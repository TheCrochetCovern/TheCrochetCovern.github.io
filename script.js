function orderProduct(productName) {

  const email = "melodiewarrender@gmail.com";
  const subject = "Order - " + productName;

  const body =
`Hello The Crochet Covern,

I would like to place an order for ${productName}.

Name:

Address:

Quantity:

Payment Method: (PayPal / Bank Transfer)

Preferred Contact Method: (Email / Phone / Instagram)

Special Notes:


Shipping Information:
UK delivery starts from £0.99.
International delivery typically ranges from £5–£10+.
Exact shipping costs will be confirmed before payment.


Thank you for supporting The Crochet Covern.

My name is Melodie, and every piece is handmade with care, attention, and a genuine love for crochet. Your support means so much, and I hope your new forever friend brings you joy for years to come.

Dispatch Information:
Orders are typically posted within 1–3 working days after payment.`;

  window.location.href =
    `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
