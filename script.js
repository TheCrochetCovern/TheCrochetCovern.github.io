/* THE CROCHET COVERN CART + CHECKOUT */

const CHECKOUT_API_URL = "https://the-crochet-covern-github-io.vercel.app/api/checkout";

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
  flyToCart(image);

  cart.push({
    name,
    price,
    image,
    suitable,
    stock
  });

  setTimeout(() => {
    saveCart();
  }, 600);
}
function flyToCart(image) {
  const cartButton = document.querySelector(".cart-btn");

  if (!cartButton) {
    saveCart();
    return;
  }

  const flyingImg = document.createElement("img");

  flyingImg.src = image;
  flyingImg.className = "fly-cart-img";

  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2;

  const cartRect = cartButton.getBoundingClientRect();

  flyingImg.style.left = startX + "px";
  flyingImg.style.top = startY + "px";

  document.body.appendChild(flyingImg);

  setTimeout(() => {
    flyingImg.style.left = cartRect.left + cartRect.width / 2 + "px";
    flyingImg.style.top = cartRect.top + cartRect.height / 2 + "px";
    flyingImg.style.transform = "scale(0.1) rotate(20deg)";
    flyingImg.style.opacity = "0";
  }, 50);

  setTimeout(() => {
    flyingImg.remove();
  }, 750);
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

    cartItems.innerHTML = `
      <p style="text-align:center;color:#7a6a6a;">
        Your basket is feeling a little lonely 🧶
      </p>
    `;

    cartTotal.textContent = "£0.00";

    return;
  }

  let total = 0;

  cart.forEach((item,index)=>{

    total += priceToNumber(item.price);

    cartItems.innerHTML += `

      <div class="cart-item">

        <img
          src="${item.image}"
          class="cart-thumb"
          alt="${item.name}"
        >

        <div class="cart-info">

          <strong>${item.name}</strong>

          <span class="cart-price">
            £${item.price}
          </span>

        </div>

        <button
          class="cart-remove"
          onclick="removeFromCart(${index})"
        >
          ✕
        </button>

      </div>

    `;

  });

  cartTotal.textContent = "£" + total.toFixed(2);

}

function clearCart(){

    if(!confirm("Empty your basket?")) return;

    cart=[];

    saveCart();

    renderCart();

}

  let total = 0;

  cart.forEach((item, index) => {
    total += priceToNumber(item.price);

   const parts = item.name.split("(");

const productName = parts[0].trim();

const variation = parts[1]
    ? parts[1].replace(")", "")
    : "";

cartItems.innerHTML += `
<div class="cart-item">

    <img
        src="${item.image}"
        class="cart-image"
        alt="${productName}"
    >

    <div class="cart-info">

        <strong>${productName}</strong>

        ${
            variation
            ? `<div class="cart-variation">${variation}</div>`
            : ""
        }

        <div class="cart-price">
            £${item.price}
        </div>

    </div>

    <button
        class="remove-cart-btn"
        onclick="removeFromCart(${index})">

        🗑

    </button>

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
    "mailto:support@thecrochetcovern.co.uk?subject=" +
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
    : [{ name: selectedProduct.name, price: selectedProduct.price }],
  customer: {
    fullName: formData.get("Full Name"),
    email: formData.get("Email"),
    address: formData.get("Address"),
    town: formData.get("Town or City"),
    postcode: formData.get("Postcode"),
    notes: formData.get("Order Notes")
  }
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

       localStorage.setItem("lastCheckoutId", checkoutData.checkoutId);
localStorage.setItem("lastCustomerEmail", formData.get("Email"));
localStorage.setItem("lastCustomerName", formData.get("Full Name"));
localStorage.setItem("lastOrderDescription", selectedProduct.name);
localStorage.setItem("lastOrderTotal", selectedProduct.price);

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
/* PAYMENT RETURN CHECK */

window.addEventListener("load", async () => {
  const params = new URLSearchParams(window.location.search);
  const checkoutRef = params.get("checkout");

  if (!checkoutRef) return;

  const messageBox = document.createElement("div");

  messageBox.style.cssText = `
    position: fixed;
    top: 90px;
    left: 50%;
    transform: translateX(-50%);
    background: #e8dcd6;
    color: #5f4b45;
    padding: 20px;
    border-radius: 20px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    z-index: 999999;
  `;

  messageBox.innerHTML = `
    <h2>🧶 Checking your order...</h2>
    <p>Making sure your crochet friend is ready for its journey.</p>
  `;

  document.body.appendChild(messageBox);


  setTimeout(() => {

    messageBox.innerHTML = `
      <h2>Thank you for your order 💚</h2>

      <p>
      Your Crochet Covern creation has been adopted!
      </p>

      <p>
      Your order details have been received and your handmade friend
      will be carefully packed ready for its journey home 📦✨
      </p>

      <button class="btn" onclick="this.parentElement.remove()">
      Continue Shopping
      </button>
    `;

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

  }, 2000);
});

/* LIVE STOCK CHECK */

async function updateLiveStock() {
  try {

    const response = await fetch(
      "https://the-crochet-covern-github-io.vercel.app/api/get-products"
    );

    const data = await response.json();

    if (!data.products) return;


    data.products.forEach(product => {

      document.querySelectorAll(".card").forEach(card => {

        const title = card.querySelector("h3");

        if (!title) return;


if (
  title.textContent.trim().toLowerCase() === 
  product.name.trim().toLowerCase()
) {


          const stockText = card.querySelector(".stock");

          if (stockText) {

            if (product.stock <= 0) {

              stockText.textContent = "❌ Sold Out";

            } else {

              stockText.textContent =
                product.stock + " Available";

            }

          }


          const buttons = card.querySelectorAll("button");


          buttons.forEach(button => {

            if (product.stock <= 0) {

              button.disabled = true;

              button.textContent = "Sold Out";

              button.classList.add("sold-out-btn");


            } else {

              button.disabled = false;

            }

          });

        }

      });

    });


  } catch(error) {

    console.log("Stock check failed", error);

  }
}


window.addEventListener("load", updateLiveStock);


// ===========================
// CHERRY VARIATIONS
// ===========================

function setupCherryVariation(
    selectId,
    orderId,
    cartId
) {

    const select = document.getElementById(selectId);

    if (!select) return;

    function currentProduct(){

        const option = select.options[select.selectedIndex];

        return {

            name: option.value,

            image: option.dataset.image,

            price: "5.00",

            suitable: "3+",

            stock: "Available"

        };

    }

    document.getElementById(orderId).onclick = () => {

        const p = currentProduct();

        orderProduct(
            p.name,
            p.price,
            p.image,
            p.suitable,
            p.stock
        );

    };

    document.getElementById(cartId).onclick = () => {

        const p = currentProduct();

        addToCart(
            p.name,
            p.price,
            p.image,
            p.suitable,
            p.stock
        );

    };

}

document.addEventListener("DOMContentLoaded",()=>{

    setupCherryVariation(
        "pinkCherrySelect",
        "pinkCherryOrder",
        "pinkCherryCart"
    );

    setupCherryVariation(
        "lightPinkCherrySelect",
        "lightPinkCherryOrder",
        "lightPinkCherryCart"
    );

});
