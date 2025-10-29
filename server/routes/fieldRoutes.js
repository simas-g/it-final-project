import express from "express";
import {
  getInventoryFields,
  createField,
  updateField,
  deleteField,
  reorderFields
} from "../controllers/fieldController.js";

import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/inventories/:inventoryId/fields", authenticateToken, getInventoryFields);
router.post("/inventories/:inventoryId/fields", authenticateToken, createField);
router.put("/fields/:fieldId", authenticateToken, updateField);
router.delete("/fields/:fieldId", authenticateToken, deleteField);
router.put("/inventories/:inventoryId/fields/reorder", authenticateToken, reorderFields);

export default router;
