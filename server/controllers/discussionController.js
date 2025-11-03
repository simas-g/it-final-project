import prisma from "../lib/prisma.js";

export async function getDiscussionPosts(req, res) {
  try {
    const { inventoryId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      prisma.discussionPost.findMany({
        where: { inventoryId },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'asc' }
      }),
      prisma.discussionPost.count({
        where: { inventoryId }
      })
    ]);
    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get discussion posts error:", error);
    res.status(500).json({ error: "Failed to fetch discussion posts" });
  }
}

export async function createDiscussionPost(req, res) {
  try {
    const { inventoryId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: { id: true }
    });
    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }
    const post = await prisma.discussionPost.create({
      data: {
        inventoryId,
        userId,
        content: content.trim()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    res.status(201).json(post);
  } catch (error) {
    console.error("Create discussion post error:", error);
    res.status(500).json({ error: "Failed to create discussion post" });
  }
}

export async function updateDiscussionPost(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }
    const existingPost = await prisma.discussionPost.findUnique({
      where: { id: postId },
      include: {
        inventory: {
          select: { userId: true }
        }
      }
    });
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    const canEdit = existingPost.userId === userId || 
                    existingPost.inventory.userId === userId || 
                    req.user.role === 'ADMIN';
    if (!canEdit) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }
    const post = await prisma.discussionPost.update({
      where: { id: postId },
      data: {
        content: content.trim()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    res.json(post);
  } catch (error) {
    console.error("Update discussion post error:", error);
    res.status(500).json({ error: "Failed to update discussion post" });
  }
}

export async function deleteDiscussionPost(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const existingPost = await prisma.discussionPost.findUnique({
      where: { id: postId },
      include: {
        inventory: {
          select: { userId: true }
        }
      }
    });
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    const canDelete = existingPost.userId === userId || 
                      existingPost.inventory.userId === userId || 
                      req.user.role === 'ADMIN';
    if (!canDelete) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }
    await prisma.discussionPost.delete({
      where: { id: postId }
    });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete discussion post error:", error);
    res.status(500).json({ error: "Failed to delete discussion post" });
  }
}
