import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCustomIdConfig(req, res) {
  try {
    const { inventoryId } = req.params;
    const config = await prisma.customIdConfig.findUnique({
      where: { inventoryId },
      include: {
        elementsList: {
          orderBy: { order: 'asc' }
        }
      }
    });
    res.json(config);
  } catch (error) {
    console.error("Get custom ID config error:", error);
    res.status(500).json({ error: "Failed to fetch custom ID configuration" });
  }
}

export async function updateCustomIdConfig(req, res) {
  try {
    const { inventoryId } = req.params;
    const { elements } = req.body;
    const userId = req.user.id;
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: { userId: true }
    });
    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }
    if (inventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can configure custom IDs" });
    }
    if (!Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ error: "At least one element is required" });
    }
    if (elements.length > 10) {
      return res.status(400).json({ error: "Maximum 10 elements allowed" });
    }
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (!element.elementType) {
        return res.status(400).json({ error: `Element ${i + 1} must have a type` });
      }
      if (element.elementType === 'FIXED_TEXT' && !element.value) {
        return res.status(400).json({ error: `Element ${i + 1} of type FIXED_TEXT must have a value` });
      }
      if (element.order === undefined) {
        element.order = i;
      }
    }
    const config = await prisma.customIdConfig.upsert({
      where: { inventoryId },
      update: {
        elements: elements
      },
      create: {
        inventoryId,
        elements: elements
      }
    });
    await prisma.customIdElement.deleteMany({
      where: { configId: config.id }
    });
    const createdElements = await prisma.customIdElement.createMany({
      data: elements.map((element, index) => ({
        configId: config.id,
        elementType: element.elementType,
        format: element.format || '',
        value: element.value || null,
        order: element.order || index
      }))
    });
    const updatedConfig = await prisma.customIdConfig.findUnique({
      where: { inventoryId },
      include: {
        elementsList: {
          orderBy: { order: 'asc' }
        }
      }
    });
    res.json(updatedConfig);
  } catch (error) {
    console.error("Update custom ID config error:", error);
    res.status(500).json({ error: "Failed to update custom ID configuration" });
  }
}

export async function generateCustomIdPreview(req, res) {
  try {
    const { elements } = req.body;
    if (!Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ error: "At least one element is required" });
    }
    let preview = "";
    for (const element of elements) {
      switch (element.elementType) {
        case 'FIXED_TEXT':
          preview += element.value || '';
          break;
        case 'RANDOM_20BIT':
          const random20 = Math.floor(Math.random() * (2 ** 20));
          preview += formatNumber(random20, element.format);
          break;
        case 'RANDOM_32BIT':
          const random32 = Math.floor(Math.random() * (2 ** 32));
          preview += formatNumber(random32, element.format);
          break;
        case 'RANDOM_6DIGIT':
          const random6 = Math.floor(Math.random() * 1000000);
          preview += formatNumber(random6, element.format);
          break;
        case 'RANDOM_9DIGIT':
          const random9 = Math.floor(Math.random() * 1000000000);
          preview += formatNumber(random9, element.format);
          break;
        case 'GUID':
          preview += generateGUID();
          break;
        case 'DATE_TIME':
          const now = new Date();
          preview += formatDateTime(now, element.format);
          break;
        case 'SEQUENCE':
          preview += formatNumber(123, element.format);
          break;
      }
    }
    res.json({ preview });
  } catch (error) {
    console.error("Generate preview error:", error);
    res.status(500).json({ error: "Failed to generate preview" });
  }
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
