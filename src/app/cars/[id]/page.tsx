'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, Fuel, Gauge, Users, Star, Car, X } from 'lucide-react';
import { api } from '@/lib/api';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';
import { endpoints } from '@/lib/endpoints';
import { getImageUrl } from '@/lib/upload';
import { useAppSelector } from '@/store/hooks';
import { getT } from '@/lib/i18n';
import type { Language } from '@/types';

type CarData = {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  basePricePerDay: number;
  basePricePerWeek: number | null;
  basePricePerMonth: number | null;
  basePricePerDayWithDriver?: number | null;
  basePricePerWeekWithDriver?: number | null;
  basePricePerMonthWithDriver?: number | null;
  discount?: { id: string; discountType: string; value: number } | null;
  finalPricePerDay?: number;
  finalPricePerWeek?: number | null;
  finalPricePerMonth?: number | null;
  finalPricePerDayWithDriver?: number | null;
  finalPricePerWeekWithDriver?: number | null;
  finalPricePerMonthWithDriver?: number | null;
  category: string;
  transmission: string;
  seats: number;
  fuelType: string | null;
  isActive: boolean;
  averageRating: number | null;
  reviewsCount?: number;
  images: { id: string; imagePath: string }[];
};

const CATEGORY_COLORS: Record<string, string> = {
  ECONOMY: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  SUV: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  LUXURY: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
  VAN: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200',
};

