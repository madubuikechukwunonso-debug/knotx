'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    setMobileOpen(false);
  }, [pathname]);

  const bgClass = scrolled || !isHome 
    ? 'bg-white/90 backdrop-blur-md border-b border-black/5' 
    : 'bg-transparent';

  return (
    <>
      <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${bgClass}`}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10 lg:px-16">
          
          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/shop" className="nav-link">Shop</Link>
            <Link href="/booking" className="nav-link">Book</Link>
            <Link href="/gallery" className="nav-link">Gallery</Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-lg tracking-[0.25em] text-black md:text-xl"
          >
            KNOTXANDKRAFTS
          </Link>

          {/* Desktop Right Side */}
          <div className="hidden items-center gap-6 md:flex">
            {/* Dashboard link (replaces old Account link) */}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="nav-link font-medium"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="nav-link"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="nav-link">
                Login
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative nav-link flex items-center gap-2">
              <ShoppingBag size={16} />
              <span>({totalItems})</span>
            </Link>
          </div>

          {/* Mobile Right Side */}
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/cart" className="relative" aria-label="Cart">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-black/5 bg-white px-6 py-6 md:hidden">
            <nav className="flex flex-col gap-5">
              <Link href="/shop" className="nav-link">Shop</Link>
              <Link href="/booking" className="nav-link">Book</Link>
              <Link href="/gallery" className="nav-link">Gallery</Link>

              {user ? (
                <>
                  <Link href="/dashboard" className="nav-link">Dashboard</Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-left nav-link"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="nav-link">Login</Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
