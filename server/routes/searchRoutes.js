import express from "express";
import {
  globalSearch,
  searchByTag,
  getSearchSuggestions,
  getAdminUserSuggestions
} from "../controllers/searchController.js";

const router = express.Router();

router.get("/search", globalSearch);
router.get("/search/tag/:tag", searchByTag);
router.get("/search/suggestions", getSearchSuggestions);
router.get("/search/admin-users", getAdminUserSuggestions);

export default router;
