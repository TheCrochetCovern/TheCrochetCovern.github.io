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
UK delivery free.
International delivery typically ranges from £5–£10+.
Exact shipping costs will be confirmed before payment.



My name is Melodie, and every piece is handmade with care, attention, and a genuine love for crochet. Your support means so much, and I hope your new forever friend brings you joy for years to come.
Thank you for supporting The Crochet Covern.

Dispatch Information:
Orders are typically posted within 1–3 working days after payment.`;

  window.location.href =
    `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}


/* APP INSTALL BUTTON */

let deferredPrompt;

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredPrompt = event;

  const installBtn = document.getElementById("installBtn");

  if (installBtn) {
    installBtn.style.display = "inline-block";

    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();

      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        installBtn.style.display = "none";
      }

      deferredPrompt = null;
    });
  }
});


/* SERVICE WORKER */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
