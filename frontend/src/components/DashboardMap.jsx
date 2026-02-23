import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MILES_PER_DEG_LAT = 69;

function boundsForRadius(centerLat, centerLng, radiusMiles) {
  const deltaLat = radiusMiles / MILES_PER_DEG_LAT;
  const deltaLng = radiusMiles / (MILES_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180));
  return L.latLngBounds(
    [centerLat - deltaLat, centerLng - deltaLng],
    [centerLat + deltaLat, centerLng + deltaLng]
  );
}

function FitBounds({ meetups, maxZoom }) {
  const map = useMap();
  const withCoords = useMemo(() => meetups.filter((m) => m.lat != null && m.lng != null), [meetups]);
  useEffect(() => {
    if (withCoords.length === 0) return;
    if (withCoords.length === 1) {
      map.setView([withCoords[0].lat, withCoords[0].lng], Math.min(14, maxZoom));
      return;
    }
    const bounds = L.latLngBounds(withCoords.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [24, 24], maxZoom });
  }, [map, withCoords, maxZoom]);
  return null;
}

const DEFAULT_CENTER = [40.7, -74];
const ZOOM_MIN = 9;
const ZOOM_MAX = 17;

function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : undefined;
}

export default function DashboardMap({ meetups = [], userLat, userLng, radiusMiles = 50 }) {
  useEffect(() => {
    try {
      if (L.Icon.Default?.prototype?._getIconUrl) delete L.Icon.Default.prototype._getIconUrl;
      if (L.Icon.Default?.mergeOptions) {
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      }
    } catch (_) {}
  }, []);

  const withCoords = useMemo(
    () => (Array.isArray(meetups) ? meetups : []).filter((m) => m && safeNum(m.lat) != null && safeNum(m.lng) != null),
    [meetups]
  );

  const lat = safeNum(userLat);
  const lng = safeNum(userLng);
  const hasUserLocation = lat != null && lng != null;
  const center = useMemo(() => {
    if (hasUserLocation) return [lat, lng];
    if (withCoords.length > 0) {
      const sumLat = withCoords.reduce((a, m) => a + (safeNum(m.lat) ?? 0), 0);
      const sumLng = withCoords.reduce((a, m) => a + (safeNum(m.lng) ?? 0), 0);
      return [sumLat / withCoords.length, sumLng / withCoords.length];
    }
    return DEFAULT_CENTER;
  }, [lat, lng, hasUserLocation, withCoords]);

  const maxBounds = useMemo(() => {
    if (!hasUserLocation || lat == null || lng == null) return undefined;
    return boundsForRadius(lat, lng, radiusMiles);
  }, [hasUserLocation, lat, lng, radiusMiles]);

  const [cLat, cLng] = center;
  if (!Number.isFinite(cLat) || !Number.isFinite(cLng)) {
    return (
      <div className="dashboard-map-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Map unavailable
      </div>
    );
  }

  return (
    <div className="dashboard-map-wrap">
      <MapContainer
        center={[cLat, cLng]}
        zoom={10}
        minZoom={ZOOM_MIN}
        maxZoom={ZOOM_MAX}
        maxBounds={maxBounds}
        maxBoundsViscosity={1}
        className="dashboard-map"
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-card)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.length > 0 && <FitBounds meetups={withCoords} maxZoom={ZOOM_MAX} />}
        {withCoords.map((m, i) => (
          <Marker key={m?.id ?? i} position={[safeNum(m.lat) ?? 0, safeNum(m.lng) ?? 0]}>
            <Popup>
              <Link to={`/meetups/${m?.id ?? ''}`} style={{ fontWeight: 600 }}>{m?.title ?? 'Meetup'}</Link>
              {m.location && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{m.location}</div>}
              {m.meetupAt && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {new Date(m.meetupAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
