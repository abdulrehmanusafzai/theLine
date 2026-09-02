const form = document.getElementById("addForm");
const addBtn = document.getElementById("addBtn");
const alert = document.getElementById("alert");
const menuTable = document.getElementById("menu-table");
const menuRows = document.getElementById("menu-rows");

const fetchMenuItems = async () => {
    const menuItems = await fetch('admin/get-menu', {
        method: "GET",
        // headers: {
        //     "Content-Type": "application/json"
        // }
    });

    const response = await menuItems.json()
    
    fillMenuTable(response);
}

const fillMenuTable = (items) => {
    items.forEach(item => {
        menuRows.innerHTML += `<tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${parseInt(item.price)}</td>
            <td>${item.available ? "Yes" : "No"}</td>
        </tr>`
    });
}

document.addEventListener("DOMContentLoaded", fetchMenuItems)

addBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value
    const price = document.getElementById("price").value
    const category = document.getElementById("category").value
    const description = document.getElementById("description").value
    const image = document.getElementById("image").files[0]
    const available = document.getElementById("available").checked

    const formData = new FormData();
    
    formData.append("name", name)
    formData.append("price", price)
    formData.append("category", category)
    formData.append("description", description)
    formData.append("image", image)
    formData.append("available", available)
    
    const response = await fetch('/admin/add-item', {
        method: "POST",
        body: formData
    });
    const result = await response.json();
    manageAlert(result);
    if (result.status === "success"){
        fillMenuTable([{name, price, category, description, image, available}])
    }
});

// Alert Management
const manageAlert = (alertMessage) => {
    alert.classList.remove("noDis");

    document.getElementById("alertMessage").innerText = alertMessage.message
    setTimeout(() => {
        alert.classList.add("noDis");
    }, 1500);
}
