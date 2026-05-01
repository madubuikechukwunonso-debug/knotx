'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart } from "lucide-react";

export default function WishlistSection() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/wishlist?userId=${user.id}`);
        const data = await res.json();
        setWishlist(data.items || []);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [isAuthenticated, user?.id]);

  const handleAddToCart = (product: any) => {
    // Add to cart logic - you'll need to integrate with your cart hook
    // For now, navigate to cart
    setAddedToCart(product.id);
    setTimeout(() => {
      setAddedToCart(null);
      router.push('/cart');
    }, 500);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium">Wishlist &amp; Favorites</h2>
        {wishlist.length > 0 && (
          <div className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
            {wishlist.length} items
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-black/40">Loading your wishlist...</div>
      ) : wishlist.length === 0 ? (
        <div className="bg-[#f6f6f6] py-12 text-center rounded-3xl">
          <p className="mb-2 text-sm text-black/40">Your wishlist is empty</p>
          <Link
            href="/shop"
            className="border-b border-black pb-0.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const product = item.product;
            const isAdded = addedToCart === product?.id;

            return (
              <div key={item.id} className="text-center group">
                <div className="aspect-square bg-[#f6f6f6] rounded-3xl mb-3 overflow-hidden flex items-center justify-center relative">
                  {product?.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-5xl">🪢</span>
                  )}

                  {/* CART ICON AT CENTER OF IMAGE */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                      isAdded 
                        ? 'bg-emerald-500/90' 
                        : 'bg-black/0 group-hover:bg-black/60'
                    }`}
                  >
                    <div className={`p-4 rounded-full transition-all duration-300 ${
                      isAdded 
                        ? 'bg-white scale-110' 
                        : 'bg-white/90 scale-90 group-hover:scale-100'
                    }`}>
                      {isAdded ? (
                        <span className="text-emerald-600 text-2xl">✓</span>
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-black" />
                      )}
                    </div>
                  </button>
                </div>

                <p className="font-medium text-sm line-clamp-2">{product?.name || "Saved Item"}</p>
                <p className="text-xs text-black/50 mt-1">
                  {product?.category ? product.category.replace(/-/g, " ") : "Favorite"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
