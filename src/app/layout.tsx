// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import VisitorTracker from '@/components/VisitorTracker';

export const metadata: Metadata = {
  title: 'KNOTXANDKRAFTS',
  description: 'Luxury braiding and curated hair care.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <VisitorTracker />     {/* ← Added here */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
