import { Request, Response, NextFunction } from "express";
import "express-session";
import { SessionUser } from "../types/user.types";

// ─────────────────────────────────────────
// AuthRequest — extends Express Request with
// req.user populated by authenticate middleware
// ─────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: SessionUser
}

// ─────────────────────────────────────────
// authenticate — verify session and attach
// session user to req.user for controllers
// ─────────────────────────────────────────
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.session.user) {
    res.status(401).json({ error: "Not logged in. Please log in first." })
    return
  }
  req.user = req.session.user // attach for convenient access in controllers
  next()
}

// ─────────────────────────────────────────
// requireEmployer — employer access only
// Always use AFTER authenticate
// ─────────────────────────────────────────
export function requireEmployer(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user?.role !== "EMPLOYER") {
    res.status(403).json({ error: "Employer access only." })
    return
  }
  next()
}

// ─────────────────────────────────────────
// isEmployee — employee access only
// Always use AFTER authenticate
// ─────────────────────────────────────────
export function isEmployee(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user?.role !== "EMPLOYEE") {
    res.status(403).json({ error: "Employee access only." })
    return
  }
  next()
}