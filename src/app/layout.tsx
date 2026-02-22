import type { Metadata } from 'next';
import Script from 'next/script';
import { Cairo, Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from './StoreProvider';
import { ConditionalHeader } from '@/components/ConditionalHeader';
import { ConditionalFooter } from '@/components/ConditionalFooter';

const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Sahalat',
  description: 'منصة سياحية عمان',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeLangScript = `(function(){
    try {
      var t = localStorage.getItem('sahalat_theme');
      if (t === 'dark' || t === 'light') document.documentElement.classList.toggle('dark', t === 'dark');
      var l = localStorage.getItem('sahalat_language');
      if (l === 'ar' || l === 'en') {
        document.documentElement.lang = l;
        document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      }
    } catch (e) {}
  })();`;

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-[#faf9f7] dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Script id="theme-lang-init" strategy="beforeInteractive">
          {themeLangScript}
        </Script>
        <StoreProvider>
          <ConditionalHeader />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
