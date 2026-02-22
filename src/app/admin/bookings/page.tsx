'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';

type TripBooking = {
  id: string;
  startDate: string;
  participants: number;
  adults?: number;
  children?: number;
  basePrice: number;
  finalPrice: number;
  status: string;
  trip: { id: string; title: string; titleAr: string | null };
  user: { id: string; email: string; name: string };
};

type CarBooking = {
  id: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  finalPrice: number;
  status: string;
  car: { id: string; name: string; nameAr: string | null };
  user: { id: string; email: string; name: string };
};

type Tab = 'trips' | 'cars';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [tab, setTab] = useState<Tab>('trips');
  const [tripBookings, setTripBookings] = useState<TripBooking[]>([]);
  const [carBookings, setCarBookings] = useState<CarBooking[]>([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [totalCars, setTotalCars] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    if (tab === 'trips') fetchTripBookings();
    else fetchCarBookings();
  }, [isAuthenticated, user?.role, router, tab, page]);

  const fetchTripBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpoints.bookings.adminTripBookings(), {
        params: { page, limit },
      });
      setTripBookings(data.data?.items ?? []);
      setTotalTrips(data.data?.total ?? 0);
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل تحميل حجوزات الرحلات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCarBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpoints.bookings.adminCarBookings(), {
        params: { page, limit },
      });
      setCarBookings(data.data?.items ?? []);
      setTotalCars(data.data?.total ?? 0);
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل تحميل حجوزات السيارات');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  const totalPages = tab === 'trips' ? Math.ceil(totalTrips / limit) : Math.ceil(totalCars / limit);
  const STATUS_LABELS: Record<string, string> = {
    PENDING: 'قيد الانتظار',
    PAID: 'مدفوع',
    CANCELLED: 'ملغى',
    COMPLETED: 'مكتمل',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">الحجوزات</h1>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => { setTab('trips'); setPage(1); }}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'trips' ? 'bg-[#b8860b] text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          حجوزات الرحلات
        </button>
        <button
          type="button"
          onClick={() => { setTab('cars'); setPage(1); }}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'cars' ? 'bg-[#b8860b] text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          حجوزات السيارات
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">جاري التحميل...</p>
      ) : tab === 'trips' ? (
        tripBookings.length === 0 ? (
          <p className="text-slate-500">لا توجد حجوزات رحلات</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-right p-3 font-medium">الرحلة</th>
                  <th className="text-right p-3 font-medium">المستخدم</th>
                  <th className="text-right p-3 font-medium">تاريخ البداية</th>
                  <th className="text-right p-3 font-medium">البالغين</th>
                  <th className="text-right p-3 font-medium">الأطفال</th>
                  <th className="text-right p-3 font-medium">الإجمالي</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {tripBookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium">{b.trip?.titleAr ?? b.trip?.title ?? '—'}</td>
                    <td className="p-3">
                      <span>{b.user?.name}</span>
                      <span className="block text-xs text-slate-500">{b.user?.email}</span>
                    </td>
                    <td className="p-3">{new Date(b.startDate).toLocaleDateString('ar-SA')}</td>
                    <td className="p-3">{b.adults ?? b.participants ?? '—'}</td>
                    <td className="p-3">{b.children ?? 0}</td>
                    <td className="p-3">{Number(b.finalPrice).toFixed(3)} ر.ع</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        b.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="px-3 py-1">{page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        carBookings.length === 0 ? (
          <p className="text-slate-500">لا توجد حجوزات سيارات</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-right p-3 font-medium">السيارة</th>
                  <th className="text-right p-3 font-medium">المستخدم</th>
                  <th className="text-right p-3 font-medium">من - إلى</th>
                  <th className="text-right p-3 font-medium">الإجمالي</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {carBookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium">{b.car?.nameAr ?? b.car?.name ?? '—'}</td>
                    <td className="p-3">
                      <span>{b.user?.name}</span>
                      <span className="block text-xs text-slate-500">{b.user?.email}</span>
                    </td>
                    <td className="p-3">
                      {new Date(b.startDate).toLocaleDateString('ar-SA')} — {new Date(b.endDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-3">{Number(b.finalPrice).toFixed(3)} ر.ع</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        b.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="px-3 py-1">{page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
