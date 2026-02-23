/**
 * Fetch place suggestions from OpenStreetMap Nominatim (no API key).
 * Usage policy: 1 request per second, set User-Agent.
 * @param {string} query - Search string (address or place name)
 * @returns {Promise<Array<{ display_name: string, lat: string, lon: string }>>}
 */
export async function searchPlaces(query) {
  const q = (query || '').trim();
  if (!q || q.length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q,
    format: 'json',
    limit: '5',
    addressdetails: '0',
  })}`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'BuddyMatch/1.0 (https://github.com/buddymatch)' },
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}
