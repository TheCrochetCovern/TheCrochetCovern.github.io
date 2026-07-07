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
    return res.status(200).json({ message: "Update stock API is working" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { itemName } = req.body;

    if (!itemName) {
      return res.status(400).json({ error: "Missing itemName" });
    }

    const productResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/products?name=eq.${encodeURIComponent(itemName)}&select=*`,
      {
        method: "GET",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );

    const products = await productResponse.json();
    const product = products[0];

    if (!product) {
      return res.status(404).json({ error: "Product not found", itemName });
    }

    const newStock = Math.max(Number(product.stock) - 1, 0);

    const updateResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`,
      {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          stock: newStock
        })
      }
    );

    const updated = await updateResponse.json();

    if (!updateResponse.ok) {
      return res.status(updateResponse.status).json(updated);
    }

    return res.status(200).json({
      message: "Stock updated",
      product: updated[0]
    });

  } catch (error) {
    return res.status(500).json({ error: "Could not update stock" });
  }
}
