import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { createAccountAndContact, describeSObject } from "../controllers/salesforceController.js";

const router = express.Router();

router.get("/salesforce/describe/:sobjectName", authenticateToken, describeSObject);
router.post("/salesforce/create-account", authenticateToken, createAccountAndContact);

export default router;


