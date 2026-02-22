'use client';

import Image from 'next/image';

/**
 * تخطيط صفحة المصادقة: نصف الشاشة للنموذج، والنصف الآخر للشعار.
 * يتكيف مع اتجاه اللغة (RTL/LTR).
 */
export function AuthLayout({
  children,
  title,
  tagline,
}: {
  children: React.ReactNode;
  title: string;
  tagline?: string;
}) {
  return (
    <div className="min-h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
      {/* Form side - order respects parent dir (RTL/LTR) */}
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-md">
          <h1 className="text-2xl lg:text-3xl font-bold mb-8 text-slate-800 dark:text-slate-100">
            {title}
          </h1>
          {children}
        </div>
      </div>

      {/* Logo side */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-8">
        <div className="relative w-64 h-64 lg:w-80 lg:h-80">
          <Image
            src="/logo.png"
            alt="Sahalat"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 1024px) 256px, 320px"
          />
        </div>
        {tagline && (
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm text-center max-w-xs">
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}
