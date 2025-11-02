import prisma from "../lib/prisma.js"
import { getFieldValues } from "../lib/fieldMapping.js"
import { sanitizeSearchQuery, searchInventories, searchItems, searchTags, searchSuggestions } from "../lib/fullTextSearch.js"

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
      
      const { results: inventoriesRaw, total: inventoryTotal } = await searchInventories(
        prisma, sanitizedQuery, inventoryLimit, inventorySkip
      );

      if (inventoriesRaw.length > 0) {
        const inventoriesWithRelations = await prisma.inventory.findMany({
          where: { id: { in: inventoriesRaw.map(inv => inv.id) } },
          include: {
            user: { select: { id: true, name: true, email: true } },
            category: true,
            inventoryTags: { include: { tag: true } },
            _count: { select: { items: true } }
          }
        });

        const inventoryMap = new Map(inventoriesWithRelations.map(inv => [inv.id, inv]));
        results.inventories = inventoriesRaw.map(rawInv => ({
          ...inventoryMap.get(rawInv.id),
          searchRank: Number(rawInv.rank)
        }));
      }

      if (type === "inventories") results.total = inventoryTotal;
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
            inventory: { include: { fields: { orderBy: { order: 'asc' } } } },
            user: { select: { id: true, name: true, email: true } },
            likes: { include: { user: { select: { id: true, name: true } } } },
            fieldValues: { include: { field: true } }
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
          category: true,
          inventoryTags: { include: { tag: true } },
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
    
    const sanitizedQuery = sanitizeSearchQuery(query.trim());
    if (!sanitizedQuery) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await searchSuggestions(prisma, sanitizedQuery);
    res.json({ suggestions });
  } catch (error) {
    console.error("Get search suggestions error:", error);
    res.status(500).json({ error: "Failed to get search suggestions" });
  }
}
