let savedPassword = "";


function statusPriority(status) {

  if (status === "Needs packing") return 1;
  if (status === "Packed") return 2;
  if (status === "Posted") return 3;

  return 4;

}



function formatDate(dateText) {

  if (!dateText) return "Unknown date";

  const date = new Date(dateText);

  return date.toLocaleString("en-GB", {

    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"

  });

}





async function loadOrders() {


savedPassword = document.getElementById("password").value;



const response = await fetch(

"https://the-crochet-covern-github-io.vercel.app/api/admin-orders",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

password:savedPassword

})

}

);



const data = await response.json();



if(!response.ok){

alert("Incorrect password");

return;

}





const container=document.getElementById("orders");

container.innerHTML="";





const toPack=data.orders.filter(

o=>o.order_status!=="Posted"

).length;



const posted=data.orders.filter(

o=>o.order_status==="Posted"

).length;



const sales=data.orders

.filter(o=>o.paid)

.reduce(

(sum,o)=>sum+Number(o.amount),

0

);





document.getElementById("packCount").textContent=toPack;


document.getElementById("postedCount").textContent=posted;


document.getElementById("salesTotal").textContent=

"£"+sales.toFixed(2);







const sortedOrders=data.orders.sort((a,b)=>{


const statusSort=

statusPriority(a.order_status)

-

statusPriority(b.order_status);



if(statusSort!==0)return statusSort;



return new Date(b.created_at)-new Date(a.created_at);


});







sortedOrders.forEach(order=>{


const customer=order.customer||{};

const items=order.items||[];

const status=order.order_status||"Needs packing";






container.innerHTML+=`


<div class="admin-order" id="order-${order.id}">



<div class="admin-top">

<div>

<h2>${order.checkout_ref}</h2>

<p>${formatDate(order.created_at)}</p>

</div>



<div>

<span class="badge">

${order.paid ? "✅ Paid":"❌ Not Paid"}

</span>



<span class="badge">

${status}

</span>



<span class="badge">

${order.email_sent ? "📩 Email Sent":"⏳ Email Waiting"}

</span>


</div>

</div>



<hr>




<div class="admin-grid">



<div class="item-box">


<h3>🧸 Order Items</h3>



${items.map(i=>`

<div class="order-item">

☐ ${i.name}

<div>

£${i.price || ""}

</div>

</div>

`).join("")}





<div class="total-box">

💷 Order Total

<br>

<strong>

£${order.amount}

</strong>

</div>



</div>






<div class="info-box">


<h3>👤 Customer Details</h3>


<div class="info-row">

<label>Name</label>

<span>

${customer.fullName || ""}

</span>

</div>




<div class="info-row">

<label>Email</label>

<span>

${customer.email || ""}

</span>

</div>




<h3>🏠 Delivery Address</h3>


<div class="info-row">

<label>Address</label>


<span>

${customer.address || ""}

<br>

${customer.town || ""}

<br>

${customer.postcode || ""}

</span>


</div>



</div>


</div>





<h3>📝 Notes</h3>

<pre>${customer.notes || "None"}</pre>





<h3>🚚 Tracking</h3>


<input

class="tracking-input"

id="tracking-${order.id}"

value="${order.tracking_number || ""}"

placeholder="Add tracking number"

>




<br><br>




<button class="btn"

onclick="saveTracking('${order.id}')">

Save Tracking

</button>






<div class="status-buttons">


<h3>Update Status</h3>




<button class="btn"

onclick="updateStatus('${order.id}','Needs packing')">

📦 Needs Packing

</button>



<button class="btn"

onclick="updateStatus('${order.id}','Packed')">

🎀 Packed

</button>



<button class="btn"

onclick="updateStatus('${order.id}','Posted')">

🚚 Posted

</button>



</div>



</div>


`;

});


}








async function updateOrder(id,updateData){


const response=await fetch(

"https://the-crochet-covern-github-io.vercel.app/api/update-order",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

password:savedPassword,

id,

...updateData

})

}

);




if(!response.ok){

alert("Could not update order.");

return;

}



loadOrders();


}








function updateStatus(id,status){


updateOrder(id,{

order_status:status

});


}







function saveTracking(id){


const tracking=

document.getElementById(

"tracking-"+id

).value;




updateOrder(id,{

tracking_number:tracking

});


}
