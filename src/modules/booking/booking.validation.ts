import { z } from 'zod';
export const availabilitySchema = z.object({ date: z.string(), serviceId: z.number() });
export const createBookingSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  serviceId: z.number(),
  staffUserId: z.number(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
  userId: z.number().optional(),
  userType: z.enum(['local', 'oauth']).optional(),
});
