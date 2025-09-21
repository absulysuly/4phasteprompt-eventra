// Simple Nominatim-based geocoding (free). Respect rate limits.
// For production scale, consider hosted providers (MapTiler, LocationIQ).

export type GeoPoint = { lat: number; lon: number };

export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  if (!address) return null;
  const params = new URLSearchParams({
    format: 'json',
    q: address,
    limit: '1'
  });
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        // Identify your app; replace with your contact if desired
        'User-Agent': 'Eventra-SaaS/1.0'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      const lat = parseFloat(first.lat);
      const lon = parseFloat(first.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    }
    return null;
  } catch {
    return null;
  }
}
