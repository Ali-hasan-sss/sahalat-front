'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { FileUpload } from '@/components/FileUpload';

const TRIP_TYPES = [
  { value: 'MARINE', labelAr: 'بحرية', labelEn: 'Marine' },
  { value: 'GROUP', labelAr: 'جماعية', labelEn: 'Group' },
  { value: 'INDIVIDUAL', labelAr: 'فردية', labelEn: 'Individual' },
] as const;

type Landmark = { id: string; name: string; nameAr?: string | null };

type Trip = {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  route?: string | null;
  routeAr?: string | null;
  tripType?: 'MARINE' | 'GROUP' | 'INDIVIDUAL' | null;
  durationDays: number;
  basePrice: number;
  maxParticipants: number | null;
  isActive: boolean;
  landmarks?: Landmark[];
};

type Props = {
  trip: Trip | null;
  onSuccess: () => void;
  onClose: () => void;
};

export function TripForm({ trip, onSuccess, onClose }: Props) {
  const isEdit = !!trip;
  const [title, setTitle] = useState(trip?.title ?? '');
  const [titleAr, setTitleAr] = useState(trip?.titleAr ?? '');
  const [description, setDescription] = useState(trip?.description ?? '');
  const [descriptionAr, setDescriptionAr] = useState(trip?.descriptionAr ?? '');
  const [route, setRoute] = useState(trip?.route ?? '');
  const [routeAr, setRouteAr] = useState(trip?.routeAr ?? '');
  const [tripType, setTripType] = useState<Trip['tripType']>(trip?.tripType ?? null);
  const [durationDays, setDurationDays] = useState(trip?.durationDays ?? 1);
  const [basePrice, setBasePrice] = useState(String(trip?.basePrice ?? ''));
  const [maxParticipants, setMaxParticipants] = useState(trip?.maxParticipants != null ? String(trip.maxParticipants) : '');
  const [isActive, setIsActive] = useState(trip?.isActive ?? true);
  const [landmarkIds, setLandmarkIds] = useState<string[]>(
    () => trip?.landmarks?.map((l) => l.id) ?? []
  );
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLandmarkIds(trip?.landmarks?.map((l) => l.id) ?? []);
  }, [trip?.id]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(endpoints.landmarks.list(), { params: { limit: 200 } });
        setLandmarks(data.data?.items ?? []);
      } catch {
        setLandmarks([]);
      }
    })();
  }, []);

  const toggleLandmark = (id: string) => {
    setLandmarkIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (landmarkIds.length === 0) {
      setError('يجب اختيار معلم سياحي واحد على الأقل');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title,
        titleAr: titleAr || undefined,
        description: description || undefined,
        descriptionAr: descriptionAr || undefined,
        route: route || undefined,
        routeAr: routeAr || undefined,
        tripType: tripType || undefined,
        durationDays: Number(durationDays),
        basePrice: Number(basePrice),
        maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
        isActive,
        landmarkIds,
      };
      if (isEdit && trip) {
        await api.patch(endpoints.trips.update(trip.id), payload);
      } else {
        await api.post(endpoints.trips.create(), payload);
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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">{isEdit ? 'تعديل رحلة' : 'إضافة رحلة'}</h2>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">العنوان (إنجليزي)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">العنوان (عربي)</label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">الوصف</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">الوصف (عربي)</label>
              <textarea
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                rows={2}
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">مسار الرحلة (مثال: مسقط - صحراء وهيبة)</label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="Muscat - Wahiba Desert"
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">مسار الرحلة (عربي)</label>
              <input
                type="text"
                value={routeAr}
                onChange={(e) => setRouteAr(e.target.value)}
                placeholder="مسقط - صحراء وهيبة"
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                المعالم السياحية <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                اختر معلم سياحي واحد أو أكثر
              </p>
              <div className="max-h-40 overflow-y-auto border dark:border-slate-600 rounded-lg p-2 space-y-1 dark:bg-slate-700">
                {landmarks.map((lm) => (
                  <label
                    key={lm.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 rounded px-2 py-1"
                  >
                    <input
                      type="checkbox"
                      checked={landmarkIds.includes(lm.id)}
                      onChange={() => toggleLandmark(lm.id)}
                      className="rounded"
                    />
                    <span className="text-sm dark:text-slate-200">
                      {lm.nameAr || lm.name}
                    </span>
                  </label>
                ))}
              </div>
              {landmarkIds.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  يجب اختيار معلم واحد على الأقل
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">نوع الرحلة</label>
              <select
                value={tripType ?? ''}
                onChange={(e) => setTripType((e.target.value || null) as Trip['tripType'])}
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
              >
                <option value="">اختر النوع</option>
                {TRIP_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.labelAr} / {t.labelEn}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">المدة (أيام)</label>
                <input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">السعر الأساسي (ر.ع.)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">الحد الأقصى للمشاركين</label>
              <input
                type="number"
                min={1}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="اختياري"
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm dark:text-slate-300">نشط</label>
            </div>
            {isEdit && trip && (
              <FileUpload
                label="إضافة صورة للرحلة"
                uploadUrl={endpoints.trips.addImage(trip.id)}
                fieldName="image"
                onSuccess={() => onSuccess()}
                onError={(msg) => setError(msg)}
              />
            )}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#b8860b] text-white py-2 rounded-lg hover:bg-[#9a7209] disabled:opacity-50"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
