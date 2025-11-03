import prisma from "../lib/prisma.js";

export async function getUsers(req, res) {
  try {
    const { page = 1, limit = 20, search = "", role = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(role && { role })
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isBlocked: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              inventories: true,
              items: true,
              discussionPosts: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const { 
      inventoriesPage = 1, inventoriesLimit = 10,
      itemsPage = 1, itemsLimit = 10,
      postsPage = 1, postsLimit = 10
    } = req.query;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            inventories: true,
            items: true,
            discussionPosts: true,
            itemLikes: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const inventoriesSkip = (parseInt(inventoriesPage) - 1) * parseInt(inventoriesLimit);
    const itemsSkip = (parseInt(itemsPage) - 1) * parseInt(itemsLimit);
    const postsSkip = (parseInt(postsPage) - 1) * parseInt(postsLimit);
    
    const [inventories, inventoriesTotal, items, itemsTotal, discussionPosts, postsTotal] = await Promise.all([
      prisma.inventory.findMany({
        where: { userId: id },
        include: {
          category: {
            select: { id: true, name: true }
          },
          _count: {
            select: { items: true }
          }
        },
        skip: inventoriesSkip,
        take: parseInt(inventoriesLimit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventory.count({ where: { userId: id } }),
      prisma.inventoryItem.findMany({
        where: { userId: id },
        include: {
          inventory: {
            select: { id: true, name: true }
          }
        },
        skip: itemsSkip,
        take: parseInt(itemsLimit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventoryItem.count({ where: { userId: id } }),
      prisma.discussionPost.findMany({
        where: { userId: id },
        include: {
          inventory: {
            select: { id: true, name: true }
          }
        },
        skip: postsSkip,
        take: parseInt(postsLimit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.discussionPost.count({ where: { userId: id } })
    ]);
    
    res.json({
      ...user,
      inventories,
      items,
      discussionPosts,
      pagination: {
        inventories: {
          page: parseInt(inventoriesPage),
          limit: parseInt(inventoriesLimit),
          total: inventoriesTotal,
          pages: Math.ceil(inventoriesTotal / parseInt(inventoriesLimit))
        },
        items: {
          page: parseInt(itemsPage),
          limit: parseInt(itemsLimit),
          total: itemsTotal,
          pages: Math.ceil(itemsTotal / parseInt(itemsLimit))
        },
        posts: {
          page: parseInt(postsPage),
          limit: parseInt(postsLimit),
          total: postsTotal,
          pages: Math.ceil(postsTotal / parseInt(postsLimit))
        }
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;
    if (!['ADMIN', 'CREATOR', 'USER'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    if (id === adminId && role !== 'ADMIN') {
      return res.status(400).json({ error: "You cannot remove admin access from yourself" });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true
      }
    });
    res.json(user);
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
}

export async function toggleUserBlock(req, res) {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    const adminId = req.user.id;
    if (id === adminId && isBlocked) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { isBlocked },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true
      }
    });
    res.json(user);
  } catch (error) {
    console.error("Toggle user block error:", error);
    res.status(500).json({ error: "Failed to toggle user block" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    if (id === adminId) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await prisma.user.delete({
      where: { id }
    });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

export async function getSystemStats(req, res) {
  try {
    const [
      totalUsers,
      totalInventories,
      totalItems,
      totalPosts,
      recentUsers,
      popularInventories,
      systemHealth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.inventory.count(),
      prisma.inventoryItem.count(),
      prisma.discussionPost.count(),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.inventory.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true }
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
      }),
      prisma.$queryRaw`SELECT 1 as healthy`
    ]);
    res.json({
      stats: {
        totalUsers,
        totalInventories,
        totalItems,
        totalPosts
      },
      recentUsers,
      popularInventories,
      systemHealth: systemHealth.length > 0
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({ error: "Failed to fetch system statistics" });
  }
}
