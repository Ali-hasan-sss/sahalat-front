'use client';

import { useRef, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { FileUpload } from '@/components/FileUpload';
import { ImagePlus, X } from 'lucide-react';

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

const inputClass =
  'w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2';
const labelClass = 'block text-sm font-medium mb-1 dark:text-slate-300';

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
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const addImageFiles = (files: FileList | File[]) => {
    const list = Array.isArray(files) ? files : Array.from(files);
    const valid = list.filter((f) =>
      f.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)
    );
    setPendingImages((prev) => [...prev, ...valid]);
  };

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addImageFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addImageFiles(e.dataTransfer.files);
  };

  const removePendingImage = (idx: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== idx));
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
        const { data } = await api.post(endpoints.trips.create(), payload);
        const createdId = data.data?.id;
        if (createdId && pendingImages.length > 0) {
          for (const file of pendingImages) {
            const fd = new FormData();
            fd.append('image', file);
            await api.post(endpoints.trips.addImage(createdId), fd);
          }
        }
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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">{isEdit ? 'تعديل رحلة' : 'إضافة رحلة'}</h2>
          {error && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* العنوان - عمودين */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>العنوان (إنجليزي)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>العنوان (عربي)</label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* الوصف - عمودين */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>الوصف (إنجليزي)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>الوصف (عربي)</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>

            {/* المسار - عمودين */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>مسار الرحلة (إنجليزي)</label>
                <input
                  type="text"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="Muscat - Wahiba Desert"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>مسار الرحلة (عربي)</label>
                <input
                  type="text"
                  value={routeAr}
                  onChange={(e) => setRouteAr(e.target.value)}
                  placeholder="مسقط - صحراء وهيبة"
                  className={inputClass}
                />
              </div>
            </div>

            {/* المعالم السياحية */}
            <div>
              <label className={labelClass}>
                المعالم السياحية <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">اختر معلم سياحي واحد أو أكثر</p>
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
                    <span className="text-sm dark:text-slate-200">{lm.nameAr || lm.name}</span>
                  </label>
                ))}
              </div>
              {landmarkIds.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">يجب اختيار معلم واحد على الأقل</p>
              )}
            </div>

            {/* نوع الرحلة + المدة والسعر - عمودين */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>نوع الرحلة</label>
                <select
                  value={tripType ?? ''}
                  onChange={(e) => setTripType((e.target.value || null) as Trip['tripType'])}
                  className={inputClass}
                >
                  <option value="">اختر النوع</option>
                  {TRIP_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.labelAr} / {t.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>المدة (أيام)</label>
                  <input
                    type="number"
                    min={1}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>السعر (ر.ع.)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* الحد الأقصى + نشط */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>الحد الأقصى للمشاركين</label>
                <input
                  type="number"
                  min={1}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  placeholder="اختياري"
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm dark:text-slate-300">نشط</label>
              </div>
            </div>

            {/* رفع الصور */}
            <div>
              {isEdit && trip ? (
                <FileUpload
                  label="إضافة صورة للرحلة"
                  uploadUrl={endpoints.trips.addImage(trip.id)}
                  fieldName="image"
                  onSuccess={() => onSuccess()}
                  onError={(msg) => setError(msg)}
                />
              ) : (
                <div>
                  <label className={labelClass}>صور الرحلة</label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">يمكنك رفع صورة أو أكثر (تُرفع بعد إنشاء الرحلة)</p>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={addImages}
                    className="hidden"
                  />
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center cursor-pointer hover:border-teal-500 dark:hover:border-teal-500 transition-colors"
                  >
                    <ImagePlus size={32} className="mx-auto text-slate-400 dark:text-slate-500 mb-2" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      انقر لاختيار صور أو اسحبها هنا
                    </span>
                  </div>
                  {pendingImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pendingImages.map((file, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-600 group"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePendingImage(idx)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={20} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300"
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
