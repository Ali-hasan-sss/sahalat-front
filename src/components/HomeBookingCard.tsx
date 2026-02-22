'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Car, Search } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { getT } from '@/lib/i18n';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import type { Language } from '@/types';

type Landmark = { id: string; name: string; nameAr: string | null };

const TRIP_TYPES = ['', 'GROUP', 'INDIVIDUAL', 'MARINE'] as const;
const PEOPLE_OPTIONS = [
  { value: '1', labelKey: 'person1' as const },
  { value: '2', labelKey: 'person2' as const },
  { value: '3-6', labelKey: 'people3to6' as const },
  { value: '6+', labelKey: 'people6plus' as const },
] as const;

const CAR_CATEGORIES = ['', 'ECONOMY', 'SUV', 'LUXURY', 'VAN'] as const;
const SEATS_OPTIONS = ['', '4-5', '6-7', '8+'] as const;
const TRANSMISSION_OPTIONS = ['', 'AUTOMATIC', 'MANUAL'] as const;

export function HomeBookingCard() {
  const locale = useAppSelector((s) => s.language.locale) as Language;
  const t = getT(locale);
  const hl = (t as unknown as { homeLanding?: Record<string, string> }).homeLanding ?? {};
  const carsT = (t as unknown as { carsPage?: Record<string, string> }).carsPage ?? {};
  const txt = (k: string) => (typeof hl[k] === 'string' ? hl[k] : k);
  const carsTxt = (k: string) => (typeof carsT[k] === 'string' ? carsT[k] : k);
  const isAr = locale === 'ar';

  const [activeTab, setActiveTab] = useState<'trip' | 'car'>('trip');
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);

  const [destination, setDestination] = useState('');
  const [tripType, setTripType] = useState('');
  const [people, setPeople] = useState('1');

  const [category, setCategory] = useState('');
  const [seats, setSeats] = useState('');
  const [transmission, setTransmission] = useState('');

  useEffect(() => {
    api.get(endpoints.landmarks.list(), { params: { limit: 100 } }).then(({ data }) => {
      setLandmarks(data.data?.items ?? []);
    }).catch(() => {});
  }, []);

  const buildTripsUrl = () => {
    const params = new URLSearchParams();
    if (destination) params.set('landmarkId', destination);
    if (tripType && TRIP_TYPES.includes(tripType as (typeof TRIP_TYPES)[number])) params.set('tripType', tripType);
    if (people && people !== '1') params.set('people', people);
    const q = params.toString();
    return `/trips${q ? `?${q}` : ''}`;
  };

  const buildCarsUrl = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (seats) params.set('seatsRange', seats);
    if (transmission) params.set('transmission', transmission);
    const q = params.toString();
    return `/cars${q ? `?${q}` : ''}`;
  };

  const getCategoryLabel = (c: string) => {
    const map: Record<string, string> = {
      ECONOMY: carsTxt('economy'),
      SUV: carsTxt('suv'),
      LUXURY: carsTxt('luxury'),
      VAN: carsTxt('van'),
    };
    return map[c] ?? c;
  };

  const getLandmarkLabel = (l: Landmark) => (isAr ? (l.nameAr ?? l.name) : l.name);

  return (
    <div
      className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab('trip')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold transition ${
            activeTab === 'trip'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <MapPin size={20} aria-hidden />
          {txt('bookTrip')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('car')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold transition ${
            activeTab === 'car'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Car size={20} aria-hidden />
          {txt('rentCarTab')}
        </button>
      </div>

      {/* Trip form */}
      {activeTab === 'trip' && (
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {txt('destination')}
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">{txt('chooseDestination')}</option>
                {landmarks.map((lm) => (
                  <option key={lm.id} value={lm.id}>
                    {getLandmarkLabel(lm)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {txt('tripType')}
              </label>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">{t.tripsPage?.tripTypeAll ?? 'الكل'}</option>
                <option value="GROUP">{t.tripsPage?.tripTypeGroup ?? 'جماعية'}</option>
                <option value="INDIVIDUAL">{t.tripsPage?.tripTypeIndividual ?? 'فردية'}</option>
                <option value="MARINE">{t.tripsPage?.tripTypeMarine ?? 'بحرية'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {txt('peopleCount')}
              </label>
              <select
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {PEOPLE_OPTIONS.map(({ value, labelKey }) => (
                  <option key={value} value={value}>
                    {txt(labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Link
            href={buildTripsUrl()}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-medium text-white bg-[rgb(255,138,0)] hover:bg-[rgb(230,124,0)] transition"
          >
            <Search size={20} aria-hidden />
            {txt('searchTrips')}
          </Link>
        </div>
      )}

      {/* Car form */}
      {activeTab === 'car' && (
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {txt('carCategory')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">{txt('chooseCategory')}</option>
                {CAR_CATEGORIES.filter(Boolean).map((c) => (
                  <option key={c} value={c}>
                    {getCategoryLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {txt('seats')}
              </label>
              <select
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">{carsTxt('all')}</option>
                <option value="4-5">{carsTxt('seats45')}</option>
                <option value="6-7">{carsTxt('seats67')}</option>
                <option value="8+">{carsTxt('seats8plus')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {carsTxt('transmission')}
              </label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">{carsTxt('all')}</option>
                <option value="AUTOMATIC">{carsTxt('automatic')}</option>
                <option value="MANUAL">{carsTxt('manual')}</option>
              </select>
            </div>
          </div>
          <Link
            href={buildCarsUrl()}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-medium text-white bg-[rgb(255,138,0)] hover:bg-[rgb(230,124,0)] transition"
          >
            <Search size={20} aria-hidden />
            {txt('searchCars')}
          </Link>
        </div>
      )}
    </div>
  );
}
