'use client';

import { useEffect, useRef } from 'react';
import { Vendor } from './SalonCard'; // Re-use the interface

export default function MapView({ vendors }: { vendors: Vendor[] }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersGroupRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;

    const setupMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        map = L.map(mapContainerRef.current, {
          center: [28.6139, 77.2090],
          zoom: 11,
          zoomControl: false
        });
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        markersGroupRef.current = L.featureGroup().addTo(map);
      } else {
        map = mapInstanceRef.current;
      }

      map.invalidateSize();
      renderMarkers(map, L);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderMarkers = (mapInstance: any, L: any) => {
      if (!markersGroupRef.current) return;
      markersGroupRef.current.clearLayers();

      vendors.forEach((vendor) => {
        // @ts-ignore - Handle coordinates
        const lat = vendor.coordinates?.lat || 28.6139 + (Math.random() - 0.5) * 0.1;
        // @ts-ignore
        const lng = vendor.coordinates?.lng || 77.2090 + (Math.random() - 0.5) * 0.1;

        const pulsingIcon = L.divIcon({
          className: 'bg-transparent border-none',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
              <span class="animate-ping" style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: #8f3546; opacity: 0.4;"></span>
              <span style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #8f3546; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="padding: 8px; min-width: 200px; font-family: sans-serif;">
            <img style="width: 100%; height: 96px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" src="${vendor.image_url}" alt="${vendor.name}" />
            <h4 style="font-weight: bold; font-size: 14px; color: #8f3546; margin: 0;">${vendor.name}</h4>
            <p style="font-size: 12px; color: #6b7280; margin: 2px 0 8px 0;">${vendor.location}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px; border-top: 1px solid #f3f4f6;">
              <span style="font-size: 12px; font-weight: bold; color: #111827;">₹${vendor.starting_price.toLocaleString()}</span>
              <span style="font-size: 12px; font-weight: bold; color: #8f3546;">★ ${vendor.rating}</span>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: pulsingIcon }).bindPopup(popupContent);
        markersGroupRef.current.addLayer(marker);
      });

      if (vendors.length > 0) {
        const bounds = markersGroupRef.current.getBounds();
        mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    };

    setupMap();
  }, [vendors]);

  return (
    <div className="w-full h-[650px] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg z-20 border border-gray-100/50 max-w-xs hidden md:block">
        <h4 className="font-bold text-[#8f3546]">Dynamic Mapping</h4>
        <p className="text-xs text-gray-500 mt-1">Showing {vendors.length} matches dynamically plotted.</p>
      </div>
    </div>
  );
}