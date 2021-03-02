let currentCustomer;
let currentLocation;
let customers;
let orders;
let inventory;
let locations;
let allViews = ["customerTable", "inventory", "orderTable", "cart"];
let cart = {};

async function init()
{
    customers = await getCustomers();
    orders = await getOrders();
    inventory = await getInventory();
    locations = await getLocations();
    addLocationsToDropdown();
    document.getElementById("customer-name-navbar").addEventListener("click", handleCustomerPageClick);
    document.getElementById("customerOrderPageButton").addEventListener("click", handleCustomerOrderClick);
    document.getElementById("cartPageButton").addEventListener("click", handleCartPageClick);
}

function addLocationsToDropdown() {
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

function removeCart() {
    cart = {};
    handleCartPageClick();
}

function handleLocationOrdersClick(location) {
    locationOrders = filterOrderByLocation(orders, location);
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
                        <td>${prod.amount}</td>`;
        }
    }
}

function handleLocationClick(event) {
    let elem = event.target.closest('button');
    if (elem.nodeName == "BUTTON") {
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
            row.innerHTML = `<td>${prod.productId}</td>
                            <td>${prod.name}</td>
                            <td>${prod.price}</td>
                            <td><input type="number" onkeydown="return false" min=0 max=${prod.amount} placeholder="${prod.amount}" size=5></td>`;
            row.setAttribute("productId", prod.productId);
            row.setAttribute("productName", prod.name);
            row.setAttribute("price", prod.price);
        }
    }
}

function filterOrderByCustomer(orders, customer)
{
    let j = customer.getAttribute("customerId");
    return orders.filter((order) => { return order.customerId == customer.getAttribute("customerId");});
}

function filterOrderByLocation(orders, location) {
    return orders.filter((order) => { return order.location == location; });
}

async function getInventory() {
    let response = await fetch('/api/inventory');
    let inventoryDict;
    if (response.ok) {
        inventoryDict = await response.json();
    }
    else {
        alert("Could not get inventory.");
    }
    return inventoryDict;
}

async function getLocations() {
    let response = await fetch('/api/locations');
    let locationList;
    if (response.ok) {
        locationList = await response.json();
    }
    else {
        alert("Could not get locations.");
    }
    return locationList;
}

async function getCustomers()
{
    let response = await fetch('/api/customers');
    let listOfCustomers;
    if (response.ok)
    {
        listOfCustomers = await response.json();
    }
    else
    {
        alert("Could not get customers");
    }
    return listOfCustomers;
}

async function getOrders()
{
    let response = await fetch('/api/orders');
    let listOfOrders;
    if (response.ok)
    {
        listOfOrders = await response.json();
    }
    else
    {
        alert("Could not get orders");
    }
    return listOfOrders;
}

function handleLocationOrderClick(event) {
    let inventoryTable = document.getElementById("inventoryTable");
    let addCartButton = document.getElementById("addToCartButton");
    let locationOrdersTable = document.getElementById("locationOrdersTable");
    inventoryTable.hidden = !inventoryTable.hidden;
    addCartButton.hidden = !addCartButton.hidden;
    locationOrdersTable.hidden = !locationOrdersTable.hidden;
}

function handleCartPageClick() {
    let table = document.getElementById("cartTableBody");

    while (table.children.length) {
        table.removeChild(table.lastChild);
    }

    for (const productId in cart) {
        let row = table.insertRow();
        row.innerHTML = `<td>${productId}</td>
                        <td>${cart[productId].productName}</td>
                        <td>${cart[productId].price}</td>
                        <td>${cart[productId].amount}</td>`;
    }
}

function handleAddToCart(event) {
    let tableBody = document.getElementById("inventoryTableBody");
    for (let i = 0; i < tableBody.childNodes.length; i++) {
        let prod = tableBody.children[i];
        let prodInput = prod.children[3].firstChild;
        let cartObject = {
            location: currentLocation,
            productId : prod.getAttribute("productId"),
            productName : prod.getAttribute("productName"),
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
}

function handleCustomerClick(event)
{
    let elem = event.target.closest('tr');
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

function handleCustomerPageClick(event)
{
    toggleMainView("customerTable");
    let table = document.getElementById("customerTableBody");

    while (table.childNodes.length)
    {
        table.removeChild(table.lastChild);
    }

    for (let i = 0; i < customers.length; i++)
    {
        const row = table.insertRow();
        row.innerHTML = `<td>${customers[i].customerId}</td>
                        <td>${customers[i].firstName}</td>
                        <td>${customers[i].lastName}</td>
                        <td>${customers[i].balance}</td>`;
        row.setAttribute("customerId", customers[i].customerId);
        row.setAttribute("customerFirst", customers[i].firstName);
        row.setAttribute("customerLast", customers[i].lastName);
        row.setAttribute("customerBalance", customers[i].balance);
        if (currentCustomer && currentCustomer.getAttribute("customerId") == customers[i].customerId) {
            row.classList.add("table-primary");
            currentCustomer = row;
        }
    }
}

function handleCustomerOrderClick(event)
{
    customerOrders = filterOrderByCustomer(orders, currentCustomer);
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
                        <td>${prod.amount}</td>`;
        }
    }
}

function toggleMainView(currentView)
{   
    for (const index in allViews) {
        let table = allViews[index];
        let elem = document.getElementById(table);
        if (currentView === table)
        {
            elem.hidden = false;
            continue;
        }
        elem.hidden = true;
    }
}

init();