import jwt from "jsonwebtoken";

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLon = (lon2 - lon1) * Math.PI/180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2) *
    Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export default async function handler(req, res) {
  const { lat, lon, type, token } = req.query;

  let isPremium = false;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      isPremium = decoded.premium;
    } catch {}
  }

  const apiUrl = `https://de1.api.radio-browser.info/json/stations/search?tag=${type}&has_geo_info=true&limit=50`;
  const response = await fetch(apiUrl);
  const stations = await response.json();

  const ranked = stations
    .filter(s => s.url_resolved && s.geo_lat && s.geo_long)
    .map(s => ({
      name: s.name,
      stream: s.url_resolved,
      lat: parseFloat(s.geo_lat),
      lon: parseFloat(s.geo_long),
      metadata: s.tags,
      distance: haversine(lat, lon, s.geo_lat, s.geo_long)
    }))
    .sort((a,b) => a.distance - b.distance)
    .slice(0, isPremium ? 20 : 5);

  res.status(200).json({ feeds: ranked });
}
