import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';
import { ApiError } from '../utils/ApiError';

/**
 * Restrict a route to a specific set of roles.
 * Usage: router.post('/', authenticate, authorize(Role.ADMIN, Role.MANAGER), controller.create)
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};
