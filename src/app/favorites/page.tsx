'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { getImageUrl } from '@/lib/upload';
import { useAppSelector } from '@/store/hooks';
import { getT } from '@/lib/i18n';
import { MapPin, Car, Landmark } from 'lucide-react';
import { FavoriteButton } from '@/components/FavoriteButton';
import type { Language } from '@/types';

type FavoriteItem = {
  id: string;
  type: string;
  trip?: {
    id: string;
    title: string;
    titleAr?: string | null;
    basePrice: number;
    discount?: { id: string; discountType: string; value: number } | null;
    finalPrice?: number;
    durationDays?: number;
    image?: string;
  };
  car?: {
    id: string;
    name: string;
    nameAr?: string | null;
    basePricePerDay: number;
    discount?: { id: string; discountType: string; value: number } | null;
    finalPricePerDay?: number;
    image?: string;
  };
  landmark?: { id: string; name: string; nameAr?: string | null; location?: string | null; image?: string };
};

export default function FavoritesPage() {
  const router = useRouter();
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const t = getT(locale);
  const fp = (t as { favoritesPage?: Record<string, string> }).favoritesPage ?? {};
  const isAr = locale === 'ar';

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trip' | 'car' | 'landmark'>('all');

  const filteredItems = items.filter((f) => {
    if (filter === 'all') return true;
    if (filter === 'trip') return !!f.trip;
    if (filter === 'car') return !!f.car;
    return !!f.landmark;
  });

  const removeFromList = (favoriteId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== favoriteId));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setItems([]);
      return;
    }
    api
      .get(endpoints.favorites.list())
      .then(({ data }) => setItems(data.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/favorites'));
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#faf9f7] dark:bg-slate-900 py-12"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="container mx-auto px-4">
          <div className="h-9 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-6" />
          <div className="flex flex-wrap gap-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
              >
                <div className="aspect-video bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-5 w-3/4 mt-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-1/2 mt-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div
      className="min-h-screen bg-[#faf9f7] dark:bg-slate-900 py-12"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6">
          {fp.title ?? (isAr ? 'المفضلة' : 'Favorites')}
        </h1>
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'trip', 'car', 'landmark'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-[#26C0D2] text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
              }`}
            >
              {key === 'all' && (fp.filterAll ?? (isAr ? 'الكل' : 'All'))}
              {key === 'trip' && (fp.filterTrips ?? (isAr ? 'رحلات' : 'Trips'))}
              {key === 'car' && (fp.filterCars ?? (isAr ? 'سيارات' : 'Cars'))}
              {key === 'landmark' && (fp.filterLandmarks ?? (isAr ? 'معالم أثرية' : 'Landmarks'))}
            </button>
          ))}
        </div>
        {items.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">
            {fp.empty ?? (isAr ? 'لا توجد عناصر في المفضلة.' : 'No items in favorites.')}
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">
            {fp.emptyFilter ?? (isAr ? 'لا توجد عناصر بهذا النوع في المفضلة.' : 'No items of this type in favorites.')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((f) => {
              if (f.trip) {
                const label = isAr ? (f.trip.titleAr ?? f.trip.title) : f.trip.title;
                return (
                  <div key={f.id} className="relative">
                    <div
                      className={`absolute top-3 z-10 ${isAr ? 'left-3' : 'right-3'}`}
                      onClick={(e) => e.preventDefault()}
                    >
                      <FavoriteButton
                        type="trip"
                        id={f.trip.id}
                        isFavorite
                        favoriteId={f.id}
                        variant="overlay"
                        onToggle={() => removeFromList(f.id)}
                      />
                    </div>
                    <Link
                      href={`/trips/${f.trip.id}`}
                      className="group block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="aspect-video bg-slate-200 dark:bg-slate-700">
                      {f.trip.image ? (
                        <img
                          src={getImageUrl(f.trip.image)}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Landmark size={48} />
                        </div>
                      )}
                    </div>
                    <div className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>
                      <span className="text-xs text-amber-500 dark:text-amber-400 font-medium">
                        {fp.tripLabel ?? (isAr ? 'رحلة' : 'Trip')}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white mt-1">{label}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        {f.trip.discount ? (
                          <>
                            <span className="line-through mr-1">{f.trip.basePrice} ر.ع.</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{f.trip.finalPrice ?? f.trip.basePrice} ر.ع.</span>
                          </>
                        ) : (
                          <>{f.trip.finalPrice ?? f.trip.basePrice} ر.ع.</>
                        )}{' '}
                        {f.trip.durationDays ? `• ${f.trip.durationDays} ${isAr ? 'أيام' : 'days'}` : ''}
                      </p>
                      <span className="inline-block mt-2 text-[#26C0D2] font-medium text-sm">
                        {fp.view ?? (isAr ? 'عرض' : 'View')} →
                      </span>
                    </div>
                  </Link>
                  </div>
                );
              }
              if (f.car) {
                const label = isAr ? (f.car.nameAr ?? f.car.name) : f.car.name;
                return (
                  <div key={f.id} className="relative">
                    <div
                      className={`absolute top-3 z-10 ${isAr ? 'left-3' : 'right-3'}`}
                      onClick={(e) => e.preventDefault()}
                    >
                      <FavoriteButton
                        type="car"
                        id={f.car!.id}
                        isFavorite
                        favoriteId={f.id}
                        variant="overlay"
                        onToggle={() => removeFromList(f.id)}
                      />
                    </div>
                    <Link
                      href={`/cars/${f.car!.id}`}
                      className="group block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="aspect-video bg-slate-200 dark:bg-slate-700">
                      {f.car.image ? (
                        <img
                          src={getImageUrl(f.car.image)}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Car size={48} />
                        </div>
                      )}
                    </div>
                    <div className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>
                      <span className="text-xs text-amber-500 dark:text-amber-400 font-medium">
                        {fp.carLabel ?? (isAr ? 'سيارة' : 'Car')}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white mt-1">{label}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        {f.car.discount ? (
                          <>
                            <span className="line-through mr-1">{f.car.basePricePerDay} ر.ع.</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{f.car.finalPricePerDay ?? f.car.basePricePerDay} ر.ع.</span>
                          </>
                        ) : (
                          <>{f.car.finalPricePerDay ?? f.car.basePricePerDay} ر.ع.</>
                        )}/{isAr ? 'يوم' : 'day'}
                      </p>
                      <span className="inline-block mt-2 text-[#26C0D2] font-medium text-sm">
                        {fp.view ?? (isAr ? 'عرض' : 'View')} →
                      </span>
                    </div>
                  </Link>
                  </div>
                );
              }
              if (f.landmark) {
                const label = isAr ? (f.landmark.nameAr ?? f.landmark.name) : f.landmark.name;
                return (
                  <div key={f.id} className="relative">
                    <div
                      className={`absolute top-3 z-10 ${isAr ? 'left-3' : 'right-3'}`}
                      onClick={(e) => e.preventDefault()}
                    >
                      <FavoriteButton
                        type="landmark"
                        id={f.landmark!.id}
                        isFavorite
                        favoriteId={f.id}
                        variant="overlay"
                        onToggle={() => removeFromList(f.id)}
                      />
                    </div>
                    <Link
                      href={`/landmarks/${f.landmark!.id}`}
                      className="group block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="aspect-video bg-slate-200 dark:bg-slate-700">
                      {f.landmark.image ? (
                        <img
                          src={getImageUrl(f.landmark.image)}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <MapPin size={48} />
                        </div>
                      )}
                    </div>
                    <div className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>
                      <span className="text-xs text-amber-500 dark:text-amber-400 font-medium">
                        {fp.landmarkLabel ?? (isAr ? 'معلم سياحي' : 'Landmark')}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white mt-1">{label}</h3>
                      {f.landmark.location && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 flex items-center gap-1">
                          <MapPin size={14} className="shrink-0" />
                          {f.landmark.location}
                        </p>
                      )}
                      <span className="inline-block mt-2 text-[#26C0D2] font-medium text-sm">
                        {fp.view ?? (isAr ? 'عرض' : 'View')} →
                      </span>
                    </div>
                  </Link>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
