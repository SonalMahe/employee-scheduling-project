import { Request, Response, NextFunction } from "express";
import "express-session";

// ─────────────────────────────────────────
// Check if user is logged in at all
// ─────────────────────────────────────────
export function verifySession(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If no session user → not logged in
  if (!req.session.user) {
    res.status(401).json({ error: "Not logged in. Please log in first." })
    return
  }
  next() // logged in → continue
}

// ─────────────────────────────────────────
// Check if logged in user is EMPLOYER
// Always use AFTER verifySession
// ─────────────────────────────────────────
export function isEmployer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user?.role !== "EMPLOYER") {
    res.status(403).json({ error: "Employer access only." })
    return
  }
  next() //is employer → continue
}

// ─────────────────────────────────────────
// Check if logged in user is EMPLOYEE
// Always use AFTER verifySession
// ─────────────────────────────────────────
export function isEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user?.role !== "EMPLOYEE") {
    res.status(403).json({ error: "Employee access only." })
    return
  }
  next() // is employee → continue
}