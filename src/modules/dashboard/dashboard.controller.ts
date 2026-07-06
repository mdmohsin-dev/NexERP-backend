import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import * as dashboardService from './dashboard.service';

export const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats();
  return ApiResponse.ok(res, 'Dashboard statistics fetched successfully', stats);
});

export const getDailySalesChart = catchAsync(async (req: Request, res: Response) => {
  const days = req.query.days ? Number(req.query.days) : 30;
  const data = await dashboardService.getDailySalesChart(days);
  return ApiResponse.ok(res, 'Daily sales chart fetched successfully', data);
});