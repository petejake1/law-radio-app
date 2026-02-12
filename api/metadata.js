export default async function handler(req, res) {
  const { url } = req.query;

  try {
    const response = await fetch(url, { method: "HEAD" });
    const title = response.headers.get("icy-name");
    res.status(200).json({ title });
  } catch {
    res.status(200).json({ title: null });
  }
}
