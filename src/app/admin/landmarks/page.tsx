'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { getImageUrl } from '@/lib/upload';
import { LandmarkForm } from './LandmarkForm';

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
      setDeleteConfirm(null);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة المعالم السياحية</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-[#b8860b] text-white px-4 py-2 rounded-lg hover:bg-[#9a7209]"
        >
          إضافة معلم
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">جاري التحميل...</p>
      ) : landmarks.length === 0 ? (
        <p className="text-slate-500">لا توجد معالم سياحية</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-right p-3 font-medium">الصورة</th>
                <th className="text-right p-3 font-medium">الاسم</th>
                <th className="text-right p-3 font-medium">الموقع</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {landmarks.map((lm) => (
                <tr key={lm.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">
                    <div className="w-12 h-12 rounded overflow-hidden bg-slate-200">
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
                  <td className="p-3">
                    <span className="font-medium">{lm.nameAr ?? lm.name}</span>
                  </td>
                  <td className="p-3 text-slate-600 text-sm max-w-[200px] truncate">
                    {lm.location ?? '—'}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(lm)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        lm.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {lm.isActive ? 'نشط' : 'غير نشط'}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(lm)}
                        className="text-[#b8860b] hover:underline text-sm"
                      >
                        تعديل
                      </button>
                      {deleteConfirm === lm.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete(lm.id)}
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
                          onClick={() => setDeleteConfirm(lm.id)}
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
        <LandmarkForm
          landmark={editingLandmark}
          onSuccess={handleFormSuccess}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
