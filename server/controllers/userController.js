import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        inventories: {
          include: {
            category: true,
            inventoryTags: {
              include: {
                tag: true
              }
            },
            _count: {
              select: { 
                items: true,
                discussionPosts: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        items: {
          include: {
            inventory: {
              select: { id: true, name: true, isPublic: true }
            },
            _count: {
              select: { likes: true }
            }
          },
          orderBy: { createdAt: 'desc' },
        },
        discussionPosts: {
          include: {
            inventory: {
              select: { id: true, name: true, isPublic: true }
            }
          },
          orderBy: { createdAt: 'desc' },
        },
        itemLikes: {
          include: {
            item: {
              include: {
                inventory: {
                  select: { id: true, name: true, isPublic: true }
                }
              }
            }
          },
          orderBy: { id: 'desc' },
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

    if (user.isBlocked) {
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: true,
        createdAt: user.createdAt,
        inventories: [],
        items: [],
        discussionPosts: [],
        itemLikes: [],
        _count: {
          inventories: 0,
          items: 0,
          discussionPosts: 0,
          itemLikes: 0
        }
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
}

export async function getPublicUsers(req, res) {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isBlocked: false,
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
          provider: true,
          createdAt: true,
          _count: {
            select: {
              inventories: true,
              items: true,
              discussionPosts: true,
              itemLikes: true
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
    console.error("Get public users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

