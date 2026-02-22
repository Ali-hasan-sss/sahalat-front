'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { completeProfile, clearError } from '@/store/features/authSlice';
import { getT } from '@/lib/i18n';

export default function CompleteProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken, isLoading, error } = useAppSelector((s) => s.auth);
  const locale = useAppSelector((s) => s.language.locale);
  const t = getT(locale);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setCountry(user.country || '');
    }
  }, [user]);

  useEffect(() => {
    if (!accessToken) {
      router.replace('/login');
    }
  }, [accessToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(
      completeProfile({
        firstName,
        lastName,
        phone,
        country,
        ...(password ? { password } : {}),
      })
    );
    if (completeProfile.fulfilled.match(result)) {
      router.push('/');
      router.refresh();
    }
  };

  if (!accessToken) return null;

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-2 dark:text-white">{t.auth.completeProfileTitle}</h1>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
        {t.auth.completeProfileDesc}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          type="text"
          placeholder={t.auth.firstName}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder={t.auth.lastName}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
          required
        />
        <input
          type="tel"
          placeholder={t.auth.phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder={t.auth.country}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
          required
        />
        <div>
          <input
            type="password"
            placeholder={t.auth.optionalPassword}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
            minLength={8}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {locale === 'ar' ? 'يمكنك تعيين كلمة مرور لتسجيل الدخول بالإيميل لاحقاً' : 'You can set a password to sign in with email later'}
          </p>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
        >
          {isLoading ? t.common.loading : t.common.save}
        </button>
      </form>
    </div>
  );
}
