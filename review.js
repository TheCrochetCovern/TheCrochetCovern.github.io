// =====================================================
// THE CROCHET COVERN
// Review System V2
// Part 1
// =====================================================

const API_BASE =
  "https://the-crochet-covern-github-io.vercel.app/api";

const params = new URLSearchParams(window.location.search);

const checkoutRef = params.get("order");

const productContainer = document.getElementById("productReviews");

const submitButton = document.getElementById("submitReviewBtn");

const successBox = document.getElementById("successBox");

const reviewContent = document.getElementById("reviewContent");

let orderData = null;

let reviewCards = [];

document.addEventListener("DOMContentLoaded", initialiseReviewPage);

async function initialiseReviewPage() {

  if (!checkoutRef) {

    productContainer.innerHTML = `
      <div class="product-review">
        <h3>Order not found</h3>

        <p>
          This review link isn't valid.
        </p>
      </div>
    `;

    return;

  }

  await loadOrder();

}

async function loadOrder() {

  try {

    const response = await fetch(

      `${API_BASE}/get-review-order`,

      {

        method: "POST",

        headers: {

          "Content-Type":"application/json"

        },

        body: JSON.stringify({

          checkoutRef

        })

      }

    );

    const data = await response.json();

    if (!response.ok) {

      productContainer.innerHTML = `
        <div class="product-review">

          <h3>Unable to load order</h3>

          <p>${data.error}</p>

        </div>
      `;

      return;

    }

    orderData = data;

    buildProductCards();

  }

  catch(error){

    console.log(error);

    productContainer.innerHTML = `
      <div class="product-review">

        <h3>Something went wrong</h3>

        <p>
          Please try again later.
        </p>

      </div>
    `;

  }

}

function buildProductCards() {

  productContainer.innerHTML = "";

  reviewCards = [];

  orderData.items.forEach((item,index)=>{

    const card = createProductCard(item,index);

    productContainer.appendChild(card);

  });
  
updateSubmitState();
}

function createProductCard(item,index){

  const wrapper = document.createElement("div");

  wrapper.className = "product-review";

  wrapper.innerHTML = `

    <h3>🧸 ${item.name}</h3>

    <p>
      We'd love to hear how your little friend is settling into
      its forever home.
    </p>

    <div class="stars" id="stars-${index}"></div>

    <p id="message-${index}"
       style="font-weight:bold;color:#5f4b45;">

      Choose a star rating ⭐

    </p>

    <textarea
      class="review-text"
      id="review-${index}"
      placeholder="Tell us about your little friend's new home..."
    ></textarea>

    <div class="photo-upload">

      📷 Show us their new home (optional)

      <br><br>

      <input
        type="file"
        accept="image/*"
        id="photo-${index}"
      >

    </div>

    <br>

    <label>

      Display Name

    </label>

    <input
      class="display-name"
      id="display-${index}"
      placeholder="${orderData.customer.fullName}"
    >

  `;

  createStars(wrapper,index,item);
  
wrapper.querySelector(`#review-${index}`)
.addEventListener("input",updateSubmitState);

wrapper.querySelector(`#display-${index}`)
.addEventListener("input",updateSubmitState);
  return wrapper;

}

