import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import * as productService from './product.service';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('Product image is required');
  }

  const imagePath = `/uploads/products/${req.file.filename}`;

  const product = await productService.createProduct({
    ...req.body,
    imagePath,
  });

  return ApiResponse.created(res, 'Product created successfully', product);
});

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await productService.getProducts(req.query as Record<string, unknown>);
  return ApiResponse.ok(res, 'Products fetched successfully', data, meta);
});

export const getProductById = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  return ApiResponse.ok(res, 'Product fetched successfully', product);
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const imagePath = req.file ? `/uploads/products/${req.file.filename}` : undefined;

  const product = await productService.updateProduct(req.params.id, {
    ...req.body,
    imagePath,
  });

  return ApiResponse.ok(res, 'Product updated successfully', product);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  return ApiResponse.ok(res, 'Product deleted successfully');
});
