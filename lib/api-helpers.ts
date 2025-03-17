import { NextResponse } from 'next/server';
import { AppError, ErrorCode, handleError } from './error-handling';
import { logger } from './logger';

export const handleApiError = (error: unknown) => {
  const errorResponse = handleError(error);

  logger.error({
    ...errorResponse,
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(
    { error: errorResponse },
    { status: errorResponse.status }
  );
};

export const createApiHandler = (handler: Function) => {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
};