const snacks = [
  { id: "hot-chips", name: "Hot Chips", price: 1.50, stock: 12, category: "salty", emoji: "🌶️", image: "assets/snacks/hot-chips.jpg", color: "#ff9c74", tag: "Fan favorite" },
  { id: "cheese-crackers", name: "Cheese Crackers", price: 1.00, stock: 8, category: "salty", emoji: "🧀", image: "assets/snacks/cheese-crackers.jpg", color: "#ffd85e", tag: "Classic" },
  { id: "gummy-bears", name: "Gummy Bears", price: 1.50, stock: 5, category: "sweet", emoji: "🍬", image: "assets/snacks/gummy-bears.jpg", color: "#c9b5ee", tag: "Sweet" },
  { id: "chocolate-bar", name: "Chocolate Bar", price: 2.00, stock: 9, category: "sweet", emoji: "🍫", image: "assets/snacks/chocolate-bar.jpg", color: "#d7ad85", tag: "Top pick" },
  { id: "fruit-chews", name: "Fruit Chews", price: 1.00, stock: 3, category: "sweet", emoji: "🍓", image: "assets/snacks/fruit-chews.jpg", color: "#f5aabd", tag: "Almost gone" },
  { id: "sparkling-water", name: "Sparkling Water", price: 1.50, stock: 10, category: "drink", emoji: "🥤", image: "assets/snacks/sparkling-water.jpg", color: "#a9dcd4", tag: "Chilled" }
];

const storageKey = "snack-shack-stock-v1";
const cartStorageKey = "snack-shack-cart-v1";
const grid = document.querySelector("#snack-grid");
const cartContent = document.querySelector("#cart-content");
const cartCount = document.querySelector("#cart-count");
const toast = document.querySelector("#toast");
let activeFilter = "all";

function loadStock() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Object.fromEntries(snacks.map(snack => [snack.id, Number.isInteger(saved?.[snack.id]) ? saved[snack.id] : snack.stock]));
  } catch {
    return Object.fromEntries(snacks.map(snack => [snack.id, snack.stock]));
  }
}

let stock = loadStock();

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(cartStorageKey));
    return Object.fromEntries(snacks.map(snack => [snack.id, Number.isInteger(saved?.[snack.id]) && saved[snack.id] > 0 ? saved[snack.id] : 0]));
  } catch {
    return Object.fromEntries(snacks.map(snack => [snack.id, 0]));
  }
}

let cart = loadCart();

function stockLabel(amount) {
  if (amount === 0) return "Sold out";
  if (amount <= 3) return `Only ${amount} left`;
  return `${amount} in stock`;
}

function renderSnacks() {
  const visible = snacks.filter(snack => activeFilter === "all" || snack.category === activeFilter);
  grid.innerHTML = visible.map(snack => {
    const amount = stock[snack.id];
    const status = amount === 0 ? "out" : amount <= 3 ? "low" : "";
    return `
      <article class="snack-card">
        <div class="snack-visual" style="--card-color: ${snack.color}">
          <span class="snack-tag">${snack.tag}</span>
          <img class="snack-photo" src="${snack.image}" alt="${snack.name}" loading="lazy">
        </div>
        <div class="snack-body">
          <div class="snack-topline">
            <h3 class="snack-name">${snack.name}</h3>
            <span class="price">$${snack.price.toFixed(2)}</span>
          </div>
          <div class="stock-row">
            <span class="stock ${status}"><span class="stock-dot"></span>${stockLabel(amount)}</span>
            <button class="buy-button" type="button" data-buy="${snack.id}" ${amount === 0 ? "disabled" : ""}>${amount === 0 ? "Sold out" : "Get one"}</button>
          </div>
        </div>
      </article>`;
  }).join("");
}

function renderCart() {
  const selected = snacks.filter(snack => cart[snack.id] > 0);
  const itemCount = selected.reduce((total, snack) => total + cart[snack.id], 0);
  const total = selected.reduce((sum, snack) => sum + snack.price * cart[snack.id], 0);
  cartCount.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  if (selected.length === 0) {
    cartContent.innerHTML = `
      <div class="cart-empty">
        <span aria-hidden="true">🛒</span>
        <div><strong>Your cart is empty.</strong><p>Choose a snack above to add it here.</p></div>
      </div>`;
    return;
  }

  cartContent.innerHTML = `
    <div class="cart-items">
      ${selected.map(snack => `
        <div class="cart-item">
          <span class="cart-item-emoji" style="--cart-color: ${snack.color}" aria-hidden="true">${snack.emoji}</span>
          <div class="cart-item-info">
            <strong>${snack.name}</strong>
            <span>$${snack.price.toFixed(2)} each</span>
          </div>
          <span class="cart-quantity">× ${cart[snack.id]}</span>
          <strong class="cart-item-total">$${(snack.price * cart[snack.id]).toFixed(2)}</strong>
          <button class="remove-button" type="button" data-remove="${snack.id}" aria-label="Remove one ${snack.name}">Remove one</button>
        </div>`).join("")}
    </div>
    <div class="cart-total"><span>Total to pay at pickup</span><strong>$${total.toFixed(2)}</strong></div>`;
}

function reserveSnack(id) {
  const snack = snacks.find(item => item.id === id);
  if (!snack || stock[id] <= 0) return;
  stock[id] -= 1;
  cart[id] += 1;
  localStorage.setItem(storageKey, JSON.stringify(stock));
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  renderSnacks();
  renderCart();
  showToast(`${snack.name} added — pay $${snack.price.toFixed(2)} at pickup.`);
}

function removeSnack(id) {
  const snack = snacks.find(item => item.id === id);
  if (!snack || cart[id] <= 0) return;
  cart[id] -= 1;
  stock[id] += 1;
  localStorage.setItem(storageKey, JSON.stringify(stock));
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  renderSnacks();
  renderCart();
  showToast(`${snack.name} removed and returned to stock.`);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

grid.addEventListener("click", event => {
  const button = event.target.closest("[data-buy]");
  if (button) reserveSnack(button.dataset.buy);
});

cartContent.addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (button) removeSnack(button.dataset.remove);
});

document.querySelector(".filter-row").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderSnacks();
});

renderSnacks();
renderCart();
