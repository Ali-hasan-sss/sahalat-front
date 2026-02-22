"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { getT } from "@/lib/i18n";
import {
  Rocket,
  Map,
  Bus,
  Monitor,
  Globe,
  Trophy,
  Heart,
  Shield,
  Sparkles,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { Language } from "@/types";

const HERO_BG = "/images/ston.png";

const TIMELINE = [
  {
    year: "2015",
    titleKey: "timeline2015Title",
    descKey: "timeline2015Desc",
    Icon: Rocket,
  },
  {
    year: "2017",
    titleKey: "timeline2017Title",
    descKey: "timeline2017Desc",
    Icon: Map,
  },
  {
    year: "2018",
    titleKey: "timeline2018Title",
    descKey: "timeline2018Desc",
    Icon: Bus,
  },
  {
    year: "2020",
    titleKey: "timeline2020Title",
    descKey: "timeline2020Desc",
    Icon: Monitor,
  },
  {
    year: "2022",
    titleKey: "timeline2022Title",
    descKey: "timeline2022Desc",
    Icon: Globe,
  },
  {
    year: "2024",
    titleKey: "timeline2024Title",
    descKey: "timeline2024Desc",
    Icon: Trophy,
  },
] as const;

const VALUES = [
  {
    titleKey: "value1Title" as const,
    descKey: "value1Desc" as const,
    Icon: Heart,
  },
  {
    titleKey: "value2Title" as const,
    descKey: "value2Desc" as const,
    Icon: Shield,
  },
  {
    titleKey: "value3Title" as const,
    descKey: "value3Desc" as const,
    Icon: Globe,
  },
  {
    titleKey: "value4Title" as const,
    descKey: "value4Desc" as const,
    Icon: Sparkles,
  },
] as const;

const INQUIRY_OPTIONS = [
  { value: "general", labelKey: "inquiryGeneral" as const },
  { value: "trip", labelKey: "inquiryTripBooking" as const },
  { value: "car", labelKey: "inquiryCarRental" as const },
  { value: "feedback", labelKey: "inquiryFeedback" as const },
] as const;

export default function ContactPage() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const isAr = locale === "ar";
  const cp = (t as { contactPage?: Record<string, string> }).contactPage ?? {};
  const [inquiryType, setInquiryType] = useState<string>("general");

  return (
    <div
      className="min-h-screen bg-[#faf9f7] dark:bg-slate-900"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Hero - بنفس تصميم صفحة قصتنا */}
      <section className="relative w-full min-h-[65vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* خلفية الصورة */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        {/* طبقة تعتيم سوداء */}
        <div className="absolute inset-0 bg-black/50" />
        {/* المحتوى - محاذاة حسب اللغة */}
        <div
          className={`container mx-auto px-4 relative z-10 ${
            isAr ? "text-right" : "text-left"
          }`}
          dir={isAr ? "rtl" : "ltr"}
        >
          <p className="text-amber-400 text-sm md:text-base font-medium mb-2">
            {cp.heroTag ?? (isAr ? "سهالات" : "Sahalat")}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-sm">
            {cp.heroTitle ?? (isAr ? "اتصل بنا" : "Contact Us")}
          </h1>
          <p className="text-lg md:text-xl text-white/95 max-w-2xl leading-relaxed">
            {cp.heroDesc ??
              (isAr
                ? "نحن هنا لمساعدتك في تخطيط رحلتك المثالية إلى عُمان."
                : "We are here to help you plan your perfect trip to Oman.")}
          </p>
        </div>
      </section>

      {/* قسم رحلتنا - صورة ونص */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
            isAr ? "lg:grid-flow-dense" : ""
          }`}
        >
          <div className={isAr ? "lg:col-start-2" : ""}>
            <img
              src="/images/omanian.png"
              alt={isAr ? "فريق سهالات" : "Sahalat team"}
              className="w-full rounded-2xl shadow-lg object-cover aspect-[4/3] bg-slate-200 dark:bg-slate-700"
            />
          </div>
          <div
            className={`${isAr ? "lg:col-start-1 lg:row-start-1" : ""} ${
              isAr ? "text-right" : "text-left"
            }`}
            dir={isAr ? "rtl" : "ltr"}
          >
            <p className="text-amber-500 dark:text-amber-400 text-sm font-medium mb-2">
              {cp.journeyTag ?? (isAr ? "رحلتنا" : "Our Journey")}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6">
              {cp.journeyTitle ??
                (isAr
                  ? "حيث يلتقي التراث بالتميز"
                  : "Where Heritage Meets Excellence")}
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>{cp.journeyP1}</p>
              <p>{cp.journeyP2}</p>
              <p>{cp.journeyP3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* خط زمني النمو */}
      <section className="container mx-auto px-4 py-12 ">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800/50 rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-700">
          <div
            className={`mb-12 ${isAr ? "text-right" : "text-left"}`}
            dir={isAr ? "rtl" : "ltr"}
          >
            <p className="text-amber-500 dark:text-amber-400 text-sm font-medium mb-2">
              {cp.timelineTag ?? (isAr ? "رحلتنا" : "Our Journey")}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {cp.timelineTitle ??
                (isAr
                  ? "ننمو معاً منذ عام 2015"
                  : "We Grow Together Since 2015")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {cp.timelineIntro ??
                (isAr
                  ? "من عملية محلية صغيرة إلى منصة السياحة الرائدة في عمان."
                  : "From a small local operation to a leading tourism platform in Oman.")}
            </p>
          </div>
          <div className="space-y-8">
            {TIMELINE.map(({ year, titleKey, descKey, Icon }) => (
              <div
                key={year}
                className="flex gap-6 items-start"
                dir={isAr ? "rtl" : "ltr"}
              >
                <div className="shrink-0 w-14 h-14 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white">
                  <Icon size={24} strokeWidth={2} aria-hidden />
                </div>
                <div
                  className={`flex-1 min-w-0 ${isAr ? "text-right" : "text-left"}`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {year}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      —
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cp[titleKey]}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                    {cp[descKey]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* قيمنا الأساسية */}
      <section className="container mx-auto px-4 py-12 ">
        <div className="text-center mb-12" dir={isAr ? "rtl" : "ltr"}>
          <p className="text-amber-500 dark:text-amber-400 text-sm font-medium mb-2">
            {cp.valuesTag ?? (isAr ? "قيمنا الأساسية" : "Our Core Values")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {cp.valuesTitle ??
              (isAr ? "ما الذي يدفعنا للأمام" : "What Drives Us Forward")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {cp.valuesIntro ??
              (isAr
                ? "هذه المبادئ توجه كل قرار نتخذه وكل تجربة نخلقها لمسافرينا."
                : "These principles guide every decision we make and every experience we create for our travelers.")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ titleKey, descKey, Icon }) => (
            <div
              key={titleKey}
              className={`bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 ${
                isAr ? "text-right" : "text-left"
              }`}
              dir={isAr ? "rtl" : "ltr"}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Icon size={24} strokeWidth={2} aria-hidden />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                {cp[titleKey]}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {cp[descKey]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* تواصل معنا - نموذج ومعلومات */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start ${
            isAr ? "lg:grid-flow-dense" : ""
          }`}
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* نموذج إرسال رسالة */}
          <div
            className={`lg:col-span-7 ${isAr ? "lg:col-start-6" : ""}`}
            dir={isAr ? "rtl" : "ltr"}
          >
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 md:p-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {cp.formTitle ??
                  (isAr ? "أرسل لنا رسالة" : "Send us a message")}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                {cp.formSubtitle ??
                  (isAr
                    ? "نحن هنا لمساعدتك في التخطيط لرحلتك المثالية"
                    : "We are here to help you plan your ideal trip")}
              </p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {cp.fullName ?? (isAr ? "الاسم الكامل" : "Full Name")}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        cp.fullNamePlaceholder ??
                        (isAr ? "أدخل اسمك الكامل" : "Enter your full name")
                      }
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {cp.email ?? (isAr ? "البريد الإلكتروني" : "Email")}
                    </label>
                    <input
                      type="email"
                      placeholder={cp.emailPlaceholder ?? "example@email.com"}
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {cp.phone ?? (isAr ? "رقم الهاتف" : "Phone Number")}
                  </label>
                  <input
                    type="tel"
                    placeholder={cp.phonePlaceholder ?? "+968 xxxx xxxx"}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {cp.subject ?? (isAr ? "الموضوع" : "Subject")}
                  </label>
                  <div className="relative">
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className={`w-full appearance-none border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isAr ? "pl-9 pr-3" : "pr-9 pl-3"
                      }`}
                    >
                      {INQUIRY_OPTIONS.map(({ value, labelKey }) => (
                        <option key={value} value={value}>
                          {cp[labelKey]}
                        </option>
                      ))}
                    </select>
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 ${
                        isAr ? "left-2.5" : "right-2.5"
                      }`}
                    >
                      <ChevronDown size={18} strokeWidth={2} aria-hidden />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {cp.message ?? (isAr ? "الرسالة" : "Message")}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      cp.messagePlaceholder ??
                      (isAr
                        ? "اكتب رسالتك هنا....."
                        : "Write your message here.....")
                    }
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className={`inline-flex items-center justify-center gap-2 bg-[#26C0D2] hover:bg-[#22a8b8] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-lg w-full sm:w-auto ${
                    isAr ? "flex-row-reverse" : ""
                  }`}
                >
                  {cp.sendMessage ?? (isAr ? "إرسال الرسالة" : "Send Message")}
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className={isAr ? "rotate-180" : ""}
                    aria-hidden
                  />
                </button>
              </form>
            </div>
          </div>

          {/* بطاقات معلومات التواصل */}
          <div
            className={`lg:col-span-5 space-y-5 ${isAr ? "lg:col-start-1 lg:row-start-1" : ""}`}
          >
            <a
              href="tel:+96897018484"
              className="flex gap-4 p-5 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Phone size={24} strokeWidth={2} aria-hidden />
              </div>
              <div
                className={`min-w-0 ${isAr ? "text-right" : "text-left"}`}
                dir={isAr ? "rtl" : "ltr"}
              >
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  {cp.callUs ?? (isAr ? "اتصل بنا" : "Call Us")}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
                  {cp.callUsDesc ??
                    (isAr
                      ? "متاحون للرد على استفساراتك"
                      : "Available to answer your inquiries")}
                </p>
                <span className="text-[#26C0D2] font-medium">
                  +968 9701 8484
                </span>
              </div>
            </a>
            <a
              href="mailto:info@sahalat.com"
              className="flex gap-4 p-5 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Mail size={24} strokeWidth={2} aria-hidden />
              </div>
              <div
                className={`min-w-0 ${isAr ? "text-right" : "text-left"}`}
                dir={isAr ? "rtl" : "ltr"}
              >
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  {cp.emailUs ?? (isAr ? "راسلنا عبر البريد" : "Email Us")}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
                  {cp.emailUsDesc ??
                    (isAr
                      ? "نرد على رسائلك خلال 24 ساعة"
                      : "We respond to your messages within 24 hours")}
                </p>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  info@sahalat.com
                </span>
              </div>
            </a>
            <div className="flex gap-4 p-5 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <MapPin size={24} strokeWidth={2} aria-hidden />
              </div>
              <div
                className={`min-w-0 ${isAr ? "text-right" : "text-left"}`}
                dir={isAr ? "rtl" : "ltr"}
              >
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  {cp.ourLocation ?? (isAr ? "موقعنا" : "Our Location")}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {cp.locationLine1 ??
                    (isAr
                      ? "زورنا في مكتبنا الرئيسي"
                      : "Visit us at our main office")}
                  <br />
                  {cp.locationLine2 ??
                    (isAr
                      ? "شارع السلطان قابوس الخوير"
                      : "Sultan Qaboos Street, Al Khuwair")}
                  <br />
                  {cp.locationLine3 ??
                    (isAr ? "مسقط سلطنة عمان" : "Muscat, Sultanate of Oman")}
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-5 bg-blue-600 dark:bg-blue-700 rounded-2xl text-white">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock size={24} strokeWidth={2} aria-hidden />
              </div>
              <div
                className={`min-w-0 ${isAr ? "text-right" : "text-left"}`}
                dir={isAr ? "rtl" : "ltr"}
              >
                <h3 className="font-bold mb-2">
                  {cp.workingHours ?? (isAr ? "ساعات العمل" : "Working Hours")}
                </h3>
                <p className="text-white/95 text-sm leading-relaxed">
                  {cp.hoursSatThu ??
                    (isAr
                      ? "السبت - الخميس 8:00 ص - 8:00 م"
                      : "Saturday - Thursday 8:00 AM - 8:00 PM")}
                  <br />
                  {cp.hoursFri ??
                    (isAr
                      ? "الجمعة 2:00 م - 8:00 م"
                      : "Friday 2:00 PM - 8:00 PM")}
                </p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
                {cp.followUs ??
                  (isAr
                    ? "تابعنا على وسائل التواصل"
                    : "Follow us on social media")}
              </p>
              <div
                className={`flex gap-3 ${isAr ? "flex-row-reverse justify-end" : ""}`}
              >
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
