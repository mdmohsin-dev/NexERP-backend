import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Generic request validator. Pass a Zod schema shaped like:
 * { body?: ZodSchema, params?: ZodSchema, query?: ZodSchema }
 */
export const validate = (schema: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params) as typeof req.params;
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query) as typeof req.query;
      }
      next();
    } catch (error: any) {
      const formatted = error?.errors?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      next(ApiError.badRequest('Validation failed', formatted || error.message));
    }
  };
};
