"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, Heart, Plus, Minus, X } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { addItem, items, removeItem } = useCart();
  const { user, isAuthenticated } = useAuth(); // ← USE AUTH HOOK
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Record<number, number>>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isLoggedIn = isAuthenticated && !!user;
  const userId = user?.id; // ← GET USER ID FROM AUTH HOOK

  // Load wishlist when user is authenticated
  useEffect(() => {
    const loadWishlist = async () => {
      if (!isLoggedIn || !userId) {
        console.log('Not logged in, skipping wishlist load');
        return;
      }
      
      console.log('Loading wishlist for userId:', userId);
      
      try {
        const res = await fetch(`/api/wishlist?userId=${userId}`);
        const data = await res.json();
        console.log('Wishlist data:', data);
        
        const wishlistIds = (data.items || []).map((item: any) => item.product?.id || item.productId);
        setWishlist(wishlistIds);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    };
    loadWishlist();
  }, [isLoggedIn, userId]);

  // Fetch categories and products
  useEffect(() => {
    fetch('/api/product-categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));

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
    const currentQty = selectedProducts[product.id] || 0;
    setSelectedProducts(prev => ({ ...prev, [product.id]: currentQty + 1 }));
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image || "" }, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 800);
  };

  const handleDecrease = (product: Product) => {
    const currentQty = selectedProducts[product.id] || 0;
    if (currentQty <= 1) {
      handleRemove(product);
    } else {
      setSelectedProducts(prev => ({ ...prev, [product.id]: currentQty - 1 }));
      removeItem(product.id);
    }
  };

  const handleRemove = (product: Product) => {
    const currentQty = selectedProducts[product.id] || 0;
    for (let i = 0; i < currentQty; i++) removeItem(product.id);
    setSelectedProducts(prev => { const updated = { ...prev }; delete updated[product.id]; return updated; });
  };

  // Toggle wishlist using user from auth hook
  const toggleWishlist = async (productId: number) => {
    if (!isLoggedIn || !userId) {
      console.log('Not logged in, showing modal');
      setShowLoginModal(true);
      return;
    }

    console.log('Toggle wishlist, userId:', userId, 'productId:', productId);

    try {
      if (wishlist.includes(productId)) {
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, userId }),
        });
        
        console.log('DELETE response status:', res.status);
        
        if (res.ok) {
          setWishlist(prev => prev.filter(id => id !== productId));
        } else {
          const errorData = await res.json();
          console.log('DELETE error:', errorData);
          setShowLoginModal(true);
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, userId }),
        });
        
        console.log('POST response status:', res.status);
        
        if (res.ok) {
          setWishlist(prev => [...prev, productId]);
        } else {
          const errorData = await res.json();
          console.log('POST error:', errorData);
          setShowLoginModal(true);
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      setShowLoginModal(true);
    }
  };

  const handleCheckout = () => {
    router.push('/cart');
  };

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
            <h1 className="mb-4 font-serif text-4xl font-light sm:text-5xl lg:text-6xl">Shop</h1>
            <p className="max-w-lg text-sm text-black/50">Premium hair care products curated by our master stylists.</p>
          </div>

          {/* CATEGORY TABS */}
          <div className="mb-12 flex flex-wrap gap-3">
            {allCategories.map((cat) => (
              <button
                key={cat.id ?? 'all'}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${selectedCategoryId === cat.id ? "border-emerald-600 bg-emerald-600 text-white" : "border-black/10 text-black/60 hover:border-black/30 hover:text-black"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => {
              const qty = selectedProducts[product.id] || 0;
              const isSelected = qty > 0;
              const isWishlisted = wishlist.includes(product.id);

              return (
                <div key={product.id} className="group relative">
                  <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#f6f6f6] rounded-3xl">
                    <img src={product.image || "/images/products/hair-oil.jpg"} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />

                    {isSelected && (
                      <div className="absolute top-4 left-4 bg-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <span>x{qty}</span>
                      </div>
                    )}

                    <button onClick={() => toggleWishlist(product.id)} className={`absolute top-4 right-4 p-2.5 rounded-full transition-all ${isWishlisted ? "bg-red-500 text-white" : "bg-white/90 text-black hover:bg-white"}`}>
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    {!isSelected && (
                      <button onClick={() => handleAdd(product)} className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-xl opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white active:scale-95 transition-all">
                        <ShoppingBag className="h-5 w-5" />
                      </button>
                    )}

                    {isSelected && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white rounded-full shadow-xl p-1">
                        <button onClick={() => handleDecrease(product)} className="p-1.5 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors"><Minus className="h-4 w-4" /></button>
                        <span className="px-2 font-semibold text-sm min-w-[20px] text-center">{qty}</span>
                        <button onClick={() => handleAdd(product)} className="p-1.5 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors"><Plus className="h-4 w-4" /></button>
                        <button onClick={() => handleRemove(product)} className="p-1.5 hover:bg-red-100 text-red-500 rounded-full active:bg-red-200 transition-colors ml-1"><X className="h-4 w-4" /></button>
                      </div>
                    )}
                  </div>

                  <div className="px-1">
                    <h3 className="font-sans text-[17px] font-medium text-black leading-tight pr-8">{product.name}</h3>
                    <p className="mt-1.5 text-sm font-medium text-black/60">{formatPrice(product.price)}</p>
                    {product.productCategory && <p className="mt-1 text-xs text-emerald-600 font-medium">{product.productCategory.name}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-black/40 text-lg">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING CHECKOUT BUTTON */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button onClick={handleCheckout} className="group flex items-center gap-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-600 text-black font-semibold py-4 px-6 rounded-3xl shadow-2xl active:scale-[0.985] transition-all duration-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-base font-semibold">Proceed to Cart</span>
            </div>
            <div className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center ring-2 ring-white">{cartCount}</div>
          </button>
        </div>
      )}

      {/* NICE LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-serif text-emerald-950 mb-2">Save to Wishlist</h3>
              <p className="text-emerald-600">Login to save your favorite products and access them anytime from your dashboard.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  router.push('/login?redirect=/shop');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-medium transition-colors"
              >
                Login to Continue
              </button>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="w-full border border-gray-300 hover:bg-gray-50 py-4 rounded-2xl font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
