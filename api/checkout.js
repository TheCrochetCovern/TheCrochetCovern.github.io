import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {

  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://thecrochetcovern.github.io"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  try {

    const { amount, description, items } = req.body;


    const response = await fetch(
      "https://api.sumup.com/v0.1/checkouts",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${process.env.SUMUP_API_KEY}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          checkout_reference:
            "TCC-" + Date.now(),

          amount: Number(amount),
          currency: "GBP",

          merchant_code: "MJNF1P3K",

          description,

          hosted_checkout: {
            enabled: true
          },

          redirect_url:
            "https://thecrochetcovern.github.io/"
        })
      }
    );


    const data = await response.json();


    if (!response.ok) {
      return res.status(response.status).json(data);
    }


    // reduce stock
    for (const item of items) {

      const { data: product } =
        await supabase
        .from("products")
        .select("stock")
        .eq("name", item.name)
        .single();


      if (product) {

        const newStock =
          product.stock - 1;


        await supabase
        .from("products")
        .update({
          stock: newStock,
          available: newStock > 0
        })
        .eq("name", item.name);

      }
    }


    return res.status(200).json({
      url: data.hosted_checkout_url
    });


  } catch (error) {

    return res.status(500).json({
      error: "Checkout failed"
    });

  }
}
