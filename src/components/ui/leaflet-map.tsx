import { useEffect, useRef } from 'react';
import type { Map } from 'leaflet';
import { brand } from '@/lib/brand';

export default function LeafletMap() {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const rawLatitude = import.meta.env.VITE_WORKSHOP_LATITUDE;
  const rawLongitude = import.meta.env.VITE_WORKSHOP_LONGITUDE;
  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);
  const hasLocation = Boolean(brand.address && rawLatitude && rawLongitude && Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180);
  useEffect(() => {
    if (!hasLocation || !container.current) return;
    let disposed = false;
    Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]).then(([{ default: L }]) => {
      if (disposed || !container.current || map.current) return;
      const instance = L.map(container.current, { center: [latitude, longitude], zoom: 16, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(instance);
      const label = document.createElement('span'); label.textContent = brand.name;
      label.style.cssText = 'background:var(--brand-navy);color:#fff;padding:8px 12px;white-space:nowrap';
      const popup = document.createElement('p'); popup.textContent = `${brand.name}: ${brand.address}`;
      L.marker([latitude, longitude], { icon: L.divIcon({ html: label, className: 'wills-map-label' }) }).addTo(instance).bindPopup(popup);
      map.current = instance;
    }).catch((error: unknown) => console.error('Unable to load workshop map', error));
    return () => { disposed = true; map.current?.remove(); map.current = null; };
  }, [hasLocation, latitude, longitude]);
  if (!brand.address) return null;
  return <section className="wills-section wills-container"><h2>Visit the workshop.</h2><p className="mt-6">{brand.address}</p>{hasLocation && <div ref={container} className="mt-8 h-[400px]" aria-label="Workshop location map" />}<a className="text-link" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`}>Open directions</a></section>;
}
