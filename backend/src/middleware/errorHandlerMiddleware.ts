/**
 * ERROR HANDLER MIDDLEWARE
 * 
 * This is the "catch-all" at the end of the middleware chain.
 * Express calls this whenever you call next(error) from a route.
 * 
 * It handles:
 * - ZodError → 400 Bad Request with field-level messages
 * - AppError → our custom errors with specific status codes
 * - Everything else → 500 Internal Server Error
 */
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';

// Custom error class so we can throw errors with status codes
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {

  // Zod validation errors → 400 with detailed messages
  if (err instanceof z.ZodError) {
    // Format: { field: "message" }
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.') || 'input';
      fieldErrors[field] = issue.message;
    }
    logger.warn('Validation error', { fields: fieldErrors });
    res.status(400).json({
      error: 'Validation failed',
      fields: fieldErrors,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    });
    return;
  }

  // Our custom application errors
  if (err instanceof AppError) {
    logger.warn(`Application error: ${err.message}`, { statusCode: err.statusCode });
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
}
