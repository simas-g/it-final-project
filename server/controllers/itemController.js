import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Generate custom ID based on configuration
async function generateCustomId(inventoryId) {
  const config = await prisma.customIdConfig.findUnique({
    where: { inventoryId },
    include: {
      elementsList: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!config) return null;

  let customId = "";
  
  for (const element of config.elementsList) {
    switch (element.elementType) {
      case 'FIXED_TEXT':
        customId += element.value || '';
        break;
        
      case 'RANDOM_20BIT':
        const random20 = Math.floor(Math.random() * (2 ** 20));
        customId += formatNumber(random20, element.format);
        break;
        
      case 'RANDOM_32BIT':
        const random32 = Math.floor(Math.random() * (2 ** 32));
        customId += formatNumber(random32, element.format);
        break;
        
      case 'RANDOM_6DIGIT':
        const random6 = Math.floor(Math.random() * 1000000);
        customId += formatNumber(random6, element.format);
        break;
        
      case 'RANDOM_9DIGIT':
        const random9 = Math.floor(Math.random() * 1000000000);
        customId += formatNumber(random9, element.format);
        break;
        
      case 'GUID':
        customId += generateGUID();
        break;
        
      case 'DATE_TIME':
        const now = new Date();
        customId += formatDateTime(now, element.format);
        break;
        
      case 'SEQUENCE':
        // Get all items to find the highest sequence number
        const items = await prisma.inventoryItem.findMany({
          where: { inventoryId },
          select: { customId: true }
        });
        
        let maxSeq = 0;
        for (const item of items) {
          if (item.customId) {
            // Extract all numbers from the custom ID and take the last one
            const numbers = item.customId.match(/\d+/g);
            if (numbers && numbers.length > 0) {
              const lastNum = parseInt(numbers[numbers.length - 1]);
              if (lastNum > maxSeq) maxSeq = lastNum;
            }
          }
        }
        
        const nextSequence = maxSeq + 1;
        customId += formatNumber(nextSequence, element.format);
        break;
    }
  }
  
  return customId;
}

function formatNumber(num, format) {
  if (!format) return num.toString();
  
  if (format.startsWith('D')) {
    const digits = parseInt(format.substring(1)) || 0;
    return num.toString().padStart(digits, '0');
  } else if (format.startsWith('X')) {
    const digits = parseInt(format.substring(1)) || 0;
    return num.toString(16).toUpperCase().padStart(digits, '0');
  }
  
  return num.toString();
}

function formatDateTime(date, format) {
  if (!format) return date.toISOString();
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get items for an inventory
export async function getInventoryItems(req, res) {
  try {
    const { inventoryId } = req.params;
    const { page = 1, limit = 20, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      inventoryId,
      ...(search && {
        OR: [
          { customId: { contains: search, mode: 'insensitive' } },
          { fields: { path: [], string_contains: search } }
        ]
      })
    };

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
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
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventoryItem.count({ where })
    ]);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get inventory items error:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
}

// Get single item
export async function getItem(req, res) {
  try {
    const { id } = req.params;
    
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        inventory: {
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
      }
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Get item error:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
}

// Create new item
export async function createItem(req, res) {
  try {
    const { inventoryId } = req.params;
    const { fields = {}, customId } = req.body;
    const userId = req.user.id;

    // Check if user has write access to inventory
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        inventoryAccess: {
          where: { userId }
        }
      }
    });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    const hasWriteAccess = inventory.userId === userId || 
                          req.user.role === 'ADMIN' ||
                          inventory.isPublic ||
                          inventory.inventoryAccess.some(access => access.accessType === 'WRITE');

    if (!hasWriteAccess) {
      return res.status(403).json({ error: "You don't have write access to this inventory" });
    }

    // Generate custom ID if not provided
    let finalCustomId = customId;
    if (!finalCustomId) {
      finalCustomId = await generateCustomId(inventoryId);
    }

    // Check if custom ID already exists in this inventory
    if (finalCustomId) {
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          inventoryId,
          customId: finalCustomId
        }
      });

      if (existingItem) {
        return res.status(409).json({ 
          error: "Custom ID already exists in this inventory",
          suggestedId: await generateCustomId(inventoryId)
        });
      }
    }

    const item = await prisma.inventoryItem.create({
      data: {
        inventoryId,
        customId: finalCustomId,
        fields,
        userId
      },
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
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Create item error:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
}

// Update item with optimistic locking
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { fields, customId, version } = req.body;
    const userId = req.user.id;

    // Check if user has write access
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            inventoryAccess: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!existingItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    const hasWriteAccess = existingItem.inventory.userId === userId || 
                          req.user.role === 'ADMIN' ||
                          existingItem.inventory.isPublic ||
                          existingItem.inventory.inventoryAccess.some(access => access.accessType === 'WRITE');

    if (!hasWriteAccess) {
      return res.status(403).json({ error: "You don't have write access to this item" });
    }

    // Optimistic locking check
    if (version && existingItem.version !== version) {
      return res.status(409).json({ 
        error: "Item was modified by another user. Please refresh and try again.",
        currentVersion: existingItem.version
      });
    }

    // Check if custom ID already exists (if changed)
    if (customId && customId !== existingItem.customId) {
      const duplicateItem = await prisma.inventoryItem.findFirst({
        where: {
          inventoryId: existingItem.inventoryId,
          customId,
          id: { not: id }
        }
      });

      if (duplicateItem) {
        return res.status(409).json({ 
          error: "Custom ID already exists in this inventory"
        });
      }
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        fields,
        customId,
        version: { increment: 1 }
      },
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
      }
    });

    res.json(item);
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
}

// Delete item
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has write access
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            inventoryAccess: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!existingItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    const hasWriteAccess = existingItem.inventory.userId === userId || 
                          req.user.role === 'ADMIN' ||
                          existingItem.inventory.isPublic ||
                          existingItem.inventory.inventoryAccess.some(access => access.accessType === 'WRITE');

    if (!hasWriteAccess) {
      return res.status(403).json({ error: "You don't have write access to this item" });
    }

    await prisma.inventoryItem.delete({
      where: { id }
    });

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
}

// Toggle like on item
export async function toggleItemLike(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingLike = await prisma.itemLike.findUnique({
      where: {
        itemId_userId: {
          itemId: id,
          userId
        }
      }
    });

    if (existingLike) {
      // Remove like
      await prisma.itemLike.delete({
        where: { id: existingLike.id }
      });
      res.json({ liked: false });
    } else {
      // Add like
      await prisma.itemLike.create({
        data: {
          itemId: id,
          userId
        }
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error("Toggle item like error:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
}
