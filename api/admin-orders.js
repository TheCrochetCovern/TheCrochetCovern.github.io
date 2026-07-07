export default async function handler(req, res) {
  const allowedOrigins = [
    "https://thecrochetcovern.co.uk",
    "http://thecrochetcovern.co.uk",
    "https://thecrochetcovern.github.io"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ message: "Admin orders API is working" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`,
      {
        method: "GET",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );

    const orders = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(orders);
    }

    return res.status(200).json({ orders });

  } catch (error) {
    return res.status(500).json({ error: "Could not load orders" });
  }
}
