'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function WishlistSection() {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!isAuthenticated || !user?.id) {
        console.log('Not logged in, skipping wishlist load');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/wishlist?userId=${user.id}`);
        const data = await res.json();
        console.log('Dashboard wishlist data:', data);
        setWishlist(data.items || []);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [isAuthenticated, user?.id]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg">
      <h2 className="text-2xl font-medium mb-6">Wishlist &amp; Favorites</h2>
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
