export type OrderInput = {
  customerName: string;
  customerEmail: string;
  userId?: number;
  userType?: 'local' | 'oauth';
  items: { productId: number; quantity: number }[];
};
