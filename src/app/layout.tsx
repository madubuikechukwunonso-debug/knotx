// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'KNOTXANDKRAFTS',
  description: 'Luxury braiding and curated hair care.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem={false}
            themes={['dark', 'midnight', 'ocean', 'rose', 'light']}
            storageKey="admin-theme"           // ← Separate storage key (only affects admin)
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
