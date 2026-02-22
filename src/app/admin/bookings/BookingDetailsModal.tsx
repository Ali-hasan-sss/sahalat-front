'use client';

import { Eye, X } from 'lucide-react';
import { getImageUrl } from '@/lib/upload';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  PAID: 'مدفوع',
  CANCELLED: 'ملغى',
  COMPLETED: 'مكتمل',
};

const STATUS_OPTIONS = ['PENDING', 'PAID', 'CANCELLED', 'COMPLETED'] as const;

type TripBookingDetail = {
  id: string;
  startDate: string;
  participants: number;
  adults?: number;
  children?: number;
  basePrice: string | number;
  discountAmount?: string | number;
  couponAmount?: string | number;
  finalPrice: string | number;
  status: string;
  trip: { id: string; title: string; titleAr?: string | null };
  user: { id: string; email: string; name: string };
};

type CarBookingDetail = {
  id: string;
  startDate: string;
  endDate: string;
  pickupLocation?: string | null;
  returnLocation?: string | null;
  withDriver?: boolean;
  licenseImagePath?: string | null;
  licenseIssuer?: string | null;
  basePrice: string | number;
  discountAmount?: string | number;
  couponAmount?: string | number;
  finalPrice: string | number;
  status: string;
  car: { id: string; name: string; nameAr?: string | null };
  user: { id: string; email: string; name: string };
};

type Props = {
  open: boolean;
  onClose: () => void;
  type: 'trips' | 'cars';
  booking: TripBookingDetail | CarBookingDetail | null;
  onStatusChange: (status: string) => Promise<void>;
  changingStatus: boolean;
};

function DetailCard({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 ${className}`}>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800 dark:text-white break-words">{value ?? '—'}</p>
    </div>
  );
}

export function BookingDetailsModal({
  open,
  onClose,
  type,
  booking,
  onStatusChange,
  changingStatus,
}: Props) {
  if (!open) return null;

  const status = booking?.status ?? 'PENDING';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
              <Eye size={22} />
              تفاصيل الحجز {type === 'trips' ? 'الرحلة' : 'السيارة'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
            >
              <X size={20} />
            </button>
          </div>

          {!booking ? (
            <p className="text-slate-500 dark:text-slate-400 py-4">لا توجد بيانات</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {type === 'trips' ? (
                  <>
                    <DetailCard label="الرحلة" value={(booking as TripBookingDetail).trip?.titleAr ?? (booking as TripBookingDetail).trip?.title} />
                    <DetailCard label="تاريخ البداية" value={new Date((booking as TripBookingDetail).startDate).toLocaleDateString('ar-SA')} />
                    <DetailCard label="المستخدم" value={(booking as TripBookingDetail).user?.name} />
                    <DetailCard label="البريد الإلكتروني" value={(booking as TripBookingDetail).user?.email} />
                    <DetailCard label="المشاركين" value={(booking as TripBookingDetail).participants} />
                    <DetailCard label="البالغين / الأطفال" value={`${(booking as TripBookingDetail).adults ?? '—'} / ${(booking as TripBookingDetail).children ?? 0}`} />
                    <DetailCard label="السعر الأساسي" value={`${Number((booking as TripBookingDetail).basePrice).toFixed(3)} ر.ع`} />
                    <DetailCard label="خصم" value={(booking as TripBookingDetail).discountAmount ? `${Number((booking as TripBookingDetail).discountAmount).toFixed(3)} ر.ع` : '0'} />
                    <DetailCard label="كوبون" value={(booking as TripBookingDetail).couponAmount ? `${Number((booking as TripBookingDetail).couponAmount).toFixed(3)} ر.ع` : '0'} />
                    <DetailCard label="الإجمالي النهائي" value={`${Number((booking as TripBookingDetail).finalPrice).toFixed(3)} ر.ع`} className="md:col-span-2 font-bold text-teal-600 dark:text-teal-400" />
                  </>
                ) : (
                  <>
                    <DetailCard label="السيارة" value={(booking as CarBookingDetail).car?.nameAr ?? (booking as CarBookingDetail).car?.name} />
                    <DetailCard label="من تاريخ" value={new Date((booking as CarBookingDetail).startDate).toLocaleDateString('ar-SA')} />
                    <DetailCard label="إلى تاريخ" value={new Date((booking as CarBookingDetail).endDate).toLocaleDateString('ar-SA')} />
                    <DetailCard label="المستخدم" value={(booking as CarBookingDetail).user?.name} />
                    <DetailCard label="البريد الإلكتروني" value={(booking as CarBookingDetail).user?.email} />
                    <DetailCard label="مع سائق" value={(booking as CarBookingDetail).withDriver ? 'نعم' : 'لا'} />
                    <DetailCard label="موقع الاستلام" value={(booking as CarBookingDetail).pickupLocation ?? '—'} />
                    <DetailCard label="موقع الإرجاع" value={(booking as CarBookingDetail).returnLocation ?? '—'} />
                    {!(booking as CarBookingDetail).withDriver && (
                      <>
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 md:col-span-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">صورة رخصة القيادة</p>
                          {(booking as CarBookingDetail).licenseImagePath ? (
                            <a href={getImageUrl((booking as CarBookingDetail).licenseImagePath)} target="_blank" rel="noopener noreferrer" className="inline-block">
                              <img
                                src={getImageUrl((booking as CarBookingDetail).licenseImagePath)}
                                alt="رخصة القيادة"
                                className="w-32 h-20 object-cover rounded-lg border dark:border-slate-600 hover:opacity-90"
                              />
                            </a>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">—</span>
                          )}
                        </div>
                        <DetailCard label="الجهة الصادرة للرخصة" value={(booking as CarBookingDetail).licenseIssuer ?? '—'} />
                      </>
                    )}
                    <DetailCard label="السعر الأساسي" value={`${Number((booking as CarBookingDetail).basePrice).toFixed(3)} ر.ع`} />
                    <DetailCard label="خصم" value={(booking as CarBookingDetail).discountAmount ? `${Number((booking as CarBookingDetail).discountAmount).toFixed(3)} ر.ع` : '0'} />
                    <DetailCard label="كوبون" value={(booking as CarBookingDetail).couponAmount ? `${Number((booking as CarBookingDetail).couponAmount).toFixed(3)} ر.ع` : '0'} />
                    <DetailCard label="الإجمالي النهائي" value={`${Number((booking as CarBookingDetail).finalPrice).toFixed(3)} ر.ع`} className="md:col-span-2 font-bold text-teal-600 dark:text-teal-400" />
                  </>
                )}
              </div>

              <div className="border-t dark:border-slate-600 pt-4">
                <h3 className="text-sm font-semibold dark:text-slate-300 mb-3">تغيير الحالة</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onStatusChange(s)}
                      disabled={changingStatus || s === status}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        s === status
                          ? 'bg-teal-600 text-white cursor-default'
                          : s === 'CANCELLED'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                            : s === 'PAID'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                              : s === 'COMPLETED'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
                {changingStatus && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">جاري التحديث...</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
