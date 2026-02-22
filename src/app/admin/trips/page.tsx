'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { getImageUrl } from '@/lib/upload';
import { TripForm } from './TripForm';
import { AdminTableLoader } from '@/app/admin/components/AdminTableLoader';
import { AdminActionButtons } from '@/app/admin/components/AdminActionButtons';
import { DeleteConfirmModal } from '@/app/admin/components/DeleteConfirmModal';
import {
  tableWrapper,
  tableClass,
  theadClass,
  thClass,
  tbodyTrClass,
  tdClass,
  badgeActive,
  badgeInactive,
  AdminPagination,
} from '@/app/admin/components/AdminTable';

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
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

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
      setDeleteModal({ open: false, id: null });
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
    <div dir="rtl">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">إدارة الرحلات</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          إضافة رحلة
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <AdminTableLoader rows={6} cols={6} />
      ) : trips.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
          لا توجد رحلات
        </div>
      ) : (
        <div className={tableWrapper}>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead className={theadClass}>
                <tr>
                  <th className={thClass}>الصورة</th>
                  <th className={thClass}>العنوان</th>
                  <th className={thClass}>المدة</th>
                  <th className={thClass}>السعر</th>
                  <th className={thClass}>الحالة</th>
                  <th className={thClass}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id} className={tbodyTrClass}>
                    <td className={tdClass}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-600 shrink-0">
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
                    <td className={tdClass}>
                      <span className="font-medium">{t.titleAr ?? t.title}</span>
                    </td>
                    <td className={tdClass}>{t.durationDays} يوم</td>
                    <td className={tdClass}>{t.basePrice} ر.ع.</td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(t)}
                        className={t.isActive ? badgeActive : badgeInactive}
                      >
                        {t.isActive ? 'نشط' : 'غير نشط'}
                      </button>
                    </td>
                    <td className={tdClass}>
                      <AdminActionButtons
                        onView={() => router.push(`/admin/trips/${t.id}`)}
                        onEdit={() => openEdit(t)}
                        onDelete={() => setDeleteModal({ open: true, id: t.id })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination page={page} totalPages={totalPages} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
        </div>
      )}

      {showForm && (
        <TripForm
          trip={editingTrip}
          onSuccess={handleFormSuccess}
          onClose={closeForm}
        />
      )}

      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
      />
    </div>
  );
}
