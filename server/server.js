import "dotenv/config";

import app from "./app.js";
const PORT = process.env.PORT || 8080;
async function initializeServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
initializeServer();
