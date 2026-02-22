'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/upload';
import { endpoints } from '@/lib/endpoints';
import { useAppSelector } from '@/store/hooks';
import { getT } from '@/lib/i18n';
import { MapPin, Calendar, Star } from 'lucide-react';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';
import type { Language } from '@/types';

type Landmark = { id: string; name: string; nameAr: string | null };
type Trip = {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  durationDays: number;
  basePrice: number;
  discount?: { id: string; discountType: string; value: number; startDate: string; endDate: string } | null;
  finalPrice?: number;
  route: string | null;
  routeAr: string | null;
  images: { imagePath: string }[];
  landmarks: Landmark[];
  averageRating?: number | null;
  reviewsCount?: number;
};

// bbox: minLon,minLat,maxLon,maxLat - حدود عُمان
const OMAN_BBOX = '53.8,16.9,59.5,26.2';
const OMAN_MAP_EMBED = `https://www.openstreetmap.org/export/embed.html?bbox=${OMAN_BBOX}&layer=mapnik`;
const OMAN_MAP_LINK = `https://www.openstreetmap.org/#map=7/21.4/56.6`;

function TripsPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir="ltr">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="h-9 w-72 bg-slate-300 dark:bg-slate-600 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 justify-center">
            <div className="h-10 w-16 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" />
            <div className="h-10 w-32 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-10 w-28 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 p-5">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-slate-300 dark:bg-slate-600 animate-pulse" />
                      <div className="h-5 w-48 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                  <div className="w-32 h-24 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-slate-200 dark:bg-slate-700 aspect-[4/3] min-h-[320px] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TripsPageContent() {
  const searchParams = useSearchParams();
  const landmarkIdFromUrl = searchParams.get('landmarkId');
  const tripTypeFromUrl = searchParams.get('tripType');
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const isAr = locale === 'ar';

  const { isFavorited, getFavoriteId, refetch } = useFavorites();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string | null>(landmarkIdFromUrl);
  const [selectedTripType, setSelectedTripType] = useState<string | null>(tripTypeFromUrl);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (landmarkIdFromUrl) setSelectedLandmarkId(landmarkIdFromUrl);
  }, [landmarkIdFromUrl]);
  useEffect(() => {
    if (tripTypeFromUrl && ['MARINE', 'GROUP', 'INDIVIDUAL'].includes(tripTypeFromUrl)) setSelectedTripType(tripTypeFromUrl);
  }, [tripTypeFromUrl]);

  useEffect(() => {
    api.get(endpoints.landmarks.list(), { params: { limit: 50 } }).then(({ data }) => {
      setLandmarks(data.data?.items ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { limit: 50 };
    if (selectedLandmarkId) params.landmarkId = selectedLandmarkId;
    if (selectedTripType) params.tripType = selectedTripType;
    api.get(endpoints.trips.list(), { params })
      .then(({ data }) => setTrips(data.data?.items ?? []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, [selectedLandmarkId, selectedTripType]);

  const getLandmarkLabel = (l: Landmark) => (isAr ? (l.nameAr ?? l.name) : l.name);

  const filterScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  useEffect(() => {
    const el = filterScrollRef.current;
    if (!el) return;
    let dragging = false;
    const onMove = (e: MouseEvent) => {
      const dx = e.pageX - dragStart.current.x;
      if (!dragging && Math.abs(dx) > 5) dragging = true;
      if (dragging) {
        setIsDragging(true);
        el.scrollLeft = dragStart.current.scrollLeft - dx;
      }
    };
    const onUp = () => {
      if (dragging) setIsDragging(false);
      dragging = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    const onDown = (e: MouseEvent) => {
      dragStart.current = { x: e.pageX, scrollLeft: el.scrollLeft };
      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('mouseup', onUp, { once: true });
    };
    el.addEventListener('mousedown', onDown);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const cardDir = isAr ? 'rtl' : 'ltr';
  const cardAlign = isAr ? 'text-right' : 'text-left';

  if (loading) return <TripsPageSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir="ltr">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            {t.tripsPage.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.tripsPage.subtitle}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4">
        <div
          ref={filterScrollRef}
          className={`container mx-auto px-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
          role="region"
          aria-label="فلتر المعالم"
        >
          <div className="flex gap-2 min-w-max justify-center pb-2">
            <button
                type="button"
                onClick={() => setSelectedLandmarkId(null)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  !selectedLandmarkId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-blue-400'
                }`}
              >
                {t.tripsPage.all}
              </button>
              {landmarks.map((lm) => (
              <button
                key={lm.id}
                type="button"
                onClick={() => setSelectedLandmarkId(lm.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedLandmarkId === lm.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-blue-400'
                }`}
              >
                {getLandmarkLabel(lm)}
              </button>
            ))}
            {(['', 'GROUP', 'INDIVIDUAL', 'MARINE'] as const).map((tt) => (
              <button
                key={tt || 'all-type'}
                type="button"
                onClick={() => setSelectedTripType(tt || null)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  (tt ? selectedTripType === tt : !selectedTripType)
                    ? 'bg-teal-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-teal-400'
                }`}
              >
                {!tt ? t.tripsPage.tripTypeAll : (tt === 'GROUP' ? t.tripsPage.tripTypeGroup : tt === 'INDIVIDUAL' ? t.tripsPage.tripTypeIndividual : t.tripsPage.tripTypeMarine)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content: Trips list + Map */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Trips list - left */}
          <div className="lg:col-span-3 space-y-6">
            {trips.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 py-12 text-center">
                {selectedLandmarkId ? t.tripsPage.noTripsForLandmark : t.tripsPage.noTrips}
              </p>
            ) : (
              trips.map((trip) => {
                const title = isAr ? (trip.titleAr ?? trip.title) : trip.title;
                const description = isAr ? (trip.descriptionAr ?? trip.description) : (trip.description ?? trip.descriptionAr);
                const durationDays = trip.durationDays || 1;
                const nights = Math.max(0, durationDays - 1);
                const img = trip.images?.[0];

                return (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="block relative bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-slate-100 dark:border-slate-700"
                  >
                    <div className={`absolute top-3 z-10 ${isAr ? 'left-3' : 'right-3'}`}>
                      <FavoriteButton
                        type="trip"
                        id={trip.id}
                        isFavorite={isFavorited('trip', trip.id)}
                        favoriteId={getFavoriteId('trip', trip.id)}
                        onToggle={refetch}
                        variant="light"
                        size={20}
                      />
                    </div>
                    <div className="flex gap-4 p-5">
                      <div className={`flex-1 min-w-0 ${cardAlign}`} dir={cardDir}>
                        <div className={`flex items-start gap-2 mb-2 ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
                          <MapPin size={20} className="text-amber-500 shrink-0 mt-0.5" aria-hidden />
                          <h2 className={`text-lg font-bold text-blue-600 dark:text-blue-400 ${cardAlign}`}>
                            {title}
                          </h2>
                        </div>
                        <p className="text-amber-600 dark:text-amber-400 text-sm font-medium mb-2">
                          {t.tripsPage.touristTrip(durationDays, nights)}
                          {trip.averageRating != null && (
                            <span className="inline-flex items-center gap-1 ltr:ml-2 rtl:mr-2">
                              <Star size={14} className="fill-amber-500 text-amber-500" aria-hidden />
                              {trip.averageRating}
                              {trip.reviewsCount != null && trip.reviewsCount > 0 && (
                                <span className="text-slate-500 dark:text-slate-400 text-xs">({trip.reviewsCount})</span>
                              )}
                            </span>
                          )}
                        </p>
                        {description && (
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-3">
                            {description}
                          </p>
                        )}
                        <div className={`flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
                          <Calendar size={16} aria-hidden />
                          <span className={cardAlign}>{t.tripsPage.bestTime}</span>
                        </div>
                        <div className={`mt-2 flex items-center gap-2 font-bold text-lg ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
                          {trip.discount ? (
                            <>
                              <span className="text-slate-400 dark:text-slate-500 line-through text-base font-medium">
                                {trip.basePrice} ر.ع.
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {trip.finalPrice ?? trip.basePrice} ر.ع. {isAr ? 'للشخص' : 'per person'}
                              </span>
                            </>
                          ) : (
                            <span className="text-blue-600 dark:text-blue-400">
                              {trip.finalPrice ?? trip.basePrice} ر.ع. {isAr ? 'للشخص' : 'per person'}
                            </span>
                          )}
                        </div>
                      </div>
                      {img && (
                        <div className="relative w-32 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                          <img
                            src={getImageUrl(img.imagePath)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {trip.discount && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/25 rounded-xl">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                                {trip.discount.discountType === 'PERCENTAGE'
                                  ? t.tripsPage.discountBadgePercent(trip.discount.value)
                                  : t.tripsPage.discountBadgeFixed(trip.discount.value)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Map - right, sticky */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-slate-100 dark:bg-slate-800">
              <div className="relative aspect-[4/3] min-h-[320px]">
                <iframe
                  title="خريطة عمان"
                  src={OMAN_MAP_EMBED}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-scripts allow-same-origin"
                />
                <a
                  href={OMAN_MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 start-3 px-3 py-1.5 bg-white/95 dark:bg-slate-800/95 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 shadow transition-colors"
                >
                  {t.tripsPage.viewLargerMap}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={<TripsPageSkeleton />}>
      <TripsPageContent />
    </Suspense>
  );
}
