import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

/**
 * Creates custom styled HTML markers for Leaflet without external asset dependencies
 */
const createPinIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 11px;
          font-weight: bold;
        ">${label}</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

export function MapComponent({
  pickupCoords, // [lng, lat]
  destinationCoords, // [lng, lat]
  pickupLabel = 'Pickup',
  destinationLabel = 'Destination',
  pickupAddress = '',
  destinationAddress = '',
  height = '320px',
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Normalize coordinates: Leaflet uses [lat, lng], GeoJSON uses [lng, lat]
    const pLat = pickupCoords?.[1] || 40.7488;
    const pLng = pickupCoords?.[0] || -73.9851;

    const dLat = destinationCoords?.[1] || 40.7306;
    const dLng = destinationCoords?.[0] || -73.9352;

    const pickupLatLng = [pLat, pLng];
    const destLatLng = [dLat, dLng];

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: pickupLatLng,
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add Pickup Pin
    const pickupMarker = L.marker(pickupLatLng, {
      icon: createPinIcon('#059669', 'P'),
    })
      .addTo(map)
      .bindPopup(`<strong>${pickupLabel}</strong><br/>${pickupAddress || 'Donor Pickup Site'}`);

    // Add Destination Pin
    const destMarker = L.marker(destLatLng, {
      icon: createPinIcon('#0284c7', 'D'),
    })
      .addTo(map)
      .bindPopup(`<strong>${destinationLabel}</strong><br/>${destinationAddress || 'Recipient Shelter'}`);

    // Fit bounds to show both pins
    const bounds = L.latLngBounds([pickupLatLng, destLatLng]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

    // Attempt OSRM turn-by-turn route calculation with graceful fallback
    const fetchOsrmRoute = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s fallback timeout

        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const coordinates = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            const polyline = L.polyline(coordinates, {
              color: '#059669',
              weight: 4,
              opacity: 0.85,
            }).addTo(map);

            const distKm = (data.routes[0].distance / 1000).toFixed(1);
            const durationMins = Math.round(data.routes[0].duration / 60);
            setRouteInfo({ distanceKm: distKm, durationMins, mode: 'OSRM' });
            return;
          }
        }
      } catch (err) {
        // Fallback silently if offline or OSRM unavailable
      }

      // Graceful Fallback: Draw straight dashed line
      L.polyline([pickupLatLng, destLatLng], {
        color: '#0d9488',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.7,
      }).addTo(map);

      // Estimate distance straight-line
      const R = 6371;
      const dLatRad = ((dLat - pLat) * Math.PI) / 180;
      const dLonRad = ((dLng - pLng) * Math.PI) / 180;
      const a =
        Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
        Math.cos((pLat * Math.PI) / 180) * Math.cos((dLat * Math.PI) / 180) * Math.sin(dLonRad / 2) * Math.sin(dLonRad / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = (R * c).toFixed(1);
      const estMins = Math.max(10, Math.round((dist / 25) * 60));

      setRouteInfo({ distanceKm: dist, durationMins: estMins, mode: 'Direct Line Estimate' });
    };

    fetchOsrmRoute();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickupCoords, destinationCoords]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-cream-200 shadow-sm ${className}`}>
      <div ref={mapContainerRef} style={{ height, width: '100%', zIndex: 10 }} />

      {routeInfo && (
        <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-cream-200 shadow-sm text-xs font-semibold text-stone-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>~{routeInfo.distanceKm} km</span>
          <span className="text-stone-400">•</span>
          <span>~{routeInfo.durationMins} mins</span>
        </div>
      )}

      <div className="absolute bottom-2 left-2 z-20 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-stone-500">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}

