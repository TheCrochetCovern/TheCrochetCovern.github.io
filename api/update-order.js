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
    return res.status(200).json({ message: "Update order API is working" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { password, id, order_status, tracking_number } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Wrong password" });
    }

    if (!id) {
      return res.status(400).json({ error: "Missing order id" });
    }

    const updateData = {};

    if (order_status) {
      updateData.order_status = order_status;
    }

    if (tracking_number !== undefined) {
      updateData.tracking_number = tracking_number;
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${id}`,
      {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(updateData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      message: "Order updated",
      order: data[0]
    });

  } catch (error) {
    return res.status(500).json({ error: "Could not update order" });
  }
}
