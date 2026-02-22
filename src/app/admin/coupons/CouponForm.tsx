'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';

type Coupon = {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  minBookingAmount: number | null;
  maxUsages: number | null;
  expiresAt: string;
  isActive: boolean;
};

type Props = {
  coupon: Coupon | null;
  onSuccess: () => void;
  onClose: () => void;
};

const inputClass = 'w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2';

export function CouponForm({ coupon, onSuccess, onClose }: Props) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [minBookingAmount, setMinBookingAmount] = useState('');
  const [maxUsages, setMaxUsages] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setDiscountType(coupon.discountType);
      setValue(String(coupon.value));
      setMinBookingAmount(coupon.minBookingAmount != null ? String(coupon.minBookingAmount) : '');
      setMaxUsages(coupon.maxUsages != null ? String(coupon.maxUsages) : '');
      setExpiresAt(new Date(coupon.expiresAt).toISOString().slice(0, 10));
      setIsActive(coupon.isActive);
    } else {
      setCode('');
      setDiscountType('PERCENTAGE');
      setValue('');
      setMinBookingAmount('');
      setMaxUsages('');
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setExpiresAt(nextMonth.toISOString().slice(0, 10));
      setIsActive(true);
    }
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const val = parseFloat(value);
    if (isNaN(val) || val <= 0) {
      setError('أدخل قيمة صحيحة');
      return;
    }
    if (discountType === 'PERCENTAGE' && val > 100) {
      setError('النسبة لا تتجاوز 100%');
      return;
    }
    if (!code.trim()) {
      setError('أدخل كود الكوبون');
      return;
    }
    if (!expiresAt) {
      setError('أدخل تاريخ انتهاء الصلاحية');
      return;
    }
    const minAmt = minBookingAmount.trim() ? parseFloat(minBookingAmount) : null;
    const maxUsg = maxUsages.trim() ? parseInt(maxUsages, 10) : null;
    if (minAmt != null && (isNaN(minAmt) || minAmt < 0)) {
      setError('الحد الأدنى للحجز غير صحيح');
      return;
    }
    if (maxUsg != null && (isNaN(maxUsg) || maxUsg < 1)) {
      setError('الحد الأقصى للاستخدام يجب أن يكون 1 على الأقل');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        value: val,
        minBookingAmount: minAmt,
        maxUsages: maxUsg,
        expiresAt,
        isActive,
      };
      if (coupon) {
        await api.patch(endpoints.coupons.update(coupon.id), payload);
      } else {
        await api.post(endpoints.coupons.create(), payload);
      }
      onSuccess();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-600">
          <h2 className="text-xl font-bold">{coupon ? 'تعديل الكوبون' : 'إضافة كوبون'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">كود الكوبون</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={inputClass}
              placeholder="مثال: SUMMER20"
              dir="ltr"
              maxLength={50}
              readOnly={!!coupon}
            />
            {coupon && <p className="text-xs text-slate-500 mt-1">لا يمكن تغيير الكود</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">نوع الخصم</label>
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')} className={inputClass} dir="rtl">
              <option value="PERCENTAGE">نسبة مئوية %</option>
              <option value="FIXED">مبلغ ثابت (ر.ع)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">القيمة</label>
            <input
              type="number"
              step={discountType === 'PERCENTAGE' ? '0.01' : '0.001'}
              min="0"
              max={discountType === 'PERCENTAGE' ? 100 : undefined}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={inputClass}
              placeholder={discountType === 'PERCENTAGE' ? 'مثال: 10' : 'مثال: 5.5'}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الحد الأدنى للحجز (ر.ع) - اختياري</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={minBookingAmount}
              onChange={(e) => setMinBookingAmount(e.target.value)}
              className={inputClass}
              placeholder="اتركه فارغاً للإلغاء"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الحد الأقصى للاستخدام - اختياري</label>
            <input
              type="number"
              min="1"
              value={maxUsages}
              onChange={(e) => setMaxUsages(e.target.value)}
              className={inputClass}
              placeholder="اتركه فارغاً لاستخدام غير محدود"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">تنتهي الصلاحية في</label>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputClass} required dir="ltr" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
            <label htmlFor="isActive" className="text-sm">نشط</label>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" disabled={loading} className="flex-1 bg-[#b8860b] text-white py-2 rounded-lg hover:bg-[#9a7209] disabled:opacity-50">
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
