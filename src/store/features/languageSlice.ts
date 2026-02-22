import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LanguageState, Language } from '@/types';

const STORAGE_KEY = 'sahalat_language';

function getInitialLocale(): Language {
  if (typeof window === 'undefined') return 'ar';
  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored === 'ar' || stored === 'en') return stored;
  return 'ar';
}

const initialState: LanguageState = {
  locale: 'ar',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.locale = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, action.payload);
        document.documentElement.lang = action.payload;
        document.documentElement.dir = action.payload === 'ar' ? 'rtl' : 'ltr';
      }
    },
    toggleLanguage: (state) => {
      const next = state.locale === 'ar' ? 'en' : 'ar';
      state.locale = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.lang = next;
        document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
      }
    },
    initLanguage: (state) => {
      const locale = getInitialLocale();
      state.locale = locale;
      if (typeof window !== 'undefined') {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      }
    },
  },
});

export const { setLanguage, toggleLanguage, initLanguage } = languageSlice.actions;
export default languageSlice.reducer;
