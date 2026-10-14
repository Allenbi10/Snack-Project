const snacks = [
  { id: "doritos", name: "Doritos", price: 1.00, stock: 8, category: "salty", image: "assets/snacks/doritos.png", color: "#d8c3a5", tag: "Salty snack" },
  { id: "hot-cheetos", name: "Hot Cheetos", price: 1.50, stock: 12, category: "salty", image: "assets/snacks/hot_cheeto.png", color: "#d3ad91", tag: "Salty snack" },
  { id: "takis", name: "Takis", price: 1.50, stock: 10, category: "salty", image: "assets/snacks/takis.png", color: "#d6b9a6", tag: "Salty snack" },
  { id: "kitkat", name: "KitKat", price: 2.00, stock: 9, category: "sweet", image: "assets/snacks/kitkat.png", color: "#c9a58b", tag: "Sweet snack" },
  { id: "reeses", name: "Reese's", price: 1.50, stock: 8, category: "sweet", image: "assets/snacks/reeses.png", color: "#c9a477", tag: "Sweet snack" },
  { id: "skittles", name: "Skittles", price: 1.00, stock: 8, category: "sweet", image: "assets/snacks/skittles.png", color: "#d6c59b", tag: "Sweet snack" },
  { id: "sour-patch-kids", name: "Sour Patch Kids", price: 1.00, stock: 3, category: "sweet", image: "assets/snacks/sour_patch_kids.png", color: "#c3c8aa", tag: "Sweet snack" },
  { id: "trolli", name: "Trolli Gummies", price: 1.50, stock: 5, category: "sweet", image: "assets/snacks/trolli.png", color: "#c4b9a4", tag: "Sweet snack" }
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
  if (amount === 0) return "This item is currently unavailable.";
  if (amount === 1) return "There is 1 item remaining.";
  return `There are ${amount} items in stock.`;
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
            <button class="buy-button" type="button" data-buy="${snack.id}" aria-label="Add ${snack.name} to cart" ${amount === 0 ? "disabled" : ""}>${amount === 0 ? "Unavailable" : "Add"}</button>
          </div>
        </div>
      </article>`;
  }).join("");
}

function renderCart() {
  const selected = snacks.filter(snack => cart[snack.id] > 0);
  const itemCount = selected.reduce((total, snack) => total + cart[snack.id], 0);
  const total = selected.reduce((sum, snack) => sum + snack.price * cart[snack.id], 0);
  cartCount.textContent = itemCount === 0 ? "There are no items in your cart." : itemCount === 1 ? "There is 1 item in your cart." : `There are ${itemCount} items in your cart.`;

  if (selected.length === 0) {
    cartContent.innerHTML = `
      <div class="cart-empty">
        <span class="material-symbols-outlined cart-empty-icon" aria-hidden="true">shopping_cart</span>
        <div><strong>Your shopping cart is empty.</strong></div>
      </div>`;
    return;
  }

  cartContent.innerHTML = `
    <div class="cart-items">
      ${selected.map(snack => `
        <div class="cart-item">
          <img class="cart-item-photo" src="${snack.image}" alt="${snack.name}">
          <div class="cart-item-info">
            <strong>${snack.name}</strong>
            <span>$${snack.price.toFixed(2)} each</span>
          </div>
          <span class="cart-quantity"><span class="material-symbols-outlined quantity-icon" aria-hidden="true">close</span>${cart[snack.id]}</span>
          <strong class="cart-item-total">$${(snack.price * cart[snack.id]).toFixed(2)}</strong>
          <button class="remove-button" type="button" data-remove="${snack.id}" aria-label="Remove one ${snack.name}">Remove one item</button>
        </div>`).join("")}
    </div>
    <div class="cart-total"><span>Your total payment at pickup is</span><strong>$${total.toFixed(2)}</strong></div>`;
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
  showToast(`${snack.name} has been added to your cart. You will pay $${snack.price.toFixed(2)} at pickup.`);
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
  showToast(`${snack.name} has been removed from your cart and returned to stock.`);
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
