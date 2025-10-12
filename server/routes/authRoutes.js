import express from "express";
import {
  registerEmail,
  loginEmail,
  authProvider,
  getCurrentUser,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/api/auth/register", registerEmail);
router.post("/api/auth/login", loginEmail);
router.post("/api/auth/provider", authProvider); // OAuth providers

// Protected routes
router.get("/api/auth/me", authenticateToken, getCurrentUser);
export default router;
