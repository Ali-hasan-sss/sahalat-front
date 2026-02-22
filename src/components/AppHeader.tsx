'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/features/authSlice';
import { ThemeLanguageSwitcher } from './ThemeLanguageSwitcher';
import { getT } from '@/lib/i18n';
import { Phone, User, Menu, X } from 'lucide-react';

const PHONE = '+968 9701 8484';

export function AppHeader() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const locale = useAppSelector((s) => s.language.locale);
  const t = getT(locale);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideDesktop = menuRef.current?.contains(target);
      const insideMobile = mobileMenuRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [sidebarOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setSidebarOpen(false);
    dispatch(logout());
    router.push('/');
    router.refresh();
  };

  const pathname = usePathname() ?? '';
  const navItems = [
    { href: '/', label: t.nav.discoverOman },
    { href: '/trips', label: t.nav.trips },
    { href: '/cars', label: t.nav.cars },
    { href: '/landmarks', label: t.nav.landmarks },
    { href: '/contact', label: t.nav.contactUs },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const getNavLinkClass = (href: string) => {
    const base =
      'text-slate-700 dark:text-slate-300 hover:text-[#26C0D2] dark:hover:text-[#26C0D2] transition-colors text-sm font-medium pb-1 border-b-2 border-transparent';
    const active = 'text-[#26C0D2] dark:text-[#26C0D2] border-b-2 border-[#26C0D2]';
    return isActive(href) ? `${base} ${active}` : base;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e6e3] dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-3 md:py-4">
          {/* Logo - always visible */}
          <Link href="/" className="shrink-0 flex items-center" onClick={closeSidebar}>
            <Image src="/logo.png" alt="Sahalat" width={120} height={40} className="h-9 md:h-10 w-auto object-contain" priority />
          </Link>

          {/* Desktop: Nav + Theme/Lang + Contact + Auth */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={getNavLinkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <ThemeLanguageSwitcher />
            <a
              href={`tel:${PHONE.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
            >
              <Phone size={18} className="shrink-0" aria-hidden />
              {PHONE}
            </a>
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {user?.name ? (
                    <span className="text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User size={20} aria-hidden />
                  )}
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full end-0 mt-2 py-2 min-w-[160px] rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                    <Link
                      href="/bookings"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {t.nav.myBookings}
                    </Link>
                    <Link
                      href="/favorites"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {t.nav.favorites}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-start px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium">
                  {t.nav.login}
                </Link>
                <Link href="/register" className="bg-[#1970f0] hover:bg-[#1560d8] text-white px-4 py-2 rounded-lg text-sm font-medium">
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Sidebar عند الحافة (يمين في LTR، يسار في RTL) + أفاتار المستخدم بجانبه */}
          <div className="lg:hidden flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <div className="relative" ref={mobileMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {user?.name ? (
                    <span className="text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User size={20} aria-hidden />
                  )}
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute top-full end-0 mt-2 py-2 min-w-[160px] rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 z-50"
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  >
                    <Link
                      href="/bookings"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {t.nav.myBookings}
                    </Link>
                    <Link
                      href="/favorites"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {t.nav.favorites}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-start px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={locale === 'ar' ? 'فتح القائمة' : 'Open menu'}
            >
              <Menu size={24} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            onClick={closeSidebar}
            aria-hidden
          />
          <aside
            className="fixed top-0 end-0 w-[280px] max-w-[85vw] h-full bg-white dark:bg-slate-900 shadow-xl z-[70] lg:hidden flex flex-col"
            dir="rtl"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <Link href="/" onClick={closeSidebar} className="shrink-0 flex items-center">
                <Image src="/logo.png" alt="Sahalat" width={120} height={40} className="h-10 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={closeSidebar}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="إغلاق"
              >
                <X size={24} aria-hidden />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`block py-3 px-3 rounded-lg font-medium border-b-2 ${
                    isActive(item.href)
                      ? 'text-[#26C0D2] dark:text-[#26C0D2] border-[#26C0D2]'
                      : 'text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#26C0D2] dark:hover:text-[#26C0D2]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                <ThemeLanguageSwitcher />
              </div>
              <a
                href={`tel:${PHONE.replace(/\s/g, '')}`}
                onClick={closeSidebar}
                className="flex items-center gap-2 py-3 px-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Phone size={18} aria-hidden />
                {PHONE}
              </a>
              {isAuthenticated ? (
                <div className="mt-2 space-y-1">
                  <Link
                    href="/bookings"
                    onClick={closeSidebar}
                    className="block py-3 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t.nav.myBookings}
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={closeSidebar}
                    className="block py-3 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t.nav.favorites}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-start py-3 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <Link
                    href="/login"
                    onClick={closeSidebar}
                    className="block py-3 px-3 rounded-lg text-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeSidebar}
                    className="block py-3 px-3 rounded-lg text-center bg-[#1970f0] hover:bg-[#1560d8] text-white font-medium"
                  >
                    {t.nav.register}
                  </Link>
                </div>
              )}
            </nav>
          </aside>
        </>
      )}
    </header>
  );
}
