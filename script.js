/* ORDER SYSTEM */

let selectedProduct = {
name: "",
price: "",
image: "",
suitable: "",
stock: "",
sumup: ""
};

function orderProduct(name, price, image, suitable, stock, sumupLink) {
selectedProduct = {
name: name,
price: price,
image: image,
suitable: suitable,
stock: stock,
sumup: sumupLink
};

document.getElementById("modalProductName").textContent = name;
document.getElementById("modalPrice").textContent = "£" + price;
document.getElementById("modalImage").src = image;
document.getElementById("modalImage").alt = name;
document.getElementById("modalSuitable").textContent = suitable;
document.getElementById("modalStock").textContent = stock;

document.getElementById("orderModal").style.display = "flex";
}

function closeOrderModal() {
document.getElementById("orderModal").style.display = "none";
}

function payOrder() {
if (selectedProduct.sumup) {
window.open(selectedProduct.sumup, "_blank");
} else {
alert("Payment link coming soon. Please contact me to order.");
}
}

function contactOrder() {
const email = "melodiewarrender@gmail.com";
const subject = "Order - " + selectedProduct.name;

const body =
`Hello The Crochet Covern,

I would like to place an order for ${selectedProduct.name}.

Price: £${selectedProduct.price}

Name:

Address:

Quantity:

Payment Method: (PayPal / Bank Transfer / SumUp)

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
