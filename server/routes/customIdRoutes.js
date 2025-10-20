import express from "express";
import {
  getCustomIdConfig,
  updateCustomIdConfig,
  generateCustomIdPreview
} from "../controllers/customIdController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.get("/inventories/:inventoryId/custom-id", authenticateToken, getCustomIdConfig);
router.put("/inventories/:inventoryId/custom-id", authenticateToken, updateCustomIdConfig);
router.post("/custom-id/preview", authenticateToken, generateCustomIdPreview);

export default router;
