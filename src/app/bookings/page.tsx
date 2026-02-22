'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Car, ChevronRight, Download, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { getImageUrl } from '@/lib/upload';
import { downloadTripReceipt, downloadCarReceipt } from '@/lib/downloadReceipt';
import { useAppSelector } from '@/store/hooks';
import { getT } from '@/lib/i18n';
import { ReviewForm } from '@/components/ReviewForm';

type TripBooking = {
  id: string;
  status: string;
  startDate: string;
  participants: number;
  basePrice: number;
  finalPrice: number;
  canReview?: boolean;
  userReview?: { id: string; rating: number; comment: string | null } | null;
  trip: {
    id: string;
    title: string;
    titleAr: string | null;
    route: string | null;
    routeAr: string | null;
    durationDays: number;
    images: { imagePath: string }[];
  };
};

type CarBooking = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  basePrice: number;
  finalPrice: number;
  canReview?: boolean;
  userReview?: { id: string; rating: number; comment: string | null } | null;
  car: {
    id: string;
    name: string;
    nameAr: string | null;
    images: { imagePath: string }[];
  };
};

type TabKey = 'upcoming' | 'completed' | 'cancelled';

function getDaysBetween(start: string, end: string): number {
  const a = new Date(start);
  const b = new Date(end);
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function formatPrice(n: number): string {
  return n % 1 === 0 ? String(n) : parseFloat(n.toFixed(3)).toString();
}

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const locale = useAppSelector((s) => s.language.locale);
  const t = getT(locale);
  const isAr = locale === 'ar';

  const [tab, setTab] = useState<TabKey>('upcoming');
  const [tripBookings, setTripBookings] = useState<TripBooking[]>([]);
  const [carBookings, setCarBookings] = useState<CarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<{ type: 'trip' | 'car'; id: string } | null>(null);

  const handleDownloadTrip = async (b: TripBooking) => {
    setDownloadingId('t-' + b.id);
    try {
      await downloadTripReceipt(b, user?.name ?? '', isAr);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSubmitReview = async (type: 'trip' | 'car', id: string, rating: number, comment?: string) => {
    const endpoint = type === 'trip' ? endpoints.reviews.createTripReview(id) : endpoints.reviews.createCarReview(id);
    await api.post(endpoint, { rating, comment: comment || undefined });
    setShowReviewForm(null);
    const [tripsRes, carsRes] = await Promise.all([
      api.get(endpoints.bookings.myTripBookings() + '?limit=100'),
      api.get(endpoints.bookings.myCarBookings() + '?limit=100'),
    ]);
    setTripBookings(tripsRes.data.data?.items ?? []);
    setCarBookings(carsRes.data.data?.items ?? []);
  };

  const handleDownloadCar = async (b: CarBooking) => {
    setDownloadingId('c-' + b.id);
    try {
      await downloadCarReceipt(b, user?.name ?? '', isAr);
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    Promise.all([
      api.get(endpoints.bookings.myTripBookings() + '?limit=100'),
      api.get(endpoints.bookings.myCarBookings() + '?limit=100'),
    ])
      .then(([tripsRes, carsRes]) => {
        setTripBookings(tripsRes.data.data?.items ?? []);
        setCarBookings(carsRes.data.data?.items ?? []);
      })
      .catch(() => {
        setTripBookings([]);
        setCarBookings([]);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const filterByStatus = <T extends { status: string; startDate: string }>(items: T[]): T[] => {
    if (tab === 'upcoming') return items.filter((b) => b.status === 'PAID' || b.status === 'PENDING');
    if (tab === 'completed') return items.filter((b) => b.status === 'COMPLETED');
    if (tab === 'cancelled') return items.filter((b) => b.status === 'CANCELLED');
    return items;
  };

  const filteredTrips = filterByStatus(tripBookings);
  const filteredCars = filterByStatus(carBookings);
  const upcomingCount = tripBookings.filter((b) => b.status === 'PAID' || b.status === 'PENDING').length +
    carBookings.filter((b) => b.status === 'PAID' || b.status === 'PENDING').length;
  const completedCount = tripBookings.filter((b) => b.status === 'COMPLETED').length +
    carBookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = tripBookings.filter((b) => b.status === 'CANCELLED').length +
    carBookings.filter((b) => b.status === 'CANCELLED').length;

  const statusLabel = (status: string) => {
    if (status === 'PAID' || status === 'PENDING') return t.bookingsPage.statusConfirmed;
    if (status === 'COMPLETED') return t.bookingsPage.statusCompleted;
    return t.bookingsPage.statusCancelled;
  };

  const statusColor = (status: string) => {
    if (status === 'PAID' || status === 'PENDING') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
    if (status === 'COMPLETED') return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t.bookingsPage.title}</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{t.bookingsPage.loginRequired}</p>
        <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700">
          {t.nav.login}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-500 text-center mb-2">
        {t.bookingsPage.title}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
        {t.bookingsPage.subtitle}
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-slate-700">
        {(['upcoming', 'completed', 'cancelled'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === k
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {k === 'upcoming' && `${t.bookingsPage.tabUpcoming} (${upcomingCount})`}
            {k === 'completed' && `${t.bookingsPage.tabCompleted} (${completedCount})`}
            {k === 'cancelled' && `${t.bookingsPage.tabCancelled} (${cancelledCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="flex gap-2 mt-2">
                  <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
              </div>
              <div className="w-full sm:w-40 h-40 sm:min-h-[180px] bg-slate-200 dark:bg-slate-700 shrink-0" />
            </div>
          ))}
        </div>
      ) : filteredTrips.length === 0 && filteredCars.length === 0 ? (
        <p className="text-center text-slate-600 dark:text-slate-400 py-12">{t.bookingsPage.noBookings}</p>
      ) : (
        <div className="space-y-4">
          {/* Trip cards */}
          {filteredTrips.map((b) => (
            <div
              key={'t-' + b.id}
              className="flex flex-col sm:flex-row bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <div className="flex-1 p-4 sm:p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                    <MapPin size={14} aria-hidden />
                    {t.bookingsPage.tripLabel}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${statusColor(b.status)}`}>
                    {statusLabel(b.status)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {isAr && b.trip.titleAr ? b.trip.titleAr : b.trip.title}
                </h3>
                {b.trip.route && (
                  <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-sm mb-1">
                    <MapPin size={14} aria-hidden />
                    {isAr && b.trip.routeAr ? b.trip.routeAr : b.trip.route}
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-sm">
                  <Calendar size={14} aria-hidden />
                  {new Date(b.startDate).toISOString().slice(0, 10)} · {b.trip.durationDays > 1
                    ? t.trip.daysNights(b.trip.durationDays, b.trip.durationDays - 1)
                    : t.trip.singleDay}
                </p>
                <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  {t.bookingsPage.pricePerPerson}: {formatPrice(b.basePrice / Math.max(1, b.participants))} ر.ع
                  <span className="mx-2">×</span>
                  {t.bookingsPage.participants}: {b.participants}
                  <span className="mx-2">=</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(b.finalPrice)} ر.ع</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link
                    href={`/trips/${b.trip.id}`}
                    className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                  >
                    <ChevronRight size={16} aria-hidden />
                    {t.bookingsPage.viewDetails}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDownloadTrip(b)}
                    disabled={downloadingId === 't-' + b.id}
                    className="inline-flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-60"
                  >
                    <Download size={16} aria-hidden />
                    {downloadingId === 't-' + b.id ? '...' : t.bookingsPage.download}
                  </button>
                  {(b.status === 'PAID' || b.status === 'PENDING') && b.canReview && (
                    <button
                      type="button"
                      onClick={() => setShowReviewForm({ type: 'trip', id: b.trip.id })}
                      className="inline-flex items-center gap-1.5 border border-amber-400 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    >
                      <Star size={16} aria-hidden />
                      {t.bookingsPage.rate}
                    </button>
                  )}
                  {(b.status === 'PAID' || b.status === 'PENDING') && b.userReview && (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
                      <Star size={16} className="fill-amber-500" aria-hidden />
                      {t.bookingsPage.yourRating}: {b.userReview.rating}/5
                      {b.userReview.comment && (
                        <span className="text-slate-500 dark:text-slate-400"> – {b.userReview.comment}</span>
                      )}
                    </span>
                  )}
                </div>
                {showReviewForm?.type === 'trip' && showReviewForm?.id === b.trip.id && (
                  <div className="mt-4">
                    <ReviewForm
                      type="trip"
                      id={b.trip.id}
                      onSubmit={(rating, comment) => handleSubmitReview('trip', b.trip.id, rating, comment)}
                      onCancel={() => setShowReviewForm(null)}
                      rateLabel={t.bookingsPage.ratePlaceholder}
                      commentPlaceholder={t.bookingsPage.commentPlaceholder}
                      submitLabel={t.bookingsPage.submitReview}
                      cancelLabel={t.bookingsPage.cancel}
                      isAr={isAr}
                    />
                  </div>
                )}
              </div>
              <div className="w-full sm:w-40 h-40 sm:h-auto sm:min-h-[180px] shrink-0">
                {b.trip.images?.[0] ? (
                  <img
                    src={getImageUrl(b.trip.images[0].imagePath)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <MapPin size={32} className="text-slate-400" aria-hidden />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Car cards */}
          {filteredCars.map((b) => {
            const days = getDaysBetween(b.startDate, b.endDate);
            return (
              <div
                key={'c-' + b.id}
                className="flex flex-col sm:flex-row bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1 p-4 sm:p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                      <Car size={14} aria-hidden />
                      {t.bookingsPage.carLabel}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${statusColor(b.status)}`}>
                      {statusLabel(b.status)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {isAr && b.car.nameAr ? b.car.nameAr : b.car.name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-sm mb-1">
                    <MapPin size={14} aria-hidden />
                    {b.pickupLocation}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-sm">
                    <Calendar size={14} aria-hidden />
                    {new Date(b.startDate).toISOString().slice(0, 10)} · {t.bookingsPage.daysOnly(days)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link
                      href={`/cars/${b.car.id}`}
                      className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                    >
                      <ChevronRight size={16} aria-hidden />
                      {t.bookingsPage.viewDetails}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDownloadCar(b)}
                      disabled={downloadingId === 'c-' + b.id}
                      className="inline-flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-60"
                    >
                      <Download size={16} aria-hidden />
                      {downloadingId === 'c-' + b.id ? '...' : t.bookingsPage.download}
                    </button>
                    {(b.status === 'PAID' || b.status === 'PENDING') && b.canReview && (
                      <button
                        type="button"
                        onClick={() => setShowReviewForm({ type: 'car', id: b.car.id })}
                        className="inline-flex items-center gap-1.5 border border-amber-400 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      >
                        <Star size={16} aria-hidden />
                        {t.bookingsPage.rate}
                      </button>
                    )}
                    {(b.status === 'PAID' || b.status === 'PENDING') && b.userReview && (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
                        <Star size={16} className="fill-amber-500" aria-hidden />
                        {t.bookingsPage.yourRating}: {b.userReview.rating}/5
                        {b.userReview.comment && (
                          <span className="text-slate-500 dark:text-slate-400"> – {b.userReview.comment}</span>
                        )}
                      </span>
                    )}
                  </div>
                  {showReviewForm?.type === 'car' && showReviewForm?.id === b.car.id && (
                    <div className="mt-4">
                      <ReviewForm
                        type="car"
                        id={b.car.id}
                        onSubmit={(rating, comment) => handleSubmitReview('car', b.car.id, rating, comment)}
                        onCancel={() => setShowReviewForm(null)}
                        rateLabel={t.bookingsPage.ratePlaceholder}
                        commentPlaceholder={t.bookingsPage.commentPlaceholder}
                        submitLabel={t.bookingsPage.submitReview}
                        cancelLabel={t.bookingsPage.cancel}
                        isAr={isAr}
                      />
                    </div>
                  )}
                </div>
                <div className="w-full sm:w-40 h-40 sm:h-auto sm:min-h-[180px] shrink-0">
                  {b.car.images?.[0] ? (
                    <img
                      src={getImageUrl(b.car.images[0].imagePath)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <Car size={32} className="text-slate-400" aria-hidden />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
