'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { getImageUrl } from '@/lib/upload';
import { getFeatureIconOptions, FeatureIcon } from '@/lib/featureIcons';
import { FileUpload } from '@/components/FileUpload';
import { RichTextEditor } from '@/components/RichTextEditor';

type TripFeature = {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  icon: string | null;
  order: number;
};

type TripItineraryDay = {
  id: string;
  dayNumber: number;
  duration: string | null;
  durationAr: string | null;
  title: string;
  titleAr: string | null;
  content: string | null;
  contentAr: string | null;
  extraInfo: string | null;
  extraInfoAr: string | null;
  order: number;
};

type TripIncluded = { id: string; text: string; textAr: string | null; icon: string | null; order: number };
type TripExcluded = { id: string; text: string; textAr: string | null; icon: string | null; order: number };

type TripMeal = {
  id: string;
  dayNumber: number;
  breakfast: string | null;
  breakfastAr: string | null;
  lunch: string | null;
  lunchAr: string | null;
  dinner: string | null;
  dinnerAr: string | null;
};

type TripHotel = {
  id: string;
  nightNumber: number;
  hotelName: string;
  hotelNameAr: string | null;
  city: string | null;
  cityAr: string | null;
  category: string | null;
};

type Trip = {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  route?: string | null;
  routeAr?: string | null;
  tripType?: string | null;
  durationDays: number;
  basePrice: number;
  maxParticipants: number | null;
  isActive: boolean;
  images: { id: string; imagePath: string; order: number }[];
  features?: TripFeature[];
  itineraryDays?: TripItineraryDay[];
  included?: TripIncluded[];
  excluded?: TripExcluded[];
  meals?: TripMeal[];
  hotels?: TripHotel[];
  averageRating?: number;
  reviewsCount?: number;
  reviews?: { id: string; userId: string; userName: string; rating: number; comment: string | null; createdAt: string }[];
};

export default function AdminTripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<string>('images');

  const fetchTrip = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpoints.trips.byId(id));
      setTrip(data.data);
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل تحميل الرحلة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchTrip();
  }, [isAuthenticated, user?.role, router, id]);

  if (!isAuthenticated) return null;
  if (loading) return <p className="text-slate-500">جاري التحميل...</p>;
  if (error || !trip) {
    return (
      <div>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <Link href="/admin/trips" className="text-[#b8860b] hover:underline">← العودة للرحلات</Link>
      </div>
    );
  }

  const sections = [
    { id: 'images', label: 'الصور' },
    { id: 'features', label: 'المميزات' },
    { id: 'itinerary', label: 'البرنامج التفصيلي' },
    { id: 'included', label: 'ما يشمله' },
    { id: 'excluded', label: 'ما لا يشمله' },
    { id: 'meals', label: 'الوجبات' },
    { id: 'hotels', label: 'الفنادق' },
    { id: 'reviews', label: 'التقييمات' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/admin/trips" className="text-[#b8860b] hover:underline text-sm mb-2 inline-block">← العودة للرحلات</Link>
          <h1 className="text-2xl font-bold">{trip.titleAr ?? trip.title}</h1>
          <p className="text-slate-500 text-sm">
            {trip.durationDays} يوم · {trip.basePrice} ر.ع.
            {trip.routeAr && ` · ${trip.routeAr}`}
            {trip.averageRating != null && trip.reviewsCount != null && (
              <> · ⭐ {trip.averageRating}/5 ({trip.reviewsCount} تقييم{trip.reviewsCount > 1 ? 'ات' : ''})</>
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              activeSection === s.id
                ? 'bg-[#b8860b] text-white'
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'images' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-600 p-6">
          <h2 className="text-lg font-bold mb-4">معرض الصور</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {trip.images?.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={getImageUrl(img.imagePath)}
                  alt=""
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.delete(endpoints.trips.removeImage(trip.id, img.id));
                      fetchTrip();
                    } catch (e) {
                      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
                    }
                  }}
                  className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          <FileUpload
            label="إضافة صورة"
            uploadUrl={endpoints.trips.addImage(trip.id)}
            fieldName="image"
            onSuccess={() => fetchTrip()}
            onError={(msg) => setError(msg)}
          />
        </div>
      )}

      {activeSection === 'features' && (
        <TripFeaturesSection tripId={trip.id} features={trip.features ?? []} onRefresh={fetchTrip} onError={setError} />
      )}

      {activeSection === 'itinerary' && (
        <TripItinerarySection tripId={trip.id} days={trip.itineraryDays ?? []} onRefresh={fetchTrip} onError={setError} />
      )}

      {activeSection === 'included' && (
        <TripIncludedExcludedSection
          tripId={trip.id}
          type="included"
          items={trip.included ?? []}
          onRefresh={fetchTrip}
          onError={setError}
        />
      )}

      {activeSection === 'excluded' && (
        <TripIncludedExcludedSection
          tripId={trip.id}
          type="excluded"
          items={trip.excluded ?? []}
          onRefresh={fetchTrip}
          onError={setError}
        />
      )}

      {activeSection === 'meals' && (
        <TripMealsSection tripId={trip.id} meals={trip.meals ?? []} onRefresh={fetchTrip} onError={setError} />
      )}

      {activeSection === 'hotels' && (
        <TripHotelsSection tripId={trip.id} hotels={trip.hotels ?? []} onRefresh={fetchTrip} onError={setError} />
      )}

      {activeSection === 'reviews' && (
        <TripReviewsSection
          averageRating={trip.averageRating ?? 0}
          reviewsCount={trip.reviewsCount ?? 0}
          reviews={trip.reviews ?? []}
        />
      )}
    </div>
  );
}

