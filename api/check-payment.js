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
    return res.status(200).json({ message: "Payment check API is working" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      checkoutId,
      customerEmail,
      customerName,
      orderDescription,
      orderTotal
    } = req.body;

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

    const paid = data.status === "PAID";

    if (paid && customerEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "The Crochet Covern <orders@thecrochetcovern.co.uk>",
          to: [customerEmail],
          reply_to: "support@thecrochetcovern.co.uk",
          subject: "Your Crochet Covern order has been received 🧶",
          html: `
            <div style="font-family: Georgia, serif; background:#faf7f5; padding:30px; color:#3b2f2f;">
              <div style="max-width:620px; margin:auto; background:#fffdfc; border-radius:24px; padding:30px; border:2px dashed #ead8d2;">
                
                <h1 style="text-align:center; color:#5f4b45;">
                  Thank you${customerName ? `, ${customerName}` : ""} 🧶✨
                </h1>

                <p style="font-size:16px; line-height:1.8;">
                  Your Crochet Covern order has been received, and your handmade friend is now getting ready for its journey home.
                </p>

                <div style="background:#edf6ea; padding:18px; border-radius:18px; margin:22px 0;">
                  <h2 style="margin-top:0;">Order Details</h2>
                  <p><strong>Order:</strong> ${orderDescription || data.description}</p>
                  <p><strong>Total:</strong> £${orderTotal || data.amount}</p>
                </div>

                <p style="font-size:16px; line-height:1.8;">
                  I’ll carefully package your order and aim to post it within 
                  <strong>1–3 working days</strong>. 
                </p>

                <p style="font-size:16px; line-height:1.8;">
                  Thank you so much for supporting my small handmade business. 
                  Every order means the world and helps The Crochet Covern grow stitch by stitch.
                </p>

                <p style="font-size:16px; line-height:1.8;">
                  With love,<br>
                  <strong>Melodie</strong><br>
                  The Crochet Covern
                </p>

                <p style="font-size:13px; color:#7a6a6a; text-align:center; margin-top:30px;">
                  Need help? Email support@thecrochetcovern.co.uk
                </p>

              </div>
            </div>
          `
        })
      });
    }

    return res.status(200).json({
      paid,
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
