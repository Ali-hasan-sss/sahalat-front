/**
 * يحوّل المسار النسبي المخزَن في قاعدة البيانات إلى رابط عرض.
 * استخدام مسار نسبي /uploads/... يجعل الصور تعمل بغض النظر عن الدومين.
 */
export function getImageUrl(relativePath: string | null | undefined): string {
  if (!relativePath) return '';
  const path = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `/uploads/${path}`;
}
