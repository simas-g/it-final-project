import express from "express";
import {
  getDiscussionPosts,
  createDiscussionPost,
  updateDiscussionPost,
  deleteDiscussionPost
} from "../controllers/discussionController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/inventories/:inventoryId/discussion", getDiscussionPosts);

// Protected routes
router.post("/inventories/:inventoryId/discussion", authenticateToken, createDiscussionPost);
router.put("/discussion/:postId", authenticateToken, updateDiscussionPost);
router.delete("/discussion/:postId", authenticateToken, deleteDiscussionPost);

export default router;
