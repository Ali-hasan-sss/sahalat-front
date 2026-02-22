'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { getImageUrl } from '@/lib/upload';
import { LandmarkForm } from './LandmarkForm';
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

type Landmark = {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  images: { id: string; imagePath: string }[];
};

export default function AdminLandmarksPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLandmark, setEditingLandmark] = useState<Landmark | null>(null);
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
    fetchLandmarks();
  }, [isAuthenticated, user?.role, router, page]);

  const fetchLandmarks = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpoints.landmarks.list(), { params: { page, limit } });
      setLandmarks(data.data?.items ?? []);
      setTotal(data.data?.total ?? 0);
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل تحميل المعالم');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (landmark: Landmark) => {
    try {
      await api.patch(endpoints.landmarks.update(landmark.id), { isActive: !landmark.isActive });
      fetchLandmarks();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل التحديث');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(endpoints.landmarks.delete(id));
      setDeleteModal({ open: false, id: null });
      fetchLandmarks();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLandmark(null);
    fetchLandmarks();
  };

  const openEdit = (landmark: Landmark) => {
    setEditingLandmark(landmark);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingLandmark(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLandmark(null);
  };

  if (!isAuthenticated) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div dir="rtl">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">إدارة المعالم السياحية</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          إضافة معلم
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <AdminTableLoader rows={6} cols={5} />
      ) : landmarks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
          لا توجد معالم سياحية
        </div>
      ) : (
        <div className={tableWrapper}>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead className={theadClass}>
                <tr>
                  <th className={thClass}>الصورة</th>
                  <th className={thClass}>الاسم</th>
                  <th className={thClass}>الموقع</th>
                  <th className={thClass}>الحالة</th>
                  <th className={thClass}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {landmarks.map((lm) => (
                  <tr key={lm.id} className={tbodyTrClass}>
                    <td className={tdClass}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-600 shrink-0">
                        {lm.images?.[0] ? (
                          <img
                            src={getImageUrl(lm.images[0].imagePath)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center justify-center h-full">—</span>
                        )}
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span className="font-medium">{lm.nameAr ?? lm.name}</span>
                    </td>
                    <td className={tdClass + ' max-w-[200px] truncate'}>
                      {lm.location ?? '—'}
                    </td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(lm)}
                        className={lm.isActive ? badgeActive : badgeInactive}
                      >
                        {lm.isActive ? 'نشط' : 'غير نشط'}
                      </button>
                    </td>
                    <td className={tdClass}>
                      <AdminActionButtons
                        onView={() => router.push(`/landmarks/${lm.id}`)}
                        onEdit={() => openEdit(lm)}
                        onDelete={() => setDeleteModal({ open: true, id: lm.id })}
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
        <LandmarkForm
          landmark={editingLandmark}
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
