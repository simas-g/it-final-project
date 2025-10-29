import express from "express";

import { getUserProfile, getPublicUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/users", getPublicUsers);
router.get("/users/:id", getUserProfile);

export default router;

