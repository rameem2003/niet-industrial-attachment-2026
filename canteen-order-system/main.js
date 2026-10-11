// ---------- data ----------
const menu = [
  { id: 1, name: "Biryani", price: 120, image: "🍛" },
  { id: 2, name: "Burger", price: 90, image: "🍔" },
  { id: 3, name: "Pizza", price: 150, image: "🍕" },
  { id: 4, name: "Fries", price: 60, image: "🍟" },
  { id: 5, name: "Sandwich", price: 70, image: "🥪" },
  { id: 6, name: "Coffee", price: 40, image: "☕" },
  { id: 7, name: "Cold Drink", price: 30, image: "🥤" },
  { id: 8, name: "Cake", price: 80, image: "🍰" },
];

// picked items: [{ id, name, price, qty }]
let cart = [];

// ---------- elements ----------
const menuList = document.getElementById("menu-list");
const cartList = document.getElementById("cart-list");
const totalPriceEl = document.getElementById("total-price");
const confirmBtn = document.getElementById("confirm-btn");
const mainScreen = document.getElementById("main-screen");
const tokenScreen = document.getElementById("token-screen");
const newOrderBtn = document.getElementById("new-order-btn");

// ---------- render menu ----------
function renderMenu() {
  let html = "";

  menu.forEach((item) => {
    html += `
      <div class="food-card">
        <div class="image">${item.image}</div>
        <div class="name">${item.name}</div>
        <div class="price">Tk ${item.price}</div>
        <button onclick="addToCart(${item.id})">Add</button>
      </div>`;
  });

  menuList.innerHTML = html;
}

// ---------- cart ----------
function addToCart(id) {
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    const food = menu.find((item) => item.id === id);
    cart.push({ id: food.id, name: food.name, price: food.price, qty: 1 });
  }

  renderCart();
}

function increaseQty(id) {
  const item = cart.find((item) => item.id === id);
  item.qty += 1;
  renderCart();
}

function decreaseQty(id) {
  const item = cart.find((item) => item.id === id);

  item.qty -= 1;

  // quantity 0 = remove item
  if (item.qty <= 0) {
    removeItem(id);
    return;
  }

  renderCart();
}

function removeItem(id) {
  cart = cart.filter((item) => item.id !== id);
  renderCart();
}

// ---------- total price using REDUCE ----------
function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ---------- render cart ----------
function renderCart() {
  if (cart.length === 0) {
    cartList.innerHTML = '<p class="empty">No items added yet.</p>';
    totalPriceEl.textContent = "Tk 0";
    return;
  }

  let html = "";

  cart.forEach((item) => {
    html += `
      <div class="cart-item">
        <span class="item-name">${item.name}</span>
        <span class="qty-box">
          <button onclick="decreaseQty(${item.id})">-</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty(${item.id})">+</button>
        </span>
        <span>Tk ${item.price * item.qty}</span>
        <button class="delete-btn" onclick="removeItem(${item.id})">X</button>
      </div>`;
  });

  cartList.innerHTML = html;
  totalPriceEl.textContent = `Tk ${calculateTotal()}`;
}

// ---------- confirm order ----------
confirmBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Please add at least one item.");
    return;
  }

  // two prompts: name then number
  const name = prompt("Enter customer name:");
  if (name === null || name.trim() === "") {
    alert("Name is required.");
    return;
  }

  const phone = prompt("Enter customer number:");
  if (phone === null || phone.trim() === "") {
    alert("Number is required.");
    return;
  }

  showToken(name.trim(), phone.trim());
});

// ---------- show token ----------
function showToken(name, phone) {
  document.getElementById("token-id").textContent = `#${Math.floor(1000 + Math.random() * 9000)}`;
  document.getElementById("token-name").textContent = name;
  document.getElementById("token-phone").textContent = phone;
  document.getElementById("token-total").textContent = `Tk ${calculateTotal()}`;

  let html = "";
  cart.forEach((item) => {
    html += `
      <div class="token-item">
        <span>${item.name} x ${item.qty}</span>
        <span>Tk ${item.price * item.qty}</span>
      </div>`;
  });
  document.getElementById("token-items").innerHTML = html;

  // swap screens
  mainScreen.classList.add("hidden");
  tokenScreen.classList.remove("hidden");
}

// ---------- new order ----------
newOrderBtn.addEventListener("click", () => {
  cart = [];
  renderCart();
  tokenScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");
});

// ---------- start ----------
renderMenu();
renderCart();
