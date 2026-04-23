import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <h1 className="mb-4 font-serif text-6xl font-light lg:text-8xl">404</h1>
        <p className="mb-8 text-sm text-black/50">Page not found</p>
        <Link href="/" className="border-b border-black pb-1 text-sm uppercase tracking-widest transition-opacity hover:opacity-60">Return Home</Link>
      </div>
    </div>
  );
}
