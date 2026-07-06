export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://thecrochetcovern.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ message: "Checkout API is working" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, description, items } = req.body;

    const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        checkout_reference: "TCC-" + Date.now(),
        amount: Number(amount),
        currency: "GBP",
        merchant_code: "MJNF1P3K",
        description: description,
        hosted_checkout: {
          enabled: true
        },
        redirect_url: "https://thecrochetcovern.github.io/"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    if (items && Array.isArray(items)) {
      for (const item of items) {
        const productResponse = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/products?name=eq.${encodeURIComponent(item.name)}&select=stock`,
          {
            headers: {
              apikey: process.env.SUPABASE_KEY,
              Authorization: `Bearer ${process.env.SUPABASE_KEY}`
            }
          }
        );

        const products = await productResponse.json();

        if (products.length > 0) {
          const currentStock = products[0].stock;
          const newStock = Math.max(currentStock - 1, 0);

          await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/products?name=eq.${encodeURIComponent(item.name)}`,
            {
              method: "PATCH",
              headers: {
                apikey: process.env.SUPABASE_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal"
              },
              body: JSON.stringify({
                stock: newStock,
                available: newStock > 0
              })
            }
          );
        }
      }
    }

    return res.status(200).json({
      url: data.hosted_checkout_url,
      checkoutId: data.id
    });

  } catch (error) {
    return res.status(500).json({ error: "Checkout failed" });
  }
}