function createStars(wrapper,index,item){

  const starContainer = wrapper.querySelector(`#stars-${index}`);

  const message = wrapper.querySelector(`#message-${index}`);

  const messages = {

    1:"😢 Oh no... Tell me how I can improve.",

    2:"💚 Thank you. I'd love to know what could have been better.",

    3:"🧶 Thank you! Every bit of feedback helps me grow.",

    4:"🥹 Thank you so much! I'm so happy you liked it.",

    5:"❤️ Aww!! Thank you so much! You just made my day."

  };

  let selectedRating = 0;

  for(let i=1;i<=5;i++){

    const star=document.createElement("span");

    star.className="star";

    star.innerHTML="⭐";

    star.addEventListener("mouseenter",()=>{

      highlightStars(i);

    });

    star.addEventListener("mouseleave",()=>{

      highlightStars(selectedRating);

    });

    star.addEventListener("click",()=>{

      selectedRating=i;

      highlightStars(i);

      message.innerHTML=messages[i];

      updateSubmitState();

    });

    starContainer.appendChild(star);

  }

  function highlightStars(rating){

    const stars=starContainer.querySelectorAll(".star");

    stars.forEach((star,index)=>{

      if(index<rating){

        star.classList.add("active");

      }

      else{

        star.classList.remove("active");

      }

    });

  }

  reviewCards.push({

    product:item,

    get rating(){

      return selectedRating;

    },

    get review(){

      return wrapper.querySelector(`#review-${index}`).value.trim();

    },

    get displayName(){

      return wrapper.querySelector(`#display-${index}`).value.trim();

    },

    get photo(){

      return wrapper.querySelector(`#photo-${index}`).files[0];

    }

  });

}

submitButton.addEventListener("click",submitReviews);

function validateReviews(){

  for(const card of reviewCards){

    if(card.rating===0){

      alert("Please leave a star rating for every product ❤️");

      return false;

    }

    if(card.review.length<8){

      alert("Please write a little review for every product 🧶");

      return false;

    }

  }

  return true;

}

async function submitReviews(){

  if(!validateReviews()){

    return;

  }

  submitButton.disabled=true;

  submitButton.innerHTML="Submitting... 💚";

  for(const card of reviewCards){

    let photoUrl=null;

    // Upload photo comes in Part 3

    const response = await fetch(

      `${API_BASE}/submit-review`,

      {

        method:"POST",

        headers:{

          "Content-Type":"application/json"

        },

        body:JSON.stringify({

          checkoutRef,

          productName:card.product.name,

          customerName:orderData.customer.fullName,

          customerEmail:orderData.customer.email,

          displayName:card.displayName,

          rating:card.rating,

          review:card.review,

          photoUrl

        })

      }

    );
    
if (!response.ok) {

    alert("Something went wrong while sending your review. Please try again.");

    submitButton.disabled = false;

    submitButton.innerHTML = "Submit Reviews 💚";

    return;

}
  }

  celebrateSuccess();

}

// =====================================================
// Review System V2
// Part 3
// =====================================================

function updateSubmitState(){

    let complete=true;

    reviewCards.forEach(card=>{

        if(card.rating===0) complete=false;

        if(card.review.length<8) complete=false;

    });

    submitButton.disabled=!complete;

}

function celebrateSuccess(){

    reviewContent.style.opacity="0";

    setTimeout(()=>{

        reviewContent.style.display="none";

        successBox.style.display="block";

        successBox.style.opacity="0";

        launchConfetti();

        setTimeout(()=>{

            successBox.style.transition="opacity .8s";

            successBox.style.opacity="1";

        },100);

    },500);

}

function launchConfetti(){

    for(let i=0;i<120;i++){

        const piece=document.createElement("div");

        piece.innerHTML=Math.random()>0.5?"🧶":"💚";

        piece.style.position="fixed";

        piece.style.left=Math.random()*100+"vw";

        piece.style.top="-50px";

        piece.style.fontSize=(16+Math.random()*18)+"px";

        piece.style.pointerEvents="none";

        piece.style.transition="transform 3s linear, opacity 3s";

        piece.style.zIndex="9999";

        document.body.appendChild(piece);

        requestAnimationFrame(()=>{

            piece.style.transform=`
                translateY(${window.innerHeight+150}px)
                rotate(${Math.random()*720}deg)
            `;

            piece.style.opacity="0";

        });

        setTimeout(()=>{

            piece.remove();

        },3200);

    }

}

reviewContent.style.transition="opacity .5s";

successBox.style.transition="opacity .8s";

updateSubmitState();

console.log("🧶 Review System V2 Loaded");
