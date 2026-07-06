import { z } from 'zod';

export const createCustomerSchema = {
  body: z.object({
    name: z.string().min(2, 'Customer name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().min(6, 'Valid phone number is required'),
    address: z.string().optional(),
  }),
};

export const updateCustomerSchema = {
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(6).optional(),
    address: z.string().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
};

export const customerIdSchema = {
  params: z.object({ id: z.string().min(1) }),
};
