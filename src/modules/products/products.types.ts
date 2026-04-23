export type ProductRecord = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category?: string | null;
  inventory?: number | null;
  featured?: number | boolean | null;
  active?: number | boolean | null;
  sortOrder?: number | null;
};
