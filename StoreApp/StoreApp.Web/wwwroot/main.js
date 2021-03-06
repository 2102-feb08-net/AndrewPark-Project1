let currentCustomer;
let currentLocation;
let customers;
let orders;
let inventory;
let locations;
let allViews = ["customer", "inventory", "orderTable", "cart"];
let cart = {};

async function init()
{
    customers = await getCustomers();
    orders = await getOrders();
    inventory = await getInventory();
    locations = await getLocations();
    addLocationsToDropdown();
    addCustomersToTable(customers);
    document.getElementById("customer-name-navbar").addEventListener("click", handleCustomerPageClick);
    document.getElementById("customerOrderPageButton").addEventListener("click", handleCustomerOrderClick);
    document.getElementById("cartPageButton").addEventListener("click", handleCartPageClick);
    document.getElementById("createCustomerForm").addEventListener("submit", handleCreateCustomerClick);
}

function addLocationsToDropdown() {
    try {
        let dropdown = document.getElementById("locationDropdown");
        for (let i = 0; i < locations.length; i++) {
            let childLi = dropdown.appendChild(document.createElement("li"));
            let childButton = childLi.appendChild(document.createElement("button"));
            childButton.classList.add("dropdown-item");
            childButton.setAttribute("type", "button");
            childButton.textContent = locations[i];
            childButton.addEventListener("click", handleLocationClick);
        }
    }
    catch (error) {
        console.log("error adding locations to dropdown.");
    }
}

function refreshCustomers() {
    fetch('/api/customers')
        .then(response => response.json())
        .then(response => { customers = response; addCustomersToTable(response); return response;});
}

function removeCart() {
    cart = {};
    handleCartPageClick();
}

function handleCreateCustomerClick(event) {
    try {
        event.preventDefault();
        const customerForm = document.getElementById('createCustomerForm');
        let customerBalance = parseFloat(customerForm.elements["balanceInput"].value);

        const customer = {
            firstName: customerForm.elements["firstNameInput"].value,
            lastName: customerForm.elements["lastNameInput"].value,
            balance: customerBalance,
        };

        if (customerBalance < 0 || !customer.firstName.match(`^[a-zA-Z0-9]+$`) || !customer.lastName.match(`^[a-zA-Z0-9]+$`)) {
            throw new Error("Invalid customer name or balance.");
        }

        createCustomer(customer);
        customerForm.elements["firstNameInput"].value = '';
        customerForm.elements["lastNameInput"].value = '';
        customerForm.elements["balanceInput"].value = '';
    }
    catch (error) {
        alert("Invalid customer name or balance.");
    }
}

function createCustomer(customer) {
    return fetch('/api/new/customer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(customer)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }
        else {
            refreshCustomers();
        }
    });
}

function handleLocationOrdersClick(location) {
    try {
        let locationOrders = filterOrderByLocation(orders, location);
        toggleMainView("inventory");
        let table = document.getElementById("locationOrdersTableBody");

        while (table.children.length) {
            table.removeChild(table.lastChild);
        }

        for (let i = 0; i < locationOrders.length; i++) {
            for (let j = 0; j < locationOrders[i].products.length; j++) {
                let order = locationOrders[i];
                let prod = locationOrders[i].products[j];
                const row = table.insertRow();
                row.innerHTML = `<td>${order.orderId}</td>
                        <td>${order.customerId}</td>
                        <td>${order.location}</td>
                        <td>${prod.name}</td>
                        <td>${prod.amount}</td>
                        <td>${locationOrders[i].time}</td>`;
            }
        }
    }
    catch (error) {
        console.log("error opening location orders page.");
    }
}

function handleLocationClick(event) {
    try {
        let elem = event.target.closest('button');
        if (elem.nodeName == "BUTTON") {
            if (currentLocation && currentLocation != elem.textContent) {
                cart = {};
            }
            currentLocation = elem.textContent;
            handleLocationOrdersClick(currentLocation);
            toggleMainView("inventory");
            let table = document.getElementById("inventoryTableBody");

            while (table.childNodes.length > 0) {
                table.removeChild(table.lastChild);
            }

            let locationInventory = inventory[elem.textContent];
            for (let i = 0; i < locationInventory.length; i++) {
                let prod = locationInventory[i];
                let row = table.insertRow();
                let price = parseFloat(prod.price).toFixed(2);
                row.innerHTML = `<td>${prod.productId}</td>
                            <td>${prod.name}</td>
                            <td>${price}</td>
                            <td><input type="number" onkeydown="return false" min=0 max=${prod.amount} placeholder="${prod.amount}" size=5></td>`;
                row.setAttribute("productId", prod.productId);
                row.setAttribute("productName", prod.name);
                row.setAttribute("price", prod.price);
            }
        }
    }
    catch (error) {
        console.log("error opening location page.");
    }
}

