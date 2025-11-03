import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, isBlocked: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been blocked. Please contact support." });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Token expired" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.log(req.user.role, '=>', roles);
      return res.status(403).json({
        error: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};
