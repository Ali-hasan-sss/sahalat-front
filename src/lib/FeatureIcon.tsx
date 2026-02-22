'use client';

import {
  Sun,
  Moon,
  SunMoon,
  Mountain,
  Waves,
  TreePalm,
  Tent,
  Compass,
  MapPin,
  Building2,
  Camera,
  Footprints,
  TreePine,
  Trees,
  Ship,
  Car,
  Sparkles,
  Utensils,
  Bed,
  Landmark,
  Star,
  Heart,
  Rocket,
  Sunrise,
  Sunset,
  type LucideIcon,
} from 'lucide-react';

/** خريطة أسماء الأيقونات إلى مكونات Lucide - استيراد صريح لتجنب tree-shaking */
const ICON_MAP: Record<string, LucideIcon> = {
  Sun,
  Moon,
  SunMoon,
  Mountain,
  Waves,
  PalmTree: TreePalm,
  TreePalm,
  TreePine,
  Trees,
  Tent,
  Compass,
  MapPin,
  Building2,
  Camera,
  Footprints,
  Ship,
  Car,
  Sparkles,
  Utensils,
  Bed,
  Landmark,
  Star,
  Heart,
  Rocket,
  Sunrise,
  Sunset,
};

export function FeatureIcon({
  name,
  size = 24,
  className,
}: {
  name: string | null | undefined;
  size?: number;
  className?: string;
}) {
  if (!name) return null;
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} strokeWidth={2} />;
}
