"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Sun, Mountain, Waves, Building2 } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";
import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { getImageUrl } from "@/lib/upload";
import { useAppSelector } from "@/store/hooks";
import { getT } from "@/lib/i18n";
import type { Language } from "@/types";

// خلفية الهيرو - صورة ساحلية لعُمان
const HERO_BG = "/images/masq.png";

const EXPERIENCES = [
  {
    key: "expDesert" as const,
    descKey: "expDesertDesc" as const,
    Icon: Sun,
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600",
  },
  {
    key: "expMountain" as const,
    descKey: "expMountainDesc" as const,
    Icon: Mountain,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
  },
  {
    key: "expMarine" as const,
    descKey: "expMarineDesc" as const,
    Icon: Waves,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
  },
  {
    key: "expCultural" as const,
    descKey: "expCulturalDesc" as const,
    Icon: Building2,
    image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=600",
  },
] as const;

type Landmark = {
  id: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  location?: string | null;
  images?: { id: string; imagePath: string }[];
};

function LandmarksPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-[70vh] min-h-[400px] bg-slate-300 dark:bg-slate-700 animate-pulse" />
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-600 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-slate-200 dark:bg-slate-600 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandmarksPage() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const isAr = locale === "ar";

  const { isFavorited, getFavoriteId, refetch } = useFavorites();
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(endpoints.landmarks.list(), { params: { limit: 50 } })
      .then(({ data }) => setLandmarks(data.data?.items ?? []))
      .catch(() => setLandmarks([]))
      .finally(() => setLoading(false));
  }, []);

  const getLabel = (l: Landmark) => (isAr ? (l.nameAr ?? l.name) : l.name);

  if (loading) return <LandmarksPageSkeleton />;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative w-full min-h-[65vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="container mx-auto px-4 relative z-10 text-center"
          dir={isAr ? "rtl" : "ltr"}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-sm">
            {t.landmarksPage.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.landmarksPage.heroSubtitle}
          </p>
          <div
            className={`flex flex-wrap gap-4 justify-center ${
              isAr ? "flex-row-reverse" : ""
            }`}
          >
            <a
              href="#landmarks-grid"
              className="bg-[#26C0D2] hover:bg-[#22a8b8] text-white px-8 py-3.5 rounded-xl font-medium transition shadow-lg"
            >
              {t.landmarksPage.exploreDestinations}
            </a>
            <Link
              href="/cars"
              className="bg-white text-[#26C0D2] border-2 border-white px-8 py-3.5 rounded-xl font-medium hover:bg-white/95 transition"
            >
              {t.landmarksPage.rentCar}
            </Link>
          </div>
        </div>
      </section>

      {/* ماذا تفعل في عمان */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-white dark:bg-slate-900">
        <div
          className={`mb-12 ${isAr ? "text-right" : "text-left"}`}
          dir={isAr ? "rtl" : "ltr"}
        >
          <p className="text-amber-500 dark:text-amber-400 text-sm font-medium mb-2">
            {t.landmarksPage.experiencesTag}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {t.landmarksPage.whatToDoTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {t.landmarksPage.whatToDoSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPERIENCES.map(({ key, descKey, Icon, image }) => (
            <div
              key={key}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg group"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
                style={{ backgroundImage: `url(${image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div
                className={`absolute inset-0 flex flex-col justify-end p-5 ${
                  isAr ? "items-end text-right" : "items-start text-left"
                }`}
                dir={isAr ? "rtl" : "ltr"}
              >
                <div
                  className={`absolute top-4 ${isAr ? "right-4" : "left-4"}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Icon size={22} className="text-white" strokeWidth={2} aria-hidden />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {t.landmarksPage[key]}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {t.landmarksPage[descKey]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 h-px bg-amber-200/50 dark:bg-amber-900/30" aria-hidden />
      </section>

      {/* قائمة المعالم */}
      <div id="landmarks-grid" className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">
          {t.landmarksPage.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {landmarks.map((l) => (
            <Link
              key={l.id}
              href={`/landmarks/${l.id}`}
              className="group relative bg-white dark:bg-slate-800 rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col"
            >
              <div className={`absolute top-2 z-10 ${isAr ? "left-2" : "right-2"}`}>
                <FavoriteButton
                  type="landmark"
                  id={l.id}
                  isFavorite={isFavorited("landmark", l.id)}
                  favoriteId={getFavoriteId("landmark", l.id)}
                  onToggle={refetch}
                  variant="light"
                  size={20}
                />
              </div>
              <div className="aspect-video w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                {l.images?.[0] ? (
                  <img
                    src={getImageUrl(l.images[0].imagePath)}
                    alt={getLabel(l)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    —
                  </div>
                )}
              </div>
              <div className={`p-4 flex flex-col gap-1 ${isAr ? "text-right" : "text-left"}`}>
                <h3 className="font-bold text-lg dark:text-white" dir={isAr ? "rtl" : "ltr"}>
                  {getLabel(l)}
                </h3>
                {l.location && (
                  <p className={`flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm ${isAr ? "flex-row-reverse justify-end" : ""}`}>
                    <MapPin size={16} className="shrink-0 text-[#26C0D2]" aria-hidden />
                    {l.location}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
