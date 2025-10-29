import express from "express";
import {
  getUsers,
  getUser,
  updateUserRole,
  toggleUserBlock,
  deleteUser,
  getSystemStats
} from "../controllers/adminController.js";

import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/admin/users", authenticateToken, authorizeRoles('ADMIN'), getUsers);
router.get("/admin/users/:id", authenticateToken, authorizeRoles('ADMIN'), getUser);
router.put("/admin/users/:id/role", authenticateToken, authorizeRoles('ADMIN'), updateUserRole);
router.put("/admin/users/:id/block", authenticateToken, authorizeRoles('ADMIN'), toggleUserBlock);
router.delete("/admin/users/:id", authenticateToken, authorizeRoles('ADMIN'), deleteUser);
router.get("/admin/stats", authenticateToken, authorizeRoles('ADMIN'), getSystemStats);

export default router;
