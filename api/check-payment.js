export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://thecrochetcovern.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ message: "Payment check API is working" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { checkoutId } = req.body;

    if (!checkoutId) {
      return res.status(400).json({ error: "Missing checkoutId" });
    }

    const response = await fetch(`https://api.sumup.com/v0.1/checkouts/${checkoutId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      paid: data.status === "PAID",
      status: data.status,
      checkoutId: data.id,
      amount: data.amount,
      currency: data.currency,
      description: data.description
    });

  } catch (error) {
    return res.status(500).json({ error: "Payment check failed" });
  }
}
