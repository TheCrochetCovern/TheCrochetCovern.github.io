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
  selectedProduct = { name, price, image, suitable, stock, sumup: sumupLink };

  document.getElementById("modalProductName").textContent = name;
  document.getElementById("modalPrice").textContent = "£" + price;
  document.getElementById("modalImage").src = image;
  document.getElementById("modalImage").alt = name;
  document.getElementById("modalSuitable").textContent = suitable;
  document.getElementById("modalStock").textContent = stock;

  document.getElementById("orderFormProduct").value = name;
  document.getElementById("orderFormPrice").value = "£" + price;
  document.getElementById("orderFormSumUp").value = sumupLink;

  document.getElementById("orderModal").style.display = "flex";
  document.body.classList.add("modal-open");
}

function closeOrderModal() {
  document.getElementById("orderModal").style.display = "none";
  document.body.classList.remove("modal-open");
}

function contactOrder() {
  window.location.href =
    "mailto:thecrochetcovern@gmail.com?subject=" +
    encodeURIComponent("Order Enquiry - " + selectedProduct.name);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkoutForm");

  if (form) {
    form.addEventListener("submit", async event => {
      event.preventDefault();

      const formData = new FormData(form);

      await fetch("https://formspree.io/f/xlgywnqv", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      window.location.href = selectedProduct.sumup;
    });
  }
});

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
