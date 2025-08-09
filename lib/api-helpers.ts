import { NextResponse } from 'next/server';
// import { AppError, ErrorCode, handleError } from './error-handling';
import { logger } from './logger';

export const handleApiError = (error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const status = 500;

  logger.error({
    message: errorMessage,
    status,
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(
    { error: { message: errorMessage, status } },
    { status }
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