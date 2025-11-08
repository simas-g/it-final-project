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
const clientUrl = process.env.FRONTEND_URL;

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
  (req, res, next) => {
    passport.authenticate("google", { session: true }, (err, user, info) => {
      if (err) {
        return res.redirect(`${clientUrl}/login?error=${encodeURIComponent("Authentication failed")}`);
      }
      if (!user) {
        const message = info?.message || "Authentication failed";
        return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(message)}`);
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.redirect(`${clientUrl}/login?error=${encodeURIComponent("Authentication failed")}`);
        }
        return handleOAuthCallback(req, res);
      });
    })(req, res, next);
  }
);

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/auth/facebook/callback",
  (req, res, next) => {
    passport.authenticate("facebook", { session: true }, (err, user, info) => {
      if (err) {
        return res.redirect(`${clientUrl}/login?error=${encodeURIComponent("Authentication failed")}`);
      }
      if (!user) {
        const message = info?.message || "Authentication failed";
        return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(message)}`);
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.redirect(`${clientUrl}/login?error=${encodeURIComponent("Authentication failed")}`);
        }
        return handleOAuthCallback(req, res);
      });
    })(req, res, next);
  }
);

export default router;
