"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Mountain,
  Sun,
  Waves,
  Moon,
  Check,
  Landmark,
  TreePalm,
  Heart,
  Sparkles,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getT } from "@/lib/i18n";
import type { Language } from "@/types";

const HERO_FEATURES = [
  { key: "heroFeature1" as const, Icon: Mountain },
  { key: "heroFeature2" as const, Icon: Sun },
  { key: "heroFeature3" as const, Icon: Waves },
];

const REGION_KEYS = ["muscat", "wahiba", "jebelAkhdar", "musandam"] as const;

function useInView(once = true) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);
  return { ref, inView };
}
const REGION_IMAGES: Record<(typeof REGION_KEYS)[number], string> = {
  muscat: "/images/maskat.png",
  wahiba: "/images/sahraawaheba.png",
  jebelAkhdar: "/images/jabalgreen.png",
  musandam: "/images/sahel.png",
};

export default function DiscoverOmanPage() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const hp = (t as { homePage?: Record<string, unknown> }).homePage ?? {};
  const txt = (k: string) =>
    typeof hp[k] === "function"
      ? (hp[k] as (n: number) => string)(0)
      : ((hp[k] ?? k) as string);
  const [activeRegion, setActiveRegion] =
    useState<(typeof REGION_KEYS)[number]>("muscat");

  const handleRegionChange = (key: (typeof REGION_KEYS)[number]) => {
    if (key === activeRegion) return;
    setActiveRegion(key);
  };

  const isAr = locale === "ar";
  const aboutRef = useInView();
  const regionsRef = useInView();
  const heritageRef = useInView();
  const experiencesRef = useInView();
  const bestTimeRef = useInView();
  const ctaRef = useInView();

  return (
    <div
      className="min-h-screen flex flex-col bg-[#faf9f7] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
      dir={isAr ? "rtl" : "ltr"}
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
          dir={isAr ? "rtl" : "ltr"}
        >
          <Globe
            size={40}
            strokeWidth={2}
            className="text-white/95 mx-auto mb-4 opacity-0 animate-hero-entrance"
            style={{ animationDelay: "0.1s" }}
            aria-hidden
          />
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-sm opacity-0 animate-hero-entrance"
            style={{ animationDelay: "0.2s" }}
          >
            {txt("heroTitle")}
          </h1>
          <p
            className="text-base md:text-lg text-white/95 max-w-2xl mx-auto mb-8 leading-relaxed opacity-0 animate-hero-entrance"
            style={{ animationDelay: "0.35s" }}
          >
            {txt("heroSubtitle")}
          </p>
          <div
            className={`flex flex-wrap gap-6 justify-center items-center ${isAr ? "flex-row-reverse" : ""} opacity-0 animate-hero-entrance`}
            style={{ animationDelay: "0.5s" }}
          >
            {HERO_FEATURES.map(({ key, Icon }) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 text-white/95 text-sm md:text-base font-medium"
              >
                <Icon
                  size={20}
                  strokeWidth={2}
                  className="shrink-0"
                  aria-hidden
                />
                {txt(key)}
              </span>
            ))}
          </div>
          <div
            className="mt-8 h-px w-24 mx-auto bg-white/30 opacity-0 animate-hero-entrance"
            style={{ animationDelay: "0.65s" }}
            aria-hidden
          />
        </div>
      </section>

      {/* شريط إحصائيات عمان */}
      <section className="bg-white dark:bg-slate-900 py-6 md:py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            <div
              className="flex flex-col items-center justify-center text-center min-h-[72px] sm:min-h-0 py-2 opacity-0 animate-hero-entrance"
              style={{ animationDelay: "0.15s" }}
            >
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-500 dark:text-amber-400">
                4
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                {txt("statsStripSites")}
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-[10px] sm:text-xs">
                {txt("statsStripUnesco")}
              </p>
            </div>
            <div
              className="flex flex-col items-center justify-center text-center min-h-[72px] sm:min-h-0 py-2 opacity-0 animate-hero-entrance"
              style={{ animationDelay: "0.25s" }}
            >
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-600 dark:text-teal-400">
                <span dir="ltr">3,000</span> {txt("statsStripCoastlineKm")}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                {txt("statsStripCoastline")}
              </p>
            </div>
            <div
              className="flex flex-col items-center justify-center text-center min-h-[72px] sm:min-h-0 py-2 opacity-0 animate-hero-entrance"
              style={{ animationDelay: "0.35s" }}
            >
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-500 dark:text-amber-400">
                <span dir="ltr">+5M</span> {txt("statsStripPopulationUnit")}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                {txt("statsStripPopulation")}
              </p>
            </div>
            <div
              className="flex flex-col items-center justify-center text-center min-h-[72px] sm:min-h-0 py-2 opacity-0 animate-hero-entrance"
              style={{ animationDelay: "0.45s" }}
            >
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-600 dark:text-teal-400">
                <span dir="ltr">309,500</span> {txt("statsStripAreaKm")}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                {txt("statsStripTotalArea")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* عن سلطنة عمان */}
      <section
        ref={aboutRef.ref}
        className={`bg-[#f8fcfd] dark:bg-slate-800/90 py-16 md:py-20 ${aboutRef.inView ? "animate-section-entrance in-view" : "animate-section-entrance"}`}
      >
        <div
          className="container mx-auto px-4 text-center max-w-3xl"
          dir={isAr ? "rtl" : "ltr"}
        >
          <p className="text-teal-600 dark:text-teal-400 text-sm font-medium mb-2">
            {txt("aboutOmanTag")}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {txt("aboutOmanTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            {txt("aboutOmanP1")}
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {txt("aboutOmanP2")}
          </p>
        </div>
      </section>

      {/* المناطق الرئيسية - استكشف مناطق عمان */}
      <section
        ref={regionsRef.ref}
        className={`py-20 bg-white dark:bg-slate-900 ${regionsRef.inView ? "animate-section-entrance in-view" : "animate-section-entrance"}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" dir={isAr ? "rtl" : "ltr"}>
            <p
              className="font-semibold tracking-wider mb-4 uppercase text-amber-500 dark:text-amber-400 opacity-0 animate-hero-entrance"
              style={{ animationDelay: "0.1s" }}
            >
              {txt("regionsTag")}
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 opacity-0 animate-hero-entrance"
              style={{ animationDelay: "0.2s" }}
            >
              {txt("regionsTitle")}
            </h2>
            <p
              className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto opacity-0 animate-hero-entrance"
              style={{ animationDelay: "0.3s" }}
            >
              {txt("regionsSubtitle")}
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="relative h-[400px] md:h-[420px] rounded-3xl overflow-hidden mb-8">
              {REGION_KEYS.map((key) => {
                const region = (
                  hp.regions as Record<
                    string,
                    { subtitle: string; desc: string; tags: string[] }
                  >
                )?.[key];
                const isActive = activeRegion === key;
                return (
                  <div
                    key={key}
                    className="absolute inset-0 transition-opacity duration-300 ease-in-out"
                    style={{
                      opacity: isActive ? 1 : 0,
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    <div
                      className="w-full h-full bg-slate-700 bg-cover bg-center"
                      style={{ backgroundImage: `url(${REGION_IMAGES[key]})` }}
                      role="img"
                      aria-label={txt(key)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div
                      className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 ${isAr ? "text-right" : "text-left"}`}
                    >
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {txt(key)}
                      </h3>
                      {region?.subtitle && (
                        <p className="text-lg md:text-xl text-white/90 mb-4">
                          {region.subtitle}
                        </p>
                      )}
                      {region?.desc && (
                        <p className="text-white/80 mb-6 max-w-2xl">
                          {region.desc}
                        </p>
                      )}
                      {region?.tags && region.tags.length > 0 && (
                        <div
                          className={`flex flex-wrap gap-3 ${isAr ? "flex-row-reverse" : ""}`}
                        >
                          {region.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {REGION_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRegionChange(key)}
                  className={`p-4 rounded-xl font-bold transition-all ${
                    activeRegion === key
                      ? "bg-teal-500 dark:bg-teal-600 text-white shadow-lg"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {txt(key)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* التراث والثقافة */}
      <section
        ref={heritageRef.ref}
        className={`py-20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800/50 dark:to-cyan-900/20 ${heritageRef.inView ? "animate-section-entrance in-view" : "animate-section-entrance"}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" dir={isAr ? "rtl" : "ltr"}>
            <p className="font-semibold tracking-wider mb-4 uppercase text-[#004E64] dark:text-teal-400">
              {txt("heritageTag")}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {txt("heritageTitle")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              {txt("heritageSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                key: "forts" as const,
                Icon: Landmark,
                color: "rgb(30, 202, 211)",
                bgColor: "rgba(30, 202, 211, 0.1)",
              },
              {
                key: "aflaj" as const,
                Icon: TreePalm,
                color: "rgb(255, 138, 0)",
                bgColor: "rgba(255, 138, 0, 0.1)",
              },
              {
                key: "hospitality" as const,
                Icon: Heart,
                color: "rgb(0, 78, 100)",
                bgColor: "rgba(0, 78, 100, 0.1)",
              },
              {
                key: "handicrafts" as const,
                Icon: Sparkles,
                color: "rgb(30, 202, 211)",
                bgColor: "rgba(30, 202, 211, 0.1)",
              },
            ].map(({ key, Icon, color, bgColor }) => {
              const h = (
                hp.heritage as Record<string, { title: string; desc: string }>
              )?.[key];
              return (
                <div
                  key={key}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: bgColor }}
                  >
                    <Icon className="w-8 h-8" style={{ color }} aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {h?.title ?? key}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {h?.desc ?? ""}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* التجارب المميزة - ماذا تفعل في عمان */}
      <section
        ref={experiencesRef.ref}
        className={`py-20 bg-white dark:bg-slate-900 ${experiencesRef.inView ? "animate-section-entrance in-view" : "animate-section-entrance"}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" dir={isAr ? "rtl" : "ltr"}>
            <p
              className="font-semibold tracking-wider mb-4 uppercase"
              style={{ color: "rgb(255, 138, 0)" }}
            >
              {txt("experiencesTag")}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {txt("experiencesTitle")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              {txt("experiencesSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                key: "desert" as const,
                Icon: Sun,
                image: "/images/sahraawaheba.png",
              },
              {
                key: "mountain" as const,
                Icon: Mountain,
                image: "/images/jabalgreen.png",
              },
              { key: "sea" as const, Icon: Waves, image: "/images/sahel.png" },
              {
                key: "cultural" as const,
                Icon: Landmark,
                image: "/images/sakafa.png",
              },
            ].map(({ key, Icon, image }) => {
              const exp = (
                hp.experiences as Record<
                  string,
                  { title: string; desc: string }
                >
              )?.[key];
              return (
                <div key={key} className="group cursor-pointer">
                  <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                    <img
                      src={image}
                      alt={exp?.title ?? key}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" aria-hidden />
                    </div>
                    <div
                      className={`absolute bottom-0 left-0 right-0 p-6 ${isAr ? "text-right" : "text-left"}`}
                    >
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {exp?.title ?? key}
                      </h3>
                      <p className="text-white/80 text-sm">{exp?.desc ?? ""}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* أفضل وقت للزيارة */}
      <section
        ref={bestTimeRef.ref}
        className={`py-20 bg-[#f5f3f0] dark:bg-slate-900/70 ${bestTimeRef.inView ? "animate-section-entrance in-view" : "animate-section-entrance"}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" dir={isAr ? "rtl" : "ltr"}>
            <p className="text-amber-500 dark:text-amber-400 text-sm font-medium mb-2">
              {txt("bestTimeTag")}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {txt("bestTimeTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div
              className={`bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 ${
                isAr ? "text-right" : "text-left"
              }`}
              dir={isAr ? "rtl" : "ltr"}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Moon size={24} strokeWidth={2} aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {txt("bestTimeJunSep")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                {txt("bestTimeJunSepDesc")}
              </p>
              <ul className="space-y-2">
                {["bestTimeJunSep1", "bestTimeJunSep2", "bestTimeJunSep3"].map(
                  (k) => (
                    <li
                      key={k}
                      className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm"
                      dir={isAr ? "rtl" : "ltr"}
                    >
                      <Check
                        size={18}
                        className="shrink-0 text-emerald-500 mt-0.5"
                        aria-hidden
                      />
                      {txt(k)}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div
              className={`bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 ${
                isAr ? "text-right" : "text-left"
              }`}
              dir={isAr ? "rtl" : "ltr"}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Sun size={24} strokeWidth={2} aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {txt("bestTimeOctApr")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                {txt("bestTimeOctAprDesc")}
              </p>
              <ul className="space-y-2">
                {["bestTimeOctApr1", "bestTimeOctApr2", "bestTimeOctApr3"].map(
                  (k) => (
                    <li
                      key={k}
                      className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm"
                      dir={isAr ? "rtl" : "ltr"}
                    >
                      <Check
                        size={18}
                        className="shrink-0 text-emerald-500 mt-0.5"
                        aria-hidden
                      />
                      {txt(k)}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        ref={ctaRef.ref}
        className={`py-20 text-center ${ctaRef.inView ? "animate-section-entrance in-view" : "animate-section-entrance"}`}
        style={{
          background:
            "linear-gradient(90deg, rgb(20, 184, 166) 0%, rgb(15, 118, 110) 50%, rgb(12, 74, 110) 100%)",
        }}
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {txt("ctaTitle")}
          </h2>
          <p className="text-white/90 mb-8 max-w-lg mx-auto">
            {txt("ctaDesc")}
          </p>
          <div
            className={`flex flex-wrap gap-4 justify-center ${isAr ? "flex-row-reverse" : ""}`}
          >
            <Link
              href="/cars"
              className="bg-[rgb(255,138,0)] hover:bg-[rgb(230,124,0)] text-white px-8 py-3 rounded-xl font-medium transition"
            >
              {txt("bookCarNow")}
            </Link>
            <Link
              href="/trips"
              className="bg-white text-[rgb(12,74,110)] px-8 py-3 rounded-xl font-medium hover:bg-white/95 transition"
            >
              {txt("exploreTrips")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
