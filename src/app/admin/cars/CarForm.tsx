'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { FileUpload } from '@/components/FileUpload';
import { getImageUrl } from '@/lib/upload';
import { ImagePlus, X } from 'lucide-react';

const CATEGORIES = [
  { value: 'ECONOMY', labelAr: 'Economy', labelEn: 'Economy' },
  { value: 'SUV', labelAr: 'SUV', labelEn: 'SUV' },
  { value: 'LUXURY', labelAr: 'Luxury', labelEn: 'Luxury' },
  { value: 'VAN', labelAr: 'Van', labelEn: 'Van' },
] as const;

const TRANSMISSIONS = [
  { value: 'AUTOMATIC', labelAr: 'أوتوماتيك', labelEn: 'Automatic' },
  { value: 'MANUAL', labelAr: 'يدوي', labelEn: 'Manual' },
] as const;

const FUEL_TYPES = [
  { value: 'PETROL', labelAr: 'بنزين', labelEn: 'Petrol' },
  { value: 'DIESEL', labelAr: 'ديزل', labelEn: 'Diesel' },
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2014 }, (_, i) => 2015 + i).reverse();

type Car = {
  id: string;
  name: string;
  nameAr: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  basePricePerDay: number;
  basePricePerWeek?: number | null;
  basePricePerMonth?: number | null;
  basePricePerDayWithDriver?: number | null;
  basePricePerWeekWithDriver?: number | null;
  basePricePerMonthWithDriver?: number | null;
  category: string;
  transmission: string;
  seats: number;
  fuelType: string | null;
  isActive: boolean;
  images?: { id: string; imagePath: string }[];
};

type Props = {
  car: Car | null;
  onSuccess: (createdCar?: Car) => void;
  onClose: () => void;
};

const inputClass = 'w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2';

