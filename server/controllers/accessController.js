import prisma from "../lib/prisma.js";

export async function getInventoryAccess(req, res) {
  try {
    const { inventoryId } = req.params;
    const userId = req.user.id;
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: { userId: true, isPublic: true }
    });
    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }
    if (inventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can view access settings" });
    }
    const accessList = await prisma.inventoryAccess.findMany({
      where: { inventoryId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json({
      isPublic: inventory.isPublic,
      accessList
    });
  } catch (error) {
    console.error("Get inventory access error:", error);
    res.status(500).json({ error: "Failed to fetch access list" });
  }
}

export async function addInventoryAccess(req, res) {
  try {
    const { inventoryId } = req.params;
    const { userId: targetUserId, accessType = 'READ' } = req.body;
    const userId = req.user.id;
    console.log('Adding access:', { inventoryId, targetUserId, accessType, requestUserId: userId });
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: { userId: true, isPublic: true }
    });
    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }
    if (inventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can manage access" });
    }
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true }
    });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const existingAccess = await prisma.inventoryAccess.findFirst({
      where: {
        inventoryId: inventoryId,
        userId: targetUserId
      }
    });
    if (existingAccess) {
      return res.status(400).json({ error: "User already has access to this inventory" });
    }
    const access = await prisma.inventoryAccess.create({
      data: {
        inventoryId,
        userId: targetUserId,
        accessType
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    console.log('Access granted successfully:', access);
    res.status(201).json(access);
  } catch (error) {
    console.error("Add inventory access error:", error);
    console.error("Error details:", error.message, error.code);
    res.status(500).json({ error: "Failed to add access", details: error.message });
  }
}

export async function updateInventoryAccess(req, res) {
  try {
    const { accessId } = req.params;
    const { accessType } = req.body;
    const userId = req.user.id;
    const existingAccess = await prisma.inventoryAccess.findUnique({
      where: { id: accessId },
      include: {
        inventory: {
          select: { userId: true, isPublic: true }
        }
      }
    });
    if (!existingAccess) {
      return res.status(404).json({ error: "Access not found" });
    }
    if (existingAccess.inventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can modify access" });
    }
    const access = await prisma.inventoryAccess.update({
      where: { id: accessId },
      data: { accessType },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    res.json(access);
  } catch (error) {
    console.error("Update inventory access error:", error);
    res.status(500).json({ error: "Failed to update access" });
  }
}

export async function removeInventoryAccess(req, res) {
  try {
    const { accessId } = req.params;
    const userId = req.user.id;
    const existingAccess = await prisma.inventoryAccess.findUnique({
      where: { id: accessId },
      include: {
        inventory: {
          select: { userId: true }
        }
      }
    });
    if (!existingAccess) {
      return res.status(404).json({ error: "Access not found" });
    }
    if (existingAccess.inventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can remove access" });
    }
    await prisma.inventoryAccess.delete({
      where: { id: accessId }
    });
    res.json({ message: "Access removed successfully" });
  } catch (error) {
    console.error("Remove inventory access error:", error);
    res.status(500).json({ error: "Failed to remove access" });
  }
}

export async function togglePublicAccess(req, res) {
  try {
    const { inventoryId } = req.params;
    const { isPublic } = req.body;
    const userId = req.user.id;
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: { userId: true }
    });
    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }
    if (inventory.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only the owner or admin can change public access" });
    }
    const updatedInventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: { isPublic },
      select: { id: true, isPublic: true }
    });
    res.json(updatedInventory);
  } catch (error) {
    console.error("Toggle public access error:", error);
    res.status(500).json({ error: "Failed to update public access" });
  }
}

export async function searchUsersForAccess(req, res) {
  try {
    const { q: query } = req.query;
    if (!query || query.trim().length < 2) {
      return res.json({ users: [] });
    }
    const searchTerm = query.trim();
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ],
        isBlocked: false
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10,
      orderBy: { name: 'asc' }
    });
    res.json({ users });
  } catch (error) {
    console.error("Search users for access error:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
}
