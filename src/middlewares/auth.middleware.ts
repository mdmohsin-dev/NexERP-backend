import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../types';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token is missing');
    }

    const token = header.split(' ')[1];

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized('Session expired, please log in again'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(ApiError.unauthorized('Invalid authentication token'));
    }
    next(error);
  }
};
