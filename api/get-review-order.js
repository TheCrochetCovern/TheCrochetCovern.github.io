export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { checkoutRef } = req.body;

    if (!checkoutRef) {
      return res.status(400).json({
        error: "Missing checkout reference."
      });
    }

    const response = await fetch(

      `${process.env.SUPABASE_URL}/rest/v1/orders?checkout_ref=eq.${checkoutRef}&select=*`,

      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }

    );

    const orders = await response.json();

    if (!orders.length) {
      return res.status(404).json({
        error: "Order not found."
      });
    }

    const order = orders[0];

    return res.status(200).json({

      checkoutRef: order.checkout_ref,

      customer: order.customer,

      items: order.items,

      amount: order.amount

    });

  }

  catch(error){

    console.log(error);

    return res.status(500).json({
      error:"Server error."
    });

  }

}
