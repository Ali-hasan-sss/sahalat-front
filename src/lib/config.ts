/**
 * إعدادات التطبيق من متغيرات البيئة.
 * NEXT_PUBLIC_API_URL: عنوان الـ API (مثال: https://api-sahalat.onrender.com)
 * إذا لم يُحدد، يُفترض نفس الـ origin مع /api أو localhost:4000 للتطوير.
 */
const envApiUrl =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '';
const isClient = typeof window !== 'undefined';

/**
 * قاعدة عنوان الـ API.
 * - مع NEXT_PUBLIC_API_URL: يستخدم القيمة المحددة
 * - على السيرفر (SSR) بدون env: localhost:4000
 * - على العميل بدون env: فارغ (نفس الـ origin + rewrites)
 */
export const API_BASE_URL: string = envApiUrl
  ? envApiUrl.replace(/\/$/, '')
  : isClient
    ? ''
    : 'http://localhost:4000';

/**
 * بادئة مسارات الـ API (مثل /api أو base + /api)
 */
export const API_PREFIX: string = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

/**
 * عنوان الـ API الكامل لتحميل الملفات والصور.
 */
export const UPLOADS_BASE_URL: string = API_BASE_URL
  ? `${API_BASE_URL}/uploads`
  : '';
