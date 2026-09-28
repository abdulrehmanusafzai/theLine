const addToCartBtn = document.querySelectorAll(".addToCartBtn");
const alert = document.getElementById("alert");

addToCartBtn.forEach(btn => {
    btn.addEventListener("click", () => {
        const menuItemId = btn.dataset.id;

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (!cart.includes(menuItemId)){
            cart.push(menuItemId);
            localStorage.setItem("cart", JSON.stringify(cart))
            manageAlert(feedback = {status: "success", message: "Item added to cart"})
        }
    });
});

const manageAlert = (alertMessage) => {
    alert.classList.remove("noDis");

    document.getElementById("alertMessage").innerText = alertMessage.message
    setTimeout(() => {
        alert.classList.add("noDis");
    }, 1500);
}
