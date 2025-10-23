import { PrismaClient } from "@prisma/client"
import { columnsToFields } from "../lib/fieldMapping.js"
const prisma = new PrismaClient()

export async function globalSearch(req, res) {
  try {
    const { q: query, type = "all", page = 1, limit = 20 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchTerm = query.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let results = {
      inventories: [],
      items: [],
      total: 0
    };

    if (type === "all" || type === "inventories") {
      const [inventories, inventoryCount] = await Promise.all([
        prisma.inventory.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            category: true,
            inventoryTags: {
              include: { tag: true }
            },
            _count: {
              select: { items: true }
            }
          },
          skip: type === "inventories" ? skip : 0,
          take: type === "inventories" ? parseInt(limit) : 10,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.inventory.count({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
          }
        })
      ]);

      results.inventories = inventories;
      if (type === "inventories") {
        results.total = inventoryCount;
      }
    }

    if (type === "all" || type === "items") {
      const searchWhere = {
        OR: [
          { customId: { contains: searchTerm, mode: 'insensitive' } },
          { text1: { contains: searchTerm, mode: 'insensitive' } },
          { text2: { contains: searchTerm, mode: 'insensitive' } },
          { text3: { contains: searchTerm, mode: 'insensitive' } },
          { multiText1: { contains: searchTerm, mode: 'insensitive' } },
          { multiText2: { contains: searchTerm, mode: 'insensitive' } },
          { multiText3: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }

      const [items, itemCount] = await Promise.all([
        prisma.inventoryItem.findMany({
          where: searchWhere,
          include: {
            inventory: {
              select: { id: true, name: true, description: true },
              include: {
                fields: {
                  orderBy: { order: 'asc' }
                }
              }
            },
            user: {
              select: { id: true, name: true, email: true }
            },
            likes: {
              include: {
                user: {
                  select: { id: true, name: true }
                }
              }
            }
          },
          skip: type === "items" ? skip : 0,
          take: type === "items" ? parseInt(limit) : 10,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.inventoryItem.count({ where: searchWhere })
      ])

      const itemsWithFields = items.map(item => ({
        ...item,
        fields: columnsToFields(item, item.inventory.fields)
      }))

      results.items = itemsWithFields
      if (type === "items") {
        results.total = itemCount
      }
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
    res.status(500).json({ error: "Search failed" });
  }
}

export async function searchByTag(req, res) {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where: {
          inventoryTags: {
            some: {
              tag: {
                name: { contains: tag, mode: 'insensitive' }
              }
            }
          }
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          category: true,
          inventoryTags: {
            include: { tag: true }
          },
          _count: {
            select: { items: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventory.count({
        where: {
          inventoryTags: {
            some: {
              tag: {
                name: { contains: tag, mode: 'insensitive' }
              }
            }
          }
        }
      })
    ]);

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

export async function getSearchSuggestions(req, res) {
  try {
    const { q: query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = query.trim();
    
    const [inventoryNames, tagNames, userNames] = await Promise.all([
      prisma.inventory.findMany({
        where: {
          name: { contains: searchTerm, mode: 'insensitive' }
        },
        select: { name: true },
        take: 5,
        orderBy: { name: 'asc' }
      }),
      prisma.tag.findMany({
        where: {
          name: { contains: searchTerm, mode: 'insensitive' }
        },
        select: { name: true },
        take: 5,
        orderBy: { name: 'asc' }
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: { name: true, email: true },
        take: 5,
        orderBy: { name: 'asc' }
      })
    ]);

    const suggestions = [
      ...inventoryNames.map(inv => ({ type: 'inventory', text: inv.name })),
      ...tagNames.map(tag => ({ type: 'tag', text: tag.name })),
      ...userNames.map(user => ({ type: 'user', text: user.name || user.email }))
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error("Get search suggestions error:", error);
    res.status(500).json({ error: "Failed to get search suggestions" });
  }
}
