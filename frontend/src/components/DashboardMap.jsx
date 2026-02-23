import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function FitBounds({ meetups }) {
  const map = useMap();
  const withCoords = useMemo(() => meetups.filter((m) => m.lat != null && m.lng != null), [meetups]);
  useEffect(() => {
    if (withCoords.length === 0) return;
    if (withCoords.length === 1) {
      map.setView([withCoords[0].lat, withCoords[0].lng], 12);
      return;
    }
    const bounds = L.latLngBounds(withCoords.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
  }, [map, withCoords]);
  return null;
}

const DEFAULT_CENTER = [40.7, -74]; // fallback when no user location or markers

export default function DashboardMap({ meetups = [], userLat, userLng }) {
  // Fix default marker icon in bundlers (Vite/webpack)
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
  const center = useMemo(() => {
    if (userLat != null && userLng != null) return [userLat, userLng];
    if (withCoords.length > 0) {
      const sumLat = withCoords.reduce((a, m) => a + m.lat, 0);
      const sumLng = withCoords.reduce((a, m) => a + m.lng, 0);
      return [sumLat / withCoords.length, sumLng / withCoords.length];
    }
    return DEFAULT_CENTER;
  }, [userLat, userLng, withCoords]);

  return (
    <div className="dashboard-map-wrap">
      <MapContainer
        center={center}
        zoom={10}
        className="dashboard-map"
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-card)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.length > 0 && <FitBounds meetups={withCoords} />}
        {withCoords.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>
              <Link to={`/meetups/${m.id}`} style={{ fontWeight: 600 }}>{m.title}</Link>
              {m.location && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{m.location}</div>}
              {m.meetupAt && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {new Date(m.meetupAt).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
