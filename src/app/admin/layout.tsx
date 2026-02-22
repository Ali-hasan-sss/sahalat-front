import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-slate-800 text-white p-4">
        <h2 className="font-bold mb-4">لوحة الأدمن</h2>
        <nav className="space-y-2">
          <Link href="/admin" className="block py-1">الرئيسية</Link>
          <Link href="/admin/trips" className="block py-1">الرحلات</Link>
          <Link href="/admin/cars" className="block py-1">السيارات</Link>
          <Link href="/admin/landmarks" className="block py-1">المعالم</Link>
          <Link href="/admin/discounts" className="block py-1">الخصومات</Link>
          <Link href="/admin/coupons" className="block py-1">الكوبونات</Link>
          <Link href="/admin/bookings" className="block py-1">الحجوزات</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-slate-50">{children}</main>
    </div>
  );
}
