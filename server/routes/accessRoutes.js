import express from "express";
import {
  getInventoryAccess,
  addInventoryAccess,
  updateInventoryAccess,
  removeInventoryAccess,
  togglePublicAccess,
  searchUsersForAccess
} from "../controllers/accessController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.get("/inventories/:inventoryId/access", authenticateToken, getInventoryAccess);
router.post("/inventories/:inventoryId/access", authenticateToken, addInventoryAccess);
router.put("/access/:accessId", authenticateToken, updateInventoryAccess);
router.delete("/access/:accessId", authenticateToken, removeInventoryAccess);
router.put("/inventories/:inventoryId/public", authenticateToken, togglePublicAccess);
router.get("/access/search-users", authenticateToken, searchUsersForAccess);

export default router;
