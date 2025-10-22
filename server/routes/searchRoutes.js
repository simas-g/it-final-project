import express from "express";
import {
  globalSearch,
  searchByTag,
  getSearchSuggestions
} from "../controllers/searchController.js";

const router = express.Router();

router.get("/search", globalSearch);
router.get("/search/tag/:tag", searchByTag);
router.get("/search/suggestions", getSearchSuggestions);

export default router;