function getGalleryGridClass(count: number): string {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-2';
  if (count === 3) return 'grid-cols-2 grid-rows-2';
  if (count === 4) return 'grid-cols-2 grid-rows-2';
  return 'grid-cols-3 grid-rows-2';
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const isAr = locale === 'ar';

  const { isFavorited, getFavoriteId, refetch } = useFavorites();
  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [withDriver, setWithDriver] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(endpoints.cars.byId(id))
      .then((res) => setCar(res.data.data))
      .catch(() => setError('السيارة غير موجودة'))
      .finally(() => setLoading(false));
  }, [id]);

  const imgCount = (car?.images ?? []).slice(0, 5).length;

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => {
          const next = i === 0 ? imgCount - 1 : i - 1;
          setSelectedImage(next);
          return next;
        });
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => {
          const next = i === imgCount - 1 ? 0 : i + 1;
          setSelectedImage(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, imgCount]);

  const handleBookClick = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(`/cars/${id}/book`)}`);
    } else {
      router.push(`/cars/${id}/book`);
    }
  };

  const getLabel = () => (car ? (isAr && car.nameAr ? car.nameAr : car.name) : '');
  const getCategoryLabel = (c: string) => {
    const map: Record<string, string> = {
      ECONOMY: t.carsPage.economy,
      SUV: t.carsPage.suv,
      LUXURY: t.carsPage.luxury,
      VAN: t.carsPage.van,
    };
    return map[c] ?? c;
  };
  const getTransmissionLabel = (c: string) =>
    c === 'AUTOMATIC' ? t.carsPage.automatic : t.carsPage.manual;
  const getFuelLabel = (c: string | null | undefined) =>
    c === 'DIESEL' ? t.carsPage.diesel : t.carsPage.petrol;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 aspect-[4/3] lg:aspect-auto lg:min-h-[400px] bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!car || error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error ?? 'السيارة غير موجودة'}</p>
        <Link href="/cars" className="text-blue-600 dark:text-blue-400 hover:underline">
          {t.carsPage.availableCars(0).replace(/\(\d+\)/, '(الكل)')}
        </Link>
      </div>
    );
  }

  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;
  const description = isAr && car.descriptionAr ? car.descriptionAr : car.description;
  const images = car.images ?? [];
  const displayImages = images.slice(0, 5);

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setSelectedImage(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = () => {
    const next = lightboxIndex === 0 ? imgCount - 1 : lightboxIndex - 1;
    setLightboxIndex(next);
    setSelectedImage(next);
  };
  const goNext = () => {
    const next = lightboxIndex === imgCount - 1 ? 0 : lightboxIndex + 1;
    setLightboxIndex(next);
    setSelectedImage(next);
  };

  return (
    <div className="relative container mx-auto px-4 py-8 md:py-12" dir={isAr ? 'rtl' : 'ltr'}>
      <div className={`absolute top-4 z-10 ${isAr ? 'left-4' : 'right-4'}`}>
        <FavoriteButton
          type="car"
          id={id}
          isFavorite={isFavorited('car', id)}
          favoriteId={getFavoriteId('car', id)}
          onToggle={refetch}
          variant="light"
          size={24}
        />
      </div>
      <nav className="mb-8 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/cars" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {t.carsPage.heroTitle}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-slate-100 font-medium">{getLabel()}</span>
      </nav>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className={`aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 grid gap-1 p-1 ${
                imgCount === 0 ? '' : getGalleryGridClass(imgCount)
              }`}
            >
              {imgCount === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Car size={64} strokeWidth={1} />
                </div>
              ) : (
                displayImages.map((img, idx) => (
                  <div
                    key={img.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openLightbox(idx)}
                    onKeyDown={(e) => e.key === 'Enter' && openLightbox(idx)}
                    className={`relative overflow-hidden rounded-lg cursor-pointer transition-opacity hover:opacity-95 ${
                      imgCount === 1
                        ? 'col-span-1 row-span-1'
                        : imgCount === 3
                          ? idx === 0
                            ? 'col-span-2 row-span-2'
                            : 'col-span-1 row-span-1'
                          : imgCount === 5
                            ? idx === 0
                              ? 'col-span-2 row-span-2'
                              : 'col-span-1 row-span-1'
                            : ''
                    }`}
                  >
                    <img
                      src={getImageUrl(img.imagePath)}
                      alt={`${getLabel()} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              )}
            </div>
            {imgCount > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => {
                      setSelectedImage(idx);
                      openLightbox(idx);
                    }}
                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-blue-600 ring-2 ring-blue-600/30'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(img.imagePath)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {lightboxOpen && imgCount > 0 && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
                role="dialog"
                aria-modal="true"
                aria-label="معرض الصور"
              >
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="إغلاق"
                >
                  <X size={28} />
                </button>

                {imgCount > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className={`absolute top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ${
                        isAr ? 'right-4' : 'left-4'
                      }`}
                      aria-label="السابق"
                    >
                      <ChevronRight size={32} className={isAr ? '' : 'rotate-180'} />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className={`absolute top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ${
                        isAr ? 'left-4' : 'right-4'
                      }`}
                      aria-label="التالي"
                    >
                      <ChevronLeft size={32} className={isAr ? 'rotate-180' : ''} />
                    </button>
                  </>
                )}

                <div
                  className="absolute inset-0 flex items-center justify-center p-4"
                  onClick={closeLightbox}
                >
                  <img
                    src={getImageUrl(displayImages[lightboxIndex].imagePath)}
                    alt={`${getLabel()} - ${lightboxIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                  {lightboxIndex + 1} / {imgCount}
                </span>
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      CATEGORY_COLORS[car.category] ?? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {getCategoryLabel(car.category)}
                  </span>
                  {car.averageRating != null && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full px-2.5 py-0.5 text-sm font-medium">
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                      {car.averageRating}
                      {car.reviewsCount != null && car.reviewsCount > 0 && (
                        <span className="text-amber-600/80 dark:text-amber-400/80">({car.reviewsCount})</span>
                      )}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {getLabel()}
                </h1>
                {(car.brand || car.model || car.year) && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {[car.brand, car.model, car.year != null ? String(car.year) : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <Fuel size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.carsPage.fuel}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{getFuelLabel(car.fuelType) || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Gauge size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.carsPage.transmission}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{getTransmissionLabel(car.transmission)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                    <Users size={20} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.carsPage.seats}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{t.carsPage.seatsLabel(car.seats)}</p>
                  </div>
                </div>
                {(car.brand || car.model || car.year != null) && (
                  <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {car.brand && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t.carsPage.brand}</p>
                        <p className="font-medium text-slate-900 dark:text-white">{car.brand}</p>
                      </div>
                    )}
                    {car.model && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t.carsPage.model}</p>
                        <p className="font-medium text-slate-900 dark:text-white">{car.model}</p>
                      </div>
                    )}
                    {car.year != null && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t.carsPage.year}</p>
                        <p className="font-medium text-slate-900 dark:text-white">{car.year}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {description && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              <div className="space-y-2 p-4 rounded-xl border-2 border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isAr ? 'أسعار الإيجار' : 'Rental Prices'}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setWithDriver(false)}
                      className={`px-2 py-1 rounded text-xs font-medium transition ${
                        !withDriver ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                      }`}
                    >
                      {isAr ? 'بدون سائق' : 'Without driver'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithDriver(true)}
                      className={`px-2 py-1 rounded text-xs font-medium transition ${
                        withDriver ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                      }`}
                    >
                      {isAr ? 'مع سائق' : 'With driver'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  {car.discount ? (
                    <p className="text-lg font-bold">
                      <span className="line-through text-slate-500 dark:text-slate-400 font-medium mr-2">
                        {t.carsPage.pricePerDay(
                          withDriver && car.basePricePerDayWithDriver != null ? car.basePricePerDayWithDriver : car.basePricePerDay
                        )}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {t.carsPage.pricePerDay(
                          withDriver && car.finalPricePerDayWithDriver != null ? car.finalPricePerDayWithDriver : (car.finalPricePerDay ?? car.basePricePerDay)
                        )}
                      </span>
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {t.carsPage.pricePerDay(
                        withDriver && car.basePricePerDayWithDriver != null ? car.basePricePerDayWithDriver : car.basePricePerDay
                      )}
                    </p>
                  )}
                  {(withDriver ? (car.basePricePerWeekWithDriver ?? car.basePricePerWeek) : car.basePricePerWeek) != null && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t.carsPage.pricePerWeek(
                        car.discount
                          ? (withDriver && car.finalPricePerWeekWithDriver != null ? car.finalPricePerWeekWithDriver : car.finalPricePerWeek ?? car.basePricePerWeek)!
                          : (withDriver && car.basePricePerWeekWithDriver != null ? car.basePricePerWeekWithDriver : car.basePricePerWeek)!
                      )}
                    </p>
                  )}
                  {(withDriver ? (car.basePricePerMonthWithDriver ?? car.basePricePerMonth) : car.basePricePerMonth) != null && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t.carsPage.pricePerMonth(
                        car.discount
                          ? (withDriver && car.finalPricePerMonthWithDriver != null ? car.finalPricePerMonthWithDriver : car.finalPricePerMonth ?? car.basePricePerMonth)!
                          : (withDriver && car.basePricePerMonthWithDriver != null ? car.basePricePerMonthWithDriver : car.basePricePerMonth)!
                      )}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookClick}
                disabled={!car.isActive}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                  car.isActive
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {car.isActive ? t.carsPage.bookNow : t.carsPage.notAvailable}
                <ArrowIcon size={22} strokeWidth={2.5} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
