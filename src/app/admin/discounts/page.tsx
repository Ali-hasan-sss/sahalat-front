'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import DiscountForm from '@/app/admin/discounts/DiscountForm';
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

type Discount = {
  id: string;
  type: 'TRIP' | 'CAR';
  referenceId: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  referenceBasePrice?: number | null;
  calculatedDiscountAmount?: number | null;
};

type Trip = { id: string; title: string; titleAr: string | null };
type Car = { id: string; name: string; nameAr: string | null };

export default function AdminDiscountsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [typeFilter, setTypeFilter] = useState<'TRIP' | 'CAR' | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
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
    fetchDiscounts();
  }, [isAuthenticated, user?.role, router, page, typeFilter]);

  useEffect(() => {
    api.get(endpoints.trips.list(), { params: { limit: 500 } }).then(({ data }) => setTrips(data.data?.items ?? [])).catch(() => {});
    api.get(endpoints.cars.list(), { params: { limit: 500 } }).then(({ data }) => setCars(data.data?.items ?? [])).catch(() => {});
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit };
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get(endpoints.discounts.list(), { params });
      setDiscounts(data.data?.items ?? []);
      setTotal(data.data?.total ?? 0);
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل تحميل الخصومات');
    } finally {
      setLoading(false);
    }
  };

  const getReferenceName = (type: string, refId: string) => {
    if (type === 'TRIP') {
      const t = trips.find((x) => x.id === refId);
      return t ? (t.titleAr ?? t.title) : refId.slice(0, 8) + '...';
    }
    const c = cars.find((x) => x.id === refId);
    return c ? (c.nameAr ?? c.name) : refId.slice(0, 8) + '...';
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(endpoints.discounts.delete(id));
      setDeleteModal({ open: false, id: null });
      fetchDiscounts();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingDiscount(null);
    fetchDiscounts();
  };

  const openEdit = async (d: Discount) => {
    setShowForm(true);
    setEditingDiscount(d);
    try {
      const { data } = await api.get(endpoints.discounts.byId(d.id));
      if (data?.data) setEditingDiscount({ ...d, ...data.data });
    } catch {
      /* استمر باستخدام بيانات القائمة */
    }
  };

  const openAdd = () => {
    setEditingDiscount(null);
    setShowForm(true);
  };

  if (!isAuthenticated) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div dir="rtl">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">إدارة الخصومات</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          إضافة خصم
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['', 'TRIP', 'CAR'] as const).map((v) => (
          <button
            key={v || 'all'}
            type="button"
            onClick={() => setTypeFilter(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              typeFilter === v
                ? 'bg-teal-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {v === '' ? 'الكل' : v === 'TRIP' ? 'رحلات' : 'سيارات'}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <AdminTableLoader rows={8} cols={8} />
      ) : discounts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
          لا توجد خصومات
        </div>
      ) : (
        <div className={tableWrapper}>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead className={theadClass}>
                <tr>
                  <th className={thClass}>النوع</th>
                  <th className={thClass}>المرجع</th>
                  <th className={thClass}>نوع الخصم</th>
                  <th className={thClass}>القيمة</th>
                  <th className={thClass}>الخصم الفعلي</th>
                  <th className={thClass}>من - إلى</th>
                  <th className={thClass}>الحالة</th>
                  <th className={thClass}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id} className={tbodyTrClass}>
                    <td className={tdClass}>{d.type === 'TRIP' ? 'رحلة' : 'سيارة'}</td>
                    <td className={tdClass + ' font-medium'}>{getReferenceName(d.type, d.referenceId)}</td>
                    <td className={tdClass}>{d.discountType === 'PERCENTAGE' ? 'نسبة مئوية' : 'مبلغ ثابت'}</td>
                    <td className={tdClass}>
                      {d.discountType === 'PERCENTAGE' ? `${d.value}%` : `${d.value} ر.ع`}
                    </td>
                    <td className={tdClass}>
                      {d.calculatedDiscountAmount != null
                        ? `${d.calculatedDiscountAmount.toFixed(3)} ر.ع`
                        : '—'}
                    </td>
                    <td className={tdClass}>
                      {new Date(d.startDate).toLocaleDateString('ar-SA')} — {new Date(d.endDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className={tdClass}>
                      <span className={d.isActive ? badgeActive : badgeInactive}>
                        {d.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <AdminActionButtons
                        onEdit={() => openEdit(d)}
                        onDelete={() => setDeleteModal({ open: true, id: d.id })}
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
        <DiscountForm
          discount={editingDiscount}
          trips={trips}
          cars={cars}
          onSuccess={handleFormSuccess}
          onClose={() => { setShowForm(false); setEditingDiscount(null); }}
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
