'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/hooks';
import { initTheme } from '@/store/features/themeSlice';
import { initLanguage } from '@/store/features/languageSlice';
import { setAuth } from '@/store/features/authSlice';
import type { User } from '@/types';

/**
 * يستعيد الثيم واللغة والمصادقة من localStorage عند التحميل.
 * لا يُعرض المحتوى إلا بعد اكتمال الاستعادة لتجنب وميض الهيدر (أزرار الدخول ↔ أفاتار).
 */
export function Hydrate({ children }: { children: React.ReactNode }) {
  const store = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    store.dispatch(initTheme());
    store.dispatch(initLanguage());
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken && refreshToken) {
      const userStr = localStorage.getItem('sahalat_user');
      const user = userStr ? (JSON.parse(userStr) as User) : null;
      if (user) store.dispatch(setAuth({ user, accessToken, refreshToken }));
    }
    setHydrated(true);
  }, [store]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] dark:bg-slate-900">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-700 dark:border-t-slate-400 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
