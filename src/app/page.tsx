'use client';

import Link from 'next/link';
import { Ship, Users, Backpack, Star, Globe, Mountain, Sun, Waves, Moon, Check } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { getT } from '@/lib/i18n';
import type { Language } from '@/types';

const DESTINATIONS = [
  { key: 'muscat' as const, trips: 12, rating: 4.9 },
  { key: 'wahiba' as const, trips: 8, rating: 4.8 },
  { key: 'jebelAkhdar' as const, trips: 6, rating: 4.9 },
  { key: 'musandam' as const, trips: 5, rating: 4.7 },
  { key: 'nizwa' as const, trips: 7, rating: 4.8 },
  { key: 'salalah' as const, trips: 10, rating: 4.9 },
];

const PROGRAMS = [
  { Icon: Ship, key: 'marineTrip' as const },
  { Icon: Users, key: 'groupTrip' as const },
  { Icon: Backpack, key: 'individualTrip' as const },
];

const WHY_US = [
  { titleKey: 'safeTravel' as const, descKey: 'safeTravelDesc' as const },
  { titleKey: 'support247' as const, descKey: 'support247Desc' as const },
  { titleKey: 'qualityGuaranteed' as const, descKey: 'qualityGuaranteedDesc' as const },
  { titleKey: 'authenticExperiences' as const, descKey: 'authenticExperiencesDesc' as const },
  { titleKey: 'professionalGuides' as const, descKey: 'professionalGuidesDesc' as const },
  { titleKey: 'exceptionalValue' as const, descKey: 'exceptionalValueDesc' as const },
];

const HERO_FEATURES = [
  { key: 'heroFeature1' as const, Icon: Mountain },
  { key: 'heroFeature2' as const, Icon: Sun },
  { key: 'heroFeature3' as const, Icon: Waves },
];

const RECENT_BOOKINGS = [
  { userKey: 'recent1User' as const, textKey: 'recent1Text' as const, timeKey: 'recent1Time' as const },
  { userKey: 'recent2User' as const, textKey: 'recent2Text' as const, timeKey: 'recent2Time' as const },
  { userKey: 'recent3User' as const, textKey: 'recent3Text' as const, timeKey: 'recent3Time' as const },
];

