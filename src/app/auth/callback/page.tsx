'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/features/authSlice';
import axios from 'axios';
import { endpoints } from '@/lib/endpoints';

const baseURL = typeof window !== 'undefined' ? '' : 'http://localhost:4000';
const apiPrefix = baseURL ? baseURL + '/api' : '/api';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const needsCompleteProfile = searchParams.get('completeProfile') === '1';

    if (!accessToken || !refreshToken) {
      setStatus('error');
      return;
    }

    const persistAndRedirect = async () => {
      try {
        const { data } = await axios.get(apiPrefix + endpoints.auth.me(), {
          headers: { Authorization: 'Bearer ' + accessToken },
        });
        const user = data.data;
        dispatch(setAuth({ user, accessToken, refreshToken }));
        if (needsCompleteProfile) {
          router.replace('/complete-profile');
        } else {
          router.replace(user.role === 'ADMIN' ? '/admin' : '/');
        }
      } catch {
        setStatus('error');
      }
    };

    persistAndRedirect();
  }, [searchParams, dispatch, router]);

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 text-center">
        <p className="text-red-600 dark:text-red-400">فشل تسجيل الدخول</p>
        <a href="/login" className="text-teal-600 dark:text-teal-400 underline mt-4 inline-block">
          العودة لتسجيل الدخول
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 text-center">
      <p className="dark:text-white">جاري تسجيل الدخول...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto mt-16 p-6 text-center"><p className="dark:text-white">جاري التحميل...</p></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
