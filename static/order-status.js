const totalCont = document.getElementById("total-cont");
const progressCont = document.getElementById("progress");
const orderIdCont = document.getElementById("order-id");
const statusBoxCont = document.getElementById("status-box")

const fetchOrderStatus = async () => {
    const response = await fetch('/fetch-pending-order', {
        method: "GET",
        headers: {"auth-token": localStorage.getItem("auth-token")}
    });
    const result = await response.json();
    if (result.feedback.status == "success"){
        renderOrderStatus(result.orderData)
    } else {
        statusBoxCont.innerHTML = `<h3>You have no Pending Order</h3>`
    }
};

document.addEventListener("DOMContentLoaded", fetchOrderStatus);

const renderOrderStatus = (data) => {
    totalCont.innerText = "Rs. " + parseInt(data[0].total_amount);
    orderIdCont.innerText = "Order # " + data[0].id

    if (data[0].status === "pending"){
        statusBoxCont.innerHTML = `<h2>Your order is being prepared</h2><p>Your order will be delivered in 30 minutes after order placing time.</p><p>Order placing time ${new Date(data[0].created_at).toLocaleString()}</p>`

        
        progressCont.innerHTML = `<div class="step active">
            <div class="circle">✓</div>
                <p>Order Placed</p>
            </div>

            <div class="line active"></div>

            <div class="step active">
                <div class="circle">●</div>
                <p>Preparing</p>
            </div>

            <div class="line"></div>

            <div class="step">
                <div class="circle"></div>
                <p>Delivered</p>
            </div>`
    } else if (data[0].status === "delivered"){
        statusBoxCont.innerHTML = `<h2> Your order has been delivered</h2><p>Dont forget to leave a feedback on our portal.</p>`

        progressCont.innerHTML = `<div class="step active">
            <div class="circle">✓</div>
                <p>Order Placed</p>
            </div>

            <div class="line active"></div>

            <div class="step active">
                <div class="circle">✓</div>
                <p>Prepared</p>
            </div>

            <div class="line active"></div>

            <div class="step active">
                <div class="circle">●</div>
                <p>Delivered</p>
            </div>`
    }
};