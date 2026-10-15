import { ApiError } from '../utils/apiError.js';
import { ENV } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Prisma known errors
  if (err.code === 'P2002') {
    const target = err.meta?.target || 'Field';
    error = ApiError.conflict(`A record with this ${target} already exists.`);
  } else if (err.code === 'P2025') {
    error = ApiError.notFound('Record not found.');
  }

  // Handle generic errors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(ENV.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};
