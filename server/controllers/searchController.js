import prisma from "../lib/prisma.js"
import { getFieldValues } from "../lib/fieldMapping.js"
import { sanitizeSearchQuery, searchInventories, searchItems, searchTags, searchSuggestions, searchAdminUsers } from "../lib/fullTextSearch.js"

export const globalSearch = async (req, res) => {
  try {
    const { q: query, type = "all", page = 1, limit = 20 } = req.query;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }
    const sanitizedQuery = sanitizeSearchQuery(query.trim());
    if (!sanitizedQuery) {
      return res.json({
        results: { inventories: [], items: [], total: 0 },
        pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 }
      });
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let results = { inventories: [], items: [], total: 0 };

    if (type === "all" || type === "inventories") {
      const inventorySkip = type === "inventories" ? skip : 0;
      const inventoryLimit = type === "inventories" ? parseInt(limit) : 10;
      
      const [
        { results: inventoriesRaw, total: inventoryTotal },
        { results: tagInventoriesRaw, total: tagInventoryTotal }
      ] = await Promise.all([
        searchInventories(prisma, sanitizedQuery, inventoryLimit, inventorySkip),
        searchTags(prisma, sanitizedQuery, inventoryLimit, inventorySkip)
      ]);

      const allInventoryIds = new Set([
        ...inventoriesRaw.map(inv => inv.id),
        ...tagInventoriesRaw.map(inv => inv.id)
      ]);

      const inventoryRankMap = new Map();
      inventoriesRaw.forEach(inv => {
        inventoryRankMap.set(inv.id, Number(inv.rank));
      });
      tagInventoriesRaw.forEach(inv => {
        const currentRank = inventoryRankMap.get(inv.id) || 0;
        inventoryRankMap.set(inv.id, Math.max(currentRank, Number(inv.rank)));
      });

      if (allInventoryIds.size > 0) {
        const inventoriesWithRelations = await prisma.inventory.findMany({
          where: { id: { in: Array.from(allInventoryIds) } },
          include: {
            user: { select: { id: true, name: true, email: true } },
            category: {
              select: { id: true, name: true }
            },
            inventoryTags: {
              select: {
                tag: {
                  select: { id: true, name: true }
                }
              }
            },
            _count: { select: { items: true } }
          }
        });

        results.inventories = inventoriesWithRelations
          .map(inv => ({
            ...inv,
            searchRank: inventoryRankMap.get(inv.id) || 0
          }))
          .sort((a, b) => b.searchRank - a.searchRank)
          .slice(0, inventoryLimit);
      }

      if (type === "inventories") {
        results.total = inventoryTotal + tagInventoryTotal;
      }
    }

    if (type === "all" || type === "items") {
      const itemSkip = type === "items" ? skip : 0;
      const itemLimit = type === "items" ? parseInt(limit) : 10;
      
      const { results: itemsRaw, total: itemTotal } = await searchItems(
        prisma, sanitizedQuery, itemLimit, itemSkip
      );

      if (itemsRaw.length > 0) {
        const itemsWithRelations = await prisma.inventoryItem.findMany({
          where: { id: { in: itemsRaw.map(item => item.id) } },
          include: {
            inventory: {
              select: {
                id: true,
                name: true,
                isPublic: true,
                fields: { orderBy: { order: 'asc' } }
              }
            },
            user: { select: { id: true, name: true, email: true } },
            likes: {
              select: {
                id: true,
                userId: true,
                user: { select: { id: true, name: true } }
              }
            },
            fieldValues: {
              select: {
                fieldId: true,
                value: true,
                field: {
                  select: { id: true, title: true, fieldType: true, order: true }
                }
              }
            }
          }
        });

        const itemMap = new Map(itemsWithRelations.map(item => [item.id, item]));
        results.items = itemsRaw.map(rawItem => {
          const item = itemMap.get(rawItem.id);
          return {
            ...item,
            fields: getFieldValues(item, item.inventory.fields),
            searchRank: Number(rawItem.rank)
          };
        });
      }

      if (type === "items") results.total = itemTotal;
    }

    if (type === "all") {
      results.total = results.inventories.length + results.items.length;
    }

    res.json({
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.total,
        pages: Math.ceil(results.total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
}

export const searchByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sanitizedQuery = sanitizeSearchQuery(tag);
    
    if (!sanitizedQuery) {
      return res.json({
        inventories: [],
        tag,
        pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 }
      });
    }

    const { results: inventoriesRaw, total } = await searchTags(
      prisma, sanitizedQuery, parseInt(limit), skip
    );

    let inventories = [];
    if (inventoriesRaw.length > 0) {
      const inventoriesWithRelations = await prisma.inventory.findMany({
        where: { id: { in: inventoriesRaw.map(inv => inv.id) } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: {
            select: { id: true, name: true }
          },
          inventoryTags: {
            select: {
              tag: {
                select: { id: true, name: true }
              }
            }
          },
          _count: { select: { items: true } }
        }
      });

      const inventoryMap = new Map(inventoriesWithRelations.map(inv => [inv.id, inv]));
      inventories = inventoriesRaw.map(rawInv => ({
        ...inventoryMap.get(rawInv.id),
        searchRank: Number(rawInv.rank)
      }));
    }

    res.json({
      inventories,
      tag,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Search by tag error:", error);
    res.status(500).json({ error: "Search by tag failed" });
  }
}

export const getSearchSuggestions = async (req, res) => {
  try {
    const { q: query } = req.query;
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    const originalQuery = query.trim();
    const isEmailQuery = /@/.test(originalQuery);
    const sanitizedQuery = sanitizeSearchQuery(originalQuery);
    
    if (!isEmailQuery && !sanitizedQuery) {
      return res.json({ suggestions: [] });
    }
    const suggestions = await searchSuggestions(prisma, sanitizedQuery || '', originalQuery);
    res.json({ suggestions });
  } catch (error) {
    console.error("Get search suggestions error:", error);
    res.status(500).json({ error: "Failed to get search suggestions" });
  }
}

export const getAdminUserSuggestions = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    const suggestions = await searchAdminUsers(prisma, query.trim(), parseInt(limit));
    res.json({ suggestions });
  } catch (error) {
    console.error("Get admin user suggestions error:", error);
    res.status(500).json({ error: "Failed to get admin user suggestions" });
  }
}
