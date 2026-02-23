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

export default function DashboardMap({ meetups = [], userLat, userLng, radiusMiles = 50 }) {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const withCoords = useMemo(
    () => meetups.filter((m) => m.lat != null && m.lng != null),
    [meetups]
  );

  const hasUserLocation = userLat != null && userLng != null;
  const center = useMemo(() => {
    if (hasUserLocation) return [userLat, userLng];
    if (withCoords.length > 0) {
      const sumLat = withCoords.reduce((a, m) => a + m.lat, 0);
      const sumLng = withCoords.reduce((a, m) => a + m.lng, 0);
      return [sumLat / withCoords.length, sumLng / withCoords.length];
    }
    return DEFAULT_CENTER;
  }, [userLat, userLng, hasUserLocation, withCoords]);

  const maxBounds = useMemo(() => {
    if (!hasUserLocation) return undefined;
    return boundsForRadius(userLat, userLng, radiusMiles);
  }, [hasUserLocation, userLat, userLng, radiusMiles]);

  return (
    <div className="dashboard-map-wrap">
      <MapContainer
        center={center}
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
        {withCoords.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>
              <Link to={`/meetups/${m.id}`} style={{ fontWeight: 600 }}>{m.title}</Link>
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
