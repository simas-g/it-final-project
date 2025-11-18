import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { createAccountAndContact, getSalesforceData, updateAccountAndContact } from "../controllers/salesforceController.js";

const router = express.Router();

router.get("/salesforce/data", authenticateToken, getSalesforceData);
router.post("/salesforce/create-account", authenticateToken, createAccountAndContact);
router.put("/salesforce/update-account", authenticateToken, updateAccountAndContact);

export default router;


