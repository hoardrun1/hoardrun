import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, ErrorCode } from '@/lib/error-handling';
import { logger } from '@/lib/logger';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error({
    error: err,
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'],
    userId: req.user?.id,
  });

  const errorResponse = handleError(err);

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && err instanceof Error) {
    errorResponse.data = {
      ...errorResponse.data,
      stack: err.stack,
    };
  }

  res.status(errorResponse.status).json({
    success: false,
    error: errorResponse,
  });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      next(new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid request data',
        400,
        err instanceof ZodError ? err.errors : undefined
      ));
    }
  };
};

export default {
  errorHandler,
  asyncHandler,
  validateRequest,
} 