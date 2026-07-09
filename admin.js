let savedPassword = "";


function statusPriority(status) {

    if (status === "Needs packing") return 1;
    if (status === "Packed") return 2;
    if (status === "Posted") return 3;

    return 4;

}



function getOrderGroup(order){

    if(!order.paid){
        return "❌ Unpaid";
    }

    if(order.order_status === "Needs packing"){
        return "📦 Paid / Needs Packing";
    }

    if(order.order_status === "Packed"){
        return "🎀 Packed / Needs Posting";
    }

    if(order.order_status === "Posted"){
        return "🚚 Posted";
    }

    if(order.order_status === "Delivered"){
        return "💚 Delivered";
    }

    return "Other";

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






const groupedOrders = {};

sortedOrders.forEach(order => {

    const group = getOrderGroup(order);

    if(!groupedOrders[group]){
        groupedOrders[group] = [];
    }

    groupedOrders[group].push(order);

});



Object.keys(groupedOrders).forEach(group => {


container.innerHTML += `

<div class="status-section">


<div class="status-header" onclick="toggleSection(this)">

<span>
${group}
</span>

<span class="status-count">
${groupedOrders[group].length} orders
</span>

</div>


<div class="status-content">


<div id="${group.replace(/\s/g,'')}">

</div>


</div>


</div>

`;



const section = document.getElementById(
group.replace(/\s/g,'')
);



groupedOrders[group].forEach(order=>{


const customer = order.customer || {};

const items = order.items || [];

const status = order.order_status || "Needs packing";



section.innerHTML += `


<div class="order-summary">


<div class="order-summary-top"
onclick="toggleOrder(this)">


<div>

<h3>
${order.checkout_ref}
</h3>

<small>
${formatDate(order.created_at)}
</small>

</div>


<div class="badges">


<span class="badge">

${order.paid ? "✅ Paid":"❌ Unpaid"}

</span>


<span class="badge">

${status}

</span>


</div>


</div>




<div class="order-details">



<div class="admin-grid">



<div class="item-box">


<h3>🧸 Order Items</h3>



${items.map(i=>`

<div class="order-item">

<span>
☐ ${i.name}
</span>

<span>
£${i.price || ""}
</span>

</div>

`).join("")}



<div class="total-box">

💷 Total

<br>

<strong>
£${order.amount}
</strong>

</div>


</div>





<div class="info-box">


<h3>👤 Customer</h3>


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



<h3>🏠 Address</h3>


<div class="info-row">

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


<pre>
${customer.notes || "None"}
</pre>




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


<h3>
Update Status
</h3>



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


</div>


`;

});


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
function toggleSection(element){

    element.parentElement.classList.toggle("open");

}



function toggleOrder(element){

    element.parentElement.classList.toggle("open");

}
