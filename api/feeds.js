export default async function handler(req, res) {
  const { lat, lon, type } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing location" });
  }

  try {
    const apiUrl = `https://de1.api.radio-browser.info/json/stations/search?limit=10&tag=${type}&has_geo_info=true`;

    const response = await fetch(apiUrl);
    const stations = await response.json();

    const feeds = stations
      .filter(s => s.url_resolved)
      .slice(0, 5)
      .map(s => ({
        name: s.name,
        location: s.country,
        stream: s.url_resolved
      }));

    res.status(200).json({ feeds });
  } catch (err) {
    res.status(500).json({ error: "Feed lookup failed" });
  }
}
