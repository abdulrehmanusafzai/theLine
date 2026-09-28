const totalCont = document.getElementById("total-cont");
const progressCont = document.getElementById("progress");
const orderIdCont = document.getElementById("order-id");
const statusBoxCont = document.getElementById("status-box");
const itemsCont = document.getElementById("order-items");

const fetchOrderStatus = async () => {
    const response = await fetch('/fetch-pending-order', {
        method: "GET",
        headers: { "auth-token": localStorage.getItem("auth-token") }
    });
    const result = await response.json();
    if (result.feedback.status == "success") {
        renderOrderStatus(result.orderData)
    } else {
        statusBoxCont.innerHTML = `<h3>You have no Pending Order</h3>`
    }
};

document.addEventListener("DOMContentLoaded", fetchOrderStatus);

const renderOrderStatus = (data) => {
    const Pl = document.getElementById("Pl");
    const Pr = document.getElementById("Pr");
    const Del = document.getElementById("Del");
    const placingCircle = document.getElementById("placing-circle");
    const prepCircle = document.getElementById("prep-circle");
    const deliveryCircle = document.getElementById("delivery-circle");
    const line1 = document.getElementById("l1");
    const line2 = document.getElementById("l2");

    totalCont.innerText = "Rs. " + parseInt(data[0].total_amount);
    orderIdCont.innerText = "Order # " + data[0].id

    
    if (data[0].status === "pending") {
        statusBoxCont.innerHTML = `<h2>Your order is being prepared</h2><p>Your order will be delivered in 30 minutes after order placing time.</p><p>${new Date(data[0].created_at).toLocaleString()}</p>`

        Pl.classList.add("active");
        placingCircle.innerText = "✓";
        line1.classList.add("active");
        Pr.classList.add("active");
        prepCircle.innerText = "●";
    } else if (data[0].status === "delivered") {
        statusBoxCont.innerHTML = `<h2> Your order has been delivered</h2><p>Don't forget to leave a feedback on our portal.</p>`
        
        Pl.classList.add("active");
        placingCircle.innerText = "✓";
        line1.classList.add("active");
        Pr.classList.add("active");
        prepCircle.innerText = "✓";
        line2.classList.add("active");
        Del.classList.add("active");
        deliveryCircle.innerText = "✓";
    }

        for (let item of data[0].item_ids){
            itemsCont.innerHTML += `<div class="order-item">
                                        <img src="${item.image}" alt="Chicken Burger">
                                        <div class="item-info">
                                        <h3>${item.name}</h3>
                                        </div>
                                        
                                        <div class="item-price">
                                        <p>Rs. ${parseInt(item.price)}</p>
                                        </div>
                                    </div>`
        }
};