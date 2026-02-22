'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { CouponForm } from './CouponForm';
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
      setDeleteModal({ open: false, id: null });
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
    <div dir="rtl">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">إدارة الكوبونات</h1>
        <button
          type="button"
          onClick={openAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          إضافة كوبون
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['', true, false] as const).map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => setActiveFilter(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeFilter === v
                ? 'bg-teal-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {v === '' ? 'الكل' : v === true ? 'نشط' : 'غير نشط'}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <AdminTableLoader rows={8} cols={8} />
      ) : coupons.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
          لا توجد كوبونات
        </div>
      ) : (
        <div className={tableWrapper}>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead className={theadClass}>
                <tr>
                  <th className={thClass}>الكود</th>
                  <th className={thClass}>نوع الخصم</th>
                  <th className={thClass}>القيمة</th>
                  <th className={thClass}>الحد الأدنى</th>
                  <th className={thClass}>المستخدم / الأقصى</th>
                  <th className={thClass}>تنتهي في</th>
                  <th className={thClass}>الحالة</th>
                  <th className={thClass}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className={tbodyTrClass}>
                    <td className={tdClass + ' font-mono font-bold'}>{c.code}</td>
                    <td className={tdClass}>{c.discountType === 'PERCENTAGE' ? 'نسبة مئوية' : 'مبلغ ثابت'}</td>
                    <td className={tdClass}>
                      {c.discountType === 'PERCENTAGE' ? `${c.value}%` : `${c.value} ر.ع`}
                    </td>
                    <td className={tdClass}>{c.minBookingAmount != null ? `${c.minBookingAmount} ر.ع` : '—'}</td>
                    <td className={tdClass}>{c.usedCount} {c.maxUsages != null ? `/ ${c.maxUsages}` : '/ ∞'}</td>
                    <td className={tdClass}>{new Date(c.expiresAt).toLocaleDateString('ar-SA')}</td>
                    <td className={tdClass}>
                      <span className={c.isActive ? badgeActive : badgeInactive}>
                        {c.isActive ? 'نشط' : 'غير نشط'}
                      </span>
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
        <CouponForm
          coupon={editingCoupon}
          onSuccess={handleFormSuccess}
          onClose={() => { setShowForm(false); setEditingCoupon(null); }}
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