const FEATURE_CARD_STYLES = [
  { bg: 'bg-green-50 dark:bg-green-950/30', iconBg: 'bg-green-500' },
  { bg: 'bg-amber-50 dark:bg-amber-950/30', iconBg: 'bg-amber-500' },
  { bg: 'bg-blue-50 dark:bg-blue-950/30', iconBg: 'bg-blue-500' },
];

function TripFeaturesSection({
  tripId,
  features,
  onRefresh,
  onError,
}: {
  tripId: string;
  features: TripFeature[];
  onRefresh: () => void;
  onError: (m: string) => void;
}) {
  const locale = useAppSelector((s) => s.language.locale) as 'ar' | 'en';
  const isAr = locale === 'ar';
  const iconOptions = getFeatureIconOptions(locale);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [iconOpen, setIconOpen] = useState(false);
  const [iconOpenUp, setIconOpenUp] = useState(false);
  const iconDropdownRef = useRef<HTMLDivElement>(null);
  const iconTriggerRef = useRef<HTMLButtonElement>(null);

  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(e.target as Node)) {
        setIconOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const startEdit = (f: TripFeature) => {
    setEditingId(f.id);
    setTitle(f.title);
    setTitleAr(f.titleAr ?? '');
    setDescription(f.description ?? '');
    setDescriptionAr(f.descriptionAr ?? '');
    setIcon(f.icon ?? '');
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setTitleAr('');
    setDescription('');
    setDescriptionAr('');
    setIcon('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(endpoints.trips.addFeature(tripId), {
        title,
        titleAr: titleAr || undefined,
        description: description || undefined,
        descriptionAr: descriptionAr || undefined,
        icon: icon || undefined,
      });
      setAdding(false);
      cancelEdit();
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الإضافة');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await api.patch(endpoints.trips.updateFeature(tripId, editingId), {
        title,
        titleAr: titleAr || undefined,
        description: description || undefined,
        descriptionAr: descriptionAr || undefined,
        icon: icon || undefined,
      });
      cancelEdit();
      setEditingId(null);
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل التحديث');
    }
  };

  const handleRemove = async (featureId: string) => {
    try {
      await api.delete(endpoints.trips.removeFeature(tripId, featureId));
      if (editingId === featureId) cancelEdit();
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  const renderFeatureForm = (isEdit: boolean) => (
    <form onSubmit={isEdit ? handleUpdate : handleAdd} className="space-y-3 p-4 border dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/30">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="الميزة (إنجليزي)"
        className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
        required
      />
      <input
        type="text"
        value={titleAr}
        onChange={(e) => setTitleAr(e.target.value)}
        placeholder="الميزة (عربي)"
        className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="وصف الميزة (إنجليزي)"
        rows={2}
        className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
      />
      <textarea
        value={descriptionAr}
        onChange={(e) => setDescriptionAr(e.target.value)}
        placeholder="وصف الميزة (عربي)"
        rows={2}
        className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
      />
      <div ref={iconDropdownRef} className="relative">
        <label className="block text-sm font-medium mb-1 dark:text-slate-300">الأيقونة</label>
        <button
          ref={iconTriggerRef}
          type="button"
          onClick={() => {
            if (!iconOpen) {
              const rect = iconTriggerRef.current?.getBoundingClientRect();
              const spaceBelow = rect ? window.innerHeight - rect.bottom : 300;
              setIconOpenUp(spaceBelow < 250);
            }
            setIconOpen((o) => !o);
          }}
          className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2 flex items-center gap-3 text-right"
        >
          {icon ? (
            <>
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-600 shrink-0">
                <FeatureIcon name={icon} size={20} className="text-slate-600 dark:text-slate-300" />
              </span>
              <span>{iconOptions.find((o) => o.value === icon)?.label ?? icon}</span>
            </>
          ) : (
            <span className="text-slate-500">بدون أيقونة</span>
          )}
        </button>
        {iconOpen && (
          <div
            className={`absolute left-0 right-0 max-h-56 overflow-y-auto border dark:border-slate-600 rounded-lg shadow-lg bg-white dark:bg-slate-800 z-[100] ${
              iconOpenUp ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
          >
            <button
              type="button"
              onClick={() => { setIcon(''); setIconOpen(false); }}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 text-right"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0" />
              <span>بدون أيقونة</span>
            </button>
            {iconOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setIcon(opt.value); setIconOpen(false); }}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 text-right"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0">
                  <FeatureIcon name={opt.value} size={20} className="text-slate-600 dark:text-slate-300" />
                </span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-[#b8860b] text-white px-4 py-2 rounded-lg">
          {isEdit ? 'حفظ التعديل' : 'إضافة'}
        </button>
        <button
          type="button"
          onClick={() => (isEdit ? cancelEdit() : setAdding(false))}
          className="border dark:border-slate-600 px-4 py-2 rounded-lg"
        >
          إلغاء
        </button>
      </div>
    </form>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-600 p-6">
      <h2 className="text-lg font-bold mb-4">مميزات الرحلة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {features.map((f, i) => {
          if (editingId === f.id) {
            return <div key={f.id} className="rounded-2xl p-4 border-2 border-[#b8860b] bg-slate-50 dark:bg-slate-800">{renderFeatureForm(true)}</div>;
          }
          const style = FEATURE_CARD_STYLES[i % FEATURE_CARD_STYLES.length];
          const featureTitle = isAr ? (f.titleAr ?? f.title) : f.title;
          const featureDesc = isAr ? (f.descriptionAr ?? f.description) : (f.description ?? f.descriptionAr);
          return (
            <div key={f.id} className={`rounded-2xl p-6 shadow-md ${style.bg} text-center relative group`}>
              <div className="absolute top-3 left-3 flex gap-2 opacity-70 hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => startEdit(f)} className="text-[#b8860b] text-sm hover:underline bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded">
                  تعديل
                </button>
                <button type="button" onClick={() => handleRemove(f.id)} className="text-red-600 text-sm hover:underline bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded">
                  حذف
                </button>
              </div>
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${style.iconBg} text-white mb-4`}>
                <FeatureIcon name={f.icon || 'Sparkles'} size={28} className="text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">{featureTitle}</h3>
              {featureDesc && <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{featureDesc}</p>}
            </div>
          );
        })}
      </div>
      {adding ? (
        <div className="rounded-2xl p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
          {renderFeatureForm(false)}
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-[#b8860b] hover:underline">
          + إضافة ميزة
        </button>
      )}
    </div>
  );
}

