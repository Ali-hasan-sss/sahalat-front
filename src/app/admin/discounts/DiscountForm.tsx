'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';

type Discount = {
  id: string;
  type: 'TRIP' | 'CAR';
  referenceId: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type Trip = { id: string; title: string; titleAr: string | null };
type Car = { id: string; name: string; nameAr: string | null };

type Props = {
  discount: Discount | null;
  trips: Trip[];
  cars: Car[];
  onSuccess: () => void;
  onClose: () => void;
};

const inputClass = 'w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2';

export default function DiscountForm({ discount, trips, cars, onSuccess, onClose }: Props) {
  const [type, setType] = useState<'TRIP' | 'CAR'>('TRIP');
  const [referenceId, setReferenceId] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (discount) {
      setType(discount.type);
      setReferenceId(discount.referenceId);
      setDiscountType(discount.discountType);
      setValue(String(discount.value));
      setStartDate(new Date(discount.startDate).toISOString().slice(0, 10));
      setEndDate(new Date(discount.endDate).toISOString().slice(0, 10));
      setIsActive(discount.isActive);
    } else {
      setType('TRIP');
      setReferenceId('');
      setDiscountType('PERCENTAGE');
      setValue('');
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setEndDate(today);
      setIsActive(true);
    }
  }, [discount]);

  useEffect(() => {
    if (!referenceId) return;
    const refs = type === 'TRIP' ? trips : cars;
    if (refs.length > 0 && !refs.some((r) => r.id === referenceId)) {
      setReferenceId('');
    }
  }, [type, referenceId, trips, cars]);

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
    if (!referenceId) {
      setError('اختر رحلة أو سيارة');
      return;
    }
    if (!startDate || !endDate) {
      setError('أدخل تاريخ البداية والنهاية');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('تاريخ النهاية يجب أن يكون بعد البداية');
      return;
    }
    setLoading(true);
    try {
      const payload = { type, referenceId, discountType, value: val, startDate, endDate, isActive };
      if (discount) {
        await api.patch(endpoints.discounts.update(discount.id), payload);
      } else {
        await api.post(endpoints.discounts.create(), payload);
      }
      onSuccess();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const refs = type === 'TRIP' ? trips : cars;
  const getRefLabel = (r: Trip | Car) => ('titleAr' in r ? (r.titleAr ?? r.title) : (r.nameAr ?? r.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-600">
          <h2 className="text-xl font-bold">{discount ? 'تعديل الخصم' : 'إضافة خصم'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">النوع</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'TRIP' | 'CAR')} className={inputClass} dir="rtl">
              <option value="TRIP">رحلة</option>
              <option value="CAR">سيارة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{type === 'TRIP' ? 'الرحلة' : 'السيارة'}</label>
            <select value={referenceId} onChange={(e) => setReferenceId(e.target.value)} className={inputClass} dir="rtl" required>
              <option value="">اختر...</option>
              {referenceId && !refs.some((r) => r.id === referenceId) && (
                <option value={referenceId}>{type === 'TRIP' ? 'الرحلة المحددة' : 'السيارة المحددة'}</option>
              )}
              {refs.map((r) => (
                <option key={r.id} value={r.id}>
                  {getRefLabel(r)}
                </option>
              ))}
            </select>
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
            <label className="block text-sm font-medium mb-1">من تاريخ</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} required dir="ltr" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">إلى تاريخ</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} required dir="ltr" />
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
