import prisma from "../lib/prisma.js"
import { getFieldValues, createFieldValueData, formatFieldValueForDisplay } from "../lib/fieldMapping.js"
import { handleError } from "../lib/errors.js"
import { v4 as uuidv4 } from 'uuid';

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
        customId += uuidv4();
        break;
      case 'DATE_TIME':
        const now = new Date();
        customId += formatDateTime(now, element.format);
        break;
      case 'SEQUENCE':
        const items = await prisma.inventoryItem.findMany({
          where: { inventoryId },
          select: { customId: true }
        });
        let maxSeq = 0;
        for (const item of items) {
          if (item.customId) {
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

export async function getInventoryItems(req, res) {
  try {
    const { inventoryId } = req.params
    const { page = 1, limit = 20, search = "" } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const inventoryFields = await prisma.inventoryField.findMany({
      where: { inventoryId },
      orderBy: { order: 'asc' }
    })
    let where = { inventoryId }
    if (search) {
      const searchConditions = [
        { customId: { contains: search, mode: 'insensitive' } }
      ]
      const textFields = inventoryFields.filter(field => 
        field.fieldType === 'SINGLE_LINE_TEXT' || field.fieldType === 'MULTI_LINE_TEXT'
      )
      if (textFields.length > 0) {
        searchConditions.push({
          fieldValues: {
            some: {
              fieldId: { in: textFields.map(f => f.id) },
              value: { contains: search, mode: 'insensitive' }
            }
          }
        })
      }
      where.OR = searchConditions
    }
    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          likes: {
            select: {
              id: true,
              userId: true,
              user: {
                select: { id: true, name: true }
              }
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
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventoryItem.count({ where })
    ])
    const itemsWithFields = items.map(item => ({
      ...item,
      fields: getFieldValues(item, inventoryFields)
    }))
    res.json({
      items: itemsWithFields,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    handleError(error, "Failed to fetch items", res)
  }
}

export async function getItem(req, res) {
  try {
    const { id } = req.params
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        inventory: {
          select: {
            id: true,
            name: true,
            userId: true,
            isPublic: true,
            fields: {
              orderBy: { order: 'asc' }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        likes: {
          select: {
            id: true,
            userId: true,
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        fieldValues: {
          select: {
            value: true,
            field: {
              select: { id: true, title: true, fieldType: true, order: true }
            }
          }
        }
      }
    })
    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }
    const itemWithFields = {
      ...item,
      fields: getFieldValues(item, item.inventory.fields)
    }
    res.json(itemWithFields)
  } catch (error) {
    handleError(error, "Failed to fetch item", res)
  }
}

export async function createItem(req, res) {
  try {
    const { inventoryId } = req.params
    const { fields = {} } = req.body
    const userId = req.user.id
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: {
        id: true,
        userId: true,
        isPublic: true,
        inventoryAccess: {
          where: { userId },
          select: { accessType: true }
        },
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    })
    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" })
    }
    const hasWriteAccess = inventory.isPublic ||
                          inventory.userId === userId || 
                          req.user.role === 'ADMIN' ||
                          inventory.inventoryAccess.some(access => access.accessType === 'WRITE')
    if (!hasWriteAccess) {
      return res.status(403).json({ error: "You don't have write access to this inventory" })
    }
    
    let finalCustomId = await generateCustomId(inventoryId)
    let attempts = 0
    const maxAttempts = 10
    
    while (finalCustomId && attempts < maxAttempts) {
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          inventoryId,
          customId: finalCustomId
        }
      })
      if (!existingItem) {
        break
      }
      finalCustomId = await generateCustomId(inventoryId)
      attempts++
    }
    
    if (!finalCustomId) {
      return res.status(500).json({ error: "Failed to generate unique custom ID" })
    }
    
    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: "Unable to generate unique custom ID after multiple attempts" })
    }
    const fieldValueData = createFieldValueData(fields, inventory.fields)
    const item = await prisma.inventoryItem.create({
      data: {
        inventoryId,
        customId: finalCustomId,
        userId,
        fieldValues: {
          create: fieldValueData.map(fv => ({
            fieldId: fv.fieldId,
            value: fv.value
          }))
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        likes: {
          select: {
            id: true,
            userId: true,
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        fieldValues: {
          select: {
            value: true,
            field: {
              select: { id: true, title: true, fieldType: true, order: true }
            }
          }
        }
      }
    })
    const itemWithFields = {
      ...item,
      fields: getFieldValues(item, inventory.fields)
    }
    res.status(201).json(itemWithFields)
  } catch (error) {
    handleError(error, "Failed to create item", res)
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params
    const { fields, version } = req.body
    const userId = req.user.id
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
      select: {
        id: true,
        version: true,
        inventoryId: true,
        inventory: {
          select: {
            id: true,
            userId: true,
            inventoryAccess: {
              where: { userId },
              select: { accessType: true }
            },
            fields: {
              orderBy: { order: 'asc' }
            }
          }
        },
        fieldValues: {
          select: {
            value: true,
            field: {
              select: { id: true, title: true, fieldType: true, order: true }
            }
          }
        }
      }
    })
    if (!existingItem) {
      return res.status(404).json({ error: "Item not found" })
    }
    const hasWriteAccess = existingItem.inventory.userId === userId || 
                          req.user.role === 'ADMIN' ||
                          existingItem.inventory.inventoryAccess.some(access => access.accessType === 'WRITE')
    if (!hasWriteAccess) {
      return res.status(403).json({ error: "You don't have write access to this item" })
    }
    if (version && existingItem.version !== version) {
      return res.status(409).json({ 
        error: "Item was modified by another user. Please refresh and try again.",
        currentVersion: existingItem.version
      })
    }
    const fieldValueData = fields ? createFieldValueData(fields, existingItem.inventory.fields) : []
    if (fieldValueData.length > 0) {
      await prisma.itemFieldValue.deleteMany({
        where: { itemId: id }
      })
      await prisma.itemFieldValue.createMany({
        data: fieldValueData.map(fv => ({
          itemId: id,
          fieldId: fv.fieldId,
          value: fv.value
        }))
      })
    }
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        version: { increment: 1 }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        likes: {
          select: {
            id: true,
            userId: true,
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        fieldValues: {
          select: {
            value: true,
            field: {
              select: { id: true, title: true, fieldType: true, order: true }
            }
          }
        }
      }
    })
    const itemWithFields = {
      ...item,
      fields: getFieldValues(item, existingItem.inventory.fields)
    }
    res.json(itemWithFields)
  } catch (error) {
    handleError(error, "Failed to update item", res)
  }
}

export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
      select: {
        id: true,
        inventory: {
          select: {
            userId: true,
            inventoryAccess: {
              where: { userId },
              select: { accessType: true }
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
                          existingItem.inventory.inventoryAccess.some(access => access.accessType === 'WRITE');
    if (!hasWriteAccess) {
      return res.status(403).json({ error: "You don't have write access to this item" });
    }
    await prisma.inventoryItem.delete({
      where: { id }
    });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    handleError(error, "Failed to delete item", res);
  }
}

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
      await prisma.itemLike.delete({
        where: { id: existingLike.id }
      });
      res.json({ liked: false });
    } else {
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
