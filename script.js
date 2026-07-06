/* THE CROCHET COVERN CART + CHECKOUT */

const CHECKOUT_API_URL = "https://the-crochet-covern-github-io.vercel.app/api/checkout";
const FORMSPREE_URL = "https://formspree.io/f/xlgywnqv";

let selectedProduct = null;
let cart = JSON.parse(localStorage.getItem("crochetCart")) || [];

function saveCart() {
  localStorage.setItem("crochetCart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.textContent = cart.length;
}

function priceToNumber(price) {
  return Number(String(price).replace("£", "").replace("each", "").trim());
}

/* SINGLE PRODUCT ORDER */

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
  document.getElementById("orderFormSumUp").value = "Automatic SumUp checkout";

  document.getElementById("orderModal").style.display = "flex";
  document.body.classList.add("modal-open");
}

/* CART FUNCTIONS */

function addToCart(name, price, image, suitable, stock) {
  cart.push({
    name,
    price,
    image,
    suitable,
    stock
  });

  saveCart();
 
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function openCart() {
  renderCart();
  document.getElementById("cartModal").style.display = "flex";
  document.body.classList.add("modal-open");
}

function closeCart() {
  document.getElementById("cartModal").style.display = "none";
  document.body.classList.remove("modal-open");
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "£0.00";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += priceToNumber(item.price);

    cartItems.innerHTML += `
      <div class="cart-item">
        <strong>${item.name}</strong>
        <span>£${item.price}</span>
        <button class="btn" onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;
  });

  cartTotal.textContent = "£" + total.toFixed(2);
}

function checkoutCart() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const names = cart.map(item => item.name).join(", ");
  const total = cart.reduce((sum, item) => sum + priceToNumber(item.price), 0);

  selectedProduct = {
    name: "Cart Order: " + names,
    price: total.toFixed(2),
    image: cart[0].image,
    suitable: "Mixed items",
    stock: cart.length + " item(s)",
    sumup: ""
  };

  closeCart();

  orderProduct(
    selectedProduct.name,
    selectedProduct.price,
    selectedProduct.image,
    selectedProduct.suitable,
    selectedProduct.stock,
    ""
  );
}

/* MODAL */

function closeOrderModal() {
  document.getElementById("orderModal").style.display = "none";
  document.body.classList.remove("modal-open");
}

function contactOrder() {
  window.location.href =
    "mailto:thecrochetcovern@gmail.com?subject=" +
    encodeURIComponent("Order Enquiry - " + (selectedProduct?.name || ""));
}

/* FORM + SUMUP CHECKOUT */

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  const form = document.getElementById("checkoutForm");

  if (form) {
    form.addEventListener("submit", async event => {
      event.preventDefault();


      if (!selectedProduct) {
        alert("Please choose a product first.");
        return;
      }

      try {
        const formData = new FormData(form);

        formData.append("Order Total", "£" + selectedProduct.price);

        if (cart.length > 0 && selectedProduct.name.startsWith("Cart Order")) {
          formData.append(
            "Cart Items",
            cart.map(item => `${item.name} - £${item.price}`).join("\n")
          );
        }

        const formspreeResponse = await fetch(FORMSPREE_URL, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });

      if (!formspreeResponse.ok) {
  alert("Your order details could not be sent. Please try again or contact me directly.");
  return;
}


        const checkoutResponse = await fetch(CHECKOUT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: priceToNumber(selectedProduct.price),
            description: selectedProduct.name,
            items: cart.length > 0 && selectedProduct.name.startsWith("Cart Order")
              ? cart
              : [{ name: selectedProduct.name }]
          })
        });

        const checkoutData = await checkoutResponse.json();

        if (!checkoutResponse.ok || !checkoutData.url) {
          alert("Payment checkout could not be created.");
          console.log(checkoutData);
          return;
        }


        if (selectedProduct.name.startsWith("Cart Order")) {
          clearCart();
        }

        window.location.href = checkoutData.url;

      } catch (error) {
        alert("Something went wrong. Check the console.");
        console.error(error);
      }
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
    navigator.serviceWorker.register("service-worker.js").then(registration => {
      registration.update();
    });
  });
}


function chooseMiniCowColour() {
  const colour = prompt(
    "Which mini cow would you like?\n\n1. Black & White\n2. Pink & Red\n3. Brown"
  );

  if (!colour) return;

  let choice = colour.toLowerCase();
  let cowName = "";

  if (choice === "1" || choice.includes("black")) {
    cowName = "Black & White Mini Cow";
  } else if (choice === "2" || choice.includes("pink") || choice.includes("red")) {
    cowName = "Pink Mini Cow";
  } else if (choice === "3" || choice.includes("brown")) {
    cowName = "Brown Mini Cow";
  } else {
    alert("Please choose Black & White, Pink, or Brown.");
    return;
  }

  addToCart(
    cowName,
    "7.00",
    "cow-collection-1.jpg",
    "3+",
    "1 Available"
  );
}
