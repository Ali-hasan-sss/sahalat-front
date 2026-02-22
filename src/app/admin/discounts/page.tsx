'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import DiscountForm from '@/app/admin/discounts/DiscountForm';

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
      setDeleteConfirm(null);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة الخصومات</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-[#b8860b] text-white px-4 py-2 rounded-lg hover:bg-[#9a7209]"
        >
          إضافة خصم
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm ${!typeFilter ? 'bg-[#b8860b] text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          الكل
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('TRIP')}
          className={`px-3 py-1.5 rounded-lg text-sm ${typeFilter === 'TRIP' ? 'bg-[#b8860b] text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          رحلات
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('CAR')}
          className={`px-3 py-1.5 rounded-lg text-sm ${typeFilter === 'CAR' ? 'bg-[#b8860b] text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          سيارات
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <p className="text-slate-500">جاري التحميل...</p>
      ) : discounts.length === 0 ? (
        <p className="text-slate-500">لا توجد خصومات</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-right p-3 font-medium">النوع</th>
                <th className="text-right p-3 font-medium">المرجع</th>
                <th className="text-right p-3 font-medium">نوع الخصم</th>
                <th className="text-right p-3 font-medium">القيمة</th>
                <th className="text-right p-3 font-medium">الخصم الفعلي</th>
                <th className="text-right p-3 font-medium">من - إلى</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">{d.type === 'TRIP' ? 'رحلة' : 'سيارة'}</td>
                  <td className="p-3 font-medium">{getReferenceName(d.type, d.referenceId)}</td>
                  <td className="p-3">{d.discountType === 'PERCENTAGE' ? 'نسبة مئوية' : 'مبلغ ثابت'}</td>
                  <td className="p-3">
                    {d.discountType === 'PERCENTAGE' ? `${d.value}%` : `${d.value} ر.ع`}
                  </td>
                  <td className="p-3">
                    {d.calculatedDiscountAmount != null
                      ? `${d.calculatedDiscountAmount.toFixed(3)} ر.ع`
                      : '—'}
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(d.startDate).toLocaleDateString('ar-SA')} — {new Date(d.endDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {d.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => openEdit(d)} className="text-[#b8860b] hover:underline text-sm">
                        تعديل
                      </button>
                      {deleteConfirm === d.id ? (
                        <>
                          <button type="button" onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline text-sm">
                            تأكيد
                          </button>
                          <button type="button" onClick={() => setDeleteConfirm(null)} className="text-slate-500 hover:underline text-sm">
                            إلغاء
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setDeleteConfirm(d.id)} className="text-red-600 hover:underline text-sm">
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
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed">
                السابق
              </button>
              <span className="px-3 py-1">{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed">
                التالي
              </button>
            </div>
          )}
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
    </div>
  );
}
