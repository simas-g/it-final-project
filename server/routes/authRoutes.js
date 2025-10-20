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
router.post("/auth/register", registerEmail);
router.post("/auth/login", loginEmail);
router.post("/auth/provider", authProvider); // OAuth providers

// Protected routes
router.get("/auth/me", authenticateToken, getCurrentUser);
export default router;
