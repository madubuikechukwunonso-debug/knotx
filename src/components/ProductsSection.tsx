"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category?: string | null;
};

type ProductsSectionProps = {
  products: Product[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(price / 100);
}

export default function ProductsSection({
  products,
}: ProductsSectionProps) {
  const { addItem } = useCart();

  return (
    <section className="bg-white px-6 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-black/45">
            Shop
          </p>
          <h2 className="font-serif text-4xl leading-tight text-black md:text-5xl">
            Signature essentials
          </h2>
          <p className="mt-4 text-sm leading-7 text-black/65 md:text-base">
            A curated edit of hair and beauty essentials selected to complement
            your braid care, styling, and everyday finish.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group">
              <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#f6f6f6]">
                <img
                  src={product.image || "/images/products/hair-oil.jpg"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addItem(
                      {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image || "",
                      },
                      1,
                    );
                  }}
                  className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 hover:bg-black hover:text-white"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingBag className="h-4 w-4" />
                </button>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-black/40">
                  {product.category || "Product"}
                </p>
                <h3 className="mt-2 font-serif text-2xl text-black">
                  {product.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-black/60">
                  {product.description || "Luxury beauty essential."}
                </p>
                <p className="mt-4 text-sm font-medium text-black">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
