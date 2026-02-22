"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { AnimateSection } from "@/components/AnimateSection";
import { getT } from "@/lib/i18n";
import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { getImageUrl } from "@/lib/upload";
import type { Language } from "@/types";

type ApiLandmark = {
  id: string;
  name: string;
  nameAr?: string | null;
  images?: { id: string; imagePath: string }[];
};

const FALLBACK_DESTINATIONS: {
  key: string;
  image: string;
  rating: number;
  trips: number;
}[] = [
  {
    key: "jebelAkhdar",
    image: "/images/jabalgreen.png",
    rating: 4.9,
    trips: 6,
  },
  { key: "wahiba", image: "/images/sahraawaheba.png", rating: 4.8, trips: 8 },
  { key: "muscat", image: "/images/maskat.png", rating: 4.9, trips: 12 },
  { key: "salalah", image: "/images/salalah.png", rating: 4.9, trips: 10 },
  { key: "nizwa", image: "/images/masq.png", rating: 4.8, trips: 7 },
  { key: "musandam", image: "/images/sahel.png", rating: 4.7, trips: 5 },
];

function tripLabel(n: number, isAr: boolean): string {
  if (isAr) return n === 1 ? `${n} رحلة` : `${n} رحلات`;
  return n === 1 ? `${n} trip` : `${n} trips`;
}

export function HomePopularDestinations() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const hl = (t as { homeLanding?: Record<string, string> }).homeLanding ?? {};
  const hp =
    (t as unknown as { homePage?: Record<string, string | ((n: number) => string)> })
      .homePage ?? {};
  const txt = (k: string) => hl[k] ?? k;
  const isAr = locale === "ar";

  const [displayItems, setDisplayItems] = useState<
    {
      id: string;
      name: string;
      nameAr: string | null;
      image: string;
      rating: number;
      trips: number;
      href: string;
    }[]
  >([]);

  useEffect(() => {
    const label = (k: string) =>
      ((hp as Record<string, string>)[k] as string) ?? k;
    api
      .get(endpoints.landmarks.list(), { params: { limit: 6 } })
      .then(({ data }) => {
        const items: ApiLandmark[] = data.data?.items ?? [];
        const fromApi = items.slice(0, 6).map((l) => ({
          id: l.id,
          name: l.name,
          nameAr: l.nameAr ?? null,
          image: getImageUrl(l.images?.[0]?.imagePath) || "/images/maskat.png",
          rating: 4.8,
          trips: 5,
          href: `/landmarks/${l.id}`,
        }));
        const needed = 6 - fromApi.length;
        const fromFallback = FALLBACK_DESTINATIONS.slice(0, needed).map(
          (f, i) => ({
            id: `fallback-${i}`,
            name: label(f.key),
            nameAr: label(f.key),
            image: f.image,
            rating: f.rating,
            trips: f.trips,
            href: "/landmarks",
          }),
        );
        setDisplayItems([...fromApi, ...fromFallback]);
      })
      .catch(() => {
        const label = (k: string) =>
          ((hp as Record<string, string>)[k] as string) ?? k;
        setDisplayItems(
          FALLBACK_DESTINATIONS.map((f, i) => ({
            id: `fallback-${i}`,
            name: label(f.key),
            nameAr: label(f.key),
            image: f.image,
            rating: f.rating,
            trips: f.trips,
            href: "/landmarks",
          })),
        );
      });
  }, [locale]);

  const getLabel = (item: { name: string; nameAr: string | null }) =>
    isAr ? (item.nameAr ?? item.name) : item.name;

  return (
    <AnimateSection
      animation="blurIn"
      as="section"
      className="py-16 md:py-24 px-4 bg-slate-50 dark:bg-slate-900/50"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-blue-500 dark:text-blue-400 text-sm font-medium mb-2">
            {txt("ourDestinations")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {txt("popularDestinations")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {txt("popularDestinationsDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger-children">
          {displayItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group block relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow aspect-[4/3]"
            >
              <img
                src={item.image}
                alt={getLabel(item)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-white text-sm font-medium">
                  {item.rating}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-bold text-white mb-1">
                  {getLabel(item)}
                </h3>
                <p className="text-white/90 text-sm">
                  {tripLabel(item.trips, isAr)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/landmarks"
            className="inline-block px-8 py-4 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            {txt("viewAllDestinations")}
          </Link>
        </div>
      </div>
    </AnimateSection>
  );
}
