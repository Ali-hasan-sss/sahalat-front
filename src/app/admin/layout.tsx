'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, Car, Landmark, Percent, Ticket, Calendar, Star } from 'lucide-react';

const SIDEBAR_LINKS = [
  { href: '/admin', label: 'الرئيسية', Icon: LayoutDashboard },
  { href: '/admin/trips', label: 'الرحلات', Icon: MapPin },
  { href: '/admin/cars', label: 'السيارات', Icon: Car },
  { href: '/admin/landmarks', label: 'المعالم', Icon: Landmark },
  { href: '/admin/discounts', label: 'الخصومات', Icon: Percent },
  { href: '/admin/coupons', label: 'الكوبونات', Icon: Ticket },
  { href: '/admin/bookings', label: 'الحجوزات', Icon: Calendar },
  { href: '/admin/testimonials', label: 'التقييمات المعروضة', Icon: Star },
];

function NavLink({ href, label, Icon, isActive }: { href: string; label: string; Icon: React.ComponentType<{ size?: number | string; className?: string }>; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-teal-500/20 text-teal-300 border-e-2 border-teal-400'
          : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'
      }`}
    >
      <Icon size={20} className="shrink-0" aria-hidden />
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 right-0 z-40 w-64 flex flex-col bg-slate-900 dark:bg-slate-950 border-l border-slate-700/50 shadow-xl">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LayoutDashboard size={22} className="text-teal-400" aria-hidden />
            لوحة الأدمن
          </h2>
          <p className="text-xs text-slate-400 mt-1">إدارة المحتوى والعمليات</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {SIDEBAR_LINKS.map(({ href, label, Icon }) => (
            <NavLink key={href} href={href} label={label} Icon={Icon} isActive={isActive(href)} />
          ))}
        </nav>
      </aside>

      {/* Main content with header */}
      <div className="flex-1 mr-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            {SIDEBAR_LINKS.find((l) => isActive(l.href))?.label ?? 'لوحة التحكم'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            إدارة منصة سهالات
          </p>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