export function CarForm({ car, onSuccess, onClose }: Props) {
  const isEdit = !!car;
  const [name, setName] = useState(car?.name ?? '');
  const [nameAr, setNameAr] = useState(car?.nameAr ?? '');
  const [description, setDescription] = useState(car?.description ?? '');
  const [descriptionAr, setDescriptionAr] = useState(car?.descriptionAr ?? '');
  const [brand, setBrand] = useState(car?.brand ?? '');
  const [model, setModel] = useState(car?.model ?? '');
  const [year, setYear] = useState<string>(car?.year != null ? String(car.year) : '');
  const [basePricePerDay, setBasePricePerDay] = useState(String(car?.basePricePerDay ?? ''));
  const [basePricePerWeek, setBasePricePerWeek] = useState(String(car?.basePricePerWeek ?? ''));
  const [basePricePerMonth, setBasePricePerMonth] = useState(String(car?.basePricePerMonth ?? ''));
  const [basePricePerDayWithDriver, setBasePricePerDayWithDriver] = useState(String(car?.basePricePerDayWithDriver ?? ''));
  const [basePricePerWeekWithDriver, setBasePricePerWeekWithDriver] = useState(String(car?.basePricePerWeekWithDriver ?? ''));
  const [basePricePerMonthWithDriver, setBasePricePerMonthWithDriver] = useState(String(car?.basePricePerMonthWithDriver ?? ''));
  const [category, setCategory] = useState<Car['category']>(car?.category ?? 'ECONOMY');
  const [transmission, setTransmission] = useState<Car['transmission']>(car?.transmission ?? 'AUTOMATIC');
  const [seats, setSeats] = useState(car?.seats ?? 5);
  const [fuelType, setFuelType] = useState<Car['fuelType']>(car?.fuelType ?? null);
  const [isActive, setIsActive] = useState(car?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<{ id: string; imagePath: string }[]>(car?.images ?? []);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const addImageFiles = (files: FileList | File[]) => {
    const list = Array.isArray(files) ? files : Array.from(files);
    const valid = list.filter((f) => f.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i));
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

  useEffect(() => {
    if (!car) {
      setName('');
      setNameAr('');
      setDescription('');
      setDescriptionAr('');
      setBrand('');
      setModel('');
      setYear('');
      setBasePricePerDay('');
      setBasePricePerWeek('');
      setBasePricePerMonth('');
      setBasePricePerDayWithDriver('');
      setBasePricePerWeekWithDriver('');
      setBasePricePerMonthWithDriver('');
      setCategory('ECONOMY');
      setTransmission('AUTOMATIC');
      setSeats(5);
      setFuelType(null);
      setIsActive(true);
      setImages([]);
      setPendingImages([]);
      return;
    }
    setName(car.name);
    setNameAr(car.nameAr ?? '');
    setDescription(car.description ?? '');
    setDescriptionAr(car.descriptionAr ?? '');
    setBrand(car.brand ?? '');
    setModel(car.model ?? '');
    setYear(car.year != null ? String(car.year) : '');
    setBasePricePerDay(String(car.basePricePerDay));
    setBasePricePerWeek(car.basePricePerWeek != null ? String(car.basePricePerWeek) : '');
    setBasePricePerMonth(car.basePricePerMonth != null ? String(car.basePricePerMonth) : '');
    setBasePricePerDayWithDriver(car.basePricePerDayWithDriver != null ? String(car.basePricePerDayWithDriver) : '');
    setBasePricePerWeekWithDriver(car.basePricePerWeekWithDriver != null ? String(car.basePricePerWeekWithDriver) : '');
    setBasePricePerMonthWithDriver(car.basePricePerMonthWithDriver != null ? String(car.basePricePerMonthWithDriver) : '');
    setCategory(car.category);
    setTransmission(car.transmission);
    setSeats(car.seats);
    setFuelType(car.fuelType ?? null);
    setIsActive(car.isActive);
    api
      .get(endpoints.cars.byId(car.id))
      .then(({ data }) => setImages(data.data?.images ?? car.images ?? []))
      .catch(() => setImages(car.images ?? []));
  }, [car?.id]);

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
        brand: brand.trim() || null,
        model: model.trim() || null,
        year: year !== '' ? Number(year) : null,
        basePricePerDay: Number(basePricePerDay),
        basePricePerWeek: basePricePerWeek !== '' ? Number(basePricePerWeek) : undefined,
        basePricePerMonth: basePricePerMonth !== '' ? Number(basePricePerMonth) : undefined,
        basePricePerDayWithDriver: basePricePerDayWithDriver !== '' ? Number(basePricePerDayWithDriver) : undefined,
        basePricePerWeekWithDriver: basePricePerWeekWithDriver !== '' ? Number(basePricePerWeekWithDriver) : undefined,
        basePricePerMonthWithDriver: basePricePerMonthWithDriver !== '' ? Number(basePricePerMonthWithDriver) : undefined,
        category,
        transmission,
        seats,
        fuelType: fuelType ?? undefined,
        isActive,
      };
      if (isEdit && car) {
        await api.patch(endpoints.cars.update(car.id), payload);
        onSuccess();
      } else {
        const { data } = await api.post(endpoints.cars.create(), payload);
        const createdCar = data?.data as Car | undefined;
        const createdId = createdCar?.id;
        if (!createdId) {
          throw new Error('لم يتم إنشاء السيارة بشكل صحيح');
        }
        for (const file of pendingImages) {
          const fd = new FormData();
          fd.append('image', file);
          await api.post(endpoints.cars.addImage(createdId), fd);
        }
        setPendingImages([]);
        onSuccess(createdCar!);
      }
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    if (!car) return;
    try {
      await api.delete(endpoints.cars.removeImage(car.id, imageId));
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل حذف الصورة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            {isEdit ? 'تعديل سيارة' : 'إضافة سيارة'}
          </h2>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* الاسم - عربي و إنجليزي مقابل بعض */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">الاسم (عربي)</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className={inputClass}
                  placeholder="نيسان بترول"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">الاسم (إنجليزي) *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  required
                  placeholder="Nissan Patrol"
                />
              </div>
            </div>

            {/* الوصف - عربي وإنجليزي مقابل بعض */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">الوصف (عربي)</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="وصف السيارة بالعربية"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">الوصف (إنجليزي)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Car description in English"
                />
              </div>
            </div>

            {/* البراند - الموديل - السنة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">البراند</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={inputClass}
                  placeholder="Nissan, Toyota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">الموديل</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={inputClass}
                  placeholder="Patrol, Land Cruiser"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">سنة الصنع</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className={inputClass}>
                  <option value="">اختر السنة</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* الفئة - ناقل الحركة - المقاعد - الوقود */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">الفئة *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Car['category'])}
                  className={inputClass}
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.labelAr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">ناقل الحركة *</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as Car['transmission'])}
                  className={inputClass}
                  required
                >
                  {TRANSMISSIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.labelAr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">عدد المقاعد *</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">نوع الوقود</label>
                <select
                  value={fuelType ?? ''}
                  onChange={(e) => setFuelType(e.target.value || null)}
                  className={inputClass}
                >
                  <option value="">اختر</option>
                  {FUEL_TYPES.map((f) => (
                    <option key={f.value} value={f.value}>{f.labelAr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* الأسعار - بدون سائق */}
            <h3 className="text-sm font-semibold dark:text-slate-300 pt-2">الأسعار (بدون سائق)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">السعر (ر.ع./يوم) *</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={basePricePerDay}
                  onChange={(e) => setBasePricePerDay(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">السعر (ر.ع./أسبوع)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={basePricePerWeek}
                  onChange={(e) => setBasePricePerWeek(e.target.value)}
                  className={inputClass}
                  placeholder="اختياري"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">السعر (ر.ع./شهر)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={basePricePerMonth}
                  onChange={(e) => setBasePricePerMonth(e.target.value)}
                  className={inputClass}
                  placeholder="اختياري"
                />
              </div>
            </div>
            {/* الأسعار - مع سائق */}
            <h3 className="text-sm font-semibold dark:text-slate-300 pt-2">الأسعار (مع سائق)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">السعر (ر.ع./يوم)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={basePricePerDayWithDriver}
                  onChange={(e) => setBasePricePerDayWithDriver(e.target.value)}
                  className={inputClass}
                  placeholder="اختياري"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">السعر (ر.ع./أسبوع)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={basePricePerWeekWithDriver}
                  onChange={(e) => setBasePricePerWeekWithDriver(e.target.value)}
                  className={inputClass}
                  placeholder="اختياري"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">السعر (ر.ع./شهر)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={basePricePerMonthWithDriver}
                  onChange={(e) => setBasePricePerMonthWithDriver(e.target.value)}
                  className={inputClass}
                  placeholder="اختياري"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm dark:text-slate-300">متاحة للحجز</label>
            </div>

            {/* رفع الصور */}
            <div>
              {isEdit && car ? (
                <>
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {images.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={getImageUrl(img.imagePath)}
                            alt=""
                            className="w-20 h-20 object-cover rounded-lg border dark:border-slate-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FileUpload
                    label="إضافة صورة للسيارة"
                    uploadUrl={endpoints.cars.addImage(car.id)}
                    fieldName="image"
                    onSuccess={async () => {
                      try {
                        const { data } = await api.get(endpoints.cars.byId(car.id));
                        setImages(data.data?.images ?? []);
                      } catch {
                        onSuccess();
                      }
                    }}
                    onError={(msg) => setError(msg)}
                  />
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">صور السيارة</label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">يمكنك رفع صورة أو أكثر (تُرفع بعد إنشاء السيارة)</p>
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
                {loading ? 'جاري الحفظ...' : car ? 'حفظ التعديلات' : 'إضافة السيارة'}
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
