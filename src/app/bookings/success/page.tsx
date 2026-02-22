'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  const type = searchParams.get('type') ?? 'trip';

  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-lg">
      <div className="flex justify-center mb-6">
        <CheckCircle className="w-20 h-20 text-green-500" strokeWidth={1.5} aria-hidden />
      </div>
      <h1 className="text-2xl font-bold mb-2">تم الدفع بنجاح</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        تم إتمام عملية الدفع بنجاح. سنتواصل معك قريباً لتأكيد تفاصيل الحجز.
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
          استكشف المزيد
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

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">جاري التحميل...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
