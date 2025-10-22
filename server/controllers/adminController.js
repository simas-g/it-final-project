import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
        inventories: {
          include: {
            category: true,
            _count: {
              select: { items: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        items: {
          include: {
            inventory: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        discussionPosts: {
          include: {
            inventory: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
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

    res.json(user);
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
