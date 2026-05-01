"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { Check, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

type ProductCategory = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  productCategoryId?: number | null;
  productCategory?: { id: number; name: string } | null;
};

export default function ShopPage() {
  const { addItem, items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);

  // Calculate total items in cart
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch categories and products
  useEffect(() => {
    // Fetch categories
    fetch('/api/product-categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));

    // Fetch products
    const url = selectedCategoryId 
      ? `/api/products?categoryId=${selectedCategoryId}` 
      : '/api/products';
    
    fetch(url)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]));
  }, [selectedCategoryId]);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleAdd = (product: Product) => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
      },
      1,
    );

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  // "All" option
  const allCategories = [
    { id: null, name: "All" },
    ...categories.map(c => ({ id: c.id, name: c.name }))
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="px-6 pb-20 pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="mb-4 font-serif text-4xl font-light sm:text-5xl lg:text-6xl">
              Shop
            </h1>
            <p className="max-w-lg text-sm text-black/50">
              Premium hair care products curated by our master stylists. Each
              product is selected for quality, effectiveness, and luxury.
            </p>
          </div>

          {/* CATEGORY TABS - DYNAMIC FROM DATABASE */}
          <div className="mb-12 flex flex-wrap gap-3">
            {allCategories.map((cat) => (
              <button
                key={cat.id ?? 'all'}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedCategoryId === cat.id
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-black/10 text-black/60 hover:border-black/30 hover:text-black"
                }`}
                type="button"
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => (
              <div key={product.id} className="group">
                <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#f6f6f6] rounded-3xl">
                  <img
                    src={product.image || "/images/products/hair-oil.jpg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <button
                    onClick={() => handleAdd(product)}
                    className={`absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
                      addedId === product.id
                        ? "bg-green-500 text-white scale-110"
                        : "bg-white text-black opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white active:scale-95"
                    }`}
                    type="button"
                  >
                    {addedId === product.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <ShoppingBag className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="px-1">
                  <h3 className="text-[15px] font-medium text-black leading-tight">{product.name}</h3>
                  <p className="mt-1.5 text-sm font-medium text-black/60">
                    {formatPrice(product.price)}
                  </p>
                  {product.productCategory && (
                    <p className="mt-1 text-xs text-emerald-600 font-medium">
                      {product.productCategory.name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-black/40 text-lg">No products found in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING GOLDEN CHECKOUT BUTTON WITH GREEN COUNTER */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-md">
          <Link href="/checkout">
            <button 
              className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-600 text-black font-semibold py-4 px-8 rounded-3xl shadow-2xl active:scale-[0.985] transition-all duration-200"
            >
              <span className="text-base">Proceed to Checkout</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              
              {/* GREEN COUNTER BADGE */}
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                {cartCount}
              </div>
            </button>
          </Link>
        </div>
      )}

      <Footer />
    </div>
  );
}
