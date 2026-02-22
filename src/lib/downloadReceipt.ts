import html2canvas from 'html2canvas';

const EMAIL = 'info@sahalattoursom.com';
const PHONE = '+968 9701 8484';

type TripBooking = {
  id: string;
  participants: number;
  basePrice: number;
  finalPrice: number;
  trip: {
    title: string;
    titleAr: string | null;
    route: string | null;
    routeAr: string | null;
    durationDays: number;
  };
  startDate: string;
};

type CarBooking = {
  id: string;
  basePrice: number;
  finalPrice: number;
  car: { name: string; nameAr: string | null };
  startDate: string;
  endDate: string;
  pickupLocation: string;
};

function formatOmaniRial(n: number, isAr: boolean): string {
  const formatted = n % 1 === 0 ? String(n) : parseFloat(n.toFixed(3)).toString();
  return formatted + (isAr ? ' ر.ع' : ' OMR');
}

function formatDate(s: string): string {
  return new Date(s).toISOString().slice(0, 10);
}

function getDaysBetween(start: string, end: string): number {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24)) + 1;
}

function getLabels(isAr: boolean) {
  return isAr
    ? {
        contactEmail: 'إيميل التواصل',
        phone: 'هاتف',
        receiptTrip: 'إيصال حجز - رحلة سياحية',
        receiptCar: 'إيصال حجز - تأجير سيارة',
        item: 'البند',
        value: 'القيمة',
        customerName: 'اسم العميل',
        trip: 'الرحلة',
        route: 'المسار',
        startDate: 'تاريخ البدء',
        duration: 'المدة',
        days: (n: number) => `${n} أيام`,
        daysCount: 'عدد الأيام',
        priceDetails: 'تفاصيل السعر',
        amount: 'المبلغ',
        pricePerPerson: 'سعر للشخص الواحد',
        participants: 'عدد الأشخاص',
        total: 'الاجمالي',
        car: 'السيارة',
        pickupLocation: 'مكان الاستلام',
        from: 'من',
        to: 'إلى',
        rentalPrice: 'سعر التأجير',
        bookingId: 'رقم الحجز',
      }
    : {
        contactEmail: 'Contact Email',
        phone: 'Phone',
        receiptTrip: 'Booking Receipt - Tour',
        receiptCar: 'Booking Receipt - Car Rental',
        item: 'Item',
        value: 'Value',
        customerName: 'Customer Name',
        trip: 'Trip',
        route: 'Route',
        startDate: 'Start Date',
        duration: 'Duration',
        days: (n: number) => `${n} days`,
        daysCount: 'Number of days',
        priceDetails: 'Price Details',
        amount: 'Amount',
        pricePerPerson: 'Price per person',
        participants: 'Participants',
        total: 'Total',
        car: 'Car',
        pickupLocation: 'Pickup Location',
        from: 'From',
        to: 'To',
        rentalPrice: 'Rental Price',
        bookingId: 'Booking ID',
      };
}

function buildTripInvoiceHtml(
  b: TripBooking,
  userName: string,
  isAr: boolean
): string {
  const L = getLabels(isAr);
  const dir = isAr ? 'rtl' : 'ltr';
  const labelAlign = isAr ? 'right' : 'left';
  const valueAlign = isAr ? 'left' : 'right';
  const baseCell = 'padding: 10px 12px; border: 1px solid #e2e8f0; color: #1e293b;';
  const labelCell = `${baseCell} text-align: ${labelAlign}; background: #f8fafc; color: #475569; font-weight: 600;`;
  const valueCell = `${baseCell} text-align: ${valueAlign};`;
  const valueHeaderCell = `${baseCell} text-align: ${valueAlign}; background: #f8fafc; color: #475569; font-weight: 600;`;

  const title = isAr && b.trip.titleAr ? b.trip.titleAr : b.trip.title;
  const route = b.trip.route ? (isAr && b.trip.routeAr ? b.trip.routeAr : b.trip.route) : '';
  const pricePerPerson = b.participants > 0 ? b.basePrice / b.participants : b.basePrice;
  return `
    <div style="padding: 28px; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: ${dir}; text-align: ${labelAlign}; background: #fff; color: #1e293b; width: 420px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #007BFF;">
        <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/logo.png" alt="Sahalat" style="height: 48px; width: auto;" crossorigin="anonymous" />
        <div style="text-align: ${isAr ? 'right' : 'left'}; font-size: 12px; color: #64748b;">
          <div>${L.contactEmail}: ${EMAIL}</div>
          <div>${L.phone}: ${PHONE}</div>
        </div>
      </div>
      <h2 style="margin: 0 0 20px; font-size: 18px; color: #007BFF; text-align: inherit;">${L.receiptTrip}</h2>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr><th style="${labelCell} width: 40%;">${L.item}</th><th style="${valueHeaderCell}">${L.value}</th></tr>
        <tr><td style="${valueCell}">${L.customerName}</td><td style="${valueCell}">${userName}</td></tr>
        <tr><td style="${valueCell}">${L.trip}</td><td style="${valueCell}">${title}</td></tr>
        ${route ? `<tr><td style="${valueCell}">${L.route}</td><td style="${valueCell}">${route}</td></tr>` : ''}
        <tr><td style="${valueCell}">${L.startDate}</td><td style="${valueCell}">${formatDate(b.startDate)}</td></tr>
        <tr><td style="${valueCell}">${L.duration}</td><td style="${valueCell}">${L.days(b.trip.durationDays)}</td></tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><th style="${labelCell}">${L.priceDetails}</th><th style="${valueHeaderCell}">${L.amount}</th></tr>
        <tr><td style="${valueCell}">${L.pricePerPerson}</td><td style="${valueCell}">${formatOmaniRial(pricePerPerson, isAr)}</td></tr>
        <tr><td style="${valueCell}">${L.participants}</td><td style="${valueCell}">${b.participants}</td></tr>
        <tr><td style="${valueCell}">${L.total} (${pricePerPerson % 1 === 0 ? pricePerPerson : pricePerPerson.toFixed(3)} × ${b.participants})</td><td style="${valueCell} font-weight: bold; color: #007BFF; font-size: 15px;">${formatOmaniRial(b.finalPrice, isAr)}</td></tr>
      </table>

      <p style="margin-top: 20px; font-size: 11px; color: #94a3b8;">${L.bookingId}: ${b.id}</p>
    </div>
  `;
}

