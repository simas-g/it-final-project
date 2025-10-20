import express from "express";
import { getUserProfile, getPublicUsers } from "../controllers/userController.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/users", getPublicUsers);
router.get("/users/:id", getUserProfile);

export default router;

