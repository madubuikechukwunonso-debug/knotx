export type BookingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceId: number;
  staffUserId: number;
  date: string;
  time: string;
  notes?: string;
  userId?: number;
  userType?: 'local' | 'oauth';
};
