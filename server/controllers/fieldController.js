import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get fields for an inventory
export async function getInventoryFields(req, res) {
  try {
    const { inventoryId } = req.params;

    const fields = await prisma.inventoryField.findMany({
      where: { inventoryId },
      orderBy: { order: 'asc' }
    });

    res.json(fields);
  } catch (error) {
    console.error("Get inventory fields error:", error);
    res.status(500).json({ error: "Failed to fetch fields" });
  }
}

// Create new field
export async function createField(req, res) {
  try {
    const { inventoryId } = req.params;
    const { title, description, fieldType, isRequired, showInTable } = req.body;
    const userId = req.user.id;

    // Check if user is owner or admin
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: { userId: true }
    });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    if (inventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can manage fields" });
    }

    // Check field type limits
    const existingFields = await prisma.inventoryField.findMany({
      where: { inventoryId, fieldType }
    });

    const fieldLimits = {
      'SINGLE_LINE_TEXT': 3,
      'MULTI_LINE_TEXT': 3,
      'NUMERIC': 3,
      'DOCUMENT_IMAGE': 3,
      'BOOLEAN': 3
    };

    if (existingFields.length >= fieldLimits[fieldType]) {
      return res.status(400).json({ 
        error: `Maximum ${fieldLimits[fieldType]} ${fieldType.toLowerCase().replace(/_/g, ' ')} fields allowed` 
      });
    }

    // Get next order
    const maxOrder = await prisma.inventoryField.aggregate({
      where: { inventoryId },
      _max: { order: true }
    });

    const field = await prisma.inventoryField.create({
      data: {
        inventoryId,
        title,
        description,
        fieldType,
        isRequired: isRequired || false,
        showInTable: showInTable !== false,
        order: (maxOrder._max.order || 0) + 1
      }
    });

    res.status(201).json(field);
  } catch (error) {
    console.error("Create field error:", error);
    res.status(500).json({ error: "Failed to create field" });
  }
}

// Update field
export async function updateField(req, res) {
  try {
    const { fieldId } = req.params;
    const { title, description, isRequired, showInTable } = req.body;
    const userId = req.user.id;

    // Check if field exists and user has permission
    const existingField = await prisma.inventoryField.findUnique({
      where: { id: fieldId },
      include: {
        inventory: {
          select: { userId: true }
        }
      }
    });

    if (!existingField) {
      return res.status(404).json({ error: "Field not found" });
    }

    if (existingField.inventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can edit fields" });
    }

    const field = await prisma.inventoryField.update({
      where: { id: fieldId },
      data: {
        title,
        description,
        isRequired,
        showInTable
      }
    });

    res.json(field);
  } catch (error) {
    console.error("Update field error:", error);
    res.status(500).json({ error: "Failed to update field" });
  }
}

// Delete field
export async function deleteField(req, res) {
  try {
    const { fieldId } = req.params;
    const userId = req.user.id;

    // Check if field exists and user has permission
    const existingField = await prisma.inventoryField.findUnique({
      where: { id: fieldId },
      include: {
        inventory: {
          select: { userId: true }
        }
      }
    });

    if (!existingField) {
      return res.status(404).json({ error: "Field not found" });
    }

    if (existingField.inventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can delete fields" });
    }

    await prisma.inventoryField.delete({
      where: { id: fieldId }
    });

    res.json({ message: "Field deleted successfully" });
  } catch (error) {
    console.error("Delete field error:", error);
    res.status(500).json({ error: "Failed to delete field" });
  }
}

// Reorder fields
export async function reorderFields(req, res) {
  try {
    const { inventoryId } = req.params;
    const { fieldOrders } = req.body; // Array of { fieldId, order }
    const userId = req.user.id;

    // Check if user is owner or admin
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: { userId: true }
    });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    if (inventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can reorder fields" });
    }

    // Update field orders
    const updatePromises = fieldOrders.map(({ fieldId, order }) =>
      prisma.inventoryField.update({
        where: { id: fieldId },
        data: { order }
      })
    );

    await Promise.all(updatePromises);

    // Get updated fields
    const fields = await prisma.inventoryField.findMany({
      where: { inventoryId },
      orderBy: { order: 'asc' }
    });

    res.json(fields);
  } catch (error) {
    console.error("Reorder fields error:", error);
    res.status(500).json({ error: "Failed to reorder fields" });
  }
}
