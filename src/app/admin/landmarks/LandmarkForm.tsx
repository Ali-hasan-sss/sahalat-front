'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { FileUpload } from '@/components/FileUpload';
import { RichTextEditor } from '@/components/RichTextEditor';
import { getImageUrl } from '@/lib/upload';

const MapPicker = dynamic(() => import('@/components/MapPicker').then((m) => m.MapPicker), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] rounded-lg border dark:border-slate-600 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
      جاري تحميل الخريطة...
    </div>
  ),
});

type Landmark = {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  images?: { id: string; imagePath: string }[];
};

type Props = {
  landmark: Landmark | null;
  onSuccess: () => void;
  onClose: () => void;
};

export function LandmarkForm({ landmark, onSuccess, onClose }: Props) {
  const isEdit = !!landmark;
  const [name, setName] = useState(landmark?.name ?? '');
  const [nameAr, setNameAr] = useState(landmark?.nameAr ?? '');
  const [description, setDescription] = useState(landmark?.description ?? '');
  const [descriptionAr, setDescriptionAr] = useState(landmark?.descriptionAr ?? '');
  const [location, setLocation] = useState(landmark?.location ?? '');
  const [latitude, setLatitude] = useState<number | null>(landmark?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(landmark?.longitude ?? null);
  const [isActive, setIsActive] = useState(landmark?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<{ id: string; imagePath: string }[]>(landmark?.images ?? []);

  useEffect(() => {
    if (!landmark) {
      setName('');
      setNameAr('');
      setDescription('');
      setDescriptionAr('');
      setLocation('');
      setLatitude(null);
      setLongitude(null);
      setIsActive(true);
      setImages([]);
      return;
    }
    setName(landmark.name);
    setNameAr(landmark.nameAr ?? '');
    setDescription(landmark.description ?? '');
    setDescriptionAr(landmark.descriptionAr ?? '');
    setLocation(landmark.location ?? '');
    setLatitude(landmark.latitude ?? null);
    setLongitude(landmark.longitude ?? null);
    setIsActive(landmark.isActive);
    api
      .get(endpoints.landmarks.byId(landmark.id))
      .then(({ data }) => setImages(data.data?.images ?? landmark.images ?? []))
      .catch(() => setImages(landmark.images ?? []));
  }, [landmark?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name,
        nameAr: nameAr || undefined,
        description: description || undefined,
        descriptionAr: descriptionAr || undefined,
        location: location || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        isActive,
      };
      if (isEdit && landmark) {
        await api.patch(endpoints.landmarks.update(landmark.id), payload);
      } else {
        await api.post(endpoints.landmarks.create(), payload);
      }
      onSuccess();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    if (!landmark) return;
    try {
      await api.delete(endpoints.landmarks.removeImage(landmark.id, imageId));
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل حذف الصورة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            {isEdit ? 'تعديل معلم' : 'إضافة معلم سياحي'}
          </h2>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">الاسم (إنجليزي) *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">الاسم (عربي)</label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">الوصف (إنجليزي)</label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                استخدم شريط الأدوات لتنسيق النص (عناوين، غامق، قوائم، روابط)
              </p>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="الوصف بالإنجليزي..."
                dir="ltr"
                editorAlign="right"
                stickyToolbar
                className="[&_.ql-editor]:bg-white dark:[&_.ql-editor]:bg-slate-700 [&_.ql-toolbar]:bg-slate-100 dark:[&_.ql-toolbar]:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">الوصف (عربي)</label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                استخدم شريط الأدوات لتنسيق النص (عناوين، غامق، قوائم، روابط)
              </p>
              <RichTextEditor
                value={descriptionAr}
                onChange={setDescriptionAr}
                placeholder="الوصف بالعربي..."
                dir="rtl"
                editorAlign="right"
                stickyToolbar
                className="[&_.ql-editor]:bg-white dark:[&_.ql-editor]:bg-slate-700 [&_.ql-toolbar]:bg-slate-100 dark:[&_.ql-toolbar]:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">الموقع / العنوان</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: مسقط، سلطنة عمان"
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">اختيار الموقع على الخريطة</label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                اضغط على الخريطة لتحديد موقع المعلم (مركز سلطنة عُمان)
              </p>
              <MapPicker
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                height="320px"
              />
              {latitude != null && longitude != null && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  الإحداثيات: {latitude.toFixed(6)}، {longitude.toFixed(6)}
                </p>
              )}
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

            {isEdit && landmark && (
              <>
                {images.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-slate-300">الصور الحالية</label>
                    <div className="flex flex-wrap gap-2">
                      {images.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={getImageUrl(img.imagePath)}
                            alt=""
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <FileUpload
                  label="إضافة صورة للمعلم"
                  uploadUrl={endpoints.landmarks.addImage(landmark.id)}
                  fieldName="image"
                  onSuccess={async () => {
                    try {
                      const { data } = await api.get(endpoints.landmarks.byId(landmark.id));
                      setImages(data.data?.images ?? []);
                    } catch {
                      onSuccess();
                    }
                  }}
                  onError={(msg) => setError(msg)}
                />
              </>
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
