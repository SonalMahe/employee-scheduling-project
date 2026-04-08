import type { Request, Response, NextFunction } from "express";
import "../types";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.session?.user || req.session.user.role !== "ADMIN") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.session?.user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  next();
};