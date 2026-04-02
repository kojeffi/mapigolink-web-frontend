import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'MapigoLink — Cross-Border Health Record System',
  description: 'Secure, unified health records for patients across borders.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f2d5a',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#0ea5a0', secondary: '#fff' } },
              error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
