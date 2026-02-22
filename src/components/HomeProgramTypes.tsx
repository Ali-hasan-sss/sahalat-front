'use client';

import Link from 'next/link';
import { Ship, Users, Backpack, ChevronLeft } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { AnimateSection } from '@/components/AnimateSection';
import { getT } from '@/lib/i18n';
import type { Language } from '@/types';

const PROGRAMS = [
  {
    key: 'marineTrip' as const,
    Icon: Ship,
    gradient: 'from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    arcColor: 'text-purple-500',
    href: '/trips?tripType=MARINE',
  },
  {
    key: 'groupTrip' as const,
    Icon: Users,
    gradient: 'from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    arcColor: 'text-purple-500',
    href: '/trips?tripType=GROUP',
  },
  {
    key: 'individualTrip' as const,
    Icon: Backpack,
    gradient: 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    arcColor: 'text-orange-500',
    href: '/trips?tripType=INDIVIDUAL',
  },
];

export function HomeProgramTypes() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const hl = (t as { homeLanding?: Record<string, string> }).homeLanding ?? {};
  const txt = (k: string) => hl[k] ?? k;
  const isAr = locale === 'ar';

  return (
    <AnimateSection
      animation="slideUpBounce"
      as="section"
      className="py-16 md:py-24 px-4 bg-white dark:bg-slate-900"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
          {txt('programTypes')}
        </h2>
        <div className="space-y-4">
          {PROGRAMS.map(({ key, Icon, gradient, iconColor, arcColor, href }) => (
            <Link
              key={key}
              href={href}
              className={`program-card group flex items-center justify-between gap-4 p-5 rounded-2xl shadow-md hover:shadow-lg bg-gradient-to-r ${gradient}`}
            >
              <span className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-slate-500 dark:text-slate-400 shrink-0">
                  <ChevronLeft
                    size={24}
                    className={isAr ? 'rotate-180' : ''}
                    aria-hidden
                  />
                </span>
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {txt(key)}
                </span>
              </span>
              <span className={`relative w-14 h-14 shrink-0 flex items-center justify-center ${arcColor}`}>
                <span
                  className="program-icon-arc"
                  aria-hidden
                />
                <span
                  className={`relative z-10 w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center ${iconColor} shadow-sm`}
                >
                  <Icon size={24} strokeWidth={2} aria-hidden />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AnimateSection>
  );
}
