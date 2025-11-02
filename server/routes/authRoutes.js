import express from "express";
import {
  registerEmail,
  loginEmail,
  authProvider,
  getCurrentUser,
  handleOAuthCallback,
} from "../controllers/authController.js";

import { authenticateToken } from "../middleware/auth.js";
import passport from "../lib/passport.js";

const router = express.Router();

router.post("/auth/register", registerEmail);
router.post("/auth/login", loginEmail);
router.post("/auth/provider", authProvider);

router.get("/auth/me", authenticateToken, getCurrentUser);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=Authentication failed`,
    session: true,
  }),
  handleOAuthCallback
);

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=Authentication failed`,
    session: true,
  }),
  handleOAuthCallback
);

export default router;
