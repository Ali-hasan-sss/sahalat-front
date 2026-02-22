'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { getImageUrl } from '@/lib/upload';
import { TripForm } from './TripForm';

type Landmark = { id: string; name: string; nameAr?: string | null };

type Trip = {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  durationDays: number;
  basePrice: number;
  maxParticipants: number | null;
  isActive: boolean;
  images: { id: string; imagePath: string }[];
  landmarks?: Landmark[];
};

export default function AdminTripsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchTrips();
  }, [isAuthenticated, user?.role, router, page]);

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpoints.trips.list(), { params: { page, limit } });
      setTrips(data.data?.items ?? []);
      setTotal(data.data?.total ?? 0);
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل تحميل الرحلات');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (trip: Trip) => {
    try {
      await api.patch(endpoints.trips.update(trip.id), { isActive: !trip.isActive });
      fetchTrips();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل التحديث');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(endpoints.trips.delete(id));
      setDeleteConfirm(null);
      fetchTrips();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTrip(null);
    fetchTrips();
  };

  const openEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingTrip(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTrip(null);
  };

  if (!isAuthenticated) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة الرحلات</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-[#b8860b] text-white px-4 py-2 rounded-lg hover:bg-[#9a7209]"
        >
          إضافة رحلة
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">جاري التحميل...</p>
      ) : trips.length === 0 ? (
        <p className="text-slate-500">لا توجد رحلات</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-right p-3 font-medium">الصورة</th>
                <th className="text-right p-3 font-medium">العنوان</th>
                <th className="text-right p-3 font-medium">المدة</th>
                <th className="text-right p-3 font-medium">السعر</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">
                    <div className="w-12 h-12 rounded overflow-hidden bg-slate-200">
                      {t.images?.[0] ? (
                        <img
                          src={getImageUrl(t.images[0].imagePath)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center justify-center h-full">—</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">{t.titleAr ?? t.title}</span>
                  </td>
                  <td className="p-3">{t.durationDays} يوم</td>
                  <td className="p-3">{t.basePrice} ر.ع.</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(t)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        t.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {t.isActive ? 'نشط' : 'غير نشط'}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/trips/${t.id}`)}
                        className="text-[#b8860b] hover:underline text-sm"
                      >
                        تفاصيل
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="text-[#b8860b] hover:underline text-sm"
                      >
                        تعديل
                      </button>
                      {deleteConfirm === t.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            تأكيد
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="text-slate-500 hover:underline text-sm"
                          >
                            إلغاء
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(t.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          حذف
                        </button>
                      )}
                    </div>
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
              <span className="px-3 py-1">
                {page} / {totalPages}
              </span>
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
      )}

      {showForm && (
        <TripForm
          trip={editingTrip}
          onSuccess={handleFormSuccess}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
