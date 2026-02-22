'use client';

import {
  Shield,
  Headphones,
  Award,
  Heart,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { AnimateSection } from '@/components/AnimateSection';
import { getT } from '@/lib/i18n';
import type { Language } from '@/types';

const FEATURES = [
  { titleKey: 'safeTravel' as const, descKey: 'safeTravelDesc' as const, Icon: Shield },
  { titleKey: 'support247' as const, descKey: 'support247Desc' as const, Icon: Headphones },
  { titleKey: 'qualityGuaranteed' as const, descKey: 'qualityGuaranteedDesc' as const, Icon: Award },
  { titleKey: 'authenticExperiences' as const, descKey: 'authenticExperiencesDesc' as const, Icon: Heart },
  { titleKey: 'professionalGuides' as const, descKey: 'professionalGuidesDesc' as const, Icon: UserCheck },
  { titleKey: 'exceptionalValue' as const, descKey: 'exceptionalValueDesc' as const, Icon: Sparkles },
];

export function HomeWhyUs() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const hl = (t as { homeLanding?: Record<string, string> }).homeLanding ?? {};
  const txt = (k: string) => hl[k] ?? k;
  const isAr = locale === 'ar';

  return (
    <AnimateSection
      animation="fadeUp"
      as="section"
      className="py-16 md:py-24 px-4 bg-slate-50 dark:bg-slate-900/50"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-blue-500 dark:text-blue-400 text-sm font-medium mb-2">
            {txt('whyUsTag')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {txt('whyUsTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {txt('whyUsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger-children">
          {FEATURES.map(({ titleKey, descKey, Icon }) => (
            <div
              key={titleKey}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow ${
                isAr ? 'text-right' : 'text-center'
              }`}
            >
              <div className={`flex justify-center mb-4 ${isAr ? 'md:justify-end' : ''}`}>
                <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Icon
                    size={28}
                    className="text-blue-600 dark:text-blue-400"
                    aria-hidden
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {txt(titleKey)}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {txt(descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimateSection>
  );
}
