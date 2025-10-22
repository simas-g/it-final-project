import express from "express";
import {
  getInventoryItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  toggleItemLike
} from "../controllers/itemController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/inventories/:inventoryId/items", getInventoryItems);
router.get("/items/:id", getItem);

router.post("/inventories/:inventoryId/items", authenticateToken, createItem);
router.put("/items/:id", authenticateToken, updateItem);
router.delete("/items/:id", authenticateToken, deleteItem);
router.post("/items/:id/like", authenticateToken, toggleItemLike);

export default router;
