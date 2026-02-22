import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/trips" className="p-4 bg-white rounded-xl shadow hover:shadow-lg">إدارة الرحلات</Link>
        <Link href="/admin/cars" className="p-4 bg-white rounded-xl shadow hover:shadow-lg">إدارة السيارات</Link>
        <Link href="/admin/landmarks" className="p-4 bg-white rounded-xl shadow hover:shadow-lg">إدارة المعالم</Link>
        <Link href="/admin/discounts" className="p-4 bg-white rounded-xl shadow hover:shadow-lg">الخصومات</Link>
        <Link href="/admin/coupons" className="p-4 bg-white rounded-xl shadow hover:shadow-lg">الكوبونات</Link>
        <Link href="/admin/bookings" className="p-4 bg-white rounded-xl shadow hover:shadow-lg">الحجوزات</Link>
      </div>
    </div>
  );
}
