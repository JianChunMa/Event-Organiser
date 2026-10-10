/** Builds a Google Maps directions link from coordinates (preferred) or an address. */
export function buildMapsLink({ address, lat, lng } = {}) {
  const dest = Number.isFinite(lat) && Number.isFinite(lng) ? `${lat},${lng}` : (address || '').trim();
  if (!dest) return '';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}