export default function HomePage() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const hp = (t as { homePage?: Record<string, unknown> }).homePage ?? {};
  const txt = (k: string) =>
    typeof hp[k] === 'function'
      ? (hp[k] as (n: number) => string)(0)
      : (hp[k] ?? k) as string;
  const tripCount = (n: number) =>
    typeof hp.tripCount === 'function'
      ? (hp.tripCount as (n: number) => string)(n)
      : `${n} ${locale === 'ar' ? 'رحلة' : 'trips'}`;
  const isAr = locale === 'ar';

  return (
    <div
      className="min-h-screen flex flex-col bg-[#faf9f7] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Hero - اكتشف عمان */}
      <section className="relative w-full min-h-[65vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/exploeroman.png')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(38, 192, 210, 0.6) 0%, rgba(22, 119, 134, 0.7) 50%, rgba(15, 85, 95, 0.8) 100%)",
          }}
        />
        <div
          className="container mx-auto px-4 relative z-10 text-center"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <Globe
            size={40}
            strokeWidth={2}
            className="text-white/95 mx-auto mb-4"
            aria-hidden
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-sm">
            {txt('heroTitle')}
          </h1>
          <p className="text-base md:text-lg text-white/95 max-w-2xl mx-auto mb-8 leading-relaxed">
            {txt('heroSubtitle')}
          </p>
          <div
            className={`flex flex-wrap gap-6 justify-center items-center ${
              isAr ? 'flex-row-reverse' : ''
            }`}
          >
            {HERO_FEATURES.map(({ key, Icon }) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 text-white/95 text-sm md:text-base font-medium"
              >
                <Icon size={20} strokeWidth={2} className="shrink-0" aria-hidden />
                {txt(key)}
              </span>
            ))}
          </div>
          <div className="mt-8 h-px w-24 mx-auto bg-white/30" aria-hidden />
        </div>
      </section>

      {/* Search */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                {txt('destination')}
              </label>
              <select className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>{txt('selectDestination')}</option>
                <option>{txt('muscat')}</option>
                <option>{txt('wahiba')}</option>
                <option>{txt('jebelAkhdar')}</option>
                <option>{txt('musandam')}</option>
                <option>{txt('nizwa')}</option>
                <option>{txt('salalah')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                {txt('date')}
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                {txt('persons')}
              </label>
              <select className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500">
                <option>{txt('person1')}</option>
                <option>{txt('persons2')}</option>
                <option>{txt('persons35')}</option>
                <option>{txt('persons6plus')}</option>
              </select>
            </div>
            <div className="flex items-end">
              <Link
                href="/trips"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl font-medium transition"
              >
                {txt('searchTrips')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">50,000+</p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{txt('travelersHappy')}</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">15+</p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{txt('intlAwards')}</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">30+</p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{txt('destinations')}</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">4.9</p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{txt('customerRating')}</p>
          </div>
        </div>
      </section>

      {/* أفضل وقت للزيارة */}
      <section className="py-20 bg-[#f5f3f0] dark:bg-slate-900/70">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" dir={isAr ? 'rtl' : 'ltr'}>
            <p className="text-amber-500 dark:text-amber-400 text-sm font-medium mb-2">
              {txt('bestTimeTag')}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {txt('bestTimeTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div
              className={`bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 ${
                isAr ? 'text-right' : 'text-left'
              }`}
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Moon size={24} strokeWidth={2} aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {txt('bestTimeJunSep')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                {txt('bestTimeJunSepDesc')}
              </p>
              <ul className="space-y-2">
                {['bestTimeJunSep1', 'bestTimeJunSep2', 'bestTimeJunSep3'].map((k) => (
                  <li
                    key={k}
                    className={`flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm ${
                      isAr ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Check size={18} className="shrink-0 text-emerald-500 mt-0.5" aria-hidden />
                    {txt(k)}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={`bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 ${
                isAr ? 'text-right' : 'text-left'
              }`}
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Sun size={24} strokeWidth={2} aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {txt('bestTimeOctApr')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                {txt('bestTimeOctAprDesc')}
              </p>
              <ul className="space-y-2">
                {['bestTimeOctApr1', 'bestTimeOctApr2', 'bestTimeOctApr3'].map((k) => (
                  <li
                    key={k}
                    className={`flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm ${
                      isAr ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Check size={18} className="shrink-0 text-emerald-500 mt-0.5" aria-hidden />
                    {txt(k)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* عن عمان */}
      <section className="bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 py-20">
        <div
          className="container mx-auto px-4 text-center max-w-3xl"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            {txt('aboutTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            {txt('aboutP1')}
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            {txt('aboutP2')}
          </p>
          <Link
            href="/trips"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition"
          >
            {txt('discoverMore')}
          </Link>
        </div>
      </section>

      {/* وجهاتنا */}
      <section className="py-20 bg-[#faf9f7] dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
            {txt('popularDestinations')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-12 max-w-xl mx-auto">
            {txt('popularDestinationsDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.key}
                href="/trips"
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-xl hover:border-blue-400/50 dark:hover:border-blue-500/50 transition"
              >
                <div className={`flex justify-between items-start mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {txt(d.key)}
                  </h3>
                  <span className={`flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium ${isAr ? 'flex-row-reverse' : ''}`}>
                    <Star size={16} className="fill-current shrink-0" aria-hidden />
                    {d.rating}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{tripCount(d.trips)}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/trips"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              {txt('viewAllDestinations')}
            </Link>
          </div>
        </div>
      </section>

      {/* أنواع البرامج */}
      <section className="bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
            {txt('programTypes')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROGRAMS.map((p) => {
              const IconComponent = p.Icon;
              return (
                <div
                  key={p.key}
                  className="text-center p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-lg transition"
                >
                  <div className="flex justify-center mb-4">
                    <IconComponent className="w-12 h-12 text-blue-600 dark:text-blue-400" aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{txt(p.key)}</h3>
                </div>
              );
            })}
          </div>
          <p className="text-center text-slate-600 dark:text-slate-400 mt-8">
            {txt('followOnInstagram')}
          </p>
        </div>
      </section>

      {/* لماذا تختارنا */}
      <section className="py-20 bg-[#faf9f7] dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
            {txt('whyUsTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-12 max-w-xl mx-auto">
            {txt('whyUsDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map((w) => (
              <div
                key={w.titleKey}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:border-blue-400/30 dark:hover:border-blue-500/30 transition"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {txt(w.titleKey)}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {txt(w.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* آراء العملاء + الحجوزات الأخيرة */}
      <section className="bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
            {txt('testimonialsTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-12">
            {txt('testimonialsDesc')}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                &ldquo;{txt('testimonialQuote')}&rdquo;
              </p>
              <p className="font-bold text-slate-900 dark:text-white">{txt('testimonialAuthor')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{txt('testimonialLocation')}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{txt('testimonialTrip')}</p>
            </div>
            <div dir={isAr ? 'rtl' : 'ltr'}>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">{txt('recentBookings')}</h3>
              <ul className="space-y-4">
                {RECENT_BOOKINGS.map((b) => (
                  <li
                    key={b.userKey}
                    className={`flex justify-between items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 ${isAr ? 'flex-row-reverse' : ''}`}
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{txt(b.userKey)}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{txt(b.textKey)}</p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {txt(b.timeKey)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: '#1d4ed8' }}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{txt('ctaTitle')}</h2>
          <p className="text-white/95 mb-8 max-w-lg mx-auto">{txt('ctaDesc')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/trips"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-medium hover:bg-blue-50 transition"
            >
              {txt('exploreTrips')}
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 border-2 border-white text-white px-8 py-3 rounded-xl font-medium hover:bg-white/20 transition"
            >
              {txt('contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
