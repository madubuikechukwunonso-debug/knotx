import { z } from 'zod';
export const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  userId: z.number().optional(),
  userType: z.enum(['local', 'oauth']).optional(),
  items: z.array(z.object({ productId: z.number(), quantity: z.number().min(1) })).min(1),
});
