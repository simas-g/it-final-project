import express from "express";
import {
  getInventories,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  getUserInventories,
  getPopularInventories,
  getCategories,
  getTags,
  getInventoryStatistics,
  getInventoryItemsForExport,
  generateInventoryApiToken,
  getInventoryAggregationsByToken
} from "../controllers/inventoryController.js";

import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/inventories", getInventories);
router.get("/inventories/popular", getPopularInventories);
router.get("/inventories/:id/statistics", getInventoryStatistics);
router.get("/inventories/:id/export", getInventoryItemsForExport);
router.get("/inventories/:id", getInventory);
router.get("/external/inventories/aggregations", getInventoryAggregationsByToken);
router.get("/categories", getCategories);
router.get("/tags", getTags);

router.get("/user/inventories", authenticateToken, getUserInventories);
router.post("/inventories", authenticateToken, createInventory);
router.put("/inventories/:id", authenticateToken, updateInventory);
router.delete("/inventories/:id", authenticateToken, deleteInventory);
router.post("/inventories/:id/api-token", authenticateToken, generateInventoryApiToken);

export default router;
