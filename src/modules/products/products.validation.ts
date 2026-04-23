import { z } from 'zod';
export const productCheckoutSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  items: z.array(z.object({ productId: z.number(), quantity: z.number().min(1) })).min(1),
});
