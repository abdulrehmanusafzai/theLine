const checkoutBtn = document.getElementById("checkout-btn");
const phoneModal = document.querySelector("#phoneModal");
const closeModalBtn = document.querySelector("#closeModalBtn");
const continueOrderBtn = document.getElementById("continueOrderBtn")
const list = document.querySelector(".cart-items");
const addressModal = document.getElementById("address-modal");
const cancelAddress = document.getElementById("cancel-address");
const confirmAddress = document.getElementById("confirm-address");
const alert = document.getElementById("alert");

cancelAddress.addEventListener("click", () => {
    addressModal.style.display = "none";
});

checkoutBtn.addEventListener("click", () => {
    if (!localStorage.getItem("auth-token")){
        phoneModal.style.display = "block";
    } else {
        addressModal.style.display = "flex";
    }
});

function removePhoneModal(){
    if (localStorage.getItem("auth-token")){
        phoneModal.style.display = "none";
        checkoutBtn.innerText = "Proceed to Checkout"
    }
}
closeModalBtn.addEventListener("click", () => {
    phoneModal.style.display = "none";
});

continueOrderBtn.addEventListener("click", async () => {
    const phoneNumber = document.querySelector("#phoneNumber").value;

    const response = await fetch('/admin/register-user', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            phone: phoneNumber
        })
    });

    const data = await response.json();
    if (data.authToken){
        localStorage.setItem("auth-token", data.authToken);
        removePhoneModal();
        manageAlert(feedback = {status: "success", message: "You have been logged in, now click proceed to checkout to proceed further."})
    } else if (data.status === "error"){
        manageAlert(data)
    }
});

const fetchCartItems = async () => {
    if (localStorage.getItem("cart")){
        const response = await fetch('/fetch-cart', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                itemIds: localStorage.getItem("cart")
            })
        });
        const result = await response.json();
        console.log(result);
        fillList(result);
    } else {
        list.innerHTML = `<h3>Your Cart is Empty</h3>`
    }
}

document.addEventListener("DOMContentLoaded", () => {fetchCartItems(), removePhoneModal()});

const fillList = (items) => {
    items.forEach(item => {
        // console.log(item.price)
        list.innerHTML += `<div class="cart-item" id="${item.id}">
                <img src="${item.image}" alt="Burger">

                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p class="price">Rs. ${parseInt(item.price)}</p>
                </div>

                <button class="remove-btn" data-id="${item.id}">Remove</button>
            </div>`
    });
    functionalRemoveBtn(items);
    fillSummary(items);
};

const functionalRemoveBtn = (items) => {
    const removeBtns = document.querySelectorAll(".remove-btn");
    // console.log(items)
    removeBtns.forEach(removeBtn => {
        removeBtn.addEventListener("click", () => {
            const removeBtnIdStringed = removeBtn.dataset.id;
            
            
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart = cart.filter(id => id !== removeBtnIdStringed);
            localStorage.setItem("cart", JSON.stringify(cart));
            
            const theCard = document.getElementById(removeBtnIdStringed);
            
            const removeBtnId = Number(removeBtnIdStringed);
            
            items = items.filter(item => item.id !== removeBtnId);
            
            theCard.remove();
            fillSummary(items);
            manageAlert(feedback = {status: "success", message: "Item removed"})
        });
    });
};

const fillSummary = (items) => {
    const subTotalCont = document.getElementById("sub-total");
    const dChargesCont = document.getElementById("delivery-charges");
    const totalCont = document.getElementById("total");
    
    let subTotal = 0;
    const deliveryCharges = 180;
    const orderItems = [];
    items.forEach(item => {
        subTotal += Number(item.price);

        orderItems.push(item.id)
    });
    if (subTotal > 0){
        subTotalCont.innerText = `Rs. ${parseInt(subTotal)}`;
        dChargesCont.innerText = `Rs. ${parseInt(deliveryCharges)}`;
    
        const grandTotal = subTotal + deliveryCharges
    
        totalCont.innerText = `Rs. ${parseInt(grandTotal)}`;
        orderPlaced(grandTotal, orderItems);
    } else {
        subTotalCont.innerText = ``;
        dChargesCont.innerText = ``;
        totalCont.innerText = ``;
        localStorage.removeItem("cart");
        list.innerHTML = `<h3>Your Cart is Empty</h3>`;
    }
};

const orderPlaced = async (orderPayment, orderItems) => {
    confirmAddress.addEventListener("click", async () => {

        const addressInput = document.getElementById("address-input");
        const address = addressInput.value;
        
        const response = await fetch('/create-order', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("auth-token")
            },
            body: JSON.stringify({
                orderPayment,
                orderItems,
                address
            })
        });
        const result = await response.json();

        if (result.status === "success"){
            window.location.href = '/orders';
            localStorage.removeItem("cart");
        } else if (result.status === "error"){
            manageAlert(result)
        }
    });
};

const manageAlert = (alertMessage) => {
    alert.classList.remove("noDis");

    document.getElementById("alertMessage").innerText = alertMessage.message
    setTimeout(() => {
        alert.classList.add("noDis");
    }, 2500);
}
