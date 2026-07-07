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
    return res.status(200).json({ message: "Checkout API is working" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, description, items, customer } = req.body;
    const checkoutRef = "TCC-" + Date.now();

    const sumupResponse = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        checkout_reference: checkoutRef,
        amount: Number(amount),
        currency: "GBP",
        merchant_code: "MJNF1P3K",
        description,
        hosted_checkout: {
          enabled: true
        },
        redirect_url: `https://thecrochetcovern.co.uk/thankyou.html?checkout=${checkoutRef}`
      })
    });

    const sumupData = await sumupResponse.json();

    if (!sumupResponse.ok) {
      return res.status(sumupResponse.status).json(sumupData);
    }

const supabaseResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders`, {
  method: "POST",
  headers: {
    apikey: process.env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation"
  },
  body: JSON.stringify({
    checkout_id: sumupData.id,
    checkout_ref: checkoutRef,
    customer,
    items,
    amount: Number(amount),
    paid: false,
    email_sent: false
  })
});

const supabaseResult = await supabaseResponse.json();

if (!supabaseResponse.ok) {
  console.log("SUPABASE ERROR:", supabaseResult);

  return res.status(500).json({
    error: "Order could not be saved",
    details: supabaseResult
  });
}

console.log("ORDER SAVED:", supabaseResult);  });

    return res.status(200).json({
      url: sumupData.hosted_checkout_url,
      checkoutId: sumupData.id,
      checkoutRef
    });

  } catch (error) {
    return res.status(500).json({ error: "Checkout failed" });
  }
}
