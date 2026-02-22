'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { Eye } from 'lucide-react';
import { AdminTableLoader } from '@/app/admin/components/AdminTableLoader';
import { BookingDetailsModal } from './BookingDetailsModal';
import {
  tableWrapper,
  tableClass,
  theadClass,
  thClass,
  tbodyTrClass,
  tdClass,
  AdminPagination,
} from '@/app/admin/components/AdminTable';

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
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    type: Tab;
    bookingId: string | null;
    booking: TripBooking | CarBooking | null;
  }>({ open: false, type: 'trips', bookingId: null, booking: null });
  const [changingStatus, setChangingStatus] = useState(false);

  const openDetailModal = async (type: Tab, bookingId: string) => {
    setDetailModal({ open: true, type, bookingId, booking: null });
    try {
      const url = type === 'trips' ? endpoints.bookings.tripBooking(bookingId) : endpoints.bookings.carBooking(bookingId);
      const { data } = await api.get(url);
      setDetailModal((prev) => ({ ...prev, booking: data.data }));
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل تحميل التفاصيل');
      setDetailModal((prev) => ({ ...prev, open: false }));
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!detailModal.bookingId) return;
    setChangingStatus(true);
    setError('');
    try {
      const url =
        detailModal.type === 'trips'
          ? endpoints.bookings.adminUpdateTripStatus(detailModal.bookingId)
          : endpoints.bookings.adminUpdateCarStatus(detailModal.bookingId);
      const { data } = await api.patch(url, { status });
      setDetailModal((prev) => ({ ...prev, booking: data.data }));
      if (detailModal.type === 'trips') fetchTripBookings();
      else fetchCarBookings();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل تحديث الحالة');
    } finally {
      setChangingStatus(false);
    }
  };

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
    <div dir="rtl">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-6">الحجوزات</h1>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => { setTab('trips'); setPage(1); }}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${tab === 'trips' ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
          حجوزات الرحلات
        </button>
        <button
          type="button"
          onClick={() => { setTab('cars'); setPage(1); }}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${tab === 'cars' ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
          حجوزات السيارات
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <AdminTableLoader rows={8} cols={tab === 'trips' ? 8 : 6} />
      ) : tab === 'trips' ? (
        tripBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
            لا توجد حجوزات رحلات
          </div>
        ) : (
          <div className={tableWrapper}>
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead className={theadClass}>
                  <tr>
                    <th className={thClass}>الرحلة</th>
                    <th className={thClass}>المستخدم</th>
                    <th className={thClass}>تاريخ البداية</th>
                    <th className={thClass}>البالغين</th>
                    <th className={thClass}>الأطفال</th>
                    <th className={thClass}>الإجمالي</th>
                    <th className={thClass}>الحالة</th>
                    <th className={thClass}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {tripBookings.map((b) => (
                    <tr key={b.id} className={tbodyTrClass}>
                      <td className={tdClass + ' font-medium'}>{b.trip?.titleAr ?? b.trip?.title ?? '—'}</td>
                      <td className={tdClass}>
                        <span>{b.user?.name}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">{b.user?.email}</span>
                      </td>
                      <td className={tdClass}>{new Date(b.startDate).toLocaleDateString('ar-SA')}</td>
                      <td className={tdClass}>{b.adults ?? b.participants ?? '—'}</td>
                      <td className={tdClass}>{b.children ?? 0}</td>
                      <td className={tdClass}>{Number(b.finalPrice).toFixed(3)} ر.ع</td>
                      <td className={tdClass}>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          b.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                          b.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                          b.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                          'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {STATUS_LABELS[b.status] ?? b.status}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <button
                          type="button"
                          onClick={() => openDetailModal('trips', b.id)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination page={page} totalPages={totalPages} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
          </div>
        )
      ) : (
        carBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
            لا توجد حجوزات سيارات
          </div>
        ) : (
          <div className={tableWrapper}>
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead className={theadClass}>
                  <tr>
                    <th className={thClass}>السيارة</th>
                    <th className={thClass}>المستخدم</th>
                    <th className={thClass}>من - إلى</th>
                    <th className={thClass}>الإجمالي</th>
                    <th className={thClass}>الحالة</th>
                    <th className={thClass}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {carBookings.map((b) => (
                    <tr key={b.id} className={tbodyTrClass}>
                      <td className={tdClass + ' font-medium'}>{b.car?.nameAr ?? b.car?.name ?? '—'}</td>
                      <td className={tdClass}>
                        <span>{b.user?.name}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">{b.user?.email}</span>
                      </td>
                      <td className={tdClass}>
                        {new Date(b.startDate).toLocaleDateString('ar-SA')} — {new Date(b.endDate).toLocaleDateString('ar-SA')}
                      </td>
                      <td className={tdClass}>{Number(b.finalPrice).toFixed(3)} ر.ع</td>
                      <td className={tdClass}>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          b.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                          b.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                          b.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                          'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {STATUS_LABELS[b.status] ?? b.status}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <button
                          type="button"
                          onClick={() => openDetailModal('cars', b.id)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination page={page} totalPages={totalPages} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
          </div>
        )
      )}

      <BookingDetailsModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, type: 'trips', bookingId: null, booking: null })}
        type={detailModal.type}
        booking={detailModal.booking}
        onStatusChange={handleStatusChange}
        changingStatus={changingStatus}
      />
    </div>
  );
}
