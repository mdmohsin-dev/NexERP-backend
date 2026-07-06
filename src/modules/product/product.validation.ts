import { z } from 'zod';

const numberFromString = z.preprocess(
  (val) => (typeof val === 'string' ? Number(val) : val),
  z.number()
);

export const createProductSchema = {
  body: z.object({
    name: z.string().min(2, 'Product name is required'),
    sku: z.string().min(1, 'SKU is required'),
    category: z.string().min(1, 'Category is required'),
    purchasePrice: numberFromString.refine((v) => v >= 0, 'Purchase price must be >= 0'),
    sellingPrice: numberFromString.refine((v) => v >= 0, 'Selling price must be >= 0'),
    stockQuantity: numberFromString.refine((v) => v >= 0, 'Stock quantity must be >= 0'),
  }),
};

export const updateProductSchema = {
  body: z.object({
    name: z.string().min(2).optional(),
    sku: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    purchasePrice: numberFromString.refine((v) => v >= 0).optional(),
    sellingPrice: numberFromString.refine((v) => v >= 0).optional(),
    stockQuantity: numberFromString.refine((v) => v >= 0).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
};

export const productIdSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
};
