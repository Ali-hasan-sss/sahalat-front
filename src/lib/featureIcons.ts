/**
 * أيقونات المميزات – أسماء أيقونات Lucide المتاحة للسياحة والسفر.
 * يتم حفظ اسم الأيقونة في قاعدة البيانات وعرضها في صفحة الرحلة.
 */

export const FEATURE_ICONS = [
  { value: 'Sun', labelAr: 'شمس', labelEn: 'Sun' },
  { value: 'Moon', labelAr: 'قمر', labelEn: 'Moon' },
  { value: 'SunMoon', labelAr: 'شمس وقمر', labelEn: 'Sun & Moon' },
  { value: 'Mountain', labelAr: 'جبال', labelEn: 'Mountains' },
  { value: 'Waves', labelAr: 'أمواج', labelEn: 'Waves' },
  { value: 'TreePalm', labelAr: 'نخيل', labelEn: 'Palm Tree' },
  { value: 'Tent', labelAr: 'خيمة', labelEn: 'Tent' },
  { value: 'Compass', labelAr: 'بوصلة', labelEn: 'Compass' },
  { value: 'MapPin', labelAr: 'موقع', labelEn: 'Location' },
  { value: 'Building2', labelAr: 'مدينة', labelEn: 'City' },
  { value: 'Camera', labelAr: 'كاميرا', labelEn: 'Camera' },
  { value: 'Footprints', labelAr: 'مشي', labelEn: 'Hiking' },
  { value: 'TreePine', labelAr: 'غابة', labelEn: 'Forest' },
  { value: 'Ship', labelAr: 'سفينة', labelEn: 'Ship' },
  { value: 'Car', labelAr: 'سيارة', labelEn: 'Car' },
  { value: 'Sparkles', labelAr: 'تأمل', labelEn: 'Wellness' },
  { value: 'Utensils', labelAr: 'وجبات', labelEn: 'Meals' },
  { value: 'Bed', labelAr: 'إقامة', labelEn: 'Accommodation' },
  { value: 'Landmark', labelAr: 'معلم', labelEn: 'Landmark' },
  { value: 'Star', labelAr: 'نجمة', labelEn: 'Star' },
  { value: 'Heart', labelAr: 'قلب', labelEn: 'Heart' },
  { value: 'Rocket', labelAr: 'مغامرة', labelEn: 'Adventure' },
  { value: 'Sunrise', labelAr: 'شروق', labelEn: 'Sunrise' },
  { value: 'Sunset', labelAr: 'غروب', labelEn: 'Sunset' },
] as const;

export type FeatureIconName = (typeof FEATURE_ICONS)[number]['value'];

export function getFeatureIconOptions(locale: 'ar' | 'en') {
  return FEATURE_ICONS.map((opt) => ({
    value: opt.value,
    label: locale === 'ar' ? opt.labelAr : opt.labelEn,
  }));
}

export { FeatureIcon } from './FeatureIcon';
