import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import * as authService from './auth.service';
import { ApiError } from '../../utils/ApiError';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  return ApiResponse.ok(res, 'Login successful', result);
});

// Only Admin can create new staff accounts (registration is not public)
export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  return ApiResponse.created(res, 'User registered successfully', result);
});

export const me = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.getCurrentUser(req.user.userId);
  return ApiResponse.ok(res, 'Current user fetched', user);
});
