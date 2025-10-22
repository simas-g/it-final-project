import express from "express";
import cors from "cors";
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

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
