import prisma from "../lib/prisma.js";

export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const {
      inventoriesPage = 1, inventoriesLimit = 12,
      itemsPage = 1, itemsLimit = 10,
      postsPage = 1, postsLimit = 10,
      likesPage = 1, likesLimit = 10
    } = req.query;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
        createdAt: true,
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
        ...user,
        inventories: [],
        items: [],
        discussionPosts: [],
        itemLikes: [],
        pagination: {
          inventories: { page: 1, limit: 12, total: 0, pages: 0 },
          items: { page: 1, limit: 10, total: 0, pages: 0 },
          posts: { page: 1, limit: 10, total: 0, pages: 0 },
          likes: { page: 1, limit: 10, total: 0, pages: 0 }
        }
      });
    }
    
    const inventoriesSkip = (parseInt(inventoriesPage) - 1) * parseInt(inventoriesLimit);
    const itemsSkip = (parseInt(itemsPage) - 1) * parseInt(itemsLimit);
    const postsSkip = (parseInt(postsPage) - 1) * parseInt(postsLimit);
    const likesSkip = (parseInt(likesPage) - 1) * parseInt(likesLimit);
    
    const [inventories, inventoriesTotal, items, itemsTotal, discussionPosts, postsTotal, itemLikes, likesTotal] = await Promise.all([
      prisma.inventory.findMany({
        where: { userId: id },
        include: {
          category: {
            select: { id: true, name: true }
          },
          inventoryTags: {
            select: {
              tag: {
                select: { id: true, name: true }
              }
            }
          },
          _count: {
            select: { 
              items: true,
              discussionPosts: true
            }
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
            select: { id: true, name: true, isPublic: true }
          },
          _count: {
            select: { likes: true }
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
            select: { id: true, name: true, isPublic: true }
          }
        },
        skip: postsSkip,
        take: parseInt(postsLimit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.discussionPost.count({ where: { userId: id } }),
      prisma.itemLike.findMany({
        where: { userId: id },
        select: {
          id: true,
          itemId: true,
          item: {
            select: {
              id: true,
              customId: true,
              createdAt: true,
              inventory: {
                select: { id: true, name: true, isPublic: true }
              }
            }
          }
        },
        skip: likesSkip,
        take: parseInt(likesLimit),
        orderBy: { id: 'desc' }
      }),
      prisma.itemLike.count({ where: { userId: id } })
    ]);
    
    res.json({
      ...user,
      inventories,
      items,
      discussionPosts,
      itemLikes,
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
        },
        likes: {
          page: parseInt(likesPage),
          limit: parseInt(likesLimit),
          total: likesTotal,
          pages: Math.ceil(likesTotal / parseInt(likesLimit))
        }
      }
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
}
