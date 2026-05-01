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
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8 lg:px-16">
          
          {/* Desktop Navigation Links - LEFT SIDE */}
          <nav className="hidden items-center gap-5 lg:gap-8 md:flex">
            <Link href="/" className="nav-link text-sm lg:text-base">Home</Link>
            <Link href="/shop" className="nav-link text-sm lg:text-base">Shop</Link>
            <Link href="/booking" className="nav-link text-sm lg:text-base">Book</Link>
            <Link href="/gallery" className="nav-link text-sm lg:text-base">Gallery</Link>
            <Link href="/rateus" className="nav-link text-sm lg:text-base">Rate Us</Link>
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

          {/* Logo - CENTERED */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-base md:text-lg lg:text-xl tracking-[0.2em] text-black"
          >
            KNOTXANDKRAFTS
          </Link>

          {/* Desktop Right Side */}
          <div className="hidden items-center gap-4 md:gap-6 lg:flex">
            {user ? (
              <>
                <Link href="/dashboard" className="nav-link text-sm lg:text-base font-medium">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="nav-link text-sm lg:text-base"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="nav-link text-sm lg:text-base">
                Login
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative nav-link flex items-center gap-1.5 text-sm lg:text-base">
              <ShoppingBag size={15} />
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
          <div className="border-t border-black/5 bg-white px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-4 text-sm">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/shop" className="nav-link">Shop</Link>
              <Link href="/booking" className="nav-link">Book</Link>
              <Link href="/gallery" className="nav-link">Gallery</Link>
              <Link href="/rateus" className="nav-link">Rate Us</Link>
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
