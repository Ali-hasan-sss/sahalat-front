'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, Clock, Building2, Utensils, ChevronRight, ChevronLeft, X, Mail, Phone, Calendar, MapPin, Users, Sun, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';
import { getImageUrl } from '@/lib/upload';
import { FeatureIcon } from '@/lib/featureIcons';
import { useAppSelector } from '@/store/hooks';
import { getT } from '@/lib/i18n';
import type { Language } from '@/types';

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
  optionNumber?: number;
};

type TripIncludedExcluded = { id: string; text: string; textAr: string | null; icon?: string | null };

const FEATURE_CARD_STYLES = [
  { bg: 'bg-green-50 dark:bg-green-950/30', iconBg: 'bg-green-500' },
  { bg: 'bg-amber-50 dark:bg-amber-950/30', iconBg: 'bg-amber-500' },
  { bg: 'bg-blue-50 dark:bg-blue-950/30', iconBg: 'bg-blue-500' },
];

const ITINERARY_DAY_COLORS = [
  { header: 'bg-blue-600', check: 'text-blue-600', checkBg: 'bg-blue-100 dark:bg-blue-900/40' },
  { header: 'bg-emerald-600', check: 'text-emerald-600', checkBg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  { header: 'bg-amber-500', check: 'text-amber-600', checkBg: 'bg-amber-100 dark:bg-amber-900/40' },
  { header: 'bg-violet-600', check: 'text-violet-600', checkBg: 'bg-violet-100 dark:bg-violet-900/40' },
  { header: 'bg-rose-500', check: 'text-rose-600', checkBg: 'bg-rose-100 dark:bg-rose-900/40' },
];

function getTripTypeLabel(locale: Language, type: string) {
  const t = getT(locale);
  const map: Record<string, string> = {
    MARINE: t.trip.typeMarine,
    GROUP: t.trip.typeGroup,
    INDIVIDUAL: t.trip.typeIndividual,
  };
  return map[type] ?? '';
}

function BookButton({ id, className }: { id: string; className?: string }) {
  const router = useRouter();
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const handleClick = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(`/trips/${id}#book`)}`);
    } else {
      router.push(`/trips/${id}/book`);
    }
  };
  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={handleClick}
      className={className ?? 'inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-medium transition-colors'}
    >
      {t.trip.bookNow}
      <ArrowIcon size={20} strokeWidth={2.5} aria-hidden />
    </button>
  );
}

function TripDetailSkeleton() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-300 dark:bg-slate-700 animate-pulse" />
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="h-5 w-32 bg-slate-400/60 dark:bg-slate-600/60 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-12 md:h-16 w-3/4 max-w-2xl bg-slate-400/70 dark:bg-slate-600/70 rounded-xl mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-full max-w-xl bg-slate-400/50 dark:bg-slate-600/50 rounded mx-auto mb-8 animate-pulse" />
          <div className="flex justify-center gap-8">
            <div className="h-6 w-24 bg-slate-400/60 dark:bg-slate-600/60 rounded animate-pulse" />
            <div className="h-6 w-36 bg-slate-400/60 dark:bg-slate-600/60 rounded animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features skeleton */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl p-6 bg-slate-100 dark:bg-slate-800 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mb-4" />
                <div className="h-5 w-2/3 max-w-[200px] bg-slate-300 dark:bg-slate-600 rounded mx-auto mb-3" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Itinerary skeleton */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="h-8 w-64 bg-slate-300 dark:bg-slate-600 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-10 animate-pulse" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-lg">
                <div className="h-20 bg-slate-400/60 dark:bg-slate-600/60 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-[85%] bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA skeleton */}
      <section className="py-20 bg-slate-900 dark:bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <div className="h-10 w-80 bg-slate-700 dark:bg-slate-800 rounded-xl mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 max-w-full bg-slate-700/80 dark:bg-slate-800/80 rounded mx-auto mb-8 animate-pulse" />
          <div className="flex justify-center gap-4">
            <div className="h-12 w-36 bg-slate-600 dark:bg-slate-700 rounded-xl animate-pulse" />
            <div className="h-12 w-40 bg-slate-700/80 dark:bg-slate-800/80 rounded-xl animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function TripDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const { isFavorited, getFavoriteId, refetch } = useFavorites();
  const [trip, setTrip] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get('/trips/' + id)
      .then((r) => setTrip(r.data.data))
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash === '#book') {
      document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  if (loading) return <TripDetailSkeleton />;
  if (!trip) {
    const tErr = getT(locale);
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">{tErr.trip.notFound}</p>
        <Link href="/trips" className="text-teal-600 dark:text-teal-400 hover:underline">{tErr.trip.backToTrips}</Link>
      </div>
    );
  }

  const t = getT(locale);
  const images = (trip.images as { imagePath: string }[]) ?? [];
  const heroImage = images[0]?.imagePath;
  const galleryImages = images.slice(1);
  const durationDays = Number(trip.durationDays) || 1;
  const durationText = durationDays > 1
    ? t.trip.daysNights(durationDays, durationDays - 1)
    : t.trip.singleDay;
  const isAr = locale === 'ar';
  const route = String(isAr ? (trip.routeAr ?? trip.route) : (trip.route ?? trip.routeAr) ?? '');
  const tripType = (trip.tripType as string) ?? '';
  const typeLabel = getTripTypeLabel(locale, tripType);
  const description = String(isAr ? (trip.descriptionAr ?? trip.description) : (trip.description ?? trip.descriptionAr) ?? '');
  const title = String(isAr ? (trip.titleAr ?? trip.title) : (trip.title ?? trip.titleAr) ?? '');
  const features = (trip.features as TripFeature[] | undefined) ?? [];
  const itineraryDays = (trip.itineraryDays as TripItineraryDay[] | undefined) ?? [];
  const meals = (trip.meals as TripMeal[] | undefined) ?? [];
  const hotels = (trip.hotels as TripHotel[] | undefined) ?? [];
  const included = (trip.included as TripIncludedExcluded[] | undefined) ?? [];
  const excluded = (trip.excluded as TripIncludedExcluded[] | undefined) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center overflow-hidden">
        <div className={`absolute top-6 z-20 ${isAr ? 'left-4' : 'right-4'}`}>
          <FavoriteButton
            type="trip"
            id={id}
            isFavorite={isFavorited('trip', id)}
            favoriteId={getFavoriteId('trip', id)}
            onToggle={refetch}
            variant="overlay"
            size={28}
          />
        </div>
        {/* Background */}
        <div className="absolute inset-0">
          {heroImage ? (
            <img
              src={getImageUrl(heroImage)}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-800/60 to-slate-900/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          {typeLabel && (
            <p className="text-amber-400 text-sm md:text-base mb-3 flex items-center justify-center gap-2">
              <Sun size={20} className="shrink-0" aria-hidden />
              {typeLabel}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-white/95 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              {description}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-white">
            {typeof trip.averageRating === 'number' && trip.averageRating > 0 && (
              <span className="flex items-center gap-2">
                <Star size={20} className="shrink-0 fill-amber-400 text-amber-400" aria-hidden />
                {trip.averageRating}
                {typeof trip.reviewsCount === 'number' && trip.reviewsCount > 0 && (
                  <span className="text-white/80 text-sm">({trip.reviewsCount})</span>
                )}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Calendar size={20} className="shrink-0 text-amber-400/90" aria-hidden />
              {durationText}
            </span>
            {route && (
              <span className="flex items-center gap-2">
                <MapPin size={20} className="shrink-0 text-amber-400/90" aria-hidden />
                {route}
              </span>
            )}
            {typeLabel && (
              <span className="flex items-center gap-2">
                <Users size={20} className="shrink-0 text-amber-400/90" aria-hidden />
                {typeLabel}
              </span>
            )}
            <span className="flex items-center gap-2">
              <span className="text-amber-400/90 font-semibold">
                {trip.discount ? (
                  <>
                    <span className="line-through text-white/70 mr-1">{Number(trip.basePrice)} ر.ع.</span>
                    <span className="text-white">{Number(trip.finalPrice ?? trip.basePrice)} ر.ع.</span> {isAr ? 'للشخص' : 'per person'}
                  </>
                ) : (
                  <>{Number(trip.finalPrice ?? trip.basePrice)} ر.ع. {isAr ? 'للشخص' : 'per person'}</>
                )}
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* المميزات */}
      {features.length > 0 && (
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => {
                const style = FEATURE_CARD_STYLES[i % FEATURE_CARD_STYLES.length];
                const featureTitle = isAr ? (f.titleAr ?? f.title) : f.title;
                const featureDesc = isAr ? (f.descriptionAr ?? f.description) : (f.description ?? f.descriptionAr);
                return (
                  <div
                    key={f.id}
                    className={`rounded-2xl p-6 shadow-md ${style.bg} text-center`}
                  >
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${style.iconBg} text-white mb-4`}>
                      <FeatureIcon name={f.icon || 'Sparkles'} size={28} className="text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">
                      {featureTitle}
                    </h3>
                    {featureDesc && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {featureDesc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* برنامج الرحلة */}
      {itineraryDays.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-900/50 overflow-x-hidden">
          <div className="container mx-auto px-4 max-w-4xl min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-2">
              {t.trip.itineraryTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-10">
              {t.trip.itinerarySubtitle}
            </p>
            <div className="space-y-6">
              {itineraryDays.map((day, i) => {
                const colors = ITINERARY_DAY_COLORS[i % ITINERARY_DAY_COLORS.length];
                const dayTitle = isAr ? (day.titleAr ?? day.title) : day.title;
                const contentText = isAr ? (day.contentAr ?? day.content) : (day.content ?? day.contentAr);
                const extraItems = (() => {
                  try {
                    const en = day.extraInfo ? (JSON.parse(day.extraInfo) as string[]) : [];
                    const ar = day.extraInfoAr ? (JSON.parse(day.extraInfoAr) as string[]) : [];
                    const max = Math.max(en.length, ar.length);
                    if (max === 0) return [];
                    return Array.from({ length: max }, (_, i) => isAr ? (ar[i] ?? en[i] ?? '') : (en[i] ?? ar[i] ?? ''));
                  } catch {
                    const s = isAr ? (day.extraInfoAr ?? day.extraInfo) : (day.extraInfo ?? day.extraInfoAr);
                    return s ? [s] : [];
                  }
                })();
                const dayMeals = meals.find((m) => m.dayNumber === day.dayNumber);
                const dayHotel = hotels.find((h) => h.nightNumber === day.dayNumber);
                const isHtmlContent = contentText && contentText.includes('<');

                return (
                  <div key={day.id} className="rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-slate-800 min-w-0">
                    {/* Header */}
                    <div className={`${colors.header} px-6 py-4 flex items-center gap-4`}>
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white font-bold shrink-0">
                        {day.dayNumber}
                      </span>
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          {(() => {
                            const dayNames = [t.trip.dayFirst, t.trip.daySecond, t.trip.dayThird, t.trip.dayFourth, t.trip.dayFifth, t.trip.daySixth, t.trip.daySeventh];
                            const ordinal = dayNames[day.dayNumber - 1];
                            return isAr ? (ordinal ? `اليوم ${ordinal}` : t.trip.dayN(day.dayNumber)) : t.trip.dayN(day.dayNumber);
                          })()}
                        </h3>
                        <p className="text-white/90 text-sm">{dayTitle}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-4 min-w-0 overflow-x-hidden">
                      {day.durationAr || day.duration ? (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock size={18} className={colors.check} />
                          <span className="text-sm">{isAr ? (day.durationAr ?? day.duration) : (day.duration ?? day.durationAr)}</span>
                        </div>
                      ) : null}

                      {contentText && (
                        isHtmlContent ? (
                          <div
                            className={`prose prose-slate prose-sm dark:prose-invert max-w-none min-w-0 w-full
                              prose-headings:font-bold prose-p:mb-3 prose-p:leading-relaxed
                              prose-ul:my-3 prose-ol:my-3 prose-li:my-1
                              [&_ul]:list-disc [&_ol]:list-decimal
                              ${isAr ? '[&_ul]:pr-6 [&_ol]:pr-6 [&_ul]:list-outside [&_ol]:list-outside' : '[&_ul]:pl-6 [&_ol]:pl-6 [&_ul]:list-outside [&_ol]:list-outside'}
                              prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600
                              [&_.ql-align-center]:text-center [&_.ql-align-right]:text-right [&_.ql-align-left]:text-left
                              dark:[&_p]:!text-slate-300 dark:[&_li]:!text-slate-300 dark:[&_span]:!text-slate-300
                              [&_*]:leading-relaxed
                              ${isAr ? 'text-right' : 'text-left'}`}
                            dir={isAr ? 'rtl' : 'ltr'}
                          >
                            <div
                              className="prose-quill-content min-w-0 w-full max-w-full [&_*]:whitespace-normal [&_*]:break-normal text-slate-700 dark:text-slate-300"
                              style={{ overflowWrap: 'normal', wordBreak: 'normal' }}
                              dangerouslySetInnerHTML={{ __html: contentText.replace(/&nbsp;/g, ' ') }}
                            />
                          </div>
                        ) : (
                          <>
                            {contentText.trim().split(/\r?\n/).filter(Boolean).map((line, j) => (
                              <div key={j} className="flex items-start gap-3">
                                <span className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full ${colors.checkBg} ${colors.check} shrink-0`}>
                                  <Check size={12} strokeWidth={3} />
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed break-normal min-w-0">{line}</p>
                              </div>
                            ))}
                          </>
                        )
                      )}

                      {extraItems.length > 0 && (
                        <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 space-y-2">
                          {extraItems.filter(Boolean).map((text, j) => (
                            <div key={j} className="flex items-start gap-3">
                              <span className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-amber-200/60 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300 shrink-0">
                                <Check size={12} strokeWidth={3} />
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-normal min-w-0">{text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer: Meals & Hotel */}
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 min-w-0 overflow-x-hidden">
                      {dayMeals && (dayMeals.breakfastAr || dayMeals.lunchAr || dayMeals.dinnerAr || dayMeals.breakfast || dayMeals.lunch || dayMeals.dinner) && (
                        <div className="flex items-center gap-2">
                          <Utensils size={18} className="text-slate-400 shrink-0" />
                          <span>
                            {t.trip.mealsLabel}:{' '}
                            {(isAr ? [dayMeals.breakfastAr, dayMeals.lunchAr, dayMeals.dinnerAr] : [dayMeals.breakfast, dayMeals.lunch, dayMeals.dinner])
                              .filter(Boolean)
                              .join(t.trip.mealsJoin)}
                          </span>
                        </div>
                      )}
                      {dayHotel && (
                        <div className="flex items-center gap-2">
                          <Building2 size={18} className="text-slate-400" />
                          <span>{isAr ? (dayHotel.hotelNameAr ?? dayHotel.hotelName) : dayHotel.hotelName}</span>
                          {dayHotel.cityAr || dayHotel.city ? (
                            <span className="text-slate-400">· {isAr ? (dayHotel.cityAr ?? dayHotel.city) : dayHotel.city}</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* الفنادق والوجبات */}
      {(hotels.length > 0 || meals.length > 0) && (
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* الفنادق */}
              {hotels.length > 0 && (
                <div className="rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <Building2 size={24} className="text-slate-600 dark:text-slate-300" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.trip.hotels}</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                          <th className="p-3 font-medium text-slate-700 dark:text-slate-200">{t.trip.hotelsCategory}</th>
                          <th className="p-3 font-medium text-slate-700 dark:text-slate-200">{t.trip.hotelsCity}</th>
                          <th className="p-3 font-medium text-slate-700 dark:text-slate-200">{t.trip.hotelsName}</th>
                          <th className="p-3 font-medium text-slate-700 dark:text-slate-200">{t.trip.hotelsNight}</th>
                          <th className="p-3 font-medium text-slate-700 dark:text-slate-200">{t.trip.hotelsOption}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...hotels]
                          .sort((a, b) => a.nightNumber - b.nightNumber)
                          .map((h, i, arr) => {
                            const optNum = h.optionNumber ?? 1;
                            const showOpt = i === 0 || arr[i - 1].optionNumber !== optNum;
                            return (
                              <tr key={h.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                <td className="p-3 text-slate-600 dark:text-slate-300">{h.category ?? '—'}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{isAr ? (h.cityAr ?? h.city) ?? '—' : (h.city ?? h.cityAr) ?? '—'}</td>
                                <td className="p-3">
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">{isAr ? (h.hotelNameAr ?? h.hotelName) : h.hotelName}</span>
                                </td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{h.nightNumber}</td>
                                <td className="p-3 text-slate-500 dark:text-slate-400">{showOpt ? t.trip.hotelsOptionN(optNum) : ''}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  <p className="px-6 py-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700">
                    {t.trip.hotelsFootnote}
                  </p>
                </div>
              )}

              {/* الوجبات */}
              {meals.length > 0 && (
                <div className="rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <Utensils size={24} className="text-slate-600 dark:text-slate-300" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.trip.meals}</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                          <th className="p-3 font-medium text-slate-700 dark:text-slate-200">{t.trip.mealsDay}</th>
                          <th className="p-3 font-medium text-slate-700 dark:text-slate-200">{t.trip.mealsBreakfast}</th>
                          <th className="p-3 font-medium text-slate-700 dark:text-slate-200">{t.trip.mealsLunch}</th>
                          <th className="p-3 font-medium text-slate-700 dark:text-slate-200">{t.trip.mealsDinner}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(
                          { length: Math.max(durationDays, meals.length ? Math.max(...meals.map((m) => m.dayNumber)) : 0) },
                          (_, i) => i + 1
                        ).map((dayNum) => {
                          const m = meals.find((x) => x.dayNumber === dayNum);
                          const b = isAr ? (m?.breakfastAr ?? m?.breakfast) : (m?.breakfast ?? m?.breakfastAr);
                          const l = isAr ? (m?.lunchAr ?? m?.lunch) : (m?.lunch ?? m?.lunchAr);
                          const d = isAr ? (m?.dinnerAr ?? m?.dinner) : (m?.dinner ?? m?.dinnerAr);
                          return (
                            <tr key={dayNum} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                              <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{dayNum}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-300">{b || '—'}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-300">{l || '—'}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-300">{d || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* معرض الصور */}
      {galleryImages.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-center text-blue-600 dark:text-blue-400 text-sm mb-2">{t.trip.galleryLabel}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-2">
              {t.trip.galleryTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-10 max-w-2xl mx-auto">
              {t.trip.galleryDesc}
            </p>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 aspect-[16/10] relative">
                <img
                  src={getImageUrl(galleryImages[galleryIndex]?.imagePath)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setGalleryIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1))}
                  className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  aria-label={t.trip.galleryPrev}
                >
                  <ChevronRight size={24} className="text-slate-700 dark:text-slate-200" />
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1))}
                  className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  aria-label={t.trip.galleryNext}
                >
                  <ChevronLeft size={24} className="text-slate-700 dark:text-slate-200" />
                </button>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === galleryIndex ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    aria-label={t.trip.galleryImage(i + 1)}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 justify-center">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === galleryIndex ? 'border-teal-500' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img.imagePath)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ما يشمله البرنامج */}
      {(included.length > 0 || excluded.length > 0) && (
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-10">
              {t.trip.whatsIncluded}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {included.length > 0 && (
                <div className="rounded-2xl border-2 border-green-200 dark:border-green-800 bg-white dark:bg-slate-800 p-6">
                  <h3 className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-lg mb-4">
                    <Check size={22} strokeWidth={2.5} />
                    {t.trip.included}
                  </h3>
                  <ul className="space-y-3">
                    {included.map((item) => (
                      <li key={item.id} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <Check size={18} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{isAr ? (item.textAr ?? item.text) : item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {excluded.length > 0 && (
                <div className="rounded-2xl border-2 border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 p-6">
                  <h3 className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-lg mb-4">
                    <X size={22} strokeWidth={2.5} />
                    {t.trip.excluded}
                  </h3>
                  <ul className="space-y-3">
                    {excluded.map((item) => (
                      <li key={item.id} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <X size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{isAr ? (item.textAr ?? item.text) : item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* قسم الحجز والتواصل */}
      <section id="book" className="py-20 bg-slate-900 dark:bg-slate-950 text-center scroll-mt-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.trip.ctaTitle}
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-10">
            {t.trip.ctaDesc}
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <BookButton id={id} />
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 border-2 border-blue-400 text-blue-300 hover:bg-white/20 hover:text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              {t.trip.contactUs}
            </Link>
          </div>
          <p className="text-white/80 text-base mb-6">
            {t.trip.haveQuestions}
          </p>
          <div className="flex flex-wrap gap-8 justify-center text-white/90">
            <a
              href="mailto:info@omanexplorer.com"
              className="inline-flex items-center gap-2 hover:text-amber-400 transition-colors"
            >
              <Mail size={20} className="text-slate-400" aria-hidden />
              info@omanexplorer.com
            </a>
            <a
              href="tel:+96897018484"
              className="inline-flex items-center gap-2 hover:text-amber-400 transition-colors"
            >
              <Phone size={20} className="text-slate-400" aria-hidden />
              +968 9701 8484
            </a>
          </div>
        </div>
      </section>

      {/* زر الحجز العائم */}
      <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 z-40 flex justify-center md:justify-end">
        <BookButton
          id={id}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        />
      </div>
    </div>
  );
}
