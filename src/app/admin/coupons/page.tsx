'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { CouponForm } from './CouponForm';

type Coupon = {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  minBookingAmount: number | null;
  maxUsages: number | null;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminCouponsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
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
    fetchCoupons();
  }, [isAuthenticated, user?.role, router, page, activeFilter]);

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit };
      if (activeFilter === true) params.isActive = 'true';
      if (activeFilter === false) params.isActive = 'false';
      const { data } = await api.get(endpoints.coupons.list(), { params });
      setCoupons(data.data?.items ?? []);
      setTotal(data.data?.total ?? 0);
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل تحميل الكوبونات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(endpoints.coupons.delete(id));
      setDeleteConfirm(null);
      fetchCoupons();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCoupon(null);
    fetchCoupons();
  };

  const openEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingCoupon(null);
    setShowForm(true);
  };

  if (!isAuthenticated) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة الكوبونات</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-[#b8860b] text-white px-4 py-2 rounded-lg hover:bg-[#9a7209]"
        >
          إضافة كوبون
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === '' ? 'bg-[#b8860b] text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          الكل
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter(true)}
          className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === true ? 'bg-[#b8860b] text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          نشط
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter(false)}
          className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === false ? 'bg-[#b8860b] text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          غير نشط
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <p className="text-slate-500">جاري التحميل...</p>
      ) : coupons.length === 0 ? (
        <p className="text-slate-500">لا توجد كوبونات</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-right p-3 font-medium">الكود</th>
                <th className="text-right p-3 font-medium">نوع الخصم</th>
                <th className="text-right p-3 font-medium">القيمة</th>
                <th className="text-right p-3 font-medium">الحد الأدنى</th>
                <th className="text-right p-3 font-medium">المستخدم / الأقصى</th>
                <th className="text-right p-3 font-medium">تنتهي في</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold">{c.code}</td>
                  <td className="p-3">{c.discountType === 'PERCENTAGE' ? 'نسبة مئوية' : 'مبلغ ثابت'}</td>
                  <td className="p-3">
                    {c.discountType === 'PERCENTAGE' ? `${c.value}%` : `${c.value} ر.ع`}
                  </td>
                  <td className="p-3">{c.minBookingAmount != null ? `${c.minBookingAmount} ر.ع` : '—'}</td>
                  <td className="p-3">{c.usedCount} {c.maxUsages != null ? `/ ${c.maxUsages}` : '/ ∞'}</td>
                  <td className="p-3 text-sm">{new Date(c.expiresAt).toLocaleDateString('ar-SA')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {c.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => openEdit(c)} className="text-[#b8860b] hover:underline text-sm">
                        تعديل
                      </button>
                      {deleteConfirm === c.id ? (
                        <>
                          <button type="button" onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-sm">
                            تأكيد
                          </button>
                          <button type="button" onClick={() => setDeleteConfirm(null)} className="text-slate-500 hover:underline text-sm">
                            إلغاء
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setDeleteConfirm(c.id)} className="text-red-600 hover:underline text-sm">
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
        <CouponForm
          coupon={editingCoupon}
          onSuccess={handleFormSuccess}
          onClose={() => { setShowForm(false); setEditingCoupon(null); }}
        />
      )}
    </div>
  );
}
