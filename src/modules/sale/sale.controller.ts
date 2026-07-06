import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import * as saleService from './sale.service';

export const createSale = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const sale = await saleService.createSale({
    customer: req.body.customer,
    items: req.body.items,
    soldBy: req.user.userId,
  });

  return ApiResponse.created(res, 'Sale created successfully', sale);
});

export const getSales = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await saleService.getSales(req.query as Record<string, unknown>);
  return ApiResponse.ok(res, 'Sales fetched successfully', data, meta);
});

export const getSaleById = catchAsync(async (req: Request, res: Response) => {
  const sale = await saleService.getSaleById(req.params.id);
  return ApiResponse.ok(res, 'Sale fetched successfully', sale);
});
