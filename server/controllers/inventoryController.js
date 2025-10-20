import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all inventories with pagination and search
export async function getInventories(req, res) {
  try {
    const { page = 1, limit = 10, search = "", category = "", tag = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { categoryId: category }),
      ...(tag && {
        inventoryTags: {
          some: {
            tag: {
              name: { contains: tag, mode: 'insensitive' }
            }
          }
        }
      })
    };

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
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
      prisma.inventory.count({ where })
    ]);

    res.json({
      inventories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get inventories error:", error);
    res.status(500).json({ error: "Failed to fetch inventories" });
  }
}

// Get single inventory with all details
export async function getInventory(req, res) {
  try {
    const { id } = req.params;
    
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        category: true,
        inventoryTags: {
          include: { tag: true }
        },
        fields: {
          orderBy: { order: 'asc' }
        },
        customIdConfig: {
          include: {
            elementsList: {
              orderBy: { order: 'asc' }
            }
          }
        },
        items: {
          include: {
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
          orderBy: { createdAt: 'desc' }
        },
        discussionPosts: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    res.json(inventory);
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
}

// Create new inventory
export async function createInventory(req, res) {
  try {
    const { name, description, categoryId, imageUrl, tags = [], isPublic = false } = req.body;
    const userId = req.user.id;

    const inventory = await prisma.inventory.create({
      data: {
        name,
        description,
        categoryId: categoryId || null,
        imageUrl,
        isPublic,
        userId,
        inventoryTags: {
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        category: true,
        inventoryTags: {
          include: { tag: true }
        }
      }
    });

    res.status(201).json(inventory);
  } catch (error) {
    console.error("Create inventory error:", error);
    res.status(500).json({ error: "Failed to create inventory" });
  }
}

// Update inventory with optimistic locking
export async function updateInventory(req, res) {
  try {
    const { id } = req.params;
    const { name, description, categoryId, imageUrl, tags = [], isPublic, version } = req.body;
    const userId = req.user.id;

    // Check if user is owner or admin
    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
      select: { userId: true, version: true }
    });

    if (!existingInventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    if (existingInventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can edit this inventory" });
    }

    // Optimistic locking check
    if (version && existingInventory.version !== version) {
      return res.status(409).json({ 
        error: "Inventory was modified by another user. Please refresh and try again.",
        currentVersion: existingInventory.version
      });
    }

    const inventory = await prisma.inventory.update({
      where: { id },
      data: {
        name,
        description,
        categoryId: categoryId || null,
        imageUrl,
        isPublic,
        version: { increment: 1 },
        inventoryTags: {
          deleteMany: {},
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        category: true,
        inventoryTags: {
          include: { tag: true }
        }
      }
    });

    res.json(inventory);
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({ error: "Failed to update inventory" });
  }
}

// Delete inventory
export async function deleteInventory(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is owner or admin
    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingInventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    if (existingInventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can delete this inventory" });
    }

    await prisma.inventory.delete({
      where: { id }
    });

    res.json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Delete inventory error:", error);
    res.status(500).json({ error: "Failed to delete inventory" });
  }
}

// Get user's inventories (owned and with access)
export async function getUserInventories(req, res) {
  try {
    const userId = req.user.id;
    const { type = "all" } = req.query; // "owned", "access", "all"

    let where = {};
    if (type === "owned") {
      where = { userId };
    } else if (type === "access") {
      where = {
        inventoryAccess: {
          some: { userId }
        }
      };
    } else {
      where = {
        OR: [
          { userId },
          {
            inventoryAccess: {
              some: { userId }
            }
          }
        ]
      };
    }

    const inventories = await prisma.inventory.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        category: true,
        inventoryTags: {
          include: { tag: true }
        },
        inventoryAccess: {
          where: { userId },
          select: { accessType: true }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(inventories);
  } catch (error) {
    console.error("Get user inventories error:", error);
    res.status(500).json({ error: "Failed to fetch user inventories" });
  }
}

// Get popular inventories
export async function getPopularInventories(req, res) {
  try {
    const inventories = await prisma.inventory.findMany({
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
      orderBy: {
        items: {
          _count: 'desc'
        }
      },
      take: 5
    });

    res.json(inventories);
  } catch (error) {
    console.error("Get popular inventories error:", error);
    res.status(500).json({ error: "Failed to fetch popular inventories" });
  }
}

// Get categories
export async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}

// Get tags
export async function getTags(req, res) {
  try {
    const { search = "" } = req.query;
    
    const tags = await prisma.tag.findMany({
      where: search ? {
        name: { contains: search, mode: 'insensitive' }
      } : {},
      include: {
        _count: {
          select: { inventories: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(tags);
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
}
