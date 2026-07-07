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
    const { checkoutId } = req.body;

    if (!checkoutId) {
      return res.status(400).json({ error: "Missing checkoutId" });
    }

    const sumupResponse = await fetch(`https://api.sumup.com/v0.1/checkouts/${checkoutId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const sumupData = await sumupResponse.json();

    if (!sumupResponse.ok) {
      return res.status(sumupResponse.status).json(sumupData);
    }

    const paid = sumupData.status === "PAID";

    const orderResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?checkout_id=eq.${checkoutId}&select=*`,
      {
        method: "GET",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );

    const orders = await orderResponse.json();
    const order = orders[0];

    if (!order) {
      return res.status(404).json({ error: "Order not found", paid });
    }

    if (paid && !order.email_sent) {
      const customer = order.customer;
      const items = order.items || [];

      const itemList = items
        .map(item => `${item.name} - £${item.price || ""}`)
        .join("<br>");

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "The Crochet Covern Orders <orders@thecrochetcovern.co.uk>",
          to: ["thecrochetcovern@gmail.com"],
          reply_to: customer.email,
          subject: `🧶 PAID Order - ${order.checkout_ref}`,
          html: `
            <h2>🧶 Paid Crochet Order</h2>

            <p><strong>Order Reference:</strong> ${order.checkout_ref}</p>
            <p><strong>Total Paid:</strong> £${order.amount}</p>

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
              Payment has been confirmed through SumUp.
              This order is ready to package and dispatch.
            </p>
          `
        })
      });

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "The Crochet Covern <orders@thecrochetcovern.co.uk>",
          to: [customer.email],
          reply_to: "support@thecrochetcovern.co.uk",
          subject: "Your Crochet Covern order has been received 🧶",
          html: `
            <div style="font-family: Georgia, serif; background:#faf7f5; padding:30px; color:#3b2f2f;">
              <div style="max-width:620px; margin:auto; background:#fffdfc; border-radius:24px; padding:30px; border:2px dashed #ead8d2;">
                
                <h1 style="text-align:center; color:#5f4b45;">
                  Thank you${customer.fullName ? `, ${customer.fullName}` : ""} 🧶✨
                </h1>

                <p style="font-size:16px; line-height:1.8;">
                  Your Crochet Covern order has been received, and your handmade friend is now getting ready for its journey home.
                </p>

                <div style="background:#edf6ea; padding:18px; border-radius:18px; margin:22px 0;">
                  <h2 style="margin-top:0;">Order Details</h2>
                  <p><strong>Order:</strong><br>${itemList}</p>
                  <p><strong>Total:</strong> £${order.amount}</p>
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

      await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/orders?checkout_id=eq.${checkoutId}`,
        {
          method: "PATCH",
          headers: {
            apikey: process.env.SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify({
            paid: true,
            email_sent: true
          })
        }
      );
    }

    return res.status(200).json({
      paid,
      status: sumupData.status,
      checkoutId: sumupData.id
    });

  } catch (error) {
    return res.status(500).json({ error: "Payment check failed" });
  }
}
