'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { Star } from 'lucide-react';
import { AdminTableLoader } from '@/app/admin/components/AdminTableLoader';
import {
  tableWrapper,
  tableClass,
  theadClass,
  thClass,
  tbodyTrClass,
  tdClass,
} from '@/app/admin/components/AdminTable';

type AdminReview = {
  id: string;
  type: 'TRIP' | 'CAR';
  rating: number;
  comment: string | null;
  isFeatured: boolean;
  createdAt: string;
  userName: string;
  userCountry: string | null;
  referenceTitle: string;
  referenceId: string;
};

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TRIP' | 'CAR'>('ALL');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchReviews();
  }, [isAuthenticated, user?.role, router]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpoints.reviews.adminAll());
      const items = (data.data?.items ?? []) as AdminReview[];
      setReviews(items);
      setFeaturedIds(new Set(items.filter((r) => r.isFeatured).map((r) => r.id)));
    } catch (e) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'فشل تحميل التقييمات'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = (id: string) => {
    setFeaturedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const ids = Array.from(featuredIds);
      const tripReviewIds = reviews.filter((r) => r.type === 'TRIP' && ids.includes(r.id)).map((r) => r.id);
      const carReviewIds = reviews.filter((r) => r.type === 'CAR' && ids.includes(r.id)).map((r) => r.id);
      await api.patch(endpoints.reviews.adminUpdateFeatured(), {
        tripReviewIds,
        carReviewIds,
      });
      setSuccess('تم حفظ التقييمات المعروضة بنجاح');
      fetchReviews();
    } catch (e) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'فشل الحفظ'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  const filtered = reviews.filter(
    (r) => typeFilter === 'ALL' || r.type === typeFilter
  );

  return (
    <div dir="rtl" className="text-right">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">إدارة التقييمات المعروضة</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <p className="text-slate-600 dark:text-slate-400 mb-4">
        حدد التقييمات التي تريد عرضها في قسم &quot;ماذا يقول عملاؤنا&quot; في الصفحة الرئيسية. فقط التقييمات التي تحتوي على تعليق تظهر في السلايدر.
      </p>

      <div className="flex gap-2 mb-4">
        {(['ALL', 'TRIP', 'CAR'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              typeFilter === t
                ? 'bg-teal-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {t === 'ALL' ? 'الكل' : t === 'TRIP' ? 'رحلات' : 'سيارات'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl text-sm">
          {success}
        </div>
      )}

      {loading ? (
        <AdminTableLoader rows={6} cols={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
          لا توجد تقييمات
        </div>
      ) : (
        <div className={tableWrapper}>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead className={theadClass}>
                <tr>
                  <th className={thClass + ' w-12'}>عرض</th>
                  <th className={thClass}>النوع</th>
                  <th className={thClass}>المستخدم</th>
                  <th className={thClass}>الرحلة/السيارة</th>
                  <th className={thClass}>التقييم</th>
                  <th className={thClass + ' max-w-xs'}>التعليق</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className={tbodyTrClass}>
                    <td className={tdClass}>
                      <label className="flex items-center justify-end gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={featuredIds.has(r.id)}
                          onChange={() => toggleFeatured(r.id)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                        />
                      </label>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          r.type === 'TRIP'
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {r.type === 'TRIP' ? 'رحلة' : 'سيارة'}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <div>
                        <span className="font-medium">{r.userName}</span>
                        {r.userCountry && (
                          <span className="text-slate-500 dark:text-slate-400 text-sm block">
                            {r.userCountry}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={tdClass + ' font-medium'}>{r.referenceTitle}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-1" dir="ltr">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < r.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }
                          />
                        ))}
                      </div>
                    </td>
                    <td className={tdClass + ' max-w-xs'}>
                      <span
                        className={`text-sm line-clamp-2 ${
                          r.comment ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 italic'
                        }`}
                        title={r.comment ?? undefined}
                      >
                        {r.comment ?? 'بدون تعليق'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
