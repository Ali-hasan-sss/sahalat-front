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
      setDeleteModal({ open: false, id: null });
      fetchCars();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCar(null);
    fetchCars();
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
    <div dir="rtl">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">إدارة السيارات</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          إضافة سيارة
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm">{error}</div>
      )}

      {loading ? (
        <AdminTableLoader rows={6} cols={7} />
      ) : cars.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
          لا توجد سيارات
        </div>
      ) : (
        <div className={tableWrapper}>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead className={theadClass}>
                <tr>
                  <th className={thClass}>الصورة</th>
                  <th className={thClass}>الاسم</th>
                  <th className={thClass}>الفئة</th>
                  <th className={thClass}>المقاعد</th>
                  <th className={thClass}>السعر</th>
                  <th className={thClass}>الحالة</th>
                  <th className={thClass}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((c) => (
                  <tr key={c.id} className={tbodyTrClass}>
                    <td className={tdClass}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-600 shrink-0">
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
                    <td className={tdClass + ' font-medium'}>{c.nameAr ?? c.name}</td>
                    <td className={tdClass}>{getCategoryLabel(c.category)}</td>
                    <td className={tdClass}>{c.seats}</td>
                    <td className={tdClass}>{c.basePricePerDay} ر.ع./يوم</td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={c.isActive ? badgeActive : badgeInactive}
                      >
                        {c.isActive ? 'متاحة' : 'غير متاحة'}
                      </button>
                    </td>
                    <td className={tdClass}>
                      <AdminActionButtons
                        onEdit={() => openEdit(c)}
                        onDelete={() => setDeleteModal({ open: true, id: c.id })}
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
        <CarForm car={editingCar} onSuccess={handleFormSuccess} onClose={closeForm} />
      )}

      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
      />
    </div>
  );
}
