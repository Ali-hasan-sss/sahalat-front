'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { ChevronRight } from 'lucide-react';

type TripBasic = {
  id: string;
  title: string;
  titleAr: string | null;
  basePrice: number;
  discount?: { id: string; discountType: string; value: number } | null;
  finalPrice?: number;
};

export default function TripBookPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [trip, setTrip] = useState<TripBasic | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get(endpoints.trips.byId(id))
      .then((res) => {
        const t = res.data.data;
        setTrip({
          id: t.id,
          title: t.title,
          titleAr: t.titleAr,
          basePrice: t.basePrice ?? 0,
          discount: t.discount ?? null,
          finalPrice: t.finalPrice,
        });
      })
      .catch(() => setError('لم نتمكن من تحميل بيانات الرحلة'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent('/trips/' + id + '#book')}`);
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const totalParticipants = Math.max(1, (adults || 0) + (children || 0));
      const { data } = await api.post(endpoints.bookings.createTrip(id), {
        startDate,
        participants: totalParticipants,
        adults: adults || 1,
        children: children || 0,
        couponCode: couponCode.trim() || undefined,
      });
      const { booking, paymentAmount } = data.data;

      const sessionRes = await api.post(endpoints.payments.tripSession(booking.id), {
        amount: paymentAmount,
      });
      const { redirectUrl } = sessionRes.data.data;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        router.push(`/bookings/success?booking=${booking.id}&type=trip`);
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax?.response?.data?.message ?? 'حدث خطأ أثناء إنشاء الحجز. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 dark:text-slate-400">جاري تحميل الرحلة...</p>
      </div>
    );
  }

  if (!trip || (error && !submitting)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">
          {error ?? 'الرحلة غير موجودة'}
        </p>
        <Link href="/trips" className="text-teal-600 dark:text-teal-400 hover:underline">
          العودة للرحلات
        </Link>
      </div>
    );
  }

  const displayTitle = trip.titleAr || trip.title;
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <nav className="mb-8 text-sm text-slate-600 dark:text-slate-400">
        <Link href="/trips" className="hover:text-teal-600 dark:hover:text-teal-400">الرحلات</Link>
        <span className="mx-2">/</span>
        <Link href={`/trips/${id}`} className="hover:text-teal-600 dark:hover:text-teal-400">{displayTitle}</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-slate-100">الحجز</span>
      </nav>

      <h1 className="text-2xl font-bold mb-2">حجز الرحلة: {displayTitle}</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        {trip.discount ? (
          <>
            <span className="line-through mr-2">{Number(trip.basePrice) % 1 === 0 ? trip.basePrice : Number(trip.basePrice).toFixed(3)} ر.ع</span>
            السعر بعد الخصم للشخص: {Number(trip.finalPrice ?? trip.basePrice) % 1 === 0 ? (trip.finalPrice ?? trip.basePrice) : Number(trip.finalPrice ?? trip.basePrice).toFixed(3)} ر.ع
          </>
        ) : (
          <>السعر الأساسي للشخص الواحد: {Number(trip.basePrice) % 1 === 0 ? trip.basePrice : Number(trip.basePrice).toFixed(3)} ر.ع</>
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-2">
            تاريخ بداية الرحلة *
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={minDate}
            required
            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="adults" className="block text-sm font-medium mb-2">
              عدد البالغين *
            </label>
            <input
              id="adults"
              type="number"
              min={1}
              value={adults}
              onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="children" className="block text-sm font-medium mb-2">
              عدد الأطفال
            </label>
            <input
              id="children"
              type="number"
              min={0}
              value={children}
              onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="couponCode" className="block text-sm font-medium mb-2">
            كود الكوبون (اختياري)
          </label>
          <input
            id="couponCode"
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="أدخل كود الخصم"
            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
          />
        </div>

        {/* ملخص السعر */}
        {(() => {
          const formatPrice = (n: number) => n % 1 === 0 ? String(n) : parseFloat(n.toFixed(3)).toString();
          const participants = Math.max(1, (adults || 0) + (children || 0));
          const pricePerPerson = Number(trip.finalPrice ?? trip.basePrice);
          const subtotal = pricePerPerson * participants;
          return (
            <div className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">سعر الرحلة للشخص الواحد</span>
                <span>{formatPrice(pricePerPerson)} ر.ع</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">عدد المشاركين</span>
                <span>{participants}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-200 dark:border-slate-600">
                <span>الإجمالي</span>
                <span className="text-teal-600 dark:text-teal-400">
                  {formatPrice(pricePerPerson)} × {participants} = {formatPrice(subtotal)} ر.ع
                </span>
              </div>
              {couponCode.trim() && (
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  سيتم احتساب الخصم من الكوبون عند الدفع
                </p>
              )}
            </div>
          );
        })()}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting || !startDate || adults < 1}
            className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors"
          >
            {submitting ? 'جاري التحضير للدفع...' : 'متابعة للدفع'}
            <ChevronRight size={20} aria-hidden />
          </button>
          <Link
            href={`/trips/${id}`}
            className="px-6 py-3 border dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
