'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register, clearError } from '@/store/features/authSlice';
import { getT } from '@/lib/i18n';
import { AuthLayout } from '@/components/AuthLayout';
import { ARAB_COUNTRIES } from '@/lib/arabCountries';
import { API_PREFIX } from '@/lib/config';

const inputClass =
  'w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-600 dark:focus:border-teal-600 outline-none transition-shadow';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const locale = useAppSelector((s) => s.language.locale);
  const t = getT(locale);
  const isAr = locale === 'ar';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(
      register({ firstName, lastName, email, phone, country, password })
    );
    if (register.fulfilled.match(result)) {
      router.push('/');
      router.refresh();
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = API_PREFIX + '/auth/google';
  };

  const getCountryName = (c: (typeof ARAB_COUNTRIES)[0]) =>
    isAr ? c.nameAr : c.nameEn;

  return (
    <AuthLayout title={t.auth.registerTitle} tagline={t.auth.tagline}>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-lg px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {t.auth.loginWithGoogle}
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {t.auth.orDivider}
        </span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        )}

        {/* الاسم الأول والكنية على صف واحد */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="given-name"
            autoComplete="given-name"
            placeholder={t.auth.firstName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="family-name"
            autoComplete="family-name"
            placeholder={t.auth.lastName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {/* البلد - select */}
        <select
          name="country"
          autoComplete="country-name"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={inputClass}
          required
        >
          <option value="">{t.auth.selectCountry}</option>
          {ARAB_COUNTRIES.map((c) => (
            <option key={c.code} value={isAr ? c.nameAr : c.nameEn}>
              {getCountryName(c)}
            </option>
          ))}
        </select>

        {/* رقم الهاتف */}
        <input
          type="tel"
          name="tel"
          autoComplete="tel"
          placeholder={t.auth.phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          required
        />

        {/* الإيميل */}
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder={t.auth.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
        />

        {/* كلمة المرور */}
        <input
          type="password"
          name="new-password"
          autoComplete="new-password"
          placeholder={t.auth.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
          minLength={8}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
        >
          {isLoading ? t.common.loading : t.auth.submitRegister}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/login"
          className="text-teal-600 dark:text-teal-400 hover:underline"
        >
          {t.auth.hasAccount}
        </Link>
      </p>
    </AuthLayout>
  );
}