function TripItinerarySection({
  tripId,
  days,
  onRefresh,
  onError,
}: {
  tripId: string;
  days: TripItineraryDay[];
  onRefresh: () => void;
  onError: (m: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dayNumber, setDayNumber] = useState(1);
  const [duration, setDuration] = useState('');
  const [durationAr, setDurationAr] = useState('');
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [content, setContent] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [extraInfoList, setExtraInfoList] = useState<{ en: string; ar: string }[]>([]);

  const resetForm = () => {
    setEditingId(null);
    setDayNumber(days.length + 1);
    setDuration('');
    setDurationAr('');
    setTitle('');
    setTitleAr('');
    setContent('');
    setContentAr('');
    setExtraInfoList([]);
  };

  const parseExtraInfo = (en: string | null, ar: string | null): { en: string; ar: string }[] => {
    try {
      const enArr = en ? (JSON.parse(en) as string[]) : [];
      const arArr = ar ? (JSON.parse(ar) as string[]) : [];
      const max = Math.max(enArr.length, arArr.length, 1);
      return Array.from({ length: max }, (_, i) => ({ en: enArr[i] ?? '', ar: arArr[i] ?? '' }));
    } catch {
      if (en || ar) return [{ en: en ?? '', ar: ar ?? '' }];
      return [];
    }
  };

  const startEdit = (d: TripItineraryDay) => {
    setEditingId(d.id);
    setDayNumber(d.dayNumber);
    setDuration(d.duration ?? '');
    setDurationAr(d.durationAr ?? '');
    setTitle(d.title);
    setTitleAr(d.titleAr ?? '');
    setContent(d.content ?? '');
    setContentAr(d.contentAr ?? '');
    setExtraInfoList(parseExtraInfo(d.extraInfo, d.extraInfoAr));
    setAdding(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(endpoints.trips.addItineraryDay(tripId), {
        dayNumber,
        duration: duration || undefined,
        durationAr: durationAr || undefined,
        title,
        titleAr: titleAr || undefined,
        content: content || undefined,
        contentAr: contentAr || undefined,
        extraInfo: extraInfoList.length ? JSON.stringify(extraInfoList.map((x) => x.en)) : undefined,
        extraInfoAr: extraInfoList.length ? JSON.stringify(extraInfoList.map((x) => x.ar)) : undefined,
      });
      setAdding(false);
      resetForm();
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الإضافة');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await api.patch(endpoints.trips.updateItineraryDay(tripId, editingId), {
        dayNumber,
        duration: duration || undefined,
        durationAr: durationAr || undefined,
        title,
        titleAr: titleAr || undefined,
        content: content || undefined,
        contentAr: contentAr || undefined,
        extraInfo: extraInfoList.length ? JSON.stringify(extraInfoList.map((x) => x.en)) : undefined,
        extraInfoAr: extraInfoList.length ? JSON.stringify(extraInfoList.map((x) => x.ar)) : undefined,
      });
      resetForm();
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل التحديث');
    }
  };

  const handleRemove = async (dayId: string) => {
    try {
      await api.delete(endpoints.trips.removeItineraryDay(tripId, dayId));
      if (editingId === dayId) resetForm();
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-600 p-6">
      <h2 className="text-lg font-bold mb-4">البرنامج التفصيلي</h2>
      <div className="space-y-4 mb-6">
        {days.map((d) => {
          if (editingId === d.id) return null;
          return (
          <div key={d.id} className="p-4 border dark:border-slate-600 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{d.titleAr ?? d.title}</h3>
                {(d.durationAr || d.duration) && (
                  <span className="text-sm text-slate-500">{d.durationAr ?? d.duration}</span>
                )}
                {d.dayNumber > 0 && <span className="text-xs text-slate-400 mr-2">· اليوم {d.dayNumber}</span>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => startEdit(d)} className="text-[#b8860b] text-sm hover:underline">تعديل</button>
                <button type="button" onClick={() => handleRemove(d.id)} className="text-red-600 text-sm hover:underline">حذف</button>
              </div>
            </div>
            {(d.contentAr || d.content) && (
              <div
                className="mt-2 text-sm text-slate-600 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ol]:list-decimal"
                dangerouslySetInnerHTML={{
                  __html: (d.contentAr || d.content || '').includes('<') ? (d.contentAr || d.content || '') : `<p>${(d.contentAr || d.content || '').replace(/\n/g, '<br/>')}</p>`,
                }}
              />
            )}
            {(d.extraInfoAr || d.extraInfo) && (() => {
              const items = parseExtraInfo(d.extraInfo, d.extraInfoAr).filter((it) => it.en || it.ar);
              return items.length ? (
                <ul className="mt-2 space-y-1">
                  {items.map((it, i) => (
                    <li key={i} className="text-sm text-green-600 dark:text-green-400">✓ {it.ar || it.en}</li>
                  ))}
                </ul>
              ) : null;
            })()}
          </div>
          );
        })}
      </div>
      {(adding || editingId) ? (
        <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-3 p-4 border dark:border-slate-600 rounded-lg">
          <input
            type="number"
            min={1}
            value={dayNumber}
            onChange={(e) => setDayNumber(Number(e.target.value))}
            placeholder="رقم اليوم (1 للرحلات اليومية)"
            className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
          />
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="المدة (مثال: 1 hour, 45 min)"
            className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
          />
          <input
            type="text"
            value={durationAr}
            onChange={(e) => setDurationAr(e.target.value)}
            placeholder="المدة (عربي: ساعة واحدة، 45 دقيقة)"
            className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان اليوم (إنجليزي)"
            className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            placeholder="عنوان اليوم (عربي)"
            className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
          />
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">محتوى اليوم (إنجليزي)</label>
            <RichTextEditor value={content} onChange={setContent} placeholder="محتوى اليوم مع تنسيقات، قوائم، إلخ" dir="ltr" className="[&_.ql-editor]:bg-white dark:[&_.ql-editor]:bg-slate-700 [&_.ql-toolbar]:bg-slate-100 dark:[&_.ql-toolbar]:bg-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">محتوى اليوم (عربي)</label>
            <RichTextEditor value={contentAr} onChange={setContentAr} placeholder="محتوى اليوم مع تنسيقات، قوائم منقطة أو مرقمة" dir="rtl" className="[&_.ql-editor]:bg-white dark:[&_.ql-editor]:bg-slate-700 [&_.ql-toolbar]:bg-slate-100 dark:[&_.ql-toolbar]:bg-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">معلومات إضافية</label>
            {extraInfoList.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item.en}
                  onChange={(e) => setExtraInfoList((prev) => prev.map((x, i) => (i === idx ? { ...x, en: e.target.value } : x)))}
                  placeholder="(إنجليزي)"
                  className="flex-1 border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
                />
                <input
                  type="text"
                  value={item.ar}
                  onChange={(e) => setExtraInfoList((prev) => prev.map((x, i) => (i === idx ? { ...x, ar: e.target.value } : x)))}
                  placeholder="(عربي)"
                  className="flex-1 border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
                />
                <button type="button" onClick={() => setExtraInfoList((prev) => prev.filter((_, i) => i !== idx))} className="text-red-600 text-sm px-2 shrink-0">حذف</button>
              </div>
            ))}
            <button type="button" onClick={() => setExtraInfoList((prev) => [...prev, { en: '', ar: '' }])} className="text-[#b8860b] text-sm hover:underline mt-1">
              + إضافة معلومة إضافية
            </button>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#b8860b] text-white px-4 py-2 rounded-lg">
              {editingId ? 'حفظ التعديل' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); resetForm(); }}
              className="border dark:border-slate-600 px-4 py-2 rounded-lg"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-[#b8860b] hover:underline">
          + إضافة عنصر برنامج
        </button>
      )}
    </div>
  );
}

