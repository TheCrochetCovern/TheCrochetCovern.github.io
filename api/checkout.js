export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { amount, description } = req.body;

    const response = await fetch(
      "https://api.sumup.com/v0.1/checkouts",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SUMUP_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          checkout_reference: "TCC-" + Date.now(),
          amount: amount,
          currency: "GBP",
          pay_to_email: "thecrochetcovern@gmail.com",
          description: description
        })
      }
    );

    const data = await response.json();

    res.status(200).json({
      url: data.checkout_url
    });

  } catch (error) {
    res.status(500).json({
      error: "Checkout failed"
    });
  }
}
