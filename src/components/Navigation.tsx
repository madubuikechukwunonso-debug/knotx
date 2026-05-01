'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const bgClass = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-lg border-b border-black/10'
    : 'bg-transparent';

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${bgClass}`}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8 lg:px-16">
          
          {/* Hamburger Menu Button - ALWAYS VISIBLE */}
          <button
            type="button"
            onClick={toggleMenu}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo - CENTERED */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-lg md:text-xl tracking-[0.25em] text-black"
          >
            KNOTXANDKRAFTS
          </Link>

          {/* Right Side - Dashboard + Cart */}
          <div className="flex items-center gap-4">
            {/* Desktop/Tablet Dashboard/Login */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="nav-link text-sm font-medium">Dashboard</Link>
                  <button onClick={logout} className="nav-link text-sm">Logout</button>
                </>
              ) : (
                <Link href="/login" className="nav-link text-sm">Login</Link>
              )}
            </div>

            {/* Cart - Always Visible */}
            <Link href="/cart" className="relative flex items-center" aria-label="Cart">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white font-medium">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* COLLAPSIBLE MENU - WORKS ON ALL DEVICES */}
        {menuOpen && (
          <div className="absolute left-0 right-0 top-20 border-t border-black/10 bg-white/95 backdrop-blur-xl z-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <nav className="flex flex-col gap-1 text-lg">
                <Link href="/" className="py-3 px-4 rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors">Home</Link>
                <Link href="/shop" className="py-3 px-4 rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors">Shop</Link>
                <Link href="/booking" className="py-3 px-4 rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors">Book</Link>
                <Link href="/gallery" className="py-3 px-4 rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors">Gallery</Link>
                <Link href="/rateus" className="py-3 px-4 rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors">Rate Us</Link>
                
                <div className="h-px bg-black/10 my-3" />
                
                {user ? (
                  <>
                    <Link href="/dashboard" className="py-3 px-4 rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors">Dashboard</Link>
                    <button 
                      onClick={logout} 
                      className="py-3 px-4 text-left rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="py-3 px-4 rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors">Login</Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
