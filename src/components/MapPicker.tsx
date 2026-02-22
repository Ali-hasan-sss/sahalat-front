'use client';

import { useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// إصلاح أيقونة الـ marker الافتراضية في Leaflet مع Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// مركز سلطنة عُمان
const OMAN_CENTER: [number, number] = [21.47, 56.0];
const DEFAULT_ZOOM = 7;

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    },
  });
  return null;
}

type MapPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
  height?: string;
  className?: string;
};

export function MapPicker({
  latitude,
  longitude,
  onChange,
  height = '320px',
  className = '',
}: MapPickerProps) {
  const position: [number, number] | null =
    latitude != null && longitude != null ? [latitude, longitude] : null;

  const handleSelect = useCallback(
    (lat: number, lng: number) => {
      onChange(lat, lng);
    },
    [onChange]
  );

  return (
    <div className={`rounded-lg overflow-hidden border dark:border-slate-600 ${className}`} style={{ height }}>
      <MapContainer
        center={position ?? OMAN_CENTER}
        zoom={position ? 14 : DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelect={handleSelect} />
        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  );
}