function filterOrderByCustomer(allOrders, customer)
{
    return allOrders.filter((order) => { return order.customerId == customer.getAttribute("customerId");});
}

function filterOrderByLocation(allOrders, location) {
    return allOrders.filter((order) => { return order.location == location; });
}

async function getInventory() {
    let inventoryDict = {};
    try {
        let response = await fetch('/api/inventory');
        if (response.ok) {
            return await response.json();
        }
        else {
            alert("Could not get inventory.");
        }
    }
    catch (error) {
        console.log("error getting inventory from db.");
    }
    return inventoryDict;
}

async function getLocations() {
    let locationList;
    try {
        let response = await fetch('/api/locations');
        if (response.ok) {
            locationList = await response.json();
        }
        else {
            alert("Could not get locations.");
        }
    }
    catch (error) {
        console.log("error retrieving locations from db.");
    }
    return locationList;
}

async function getCustomers()
{
    let listOfCustomers;
    try {
        let response = await fetch('/api/customers');
        if (response.ok) {
            listOfCustomers = await response.json();
        }
        else {
            alert("Could not get customers");
        }
    }
    catch (error) {
        console.log("error retrieving customers from db.");
    }
    return listOfCustomers;
}

async function getOrders()
{
    let listOfOrders = [];
    try {
        let response = await fetch('/api/orders');
        if (response.ok) {
            return await response.json();
        }
        else {
            alert("Could not get orders");
        }
    }
    catch (error) {
        console.log("error retrieving orders from db.");
    }
    return listOfOrders;
}

function handleLocationOrderClick(event) {
    try {
        let inventoryTable = document.getElementById("inventoryTable");
        let addCartButton = document.getElementById("addToCartButton");
        let locationOrdersTable = document.getElementById("locationOrdersTable");

        inventoryTable.hidden = !inventoryTable.hidden;
        addCartButton.hidden = !addCartButton.hidden;
        locationOrdersTable.hidden = !locationOrdersTable.hidden;
    }
    catch (error) {
        console.log("error switching from inventory <> order");
    }
}

function handleCartPageClick() {
    try {
        let table = document.getElementById("cartTableBody");

        while (table.children.length) {
            table.removeChild(table.lastChild);
        }

        for (const productId in cart) {
            let row = table.insertRow();
            let price = parseFloat(cart[productId].price);
            row.innerHTML = `<td>${productId}</td>
                        <td>${cart[productId].productName}</td>
                        <td>${price.toFixed(2)}</td>
                        <td>${cart[productId].amount}</td>`;
            row.setAttribute("productId", productId);
        }
    }
    catch (error) {
        console.log("error opening cart page.");
    }
}

function handleAddToCart(event) {
    try {
        let tableBody = document.getElementById("inventoryTableBody");

        for (let i = 0; i < tableBody.childNodes.length; i++) {
            let prod = tableBody.children[i];
            let prodInput = prod.children[3].firstChild;

            let cartObject = {
                productId: prod.getAttribute("productId"),
                productName: prod.getAttribute("productName"),
                price: prod.getAttribute("price"),
                amount: isNaN(parseInt(prodInput.value)) ? 0 : parseInt(prodInput.value),
            };

            if (cartObject.amount > 0) {
                if (cartObject.productId in cart) {
                    cart[cartObject.productId].amount += cartObject.amount;
                }
                else {
                    cart[cartObject.productId] = cartObject;
                }
            }
        }

        clearInventoryValues();
    }
    catch (error) {
        console.log("error adding to cart.");
    }
}

function addCustomersToTable(currentCustomers) {
    try {
        toggleMainView("customer");
        let table = document.getElementById("customerTableBody");

        while (table.childNodes.length) {
            table.removeChild(table.lastChild);
        }

        for (let i = 0; i < currentCustomers.length; i++) {
            const row = table.insertRow();
            let balance = parseFloat(currentCustomers[i].balance);
            row.innerHTML = `<td>${currentCustomers[i].customerId}</td>
                        <td>${currentCustomers[i].firstName}</td>
                        <td>${currentCustomers[i].lastName}</td>
                        <td>${balance.toFixed(2)}</td>`;
            row.setAttribute("customerId", currentCustomers[i].customerId);
            row.setAttribute("customerFirst", currentCustomers[i].firstName);
            row.setAttribute("customerLast", currentCustomers[i].lastName);
            row.setAttribute("customerBalance", currentCustomers[i].balance);

            if (!currentCustomer || (currentCustomer && currentCustomer.getAttribute("customerId") == currentCustomers[i].customerId)) {
                changeCurrentCustomer(row);
            }
        }
    }
    catch (error) {
        console.log("error adding customers to page.");
    }

}

