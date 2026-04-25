'use client';

import { useEffect, useState } from "react";

export default function WishlistSection() {
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => setWishlist(d.items || []));
  }, []);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <h2 className="text-2xl font-serif mb-6">Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>Your wishlist is empty</p>
      ) : (
        wishlist.map((item) => <div key={item.id}>{item.product.name}</div>)
      )}
    </div>
  );
}
