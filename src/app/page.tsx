"use client";

import Link from "next/link";
import { Star, MapPin, Trophy, Users } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getT } from "@/lib/i18n";
import { AnimateSection } from "@/components/AnimateSection";
import { HomeBookingCard } from "@/components/HomeBookingCard";
import { HomePopularDestinations } from "@/components/HomePopularDestinations";
import { HomeProgramTypes } from "@/components/HomeProgramTypes";
import { HomeWhyUs } from "@/components/HomeWhyUs";
import { HomeTestimonials } from "@/components/HomeTestimonials";
import type { Language } from "@/types";

export default function HomePage() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const hl = (t as { homeLanding?: Record<string, string> }).homeLanding ?? {};
  const txt = (k: string) => hl[k] ?? k;
  const isAr = locale === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="overflow-x-hidden">
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero.png')" }}
        />
        {/* Blue-green gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(20, 184, 166, 0.65) 0%, rgba(15, 118, 110, 0.75) 50%, rgba(12, 74, 110, 0.8) 100%)",
          }}
        />
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-sm">
            {txt("heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto mb-10 leading-relaxed">
            {txt("heroSubtitle")}
          </p>
          <div
            className={`flex flex-wrap gap-4 justify-center ${isAr ? "flex-row-reverse" : ""}`}
          >
            <Link
              href="/trips"
              className="inline-block px-8 py-4 rounded-xl font-medium bg-teal-500 hover:bg-teal-600 text-white transition shadow-lg"
            >
              {txt("exploreTrips")}
            </Link>
            <Link
              href="/cars"
              className="inline-block px-8 py-4 rounded-xl font-medium bg-white text-teal-600 dark:text-teal-500 border-2 border-teal-500 hover:bg-white/95 transition"
            >
              {txt("rentCar")}
            </Link>
          </div>
        </div>
      </section>

      {/* Booking Card - below hero (no overlap) */}
      <AnimateSection
        animation="scaleUp"
        as="section"
        className="relative z-10 px-4 py-12 md:py-16 bg-slate-50 dark:bg-slate-900/50"
      >
        <HomeBookingCard />
      </AnimateSection>

      {/* Stats strip */}
      <AnimateSection
        animation="fadeUp"
        as="section"
        className="py-12 md:py-16 px-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/80 dark:to-slate-900/90"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-stagger-children">
            {[
              { Icon: Star, value: "4.9", labelKey: "statsRating" as const },
              {
                Icon: MapPin,
                value: "+30",
                labelKey: "statsDestinations" as const,
              },
              { Icon: Trophy, value: "+15", labelKey: "statsAwards" as const },
              {
                Icon: Users,
                value: "+50,000",
                labelKey: "statsTravelers" as const,
              },
            ].map(({ Icon, value, labelKey }) => (
              <div
                key={labelKey}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md text-center"
              >
                <Icon
                  size={32}
                  className="mx-auto mb-3 text-blue-600 dark:text-blue-400"
                  aria-hidden
                />
                <p
                  className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1"
                  dir="ltr"
                >
                  {value}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  {txt(labelKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimateSection>

      {/* Popular Destinations */}
      <HomePopularDestinations />

      {/* About Oman - عن عمان */}
      <AnimateSection
        animation={isAr ? "slideRight" : "slideLeft"}
        as="section"
        className="py-16 md:py-24 px-4 bg-white dark:bg-slate-900"
      >
        <div className="container mx-auto max-w-6xl">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center ${
              isAr ? "md:grid-flow-dense" : ""
            }`}
          >
            <div className={isAr ? "md:col-start-2" : ""}>
              <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3] max-h-[400px] bg-slate-200 dark:bg-slate-700">
                <img
                  src="/images/goharat.png"
                  alt={txt("aboutSectionTitle")}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div
              className={`${isAr ? "md:col-start-1 md:row-start-1 md:text-right" : ""}`}
              dir={isAr ? "rtl" : "ltr"}
            >
              <p className="text-blue-500 dark:text-blue-400 text-sm font-medium mb-3">
                {txt("aboutOmanTag")}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                {txt("aboutSectionTitle")}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {txt("aboutP1")}
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                {txt("aboutP2")}
              </p>
              <Link
                href="/discover-oman"
                className="inline-block px-8 py-4 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
              >
                {txt("discoverMore")}
              </Link>
            </div>
          </div>
        </div>
      </AnimateSection>

      {/* Program Types */}
      <HomeProgramTypes />

      {/* Testimonials - آراء العملاء */}
      <HomeTestimonials />

      {/* Why Choose Us */}
      <HomeWhyUs />

      {/* CTA - آخر قسم */}
      <AnimateSection
        animation="zoomIn"
        as="section"
        className="py-20 md:py-28 px-4 w-full bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-800 dark:from-indigo-600 dark:via-violet-700 dark:to-purple-900"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {txt("ctaTitle")}
          </h2>
          <p className="text-lg md:text-xl text-white/95 mb-10 max-w-2xl mx-auto">
            {txt("ctaDesc")}
          </p>
          <div
            className={`flex flex-wrap gap-4 justify-center ${isAr ? "flex-row-reverse" : ""}`}
          >
            <Link
              href="/trips"
              className="inline-block px-8 py-4 rounded-xl font-medium bg-white text-violet-700 hover:bg-white/95 transition shadow-lg"
            >
              {txt("exploreTrips")}
            </Link>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 rounded-xl font-medium bg-white/10 text-white border-2 border-white hover:bg-white/20 transition"
            >
              {txt("contactUs")}
            </Link>
          </div>
        </div>
      </AnimateSection>
    </div>
  );
}
