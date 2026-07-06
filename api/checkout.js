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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ message: "Checkout API is working" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, description, items, customer } = req.body;
    const checkoutRef = "TCC-" + Date.now();

    const itemList = items
      .map(item => `${item.name} - £${item.price || ""}`)
      .join("<br>");

    const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
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
        description: description,
        hosted_checkout: {
          enabled: true
        },
        redirect_url: `https://thecrochetcovern.co.uk/thankyou.html?checkout=${checkoutRef}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
      from: "The Crochet Covern Orders <orders@thecrochetcovern.co.uk>",
      to: ["melodiemay@thecrochetcovern.co.uk"],
        reply_to: customer.email,
        subject: `🧶 New Crochet Order - ${checkoutRef}`,
        html: `
          <h2>🧶 New Crochet Order</h2>

          <p><strong>Order Reference:</strong> ${checkoutRef}</p>
          <p><strong>Total:</strong> £${amount}</p>

          <h3>Items</h3>
          <p>${itemList}</p>

          <h3>Customer Details</h3>
          <p>
            <strong>Name:</strong> ${customer.fullName}<br>
            <strong>Email:</strong> ${customer.email}<br>
            <strong>Address:</strong> ${customer.address}<br>
            <strong>Town/City:</strong> ${customer.town}<br>
            <strong>Postcode:</strong> ${customer.postcode}<br>
            <strong>Notes:</strong> ${customer.notes || "None"}
          </p>

          <p>
            Payment checkout has been created through SumUp.
            Check SumUp to confirm payment before dispatching.
          </p>
        `
      })
    });

    return res.status(200).json({
      url: data.hosted_checkout_url,
      checkoutId: data.id
    });

  } catch (error) {
    return res.status(500).json({ error: "Checkout failed" });
  }
}
