export type OrderSessionUser = {
  userId: number;
  userType: "local" | "oauth";
  email?: string;
  role?: "user" | "worker" | "admin" | "super_admin";
  name?: string;
};

export type CreateOrderInput = {
  items: {
    productId: number;
    quantity: number;
  }[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  userId?: number;
  userType?: "local" | "oauth";
};
