import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/users/:id", authenticateToken, getUserProfile);

export default router;

