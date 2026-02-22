'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import { getImageUrl } from '@/lib/upload';
import { useAppSelector } from '@/store/hooks';
import { getT } from '@/lib/i18n';
import type { Language } from '@/types';
import { FileUpload } from '@/components/FileUpload';

type Car = {
  id: string;
  name: string;
  nameAr: string | null;
  basePricePerDay: number;
  basePricePerWeek: number | null;
  basePricePerMonth: number | null;
  images: { imagePath: string }[];
};

type PriceBreakdown = {
  months: number;
  weeks: number;
  days: number;
  monthAmount: number;
  weekAmount: number;
  dayAmount: number;
};

type PricePreview = {
  days: number;
  breakdown?: PriceBreakdown;
  basePrice: number;
  adminDiscountAmount: number;
  couponDiscountAmount: number;
  finalPrice: number;
};

export default function CarBookPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const isAr = locale === 'ar';

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [withDriver, setWithDriver] = useState(false);
  const [licenseImagePath, setLicenseImagePath] = useState<string | null>(null);
  const [licenseIssuer, setLicenseIssuer] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [pricePreview, setPricePreview] = useState<PricePreview | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent('/cars/' + id + '/book')}`);
      return;
    }
    if (!id) return;
    api
      .get(endpoints.cars.byId(id))
      .then((res) => setCar(res.data.data))
      .catch(() => setError('السيارة غير موجودة'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const fetchPricePreview = useCallback(() => {
    if (!id || !startDate || !endDate) {
      setPricePreview(null);
      return;
    }
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (ed <= sd) {
      setPricePreview(null);
      return;
    }
    setPriceLoading(true);
    api
      .post(endpoints.bookings.carPricePreview(id), {
        startDate,
        endDate,
        withDriver,
        couponCode: couponCode.trim() || undefined,
      })
      .then(({ data }) => setPricePreview(data.data))
      .catch(() => setPricePreview(null))
      .finally(() => setPriceLoading(false));
  }, [id, startDate, endDate, withDriver, couponCode]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    fetchPricePreview();
  }, [fetchPricePreview]);

  const handleApplyCoupon = () => fetchPricePreview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post(endpoints.bookings.createCar(id), {
        pickupLocation: pickupLocation.trim(),
        returnLocation: returnLocation.trim(),
        startDate,
        endDate,
        withDriver,
        licenseImagePath: withDriver ? undefined : licenseImagePath,
        licenseIssuer: withDriver ? undefined : licenseIssuer.trim(),
        couponCode: couponCode.trim() || undefined,
      });
      const { booking, paymentAmount } = data.data;

      const sessionRes = await api.post(endpoints.payments.carSession(booking.id), {
        amount: paymentAmount,
      });
      const { redirectUrl } = sessionRes.data.data;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        router.push(`/bookings/success?booking=${booking.id}&type=car`);
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax?.response?.data?.message ?? 'حدث خطأ أثناء إنشاء الحجز. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const getLabel = () => (car ? (isAr && car.nameAr ? car.nameAr : car.name) : '');
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 dark:text-slate-400">{t.carsPage.loading}</p>
      </div>
    );
  }

  if (!car || error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error ?? 'السيارة غير موجودة'}</p>
        <Link href="/cars" className="text-blue-600 dark:text-blue-400 hover:underline">
          {t.carBookPage.backToCars}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl" dir={isAr ? 'rtl' : 'ltr'}>
      <nav className="mb-8 text-sm text-slate-600 dark:text-slate-400">
        <Link href="/cars" className="hover:text-blue-600 dark:hover:text-blue-400">
          {t.carsPage.heroTitle}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/cars/${id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
          {getLabel()}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-slate-100">{t.carBookPage.title}</span>
      </nav>

      <div className="flex items-center gap-4 mb-6">
        {car.images?.[0] && (
          <img
            src={getImageUrl(car.images[0].imagePath)}
            alt={getLabel()}
            className="w-20 h-14 object-cover rounded-lg"
          />
        )}
        <h1 className="text-xl font-bold dark:text-white">
          {t.carBookPage.title}: {getLabel()}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-slate-800 rounded-xl p-6 shadow">
        {(error || uploadError) && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error || uploadError}
          </div>
        )}

        <div>
          <label htmlFor="pickupLocation" className="block text-sm font-medium mb-2 dark:text-slate-300">
            {t.carBookPage.pickupLocation} *
          </label>
          <input
            id="pickupLocation"
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
            placeholder={isAr ? 'مثال: مطار مسقط الدولي' : 'e.g. Muscat International Airport'}
          />
        </div>

        <div>
          <label htmlFor="returnLocation" className="block text-sm font-medium mb-2 dark:text-slate-300">
            {t.carBookPage.returnLocation} *
          </label>
          <input
            id="returnLocation"
            type="text"
            value={returnLocation}
            onChange={(e) => setReturnLocation(e.target.value)}
            required
            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
            placeholder={isAr ? 'مثال: نفس مكان الاستلام' : 'e.g. Same as pickup'}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-2 dark:text-slate-300">
              {t.carBookPage.startDate} *
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minDate}
              required
              className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-2 dark:text-slate-300">
              {t.carBookPage.endDate} *
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || minDate}
              required
              className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-slate-300">
            {isAr ? 'مع سائق أم بدون سائق؟' : 'With or without driver?'} *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="driver"
                checked={withDriver}
                onChange={() => setWithDriver(true)}
                className="rounded-full"
              />
              <span className="dark:text-slate-300">{t.carBookPage.withDriver}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="driver"
                checked={!withDriver}
                onChange={() => setWithDriver(false)}
                className="rounded-full"
              />
              <span className="dark:text-slate-300">{t.carBookPage.withoutDriver}</span>
            </label>
          </div>
        </div>

        {!withDriver && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">
                {t.carBookPage.licenseImage} *
              </label>
              <FileUpload
                label={t.carBookPage.licenseImage}
                uploadUrl={endpoints.bookings.uploadLicense()}
                fieldName="license"
                onSuccess={(path) => { setLicenseImagePath(path); setUploadError(''); }}
                onError={(msg) => setUploadError(msg)}
                previewPath={licenseImagePath}
              />
            </div>
            <div>
              <label htmlFor="licenseIssuer" className="block text-sm font-medium mb-2 dark:text-slate-300">
                {t.carBookPage.licenseIssuer} *
              </label>
              <input
                id="licenseIssuer"
                type="text"
                value={licenseIssuer}
                onChange={(e) => setLicenseIssuer(e.target.value)}
                required={!withDriver}
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
                placeholder={isAr ? 'مثال: المرور العام - سلطنة عمان' : 'e.g. Royal Oman Police'}
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="couponCode" className="block text-sm font-medium mb-2 dark:text-slate-300">
            {t.carBookPage.couponCode}
          </label>
          <div className="flex gap-2">
            <input
              id="couponCode"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder={t.carBookPage.couponPlaceholder}
              className="flex-1 border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-lg font-medium dark:text-white transition-colors"
            >
              {t.carBookPage.applyCoupon}
            </button>
          </div>
        </div>

        {pricePreview && startDate && endDate && (
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {pricePreview.breakdown
                ? t.carBookPage.durationBreakdown(
                    pricePreview.breakdown.months,
                    pricePreview.breakdown.weeks,
                    pricePreview.breakdown.days
                  )
                : t.carBookPage.daysLabel(pricePreview.days)}
            </p>
            {pricePreview.breakdown &&
              (pricePreview.breakdown.monthAmount > 0 ||
                pricePreview.breakdown.weekAmount > 0 ||
                pricePreview.breakdown.dayAmount > 0) && (
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {pricePreview.breakdown.monthAmount > 0 && (
                    <div className="flex justify-between">
                      <span>
                        {pricePreview.breakdown.months} {locale === 'ar' ? 'شهر' : 'month(s)'}
                      </span>
                      <span>{pricePreview.breakdown.monthAmount.toFixed(3)} ر.ع.</span>
                    </div>
                  )}
                  {pricePreview.breakdown.weekAmount > 0 && (
                    <div className="flex justify-between">
                      <span>
                        {pricePreview.breakdown.weeks} {locale === 'ar' ? 'أسبوع' : 'week(s)'}
                      </span>
                      <span>{pricePreview.breakdown.weekAmount.toFixed(3)} ر.ع.</span>
                    </div>
                  )}
                  {pricePreview.breakdown.dayAmount > 0 && (
                    <div className="flex justify-between">
                      <span>
                        {pricePreview.breakdown.days} {locale === 'ar' ? 'يوم' : 'day(s)'}
                      </span>
                      <span>{pricePreview.breakdown.dayAmount.toFixed(3)} ر.ع.</span>
                    </div>
                  )}
                </div>
              )}
            <div className="flex justify-between pt-1">
              <span className="dark:text-slate-300 font-medium">{t.carBookPage.basePrice}</span>
              <span className="font-medium dark:text-white">{pricePreview.basePrice.toFixed(3)} ر.ع.</span>
            </div>
            {pricePreview.adminDiscountAmount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>خصم</span>
                <span>-{pricePreview.adminDiscountAmount.toFixed(3)} ر.ع.</span>
              </div>
            )}
            {pricePreview.couponDiscountAmount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>{t.carBookPage.couponDiscount}</span>
                <span>-{pricePreview.couponDiscountAmount.toFixed(3)} ر.ع.</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t dark:border-slate-600">
              <span className="dark:text-white">{t.carBookPage.finalPrice}</span>
              <span className="text-blue-600 dark:text-blue-400">
                {pricePreview.finalPrice.toFixed(3)} ر.ع.
              </span>
            </div>
          </div>
        )}

        {priceLoading && startDate && endDate && (
          <p className="text-slate-500 text-sm">{t.carsPage.loading}</p>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={
              submitting ||
              !pickupLocation.trim() ||
              !returnLocation.trim() ||
              !startDate ||
              !endDate ||
              (!withDriver && (!licenseImagePath || !licenseIssuer.trim())) ||
              new Date(endDate) <= new Date(startDate)
            }
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors"
          >
            {submitting ? t.carBookPage.submitting : t.carBookPage.submitBook}
            <ArrowIcon size={20} aria-hidden />
          </button>
          <Link
            href={`/cars/${id}`}
            className="px-6 py-3 border dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center dark:text-slate-300"
          >
            {t.carBookPage.backToCar}
          </Link>
        </div>
      </form>
    </div>
  );
}
