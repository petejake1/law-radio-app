import jwt from "jsonwebtoken";

export default function handler(req, res) {
  const { username, password } = req.body;

  if (username === "admin" && password === "password") {
    const token = jwt.sign(
      { user: username, premium: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(200).json({ token });
  }

  res.status(401).json({ error: "Invalid credentials" });
}
