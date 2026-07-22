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

    const {
      checkoutRef,
      productName,
      customerName,
      customerEmail,
      displayName,
      rating,
      review,
      photoUrl
    } = req.body;

    if (
      !checkoutRef ||
      !productName ||
      !customerName ||
      !customerEmail ||
      !rating ||
      !review
    ) {
      return res.status(400).json({
        error: "Missing required fields."
      });
    }

    const response = await fetch(

      `${process.env.SUPABASE_URL}/rest/v1/reviews`,

      {

        method: "POST",

        headers: {

          apikey: process.env.SUPABASE_SERVICE_KEY,

          Authorization:
            `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,

          "Content-Type":"application/json",

          Prefer:"return=representation"

        },

        body: JSON.stringify({

          checkout_ref: checkoutRef,

          product_name: productName,

          customer_name: customerName,

          customer_email: customerEmail,

          display_name:
            displayName || customerName,

          rating,

          review,

          photo_url: photoUrl || null,

          approved:false,

          featured:false

        })

      }

    );

    const result = await response.json();

    if (!response.ok) {

      console.log(result);

      return res.status(500).json({
        error:"Could not save review."
      });

    }

    return res.status(200).json({

      success:true,

      review:result

    });

  }

  catch(error){

    console.log(error);

    return res.status(500).json({
      error:"Server error."
    });

  }

}
