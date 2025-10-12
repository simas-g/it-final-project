import express from "express";
import cors from "cors";

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL;
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.get("/", (_req, res) => {
  res.send("Hello, yo, niger, wassup");
});

export default app;
