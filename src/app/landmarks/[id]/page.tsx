"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ArrowLeft,
  Route,
  X,
} from "lucide-react";

const LandmarkMapView = dynamic(
  () => import("@/components/LandmarkMapView").then((m) => m.LandmarkMapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
          <div className="w-12 h-12 rounded-full border-2 border-slate-400 dark:border-slate-500 border-t-transparent animate-spin" />
          <span className="text-sm">جاري تحميل الخريطة...</span>
        </div>
      </div>
    ),
  },
);
import { api } from "@/lib/api";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";
import { endpoints } from "@/lib/endpoints";
import { getImageUrl } from "@/lib/upload";
import { useAppSelector } from "@/store/hooks";
import { getT } from "@/lib/i18n";
import type { Language } from "@/types";

type LandmarkImage = { id: string; imagePath: string };

type Landmark = {
  id: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  images?: LandmarkImage[];
};

function LandmarkDetailSkeleton() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="aspect-[4/3] max-h-[70vh] bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="container mx-auto px-4 py-8">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="h-9 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          <div className="space-y-4">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-[80%] bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div>
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
            <div className="h-[320px] rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          <div className="shrink-0 w-48 h-36 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="shrink-0 w-48 h-36 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="shrink-0 w-48 h-36 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function LandmarkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const isAr = locale === "ar";
  const ld =
    (t as { landmarkDetailPage?: Record<string, string> }).landmarkDetailPage ??
    {};

  const { isFavorited, getFavoriteId, refetch } = useFavorites();
  const [landmark, setLandmark] = useState<Landmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  const scrollGallery = (dir: "prev" | "next") => {
    const el = galleryScrollRef.current;
    if (!el) return;
    const step = 224; // w-48 (192) + gap-4 (16) + buffer, or use el.offsetWidth for dynamic
    const amount = dir === "next" ? step : -step;
    el.scrollBy({ left: isAr ? -amount : amount, behavior: "smooth" });
  };

  useEffect(() => {
    setLoading(true);
    api
      .get(endpoints.landmarks.byId(id))
      .then((r) => setLandmark(r.data.data ?? r.data))
      .catch(() => setLandmark(null))
      .finally(() => setLoading(false));
  }, [id]);

  const images = landmark?.images ?? [];
  const heroImage = images[0];
  const galleryImages = images;

  const openLightbox = (idx: number) => {
    setGalleryIndex(idx);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const goPrev = () =>
    setGalleryIndex((i) => (i <= 0 ? galleryImages.length - 1 : i - 1));
  const goNext = () =>
    setGalleryIndex((i) => (i >= galleryImages.length - 1 ? 0 : i + 1));

  const getLabel = () =>
    landmark ? (isAr ? (landmark.nameAr ?? landmark.name) : landmark.name) : "";
  const getDesc = () =>
    landmark
      ? isAr
        ? (landmark.descriptionAr ?? landmark.description)
        : (landmark.description ?? landmark.descriptionAr)
      : "";

  if (loading) return <LandmarkDetailSkeleton />;
  if (!landmark) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {ld.notFound ?? "Landmark not found"}
        </p>
        <Link
          href="/landmarks"
          className="text-[#26C0D2] dark:text-cyan-400 hover:underline inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} className={isAr ? "rotate-180" : ""} />
          {ld.backToLandmarks ?? "Back to Landmarks"}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24 overflow-x-hidden"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Hero - الصورة الأولى فقط */}
      <section className="relative w-full aspect-[4/3] max-h-[70vh] overflow-hidden bg-slate-900">
        <div
          className={`absolute top-4 z-10 ${isAr ? "left-4" : "right-4"}`}
        >
          <FavoriteButton
            type="landmark"
            id={id}
            isFavorite={isFavorited("landmark", id)}
            favoriteId={getFavoriteId("landmark", id)}
            onToggle={refetch}
            variant="overlay"
            size={28}
          />
        </div>
        {heroImage ? (
          <img
            src={getImageUrl(heroImage.imagePath)}
            alt={getLabel()}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <MapPin size={64} strokeWidth={1} />
          </div>
        )}
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        <nav className="mb-6">
          <Link
            href="/landmarks"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#26C0D2] dark:hover:text-cyan-400 transition-colors text-sm"
          >
            <ArrowLeft size={18} className={isAr ? "rotate-180" : ""} />
            {ld.backToLandmarks ?? "Back to Landmarks"}
          </Link>
        </nav>

        <h1
          className={`text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 ${isAr ? "text-right" : "text-left"}`}
        >
          {getLabel()}
        </h1>

        {landmark.location && (
          <p
            className={`flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-6 ${
              isAr ? "flex-row-reverse justify-end" : ""
            }`}
          >
            <MapPin size={20} className="shrink-0 text-[#26C0D2]" />
            {landmark.location}
          </p>
        )}

        {/* الوصف + خريطة موقع المعلم - جنباً لجنب على الديسكتوب */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* الوصف */}
          {(() => {
            const desc = getDesc();
            if (!desc) return null;
            return (
              <div
                className={`prose prose-slate prose-lg dark:prose-invert max-w-none min-w-0
                prose-headings:font-bold prose-p:mb-4 prose-p:leading-relaxed
                prose-ul:my-4 prose-ol:my-4 prose-li:my-1
                [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:list-outside [&_ol]:list-outside
                ${isAr ? "[&_ul]:pr-6 [&_ol]:pr-6" : "[&_ul]:pl-6 [&_ol]:pl-6"}
                prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600
                prose-a:text-[#26C0D2] dark:prose-a:!text-cyan-400
                prose-a:no-underline hover:prose-a:underline
                dark:[&_p]:!text-slate-300 dark:[&_li]:!text-slate-300
                dark:[&_span]:!text-slate-300 dark:[&_blockquote]:!text-slate-300
                dark:[&_h1]:!text-white dark:[&_h2]:!text-white dark:[&_h3]:!text-white
                [&_.ql-align-center]:text-center
                [&_.ql-align-right]:text-right
                [&_.ql-align-left]:text-left
                [&_*]:leading-loose
                ${isAr ? "text-right prose-ul:pr-6 prose-ol:pr-6 lg:order-1" : "text-left prose-ul:pl-6 prose-ol:pl-6 lg:order-1"}
              `}
              >
                {desc.includes("<") ? (
                  <div
                    className="prose-quill-content min-w-0 w-full max-w-full [&_*]:whitespace-normal [&_*]:break-normal"
                    style={{ overflowWrap: "normal", wordBreak: "normal" }}
                    dangerouslySetInnerHTML={{ __html: desc.replace(/&nbsp;/g, " ") }}
                  />
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">{desc}</p>
                )}
              </div>
            );
          })()}

          {/* خريطة موقع المعلم */}
          {landmark.latitude != null && landmark.longitude != null && (
            <div className={`min-w-0 ${!getDesc() ? "lg:col-span-2" : ""} lg:order-2`}>
              <h2
                className={`text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 ${
                  isAr ? "text-right" : "text-left"
                }`}
              >
                {ld.mapTitle ?? "موقع المعلم"}
              </h2>
              <LandmarkMapView
                latitude={landmark.latitude}
                longitude={landmark.longitude}
                height="320px"
              />
            </div>
          )}
        </div>

        {/* معرض الصور - السلايدر */}
        {galleryImages.length > 0 && (
          <section className="mt-12 relative">
            <h2
              className={`text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 ${
                isAr ? "text-right" : "text-left"
              }`}
            >
              {ld.galleryTitle ?? "Enjoy snapshots from this landmark"}
            </h2>
            <div className="relative -mx-4 px-12 md:px-14">
              <div
                ref={galleryScrollRef}
                className="overflow-x-auto overflow-y-hidden pb-4 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                <div
                  className={`flex gap-4 min-w-max ${isAr ? "flex-row-reverse justify-end" : ""}`}
                >
                  {galleryImages.map((img, idx) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => openLightbox(idx)}
                      className="shrink-0 w-48 md:w-64 aspect-[4/3] rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-[#26C0D2] dark:hover:border-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#26C0D2] snap-center snap-always"
                    >
                      <img
                        src={getImageUrl(img.imagePath)}
                        alt={`${getLabel()} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => scrollGallery("prev")}
                className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-[#26C0D2] hover:text-white hover:border-[#26C0D2] transition-colors ${isAr ? "right-0" : "left-0"}`}
                aria-label={ld.prev ?? "Previous"}
              >
                {isAr ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
              </button>
              <button
                type="button"
                onClick={() => scrollGallery("next")}
                className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-[#26C0D2] hover:text-white hover:border-[#26C0D2] transition-colors ${isAr ? "left-0" : "right-0"}`}
                aria-label={ld.next ?? "Next"}
              >
                {isAr ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Lightbox - عرض كامل الشاشة مع التنقل */}
      {lightboxOpen && galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="معرض الصور"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className={`absolute top-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ${isAr ? "left-4" : "right-4"}`}
            aria-label={ld.close ?? "Close"}
          >
            <X size={28} />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className={`absolute top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ${
                  isAr ? "right-4" : "left-4"
                }`}
                aria-label={ld.prev ?? "Previous"}
              >
                {isAr ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
              </button>
              <button
                type="button"
                onClick={goNext}
                className={`absolute top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ${
                  isAr ? "left-4" : "right-4"
                }`}
                aria-label={ld.next ?? "Next"}
              >
                {isAr ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
              </button>
            </>
          )}

          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <img
              src={getImageUrl(galleryImages[galleryIndex].imagePath)}
              alt={`${getLabel()} - ${galleryIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm z-10">
            {galleryIndex + 1} / {galleryImages.length}
          </p>
        </div>
      )}

      {/* Floating CTA - تصفح الرحلات */}
      <Link
        href={`/trips?landmarkId=${id}`}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-[#26C0D2] hover:bg-[#22a8b8] text-white px-8 py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
      >
        <Route size={22} aria-hidden />
        {ld.browseTrips ?? "Browse Trips"}
      </Link>
    </div>
  );
}
