import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 8080;

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not set in .env file");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is not set in .env file");
  process.exit(1);
}

async function initializeServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
    );
  });
}

initializeServer();
