import jwt from "jsonwebtoken";
export async function getUserIdFromToken(token) {
  if (!token) {
    return "";
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.id || "";
  } catch (error) {
    console.error("Error getting user id from token:", error);
    return "";
  }
}