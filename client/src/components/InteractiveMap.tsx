import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LatLng, MobilityOption, TransportMode } from '../types/index.js';

// Color map for polyline by mode
const MODE_COLORS: Record<TransportMode, string> = {
  bus: '#f97316',       // Orange
  metro: '#3b82f6',     // Blue
  train: '#8b5cf6',     // Purple
  car: '#ef4444',       // Red
  walk: '#10b981',      // Emerald Green
  cycle: '#14b8a6',     // Teal
  multimodal: '#06b6d4',// Cyan
};

// Google Maps Dark Cockpit Theme
const GOOGLE_MAPS_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#064e3b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#10b981' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#0369a1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0c4a6e' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bae6fd' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e1b4b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a855f7' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#020617' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284c7' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#020617' }],
  },
];

interface InteractiveMapProps {
  origin: string;
  destination: string;
  originCoords: LatLng;
  destinationCoords: LatLng;
  selectedOption: MobilityOption | null;
}

// Script loader helper for Google Maps JavaScript API
function loadGoogleMapsScript(apiKey: string): Promise<boolean> {
  if (typeof (window as any).google?.maps === 'object') {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    // If a script already exists with an old key, remove it first
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      if (typeof (window as any).google?.maps === 'object') {
        resolve(true);
        return;
      }
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Google Maps] Failed to load script from googleapis.com');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  origin,
  destination,
  originCoords,
  destinationCoords,
  selectedOption,
}) => {
  const apiKey =
    ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) ||
    'AIzaSyBVCaabFkjhyRrrFKo8J7mOjg6on16qk5E';

  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);
  const [googleAuthError, setGoogleAuthError] = useState<boolean>(false);
  const [trafficEnabled, setTrafficEnabled] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'dark' | 'satellite'>('dark');

  // DOM Container references
  const gmapContainerRef = useRef<HTMLDivElement>(null);
  const leafletContainerRef = useRef<HTMLDivElement>(null);

  // Google Maps instances
  const gmapInstanceRef = useRef<any>(null);
  const gmapMarkersRef = useRef<any[]>([]);
  const gmapPolylinesRef = useRef<any[]>([]);
  const gmapTrafficLayerRef = useRef<any>(null);

  // Leaflet instances
  const leafletInstanceRef = useRef<L.Map | null>(null);
  const leafletLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // 1. Hook auth failure callback & load Google Maps script
  useEffect(() => {
    // Detect if Google Maps throws an authentication failure
    (window as any).gm_authFailure = () => {
      console.warn('[Google Maps] API Key authentication failed. Switching to Leaflet OpenStreetMap.');
      setGoogleAuthError(true);
      setMapEngine('leaflet');
    };

    if (apiKey) {
      loadGoogleMapsScript(apiKey).then((success) => {
        if (success && (window as any).google?.maps) {
          setGoogleLoaded(true);
          setMapEngine('google');
        } else {
          setMapEngine('leaflet');
        }
      });
    } else {
      setMapEngine('leaflet');
    }
  }, [apiKey]);

  // 2. Initialize / Update Google Maps
  useEffect(() => {
    if (!googleLoaded || !gmapContainerRef.current) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    if (!gmapInstanceRef.current) {
      const map = new google.maps.Map(gmapContainerRef.current, {
        center: { lat: originCoords.lat, lng: originCoords.lng },
        zoom: 13,
        styles: mapType === 'dark' ? GOOGLE_MAPS_DARK_STYLE : undefined,
        mapTypeId: mapType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });

      gmapInstanceRef.current = map;

      const traffic = new google.maps.TrafficLayer();
      gmapTrafficLayerRef.current = traffic;
      if (trafficEnabled) {
        traffic.setMap(map);
      }
    } else {
      const map = gmapInstanceRef.current;
      map.setOptions({
        styles: mapType === 'dark' ? GOOGLE_MAPS_DARK_STYLE : undefined,
        mapTypeId: mapType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
      });
      if (gmapTrafficLayerRef.current) {
        gmapTrafficLayerRef.current.setMap(trafficEnabled ? map : null);
      }
    }

    const map = gmapInstanceRef.current;

    // Clear existing markers & polylines
    gmapMarkersRef.current.forEach((m) => m.setMap(null));
    gmapMarkersRef.current = [];
    gmapPolylinesRef.current.forEach((p) => p.setMap(null));
    gmapPolylinesRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    // Origin Marker
    const originMarker = new google.maps.Marker({
      position: { lat: originCoords.lat, lng: originCoords.lng },
      map,
      title: `Origin: ${origin}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });
    bounds.extend({ lat: originCoords.lat, lng: originCoords.lng });

    const originInfo = new google.maps.InfoWindow({
      content: `<div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 4px;">
        <strong style="color: #10b981;">● Origin</strong><br/>
        <b>${origin}</b>
      </div>`,
    });
    originMarker.addListener('click', () => originInfo.open(map, originMarker));
    gmapMarkersRef.current.push(originMarker);

    // Destination Marker
    const destMarker = new google.maps.Marker({
      position: { lat: destinationCoords.lat, lng: destinationCoords.lng },
      map,
      title: `Destination: ${destination}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });
    bounds.extend({ lat: destinationCoords.lat, lng: destinationCoords.lng });

    const destInfo = new google.maps.InfoWindow({
      content: `<div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 4px;">
        <strong style="color: #ef4444;">● Final Destination</strong><br/>
        <b>${destination}</b>
      </div>`,
    });
    destMarker.addListener('click', () => destInfo.open(map, destMarker));
    gmapMarkersRef.current.push(destMarker);

    // Draw Polyline for active route
    if (selectedOption && selectedOption.pathCoordinates.length > 0) {
      const path = selectedOption.pathCoordinates.map((p) => ({ lat: p.lat, lng: p.lng }));
      path.forEach((pt) => bounds.extend(pt));

      const color = MODE_COLORS[selectedOption.mode] || '#06b6d4';

      // Glow outline line
      const glowPolyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.35,
        strokeWeight: 8,
        map,
      });
      gmapPolylinesRef.current.push(glowPolyline);

      // Core line
      const corePolyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.95,
        strokeWeight: 4,
        map,
      });
      gmapPolylinesRef.current.push(corePolyline);

      // Intermediate step stops
      if (selectedOption.steps && selectedOption.steps.length > 1) {
        selectedOption.steps.forEach((step, idx) => {
          if (idx === 0 || idx === selectedOption.steps.length - 1) return;
          const ratio = idx / selectedOption.steps.length;
          const coordIndex = Math.min(
            selectedOption.pathCoordinates.length - 1,
            Math.floor(ratio * selectedOption.pathCoordinates.length)
          );
          const pt = selectedOption.pathCoordinates[coordIndex];

          const stopMarker = new google.maps.Marker({
            position: { lat: pt.lat, lng: pt.lng },
            map,
            title: `Step ${idx + 1}: ${step.instruction}`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 5,
              fillColor: '#0f172a',
              fillOpacity: 1,
              strokeColor: color,
              strokeWeight: 2,
            },
          });

          const stopInfo = new google.maps.InfoWindow({
            content: `<div style="color: #0f172a; font-family: sans-serif; font-size: 11px; padding: 2px;">
              <strong style="color: ${color}; text-transform: uppercase;">Step ${idx + 1} (${step.mode})</strong><br/>
              ${step.instruction}
            </div>`,
          });
          stopMarker.addListener('click', () => stopInfo.open(map, stopMarker));
          gmapMarkersRef.current.push(stopMarker);
        });
      }
    }

    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [googleLoaded, origin, destination, originCoords, destinationCoords, selectedOption, mapType, trafficEnabled]);

  // 3. Initialize / Update Leaflet Map
  useEffect(() => {
    if (!leafletContainerRef.current) return;

    if (!leafletInstanceRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: [originCoords.lat, originCoords.lng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      leafletLayerGroupRef.current = L.layerGroup().addTo(map);
      leafletInstanceRef.current = map;
    }

    const map = leafletInstanceRef.current;
    const layerGroup = leafletLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Origin Marker
    const originMarker = L.circleMarker([originCoords.lat, originCoords.lng], {
      radius: 8,
      fillColor: '#10b981',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1,
    }).bindPopup(`<b>Origin:</b> ${origin}`);
    layerGroup.addLayer(originMarker);

    // Destination Marker
    const destMarker = L.circleMarker([destinationCoords.lat, destinationCoords.lng], {
      radius: 8,
      fillColor: '#ef4444',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1,
    }).bindPopup(`<b>Destination:</b> ${destination}`);
    layerGroup.addLayer(destMarker);

    // Polyline
    if (selectedOption && selectedOption.pathCoordinates.length > 0) {
      const latLngs = selectedOption.pathCoordinates.map((p) => [p.lat, p.lng] as [number, number]);
      const color = MODE_COLORS[selectedOption.mode] || '#06b6d4';

      const glow = L.polyline(latLngs, { color, weight: 8, opacity: 0.35 });
      layerGroup.addLayer(glow);

      const line = L.polyline(latLngs, { color, weight: 4, opacity: 0.95 });
      layerGroup.addLayer(line);

      const bounds = L.latLngBounds([
        [originCoords.lat, originCoords.lng],
        [destinationCoords.lat, destinationCoords.lng],
        ...latLngs,
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [origin, destination, originCoords, destinationCoords, selectedOption]);

  // Handle engine toggle resize
  const handleSwitchEngine = (engine: 'google' | 'leaflet') => {
    setMapEngine(engine);
    setTimeout(() => {
      if (engine === 'google' && gmapInstanceRef.current) {
        const google = (window as any).google;
        if (google?.maps?.event) {
          google.maps.event.trigger(gmapInstanceRef.current, 'resize');
        }
      } else if (engine === 'leaflet' && leafletInstanceRef.current) {
        leafletInstanceRef.current.invalidateSize();
      }
    }, 100);
  };

  return (
    <div className="relative w-full h-[420px] lg:h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Both map containers are always present to preserve initialized state */}
      <div
        ref={gmapContainerRef}
        style={{ display: mapEngine === 'google' ? 'block' : 'none', width: '100%', height: '100%' }}
      />
      <div
        ref={leafletContainerRef}
        style={{ display: mapEngine === 'leaflet' ? 'block' : 'none', width: '100%', height: '100%' }}
      />

      {/* Top Left Engine & Controls Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-xl text-xs">
        <button
          type="button"
          onClick={() => handleSwitchEngine('google')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
            mapEngine === 'google'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Google Maps
        </button>

        <button
          type="button"
          onClick={() => handleSwitchEngine('leaflet')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
            mapEngine === 'leaflet'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          OpenStreetMap
        </button>

        {mapEngine === 'google' && (
          <>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={() => setTrafficEnabled(!trafficEnabled)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                trafficEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Live Traffic Layer"
            >
              🚦 Traffic {trafficEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() => setMapType(mapType === 'dark' ? 'satellite' : 'dark')}
              className="px-2 py-1 rounded-lg text-[11px] text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
            >
              {mapType === 'dark' ? '🛰️ Satellite' : '🌙 Dark'}
            </button>
          </>
        )}
      </div>

      {/* Auth error advisory banner if key is restricted */}
      {googleAuthError && (
        <div className="absolute bottom-3 left-3 z-[1000] max-w-sm px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-200 text-[11px] shadow-lg">
          ⚠️ Google Maps authorization fallback active (showing OpenStreetMap).
        </div>
      )}

      {/* Floating Map Legend (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 shadow-xl space-y-1">
        <div className="font-semibold text-white mb-1 flex items-center justify-between gap-3">
          <span>Route Corridor</span>
          <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
            {mapEngine === 'google' ? 'Google API' : 'Leaflet OSM'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="truncate max-w-[130px]">{origin}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="truncate max-w-[130px]">{destination}</span>
        </div>
        {selectedOption && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-cyan-400 font-medium">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: MODE_COLORS[selectedOption.mode] }}
            />
            <span className="capitalize">
              {selectedOption.mode} ({selectedOption.durationMin}m)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