function TripIncludedExcludedSection({
  tripId,
  type,
  items,
  onRefresh,
  onError,
}: {
  tripId: string;
  type: 'included' | 'excluded';
  items: (TripIncluded | TripExcluded)[];
  onRefresh: () => void;
  onError: (m: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [textAr, setTextAr] = useState('');

  const label = type === 'included' ? 'ما يشمله' : 'ما لا يشمله';
  const addEndpoint = type === 'included' ? endpoints.trips.addIncluded : endpoints.trips.addExcluded;
  const removeEndpoint = type === 'included' ? endpoints.trips.removeIncluded : endpoints.trips.removeExcluded;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(addEndpoint(tripId), { text, textAr: textAr || undefined });
      setAdding(false);
      setText('');
      setTextAr('');
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الإضافة');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await api.delete(removeEndpoint(tripId, itemId));
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-600 p-6">
      <h2 className="text-lg font-bold mb-4">{label}</h2>
      <ul className="space-y-2 mb-4">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              {item.icon && (
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 shrink-0">
                  <FeatureIcon name={item.icon} size={18} className="text-slate-600 dark:text-slate-300" />
                </span>
              )}
              <span>{item.textAr ?? item.text}</span>
            </div>
            <button type="button" onClick={() => handleRemove(item.id)} className="text-red-600 text-sm hover:underline shrink-0">حذف</button>
          </li>
        ))}
      </ul>
      {adding ? (
        <form onSubmit={handleAdd} className="space-y-3 p-4 border dark:border-slate-600 rounded-lg">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="النص (إنجليزي)"
            className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            value={textAr}
            onChange={(e) => setTextAr(e.target.value)}
            placeholder="النص (عربي)"
            className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2"
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-[#b8860b] text-white px-4 py-2 rounded-lg">إضافة</button>
            <button type="button" onClick={() => setAdding(false)} className="border dark:border-slate-600 px-4 py-2 rounded-lg">إلغاء</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-[#b8860b] hover:underline">
          + إضافة عنصر
        </button>
      )}
    </div>
  );
}

