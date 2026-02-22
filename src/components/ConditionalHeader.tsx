'use client';

import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';

/**
 * يعرض AppHeader في جميع صفحات المستخدم ويخفيه في لوحة الأدمن
 */
export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <AppHeader />;
}
