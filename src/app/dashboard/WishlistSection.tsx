"use client";

export default function WishlistSection() {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8">
      <h2 className="text-2xl font-medium mb-6">Wishlist &amp; Favorites</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {/* Example Saved Item */}
        <div className="text-center">
          <div className="aspect-square bg-[#f6f6f6] rounded-3xl mb-3 flex items-center justify-center text-4xl">🪢</div>
          <p className="font-medium text-sm">Knotless Braids</p>
          <p className="text-xs text-black/50">Saved Style</p>
        </div>

        <div className="text-center">
          <div className="aspect-square bg-[#f6f6f6] rounded-3xl mb-3 flex items-center justify-center text-4xl">🧴</div>
          <p className="font-medium text-sm">Hair Growth Oil</p>
          <p className="text-xs text-black/50">Favorite Product</p>
        </div>
      </div>
    </div>
  );
}