function TripReviewsSection({
  averageRating,
  reviewsCount,
  reviews,
}: {
  averageRating: number;
  reviewsCount: number;
  reviews: { id: string; userName: string; rating: number; comment: string | null }[];
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-600 p-6">
      <h2 className="text-lg font-bold mb-4">تقييمات المسافرين</h2>
      <div className="mb-6 flex items-center gap-4">
        <span className="text-3xl font-bold">⭐ {averageRating.toFixed(1)}</span>
        <span className="text-slate-500">من 5 نجوم · {reviewsCount} تقييم{reviewsCount !== 1 ? 'ات' : ''}</span>
      </div>
      {reviews.length === 0 ? (
        <p className="text-slate-500">لا توجد تقييمات بعد</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="p-4 border dark:border-slate-600 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{r.userName}</span>
                <span className="text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TripMealsSection({
  tripId,
  meals,
  onRefresh,
  onError,
}: {
  tripId: string;
  meals: TripMeal[];
  onRefresh: () => void;
  onError: (m: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dayNumber, setDayNumber] = useState(1);
  const [breakfast, setBreakfast] = useState('');
  const [breakfastAr, setBreakfastAr] = useState('');
  const [lunch, setLunch] = useState('');
  const [lunchAr, setLunchAr] = useState('');
  const [dinner, setDinner] = useState('');
  const [dinnerAr, setDinnerAr] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setDayNumber(meals.length + 1);
    setBreakfast('');
    setBreakfastAr('');
    setLunch('');
    setLunchAr('');
    setDinner('');
    setDinnerAr('');
  };

  const startEdit = (m: TripMeal) => {
    setEditingId(m.id);
    setDayNumber(m.dayNumber);
    setBreakfast(m.breakfast ?? '');
    setBreakfastAr(m.breakfastAr ?? '');
    setLunch(m.lunch ?? '');
    setLunchAr(m.lunchAr ?? '');
    setDinner(m.dinner ?? '');
    setDinnerAr(m.dinnerAr ?? '');
    setAdding(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(endpoints.trips.addMeal(tripId), {
        dayNumber,
        breakfast: breakfast || undefined,
        breakfastAr: breakfastAr || undefined,
        lunch: lunch || undefined,
        lunchAr: lunchAr || undefined,
        dinner: dinner || undefined,
        dinnerAr: dinnerAr || undefined,
      });
      setAdding(false);
      resetForm();
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الإضافة');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await api.patch(endpoints.trips.updateMeal(tripId, editingId), {
        dayNumber,
        breakfast: breakfast || undefined,
        breakfastAr: breakfastAr || undefined,
        lunch: lunch || undefined,
        lunchAr: lunchAr || undefined,
        dinner: dinner || undefined,
        dinnerAr: dinnerAr || undefined,
      });
      resetForm();
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل التحديث');
    }
  };

  const handleRemove = async (mealId: string) => {
    try {
      await api.delete(endpoints.trips.removeMeal(tripId, mealId));
      if (editingId === mealId) resetForm();
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-600 p-6">
      <h2 className="text-lg font-bold mb-4">الوجبات</h2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-slate-600">
              <th className="text-right p-2">اليوم</th>
              <th className="text-right p-2">الإفطار</th>
              <th className="text-right p-2">الغداء</th>
              <th className="text-right p-2">العشاء</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {meals.map((m) => {
              if (editingId === m.id) return null;
              return (
                <tr key={m.id} className="border-b dark:border-slate-600">
                  <td className="p-2">{m.dayNumber}</td>
                  <td className="p-2">{m.breakfastAr ?? m.breakfast ?? '—'}</td>
                  <td className="p-2">{m.lunchAr ?? m.lunch ?? '—'}</td>
                  <td className="p-2">{m.dinnerAr ?? m.dinner ?? '—'}</td>
                  <td className="p-2 flex gap-2">
                    <button type="button" onClick={() => startEdit(m)} className="text-[#b8860b] text-xs hover:underline">تعديل</button>
                    <button type="button" onClick={() => handleRemove(m.id)} className="text-red-600 text-xs hover:underline">حذف</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(adding || editingId) ? (
        <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-3 p-4 border dark:border-slate-600 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="number" min={1} value={dayNumber} onChange={(e) => setDayNumber(Number(e.target.value))} placeholder="اليوم" className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" required />
          <input type="text" value={breakfast} onChange={(e) => setBreakfast(e.target.value)} placeholder="الإفطار (إنجليزي)" className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" />
          <input type="text" value={breakfastAr} onChange={(e) => setBreakfastAr(e.target.value)} placeholder="الإفطار (عربي)" className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" />
          <input type="text" value={lunch} onChange={(e) => setLunch(e.target.value)} placeholder="الغداء (إنجليزي)" className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" />
          <input type="text" value={lunchAr} onChange={(e) => setLunchAr(e.target.value)} placeholder="الغداء (عربي)" className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" />
          <input type="text" value={dinner} onChange={(e) => setDinner(e.target.value)} placeholder="العشاء (إنجليزي)" className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" />
          <input type="text" value={dinnerAr} onChange={(e) => setDinnerAr(e.target.value)} placeholder="العشاء (عربي)" className="border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" />
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-[#b8860b] text-white px-4 py-2 rounded-lg">
              {editingId ? 'حفظ التعديل' : 'إضافة'}
            </button>
            <button type="button" onClick={resetForm} className="border dark:border-slate-600 px-4 py-2 rounded-lg">إلغاء</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-[#b8860b] hover:underline">
          + إضافة وجبات لليوم
        </button>
      )}
    </div>
  );
}

function TripHotelsSection({
  tripId,
  hotels,
  onRefresh,
  onError,
}: {
  tripId: string;
  hotels: TripHotel[];
  onRefresh: () => void;
  onError: (m: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [nightNumber, setNightNumber] = useState(1);
  const [hotelName, setHotelName] = useState('');
  const [hotelNameAr, setHotelNameAr] = useState('');
  const [city, setCity] = useState('');
  const [cityAr, setCityAr] = useState('');
  const [category, setCategory] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(endpoints.trips.addHotel(tripId), {
        nightNumber,
        hotelName,
        hotelNameAr: hotelNameAr || undefined,
        city: city || undefined,
        cityAr: cityAr || undefined,
        category: category || undefined,
      });
      setAdding(false);
      setNightNumber(hotels.length + 1);
      setHotelName('');
      setHotelNameAr('');
      setCity('');
      setCityAr('');
      setCategory('');
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الإضافة');
    }
  };

  const handleRemove = async (hotelId: string) => {
    try {
      await api.delete(endpoints.trips.removeHotel(tripId, hotelId));
      onRefresh();
    } catch (e) {
      onError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'فشل الحذف');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-600 p-6">
      <h2 className="text-lg font-bold mb-4">الفنادق</h2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-slate-600">
              <th className="text-right p-2">الليلة</th>
              <th className="text-right p-2">اسم الفندق</th>
              <th className="text-right p-2">المدينة</th>
              <th className="text-right p-2">الفئة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h.id} className="border-b dark:border-slate-600">
                <td className="p-2">{h.nightNumber}</td>
                <td className="p-2">{h.hotelNameAr ?? h.hotelName}</td>
                <td className="p-2">{h.cityAr ?? h.city ?? '—'}</td>
                <td className="p-2">{h.category ?? '—'}</td>
                <td className="p-2">
                  <button type="button" onClick={() => handleRemove(h.id)} className="text-red-600 text-xs hover:underline">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adding ? (
        <form onSubmit={handleAdd} className="space-y-3 p-4 border dark:border-slate-600 rounded-lg">
          <input type="number" min={1} value={nightNumber} onChange={(e) => setNightNumber(Number(e.target.value))} placeholder="الليلة" className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" required />
          <input type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="اسم الفندق (إنجليزي)" className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" required />
          <input type="text" value={hotelNameAr} onChange={(e) => setHotelNameAr(e.target.value)} placeholder="اسم الفندق (عربي)" className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" />
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة (إنجليزي)" className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" />
          <input type="text" value={cityAr} onChange={(e) => setCityAr(e.target.value)} placeholder="المدينة (عربي)" className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" />
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="الفئة (مثال: 5*، فاخر)" className="w-full border dark:border-slate-600 dark:bg-slate-700 rounded px-3 py-2" />
          <div className="flex gap-2">
            <button type="submit" className="bg-[#b8860b] text-white px-4 py-2 rounded-lg">إضافة</button>
            <button type="button" onClick={() => setAdding(false)} className="border dark:border-slate-600 px-4 py-2 rounded-lg">إلغاء</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-[#b8860b] hover:underline">
          + إضافة فندق
        </button>
      )}
    </div>
  );
}
