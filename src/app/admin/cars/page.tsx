'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { getT } from '@/lib/i18n';
import type { Language } from '@/types';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { getImageUrl } from '@/lib/upload';
import { CarForm } from './CarForm';

type Car = {
  id: string;
  name: string;
  nameAr: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  basePricePerDay: number;
  basePricePerWeek?: number | null;
  basePricePerMonth?: number | null;
  category: string;
  transmission: string;
  seats: number;
  fuelType: string | null;
  isActive: boolean;
  images?: { id: string; imagePath: string }[];
};

export default function AdminCarsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
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
    fetchCars();
  }, [isAuthenticated, user?.role, router, page]);

  const fetchCars = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpoints.cars.list(), { params: { page, limit } });
      setCars(data.data?.items ?? []);
      setTotal(data.data?.total ?? 0);
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل تحميل السيارات');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (car: Car) => {
    try {
      await api.patch(endpoints.cars.update(car.id), { isActive: !car.isActive });
      fetchCars();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل التحديث');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(endpoints.cars.delete(id));
      setDeleteConfirm(null);
      fetchCars();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  const handleFormSuccess = (createdCar?: Car) => {
    if (createdCar) {
      setEditingCar(createdCar);
      fetchCars();
    } else {
      setShowForm(false);
      setEditingCar(null);
      fetchCars();
    }
  };

  const openEdit = (car: Car) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingCar(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCar(null);
  };

  const getCategoryLabel = (c: string) => {
    const map: Record<string, string> = {
      ECONOMY: t.carsPage.economy,
      SUV: t.carsPage.suv,
      LUXURY: t.carsPage.luxury,
      VAN: t.carsPage.van,
    };
    return map[c] ?? c;
  };

  if (!isAuthenticated) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة السيارات</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-[#b8860b] text-white px-4 py-2 rounded-lg hover:bg-[#9a7209]"
        >
          إضافة سيارة
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-slate-500">جاري التحميل...</p>
      ) : cars.length === 0 ? (
        <p className="text-slate-500">لا توجد سيارات</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-right p-3 font-medium">الصورة</th>
                <th className="text-right p-3 font-medium">الاسم</th>
                <th className="text-right p-3 font-medium">الفئة</th>
                <th className="text-right p-3 font-medium">المقاعد</th>
                <th className="text-right p-3 font-medium">السعر</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">
                    <div className="w-12 h-12 rounded overflow-hidden bg-slate-200">
                      {c.images?.[0] ? (
                        <img
                          src={getImageUrl(c.images[0].imagePath)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center justify-center h-full">—</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-medium">{c.nameAr ?? c.name}</td>
                  <td className="p-3">{getCategoryLabel(c.category)}</td>
                  <td className="p-3">{c.seats}</td>
                  <td className="p-3">{c.basePricePerDay} ر.ع./يوم</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        c.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {c.isActive ? 'متاحة' : 'غير متاحة'}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="text-[#b8860b] hover:underline text-sm"
                      >
                        تعديل
                      </button>
                      {deleteConfirm === c.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
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
                          onClick={() => setDeleteConfirm(c.id)}
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
      )}

      {showForm && (
        <CarForm car={editingCar} onSuccess={handleFormSuccess} onClose={closeForm} />
      )}
    </div>
  );
}
