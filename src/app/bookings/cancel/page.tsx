'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

function CancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  const type = searchParams.get('type') ?? 'trip';

  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-lg">
      <div className="flex justify-center mb-6">
        <XCircle className="w-20 h-20 text-amber-500" strokeWidth={1.5} aria-hidden />
      </div>
      <h1 className="text-2xl font-bold mb-2">تم إلغاء الدفع</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        لم تتم عملية الدفع. يمكنك المحاولة مجدداً في أي وقت.
      </p>
      {bookingId && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          رقم الحجز: {bookingId}
        </p>
      )}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href={type === 'car' ? '/cars' : '/trips'}
          className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          {type === 'trip' ? 'استكشف الرحلات' : 'استكشف السيارات'}
        </Link>
        <Link
          href="/"
          className="inline-flex items-center border dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-3 rounded-xl font-medium transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

export default function BookingCancelPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">جاري التحميل...</div>}>
      <CancelContent />
    </Suspense>
  );
}