async function handleCheckoutClick(event) {
    try {
        checkCartInStock(cart);
        removeCartItemsFromInventory(inventory, cart);
        let finalOrder = createFinalOrder(cart);
        toggleCartButtons();
        await addDbOrder(finalOrder);
        await updateDbInventory(inventory);
        toggleCartButtons();
        cart = {};
        handleCartPageClick();
        orders = await getOrders();
    }
    catch (error) {
        console.log("error checking out.");
    }
}

async function updateDbInventory(currentInventory) {
    return fetch('/api/update/inventory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentInventory)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        } else {
            return response;
        }
    });
}

function createFinalOrder(currentCart) {
    let date = new Date();
    let finalOrder = {};
    finalOrder.location = currentLocation;
    finalOrder.customerId = currentCustomer.getAttribute("customerId");
    finalOrder.products = [];
    finalOrder.time = `${date.getMonth()}/${date.getDay()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    for (const productId in currentCart) {
        finalOrder.products.push(
            {
                productId : parseInt(cart[productId].productId),
                name: cart[productId].productName,
                amount: parseInt(cart[productId].amount),
                price: parseFloat(cart[productId].price),
            }
        );
    }
    return finalOrder;
}

function removeCartItemsFromInventory(currentInventory, currentCart) {
    for (const productId in currentCart) {
        let inventoryProd = currentInventory[currentLocation].find((p) => { return p.productId == productId; });
        inventoryProd.amount -= currentCart[productId].amount;
    }
}

async function addDbOrder(finalOrder) {
    return fetch('/api/new/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalOrder)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }
        else {
            return response;
        }
    });
}

function checkCartInStock(currentCart) {
    for (let productId in currentCart) {
        let prod = inventory[currentLocation].find((p) => { return p.productId == productId });
        if (currentCart[productId].amount > prod.amount) {
            throw new Error("Not enough in stock for " + prod.name);
        }
    }
}

function changeCurrentCustomer(elem) {
    if (elem.nodeName == "TR") {
        document.getElementById("customer-name-navbar").innerHTML =
            elem.getAttribute("customerFirst") + " " + elem.getAttribute("customerLast");
        if (currentCustomer) {
            currentCustomer.classList.remove("table-primary");
        }
        elem.classList.add("table-primary");
        currentCustomer = elem;
        document.getElementById("navbarDropdownMenuLink").classList.remove("disabled");
        document.getElementById("customerOrderPageButton").classList.remove("disabled");
        document.getElementById("cartPageButton").classList.remove("disabled");
    }
}

function handleCustomerClick(event)
{
    toggleMainView("customer");
    let elem = event.target.closest('tr');
    cart = {};
    changeCurrentCustomer(elem);
}

function handleCustomerPageClick(event)
{
    addCustomersToTable(customers);
}

function clearInventoryValues() {
    let table = document.getElementById("inventoryTableBody");
    for (let elem of table.querySelectorAll("input")) {
        elem.value = "";
    }
}

function handleCustomerOrderClick(event)
{
    try {
        let customerOrders = filterOrderByCustomer(orders, currentCustomer);
        toggleMainView("orderTable");
        let table = document.getElementById("orderTableBody");

        while (table.childNodes.length) {
            table.removeChild(table.lastChild);
        }

        for (let i = 0; i < customerOrders.length; i++) {
            for (let j = 0; j < customerOrders[i].products.length; j++) {
                let order = customerOrders[i];
                let prod = customerOrders[i].products[j];
                const row = table.insertRow();
                row.innerHTML = `<td>${order.orderId}</td>
                        <td>${order.customerId}</td>
                        <td>${order.location}</td>
                        <td>${prod.name}</td>
                        <td>${prod.amount}</td>
                        <td>${customerOrders[i].time}</td>`;
            }
        }
    }
    catch (error) {
        console.log("error opening customer order page.");
    }
}

function toggleCartButtons() {
    let checkoutBtn = document.getElementById("checkoutButton");
    let clearBtn = document.getElementById("deleteCartButton");

    if (checkoutBtn.classList.contains("disabled")) {
        checkoutBtn.classList.remove("disabled");
    } else {
        checkoutBtn.classList.add("disabled");
    }

    if (clearBtn.classList.contains("disabled")) {
        clearBtn.classList.remove("disabled");
    } else {
        clearBtn.classList.add("disabled");
    }
}

function toggleMainView(currentView)
{
    try {
        for (const index in allViews) {
            let table = allViews[index];
            let elem = document.getElementById(table);
            if (currentView === table) {
                elem.hidden = false;
                continue;
            }
            elem.hidden = true;
        }
    }
    catch (error) {
        console.log("error toggling views.");
    }
}

init();