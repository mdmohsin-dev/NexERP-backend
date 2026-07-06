import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import * as customerService from './customer.service';

export const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const customer = await customerService.createCustomer(req.body);
  return ApiResponse.created(res, 'Customer created successfully', customer);
});

export const getCustomers = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await customerService.getCustomers(req.query as Record<string, unknown>);
  return ApiResponse.ok(res, 'Customers fetched successfully', data, meta);
});

export const getCustomerById = catchAsync(async (req: Request, res: Response) => {
  const customer = await customerService.getCustomerById(req.params.id);
  return ApiResponse.ok(res, 'Customer fetched successfully', customer);
});

export const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  return ApiResponse.ok(res, 'Customer updated successfully', customer);
});

export const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  await customerService.deleteCustomer(req.params.id);
  return ApiResponse.ok(res, 'Customer deleted successfully');
});
