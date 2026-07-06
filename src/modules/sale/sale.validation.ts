import { z } from 'zod';

export const createSaleSchema = {
  body: z.object({
    customer: z.string().min(1, 'Customer is required'),
    items: z
      .array(
        z.object({
          product: z.string().min(1, 'Product is required'),
          quantity: z.number().int().positive('Quantity must be greater than 0'),
        })
      )
      .min(1, 'At least one product is required'),
  }),
};