function buildCarInvoiceHtml(
  b: CarBooking,
  userName: string,
  isAr: boolean
): string {
  const L = getLabels(isAr);
  const dir = isAr ? 'rtl' : 'ltr';
  const labelAlign = isAr ? 'right' : 'left';
  const valueAlign = isAr ? 'left' : 'right';
  const baseCell = 'padding: 10px 12px; border: 1px solid #e2e8f0; color: #1e293b;';
  const labelCell = `${baseCell} text-align: ${labelAlign}; background: #f8fafc; color: #475569; font-weight: 600;`;
  const valueCell = `${baseCell} text-align: ${valueAlign};`;
  const valueHeaderCell = `${baseCell} text-align: ${valueAlign}; background: #f8fafc; color: #475569; font-weight: 600;`;

  const days = getDaysBetween(b.startDate, b.endDate);
  const carName = isAr && b.car.nameAr ? b.car.nameAr : b.car.name;
  return `
    <div style="padding: 28px; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: ${dir}; text-align: ${labelAlign}; background: #fff; color: #1e293b; width: 420px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #007BFF;">
        <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/logo.png" alt="Sahalat" style="height: 48px; width: auto;" crossorigin="anonymous" />
        <div style="text-align: ${isAr ? 'right' : 'left'}; font-size: 12px; color: #64748b;">
          <div>${L.contactEmail}: ${EMAIL}</div>
          <div>${L.phone}: ${PHONE}</div>
        </div>
      </div>
      <h2 style="margin: 0 0 20px; font-size: 18px; color: #007BFF; text-align: inherit;">${L.receiptCar}</h2>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr><th style="${labelCell} width: 40%;">${L.item}</th><th style="${valueHeaderCell}">${L.value}</th></tr>
        <tr><td style="${valueCell}">${L.customerName}</td><td style="${valueCell}">${userName}</td></tr>
        <tr><td style="${valueCell}">${L.car}</td><td style="${valueCell}">${carName}</td></tr>
        <tr><td style="${valueCell}">${L.pickupLocation}</td><td style="${valueCell}">${b.pickupLocation}</td></tr>
        <tr><td style="${valueCell}">${L.from}</td><td style="${valueCell}">${formatDate(b.startDate)}</td></tr>
        <tr><td style="${valueCell}">${L.to}</td><td style="${valueCell}">${formatDate(b.endDate)}</td></tr>
        <tr><td style="${valueCell}">${L.daysCount}</td><td style="${valueCell}">${L.days(days)}</td></tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><th style="${labelCell}">${L.priceDetails}</th><th style="${valueHeaderCell}">${L.amount}</th></tr>
        <tr><td style="${valueCell}">${L.rentalPrice}</td><td style="${valueCell}">${formatOmaniRial(b.basePrice, isAr)}</td></tr>
        <tr><td style="${valueCell} font-weight: bold; color: #007BFF; font-size: 15px;">${L.total}</td><td style="${valueCell} font-weight: bold; color: #007BFF; font-size: 15px;">${formatOmaniRial(b.finalPrice, isAr)}</td></tr>
      </table>

      <p style="margin-top: 20px; font-size: 11px; color: #94a3b8;">${L.bookingId}: ${b.id}</p>
    </div>
  `;
}

async function loadLogo(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = window.location.origin + '/logo.png';
  });
}

export async function downloadTripReceipt(
  booking: TripBooking,
  userName: string,
  isAr: boolean
): Promise<void> {
  await loadLogo();
  const div = document.createElement('div');
  div.innerHTML = buildTripInvoiceHtml(booking, userName, isAr);
  div.style.position = 'fixed';
  div.style.left = '-9999px';
  div.style.top = '0';
  div.style.background = '#fff';
  document.body.appendChild(div);

  try {
    const canvas = await html2canvas(div.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    const link = document.createElement('a');
    link.download = `sahalat-receipt-trip-${booking.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } finally {
    document.body.removeChild(div);
  }
}

export async function downloadCarReceipt(
  booking: CarBooking,
  userName: string,
  isAr: boolean
): Promise<void> {
  await loadLogo();
  const div = document.createElement('div');
  div.innerHTML = buildCarInvoiceHtml(booking, userName, isAr);
  div.style.position = 'fixed';
  div.style.left = '-9999px';
  div.style.top = '0';
  div.style.background = '#fff';
  document.body.appendChild(div);

  try {
    const canvas = await html2canvas(div.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    const link = document.createElement('a');
    link.download = `sahalat-receipt-car-${booking.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } finally {
    document.body.removeChild(div);
  }
}
