"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { getImageUrl } from "@/lib/upload";
import { useAppSelector } from "@/store/hooks";
import { getT } from "@/lib/i18n";
import { Fuel, Gauge, Users, Star, SlidersHorizontal, X } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";
import type { Language } from "@/types";

type PricePeriod = "day" | "week" | "month";

type Car = {
  id: string;
  name: string;
  nameAr?: string | null;
  basePricePerDay: number;
  basePricePerWeek?: number | null;
  basePricePerMonth?: number | null;
  basePricePerDayWithDriver?: number | null;
  basePricePerWeekWithDriver?: number | null;
  basePricePerMonthWithDriver?: number | null;
  discount?: { id: string; discountType: string; value: number; startDate: string; endDate: string } | null;
  finalPricePerDay?: number;
  finalPricePerWeek?: number | null;
  finalPricePerMonth?: number | null;
  finalPricePerDayWithDriver?: number | null;
  finalPricePerWeekWithDriver?: number | null;
  finalPricePerMonthWithDriver?: number | null;
  category: string;
  transmission: string;
  seats: number;
  fuelType?: string | null;
  isActive: boolean;
  averageRating: number | null;
  reviewsCount?: number;
  images?: { imagePath: string }[];
};

function CarCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-100 dark:border-slate-700">
      <div className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
        <div className="flex flex-wrap gap-1">
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
        <div className="flex justify-evenly gap-2 py-1">
          <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-1" />
      </div>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  ECONOMY:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  SUV: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  LUXURY:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  VAN: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export default function CarsPage() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const isAr = locale === "ar";

  const { isFavorited, getFavoriteId, refetch } = useFavorites();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [transmission, setTransmission] = useState<string>("");
  const [seatsRange, setSeatsRange] = useState<string>("");
  const [pricePeriodByCarId, setPricePeriodByCarId] = useState<
    Record<string, PricePeriod>
  >({});
  const [withDriverByCarId, setWithDriverByCarId] = useState<
    Record<string, boolean>
  >({});

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    const params: Record<string, string | number> = { limit: 50 };
    if (category) params.category = category;
    if (transmission) params.transmission = transmission;
    if (seatsRange) params.seatsRange = seatsRange;
    api
      .get(endpoints.cars.list(), {
        params,
        signal: abortRef.current.signal,
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      })
      .then(({ data }) => setCars(data.data?.items ?? []))
      .catch((err) => {
        const isCanceled =
          err?.name === "CanceledError" ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED";
        if (!isCanceled) setCars([]);
      })
      .finally(() => setLoading(false));
    return () => {
      abortRef.current?.abort();
    };
  }, [category, transmission, seatsRange]);

  const getLabel = (c: Car) => (isAr ? (c.nameAr ?? c.name) : c.name);
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
    c === "AUTOMATIC" ? t.carsPage.automatic : t.carsPage.manual;
  const getFuelLabel = (c: string | null | undefined) =>
    c === "DIESEL" ? t.carsPage.diesel : t.carsPage.petrol;

  const getPricePeriod = (carId: string): PricePeriod =>
    pricePeriodByCarId[carId] ?? "day";
  const setPricePeriod = (carId: string, period: PricePeriod) =>
    setPricePeriodByCarId((prev) => ({ ...prev, [carId]: period }));
  const getWithDriver = (carId: string): boolean =>
    withDriverByCarId[carId] ?? false;
  const setWithDriver = (carId: string, value: boolean) =>
    setWithDriverByCarId((prev) => ({ ...prev, [carId]: value }));

  const getBasePrice = (
    c: Car,
    period: PricePeriod,
    withDrv: boolean,
  ): number | null => {
    if (withDrv) {
      if (period === "day")
        return c.basePricePerDayWithDriver ?? c.basePricePerDay;
      if (period === "week")
        return c.basePricePerWeekWithDriver ?? c.basePricePerWeek ?? null;
      return c.basePricePerMonthWithDriver ?? c.basePricePerMonth ?? null;
    }
    if (period === "day") return c.basePricePerDay;
    if (period === "week") return c.basePricePerWeek ?? null;
    return c.basePricePerMonth ?? null;
  };

  const getDisplayPrice = (
    c: Car,
    period: PricePeriod,
    withDrv: boolean,
  ): number | null => {
    const base = getBasePrice(c, period, withDrv);
    if (base == null) return null;
    if (c.discount) {
      if (withDrv) {
        if (period === "day")
          return c.finalPricePerDayWithDriver ?? c.finalPricePerDay ?? base;
        if (period === "week")
          return c.finalPricePerWeekWithDriver ?? c.finalPricePerWeek ?? null;
        return c.finalPricePerMonthWithDriver ?? c.finalPricePerMonth ?? null;
      }
      if (period === "day") return c.finalPricePerDay ?? base;
      if (period === "week") return c.finalPricePerWeek ?? null;
      return c.finalPricePerMonth ?? null;
    }
    return base;
  };
  const getPriceLabel = (period: PricePeriod) => {
    if (period === "day") return t.carsPage.pricePerDay;
    if (period === "week") return t.carsPage.pricePerWeek;
    return t.carsPage.pricePerMonth;
  };

  const clearFilters = () => {
    setCategory("");
    setTransmission("");
    setSeatsRange("");
  };

  const hasFilters = category || transmission || seatsRange;

  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  );

  if (loading && cars.length === 0) {
    return (
      <div>
        <section
          className="w-full py-20 md:py-24 flex items-center justify-center"
          style={{ backgroundColor: "#1d4ed8" }}
        >
          <div
            className={`container mx-auto px-4 text-center ${isAr ? "text-right" : "text-left"}`}
            dir={isAr ? "rtl" : "ltr"}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              {t.carsPage.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-white/95">
              {t.carsPage.heroSubtitle}
            </p>
          </div>
        </section>
        <div className="container mx-auto px-4 py-8" dir="ltr">
          <div className={`grid grid-cols-1 gap-8 ${isAr ? "lg:grid-cols-[1fr_12rem]" : "lg:grid-cols-[12rem_1fr]"}`}>
            <div className={isAr ? "lg:order-2" : "lg:order-1"}>
              <div
                className="sticky top-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800"
                dir={isAr ? "rtl" : "ltr"}
              >
                <div className="bg-slate-50 dark:bg-slate-700/50 px-5 py-4 border-b border-slate-200 dark:border-slate-600">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal size={20} className="text-blue-600" />
                    {t.carsPage.filters}
                  </h3>
                </div>
                <div className="p-5 space-y-5">
                  <div>
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-9 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-9 w-14 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`min-w-0 ${isAr ? "lg:order-1" : "lg:order-2"}`} dir={isAr ? "rtl" : "ltr"}>
              <h2 className="text-2xl font-bold mb-6 dark:text-white">
                {t.carsPage.availableCars(0)}
              </h2>
              {renderSkeletonGrid()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section
        className="w-full py-20 md:py-24 flex items-center justify-center"
        style={{ backgroundColor: "#1d4ed8" }}
      >
        <div
          className={`container mx-auto px-4 text-center ${isAr ? "text-right" : "text-left"}`}
          dir={isAr ? "rtl" : "ltr"}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {t.carsPage.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/95">
            {t.carsPage.heroSubtitle}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8" dir="ltr">
        <div className={`grid grid-cols-1 gap-8 ${isAr ? "lg:grid-cols-[1fr_12rem]" : "lg:grid-cols-[12rem_1fr]"}`}>
          {/* Filters sidebar - order-1 في EN (يسار)، order-2 في AR (يمين) */}
          <div className={isAr ? "lg:order-2" : "lg:order-1"}>
            <div
              className="sticky top-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800"
              dir={isAr ? "rtl" : "ltr"}
            >
              <div className="bg-slate-50 dark:bg-slate-700/50 px-5 py-4 border-b border-slate-200 dark:border-slate-600">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal size={20} className="text-blue-600" />
                    {t.carsPage.filters}
                  </h3>
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                    >
                      <X size={16} />
                      {t.carsPage.clearAll}
                    </button>
                  )}
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.carsPage.category}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["", "ECONOMY", "SUV", "LUXURY", "VAN"].map((cat) => (
                      <button
                        key={cat || "all"}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          category === cat
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {!cat
                          ? t.carsPage.all
                          : getCategoryLabel(cat)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.carsPage.transmission}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["", "AUTOMATIC", "MANUAL"].map((ttype) => (
                      <button
                        key={ttype || "all"}
                        type="button"
                        onClick={() => setTransmission(ttype)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          transmission === ttype
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {!ttype
                          ? t.carsPage.all
                          : getTransmissionLabel(ttype)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.carsPage.seats}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["", "4-5", "6-7", "8+"].map((sr) => (
                      <button
                        key={sr || "all"}
                        type="button"
                        onClick={() => setSeatsRange(sr)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          seatsRange === sr
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {!sr ? t.carsPage.all : (sr === "4-5" ? t.carsPage.seats45 : sr === "6-7" ? t.carsPage.seats67 : t.carsPage.seats8plus)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Cars grid - order-2 في EN (يمين)، order-1 في AR (يسار) */}
          <div className={`min-w-0 ${isAr ? "lg:order-1" : "lg:order-2"}`} dir={isAr ? "rtl" : "ltr"}>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              {t.carsPage.availableCars(cars.length)}
            </h2>
            {loading ? (
              renderSkeletonGrid()
            ) : cars.length === 0 ? (
              <p className="text-slate-500 py-8 dark:text-slate-400">
                {t.carsPage.noCars}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map((c) => (
                  <Link
                    key={c.id}
                    href={c.isActive ? `/cars/${c.id}` : "#"}
                    onClick={(e) => !c.isActive && e.preventDefault()}
                    className={`group block bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-100 dark:border-slate-700 transition-shadow hover:shadow-lg ${
                      !c.isActive
                        ? "opacity-90 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <div className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className={`absolute top-1 z-10 ${isAr ? "left-1" : "right-1"}`}>
                        <FavoriteButton
                          type="car"
                          id={c.id}
                          isFavorite={isFavorited("car", c.id)}
                          favoriteId={getFavoriteId("car", c.id)}
                          onToggle={refetch}
                          variant="overlay"
                          size={20}
                        />
                      </div>
                      {c.images?.[0] ? (
                        <img
                          src={getImageUrl(c.images[0].imagePath)}
                          alt={getLabel(c)}
                          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          —
                        </div>
                      )}
                      {!c.isActive && (
                        <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {t.carsPage.notAvailable}
                          </span>
                        </div>
                      )}
                      {c.averageRating != null && (
                        <div className={`absolute bottom-1 z-10 flex items-center gap-0.5 bg-white/90 dark:bg-slate-800/90 rounded px-1.5 py-0.5 text-xs font-medium ${isAr ? "right-1" : "left-1"}`}>
                          <Star
                            size={12}
                            className="text-amber-500 fill-amber-500"
                          />
                          {c.averageRating}
                          {c.reviewsCount != null && c.reviewsCount > 0 && (
                            <span className="text-slate-500 dark:text-slate-400">({c.reviewsCount})</span>
                          )}
                        </div>
                      )}
                      <div
                        className={`absolute top-1 z-10 flex flex-wrap gap-1 ${
                          isAr ? "right-1" : "left-1"
                        }`}
                      >
                        {c.discount && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm">
                            {c.discount.discountType === "PERCENTAGE"
                              ? t.carsPage.discountBadgePercent(c.discount.value)
                              : t.carsPage.discountBadgeFixed(c.discount.value)}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            CATEGORY_COLORS[c.category] ??
                            "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200"
                          }`}
                        >
                          {getCategoryLabel(c.category)}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className="font-bold text-base dark:text-white truncate min-w-0"
                          dir={isAr ? "rtl" : "ltr"}
                          title={getLabel(c)}
                        >
                          {getLabel(c)}
                        </h3>
                        <div
                          className="flex shrink-0 gap-1"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <label
                            className={`flex items-center gap-1 cursor-pointer ${!getWithDriver(c.id) ? "font-medium" : ""}`}
                          >
                            <input
                              type="radio"
                              name={`driver-${c.id}`}
                              checked={!getWithDriver(c.id)}
                              onChange={() => setWithDriver(c.id, false)}
                              className="rounded-full"
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-400 select-none">
                              {isAr ? "بدون سائق" : "Without"}
                            </span>
                          </label>
                          <label
                            className={`flex items-center gap-1 select-none ${
                              (c.basePricePerDayWithDriver ??
                                c.basePricePerWeekWithDriver ??
                                c.basePricePerMonthWithDriver) != null
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-60"
                            } ${getWithDriver(c.id) ? "font-medium" : ""}`}
                          >
                            <input
                              type="radio"
                              name={`driver-${c.id}`}
                              checked={getWithDriver(c.id)}
                              onChange={() => setWithDriver(c.id, true)}
                              disabled={
                                (c.basePricePerDayWithDriver ??
                                  c.basePricePerWeekWithDriver ??
                                  c.basePricePerMonthWithDriver) == null
                              }
                              className="rounded-full"
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {isAr ? "مع سائق" : "With"}
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-wrap pt-2 gap-1">
                        {(["day", "week", "month"] as const).map((period) => {
                          const hasPrice =
                            getDisplayPrice(c, period, getWithDriver(c.id)) !=
                            null;
                          const isSelected = getPricePeriod(c.id) === period;
                          return (
                            <button
                              key={period}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                hasPrice && setPricePeriod(c.id, period);
                              }}
                              disabled={!hasPrice}
                              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : hasPrice
                                    ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              {period === "day"
                                ? t.carsPage.pricePeriodDaily
                                : period === "week"
                                  ? t.carsPage.pricePeriodWeekly
                                  : t.carsPage.pricePeriodMonthly}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                        {(() => {
                          const period = getPricePeriod(c.id);
                          const basePrice = getBasePrice(
                            c,
                            period,
                            getWithDriver(c.id),
                          );
                          const finalPrice = getDisplayPrice(
                            c,
                            period,
                            getWithDriver(c.id),
                          );
                          const labelFn = getPriceLabel(period);
                          if (finalPrice == null) return "—";
                          if (c.discount && basePrice != null && basePrice > finalPrice) {
                            return (
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className="line-through text-slate-500 dark:text-slate-400 font-medium">
                                  {labelFn(basePrice)}
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {labelFn(finalPrice)}
                                </span>
                              </span>
                            );
                          }
                          return labelFn(finalPrice);
                        })()}
                      </p>
                      <div className="flex py-2 justify-evenly items-center text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-0.5 shrink-0">
                          <Fuel size={12} aria-hidden />
                          {getFuelLabel(c.fuelType)}
                        </span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          <Gauge size={12} aria-hidden />
                          {getTransmissionLabel(c.transmission)}
                        </span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          <Users size={12} aria-hidden />
                          {t.carsPage.seatsLabel(c.seats)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
