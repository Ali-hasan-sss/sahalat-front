'use client';

import { usePathname } from 'next/navigation';
import { AppFooter } from './AppFooter';

/**
 * يعرض AppFooter في صفحات الزبون ويخفيه في لوحة الأدمن
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <AppFooter />;
}
