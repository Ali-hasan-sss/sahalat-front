'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme } from '@/store/features/themeSlice';
import { toggleLanguage } from '@/store/features/languageSlice';
import { getT } from '@/lib/i18n';
import { Moon, Sun } from 'lucide-react';

export function ThemeLanguageSwitcher() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.mode);
  const locale = useAppSelector((s) => s.language.locale);
  const t = getT(locale);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => dispatch(toggleTheme())}
        className="relative flex items-center justify-center w-10 h-10 rounded-lg border border-[#e8e6e3] dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors overflow-hidden"
        title={theme === 'light' ? t.theme.dark : t.theme.light}
        aria-label={theme === 'light' ? t.theme.dark : t.theme.light}
      >
        <Moon
          size={20}
          className={`absolute text-slate-600 dark:text-slate-400 transition-all duration-300 ease-out ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`}
          aria-hidden
        />
        <Sun
          size={20}
          className={`absolute text-amber-500 transition-all duration-300 ease-out ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75'}`}
          aria-hidden
        />
      </button>
      <button
        type="button"
        onClick={() => dispatch(toggleLanguage())}
        className="p-2 rounded-lg border border-[#e8e6e3] dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium"
      >
        {locale === 'ar' ? 'EN' : 'ar'}
      </button>
    </div>
  );
}
