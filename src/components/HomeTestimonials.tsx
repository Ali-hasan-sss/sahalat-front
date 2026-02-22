'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { AnimateSection } from '@/components/AnimateSection';
import { getT } from '@/lib/i18n';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import type { Language } from '@/types';

type FeaturedReview = {
  id: string;
  type: 'TRIP' | 'CAR';
  rating: number;
  comment: string | null;
  userName: string;
  userCountry: string | null;
  referenceTitle: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s.charAt(0))
    .join('')
    .toUpperCase() || '?';
}

export function HomeTestimonials() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const hl = (t as { homeLanding?: Record<string, string> }).homeLanding ?? {};
  const txt = (k: string) => hl[k] ?? k;
  const isAr = locale === 'ar';

  const [reviews, setReviews] = useState<FeaturedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api
      .get(endpoints.reviews.featured(), { params: { limit: 20 } })
      .then((res) => {
        const payload = res.data;
        const list = payload?.data ?? payload ?? [];
        setReviews(Array.isArray(list) ? list : []);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const items = reviews.filter((r) => r.comment && r.comment.trim());
  const len = items.length;

  const goPrev = () => setCurrent((c) => (c - 1 + len) % len);
  const goNext = () => setCurrent((c) => (c + 1) % len);

  if (loading || items.length === 0) return null;

  const item = items[current];

  return (
    <AnimateSection
      animation="fadeIn"
      as="section"
      className="py-16 md:py-24 px-4 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800/60 dark:to-slate-900/80"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <p className="text-blue-500 dark:text-blue-400 text-sm font-medium mb-2">
            {txt('testimonialsTag')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {txt('testimonialsTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {txt('testimonialsDesc')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-10">
          {/* Stars */}
          <div className="flex gap-1 mb-4" dir="ltr">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={28}
                className={
                  i < item.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }
              />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-slate-700 dark:text-slate-300 text-lg md:text-xl leading-relaxed mb-8">
            &ldquo;{item.comment}&rdquo;
          </blockquote>

          {/* Author row: avatar before name (في العربي: الأفاتار قبل الاسم) */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 font-semibold text-lg">
              {getInitials(item.userName)}
            </div>
            <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : ''}`}>
              <p className="font-semibold text-slate-900 dark:text-white">
                {item.userName}
              </p>
              {item.userCountry && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {item.userCountry}
                </p>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {item.referenceTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Slider controls - dir=ltr so arrows always point outward (left/right) */}
        {len > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6" dir="ltr">
            <button
              type="button"
              onClick={goPrev}
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center transition text-slate-700 dark:text-slate-300"
              aria-label={isAr ? 'السابق' : 'Previous'}
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    i === current
                      ? 'bg-teal-600 dark:bg-teal-500 scale-110'
                      : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                  }`}
                  aria-label={isAr ? `الشريحة ${i + 1}` : `Slide ${i + 1}`}
                  aria-current={i === current ? 'true' : undefined}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={goNext}
              className="w-10 h-10 rounded-full bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 flex items-center justify-center transition text-white"
              aria-label={isAr ? 'التالي' : 'Next'}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>
    </AnimateSection>
  );
}
