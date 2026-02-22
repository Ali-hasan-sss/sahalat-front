import { UPLOADS_BASE_URL } from './config';

/**
 * يحوّل المسار النسبي المخزَن في قاعدة البيانات إلى رابط عرض.
 * عند تعيين NEXT_PUBLIC_API_URL يستخدم رابط الـ API الكامل للصور.
 */
export function getImageUrl(relativePath: string | null | undefined): string {
  if (!relativePath) return '';
  const path = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return UPLOADS_BASE_URL ? `${UPLOADS_BASE_URL}/${path}` : `/uploads/${path}`;
}
