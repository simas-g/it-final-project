import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./lib/passport.js";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import customIdRoutes from "./routes/customIdRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import fieldRoutes from "./routes/fieldRoutes.js";
import accessRoutes from "./routes/accessRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import salesforceRoutes from "./routes/salesforceRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import "dotenv/config";

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const ODOO_URL = process.env.ODOO_URL || "http://localhost:8069";

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [FRONTEND_URL, ODOO_URL];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", authRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", itemRoutes);
app.use("/api", customIdRoutes);
app.use("/api", discussionRoutes);
app.use("/api", adminRoutes);
app.use("/api", searchRoutes);
app.use("/api", fieldRoutes);
app.use("/api", accessRoutes);
app.use("/api", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api", salesforceRoutes);
app.use("/api", supportRoutes);

app.get("/health", (req, res) => {
  console.log("hello people");
  res.status(200).json({ status: "ok" });
});

export default app;
