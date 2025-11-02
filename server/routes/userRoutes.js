import express from "express";

import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/users/:id", getUserProfile);

export default router;

