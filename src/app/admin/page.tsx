import Link from 'next/link';
import { MapPin, Car, Landmark, Percent, Ticket, Calendar, Star } from 'lucide-react';

const CARDS = [
  { href: '/admin/trips', label: 'إدارة الرحلات', Icon: MapPin, iconClass: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' },
  { href: '/admin/cars', label: 'إدارة السيارات', Icon: Car, iconClass: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
  { href: '/admin/landmarks', label: 'إدارة المعالم', Icon: Landmark, iconClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
  { href: '/admin/discounts', label: 'الخصومات', Icon: Percent, iconClass: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' },
  { href: '/admin/coupons', label: 'الكوبونات', Icon: Ticket, iconClass: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  { href: '/admin/bookings', label: 'الحجوزات', Icon: Calendar, iconClass: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' },
  { href: '/admin/testimonials', label: 'التقييمات المعروضة', Icon: Star, iconClass: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <p className="text-slate-600 dark:text-slate-400">اختر القسم الذي تريد إدارته</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(({ href, label, Icon, iconClass }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${iconClass}`}>
              <Icon size={24} aria-hidden />
            </div>
            <span className="font-medium text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
