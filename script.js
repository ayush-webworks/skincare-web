
/* =========================================
   LUMIÈRE SKIN — DEMO STORE SCRIPT
   Demo checkout only. No real payment.
========================================= */

"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const PRODUCTS = [
  {
    id: 1, name: "BHA Liquid Exfoliant", category: "exfoliant",
    price: 799, oldPrice: 999, rating: 4.8, tag: "BESTSELLER",
    description: "A gentle exfoliant concept for a smoother-looking complexion.",
    ingredients: "Illustrative formula: salicylic acid, soothing humectants.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 2, name: "Dew Drop Serum", category: "serum",
    price: 999, oldPrice: 1299, rating: 4.9, tag: "GLOW FAVOURITE",
    description: "A lightweight hydration serum concept for an everyday glow.",
    ingredients: "Illustrative formula: hyaluronic acid, glycerin.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 3, name: "Cloud Cream Moisturiser", category: "moisturiser",
    price: 849, oldPrice: 1099, rating: 4.7, tag: "DAILY ESSENTIAL",
    description: "A comfort-first moisturiser concept for your daily routine.",
    ingredients: "Illustrative formula: emollients, glycerin.",
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 4, name: "Evening Renewal Oil", category: "treatment",
    price: 1199, oldPrice: 1499, rating: 4.6, tag: "NIGHT RITUAL",
    description: "A nourishing facial oil concept for an evening skincare ritual.",
    ingredients: "Illustrative formula: plant oils and emollients.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 5, name: "Snail Essence", category: "essence",
    price: 899, oldPrice: 1099, rating: 4.7, tag: "HYDRATION",
    description: "A hydrating essence concept to layer into your routine.",
    ingredients: "Illustrative formula: humectants and skin-conditioning ingredients.",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 6, name: "Daily Glow Toner", category: "toner",
    price: 699, oldPrice: 899, rating: 4.5, tag: "FRESH START",
    description: "A refreshing toner concept for a simple skincare routine.",
    ingredients: "Illustrative formula: water-based skin-conditioning ingredients.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 7, name: "Soft Foam Cleanser", category: "cleanser",
    price: 599, oldPrice: 749, rating: 4.6, tag: "GENTLE CLEANSE",
    description: "A gentle cleanser concept for the first step of your routine.",
    ingredients: "Illustrative formula: mild cleansing agents and humectants.",
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: 8, name: "Daily Veil Sunscreen", category: "sunscreen",
    price: 749, oldPrice: 949, rating: 4.8, tag: "DAYTIME CARE",
    description: "A sunscreen product concept. Check verified SPF and local labelling before real-world use.",
    ingredients: "Illustrative only. Actual UV filters and SPF are not verified.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85"
  }
];

const STORAGE = {
  cart: "lumiere_demo_cart_v3",
  wishlist: "lumiere_demo_wishlist_v3",
  orders: "lumiere_demo_orders_v3",
  user: "lumiere_demo_user_v3",
  reviews: "lumiere_demo_reviews_v3"
};

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    showToast("Browser storage is unavailable.");
  }
}

let cart = readStore(STORAGE.cart, {});
let wishlist = readStore(STORAGE.wishlist, []);
let orders = readStore(STORAGE.orders, []);
let demoUser = readStore(STORAGE.user, null);
let appliedCoupon = false;
let activeCategory = "all";
let checkoutStep = 1;
let checkoutData = {};
let toastTimer;

const money = amount => "₹" + Math.round(amount).toLocaleString("en-IN");
const safe = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function getProduct(id) {
  return PRODUCTS.find(product => product.id === Number(id));
}

function getCartLines() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ product: getProduct(id), qty: Number(qty) }))
    .filter(line => line.product && line.qty > 0);
}

function getSubtotal() {
  return getCartLines().reduce((sum, line) => sum + line.product.price * line.qty, 0);
}

function getDiscount() {
  return appliedCoupon ? Math.round(getSubtotal() * 0.10) : 0;
}

function getShipping() {
  const subtotal = getSubtotal() - getDiscount();
  return subtotal === 0 || subtotal >= 1999 ? 0 : 99;
}

function getTotal() {
  return Math.max(0, getSubtotal() - getDiscount() + getShipping());
}

function cartCount() {
  return getCartLines().reduce((sum, line) => sum + line.qty, 0);
}

function renderProducts() {
  const grid = $("#productGrid");
  if (!grid) return;

  const query = ($("#productSearch")?.value || "").trim().toLowerCase();

  const matches = PRODUCTS.filter(product => {
    const categoryMatch = activeCategory === "all" || product.category === activeCategory;
    const queryMatch = `${product.name} ${product.category} ${product.description}`
      .toLowerCase().includes(query);
    const wishlistOnly = document.body.dataset.wishlistOnly === "true";
    return categoryMatch && queryMatch && (!wishlistOnly || wishlist.includes(product.id));
  });

  if (!matches.length) {
    grid.innerHTML = '<p class="empty">No products found. Try another search.</p>';
    return;
  }

  grid.innerHTML = matches.map(product => `
    <article class="product-card">
      <a class="product-photo" href="product.html?id=${product.id}">
        <img src="${product.image}" alt="${safe(product.name)}" loading="lazy">
        <span class="product-tag">${safe(product.tag)}</span>
      </a>
      <button class="heart ${wishlist.includes(product.id) ? "selected" : ""}"
        data-wishlist="${product.id}" aria-label="Toggle wishlist">${wishlist.includes(product.id) ? "♥" : "♡"}</button>
      <div class="product-info">
        <p class="product-category">${safe(product.category)}</p>
        <h3><a href="product.html?id=${product.id}">${safe(product.name)}</a></h3>
        <p class="rating">★★★★★ <span>${product.rating} · demo rating</span></p>
        <p class="price">${money(product.price)} <del>${money(product.oldPrice)}</del></p>
        <div class="product-actions">
          <a class="text-link" href="product.html?id=${product.id}">Details ↗</a>
          <button class="btn small-btn" data-add="${product.id}">Add to bag</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderWishlistCount() {
  const count = $("#wishlistCount");
  if (count) count.textContent = wishlist.length;
}

function toggleWishlist(id) {
  id = Number(id);
  wishlist = wishlist.includes(id)
    ? wishlist.filter(item => item !== id)
    : [...wishlist, id];
  saveStore(STORAGE.wishlist, wishlist);
  renderWishlistCount();
  renderProducts();
  renderProductDetail();
  showToast(wishlist.includes(id) ? "Added to wishlist ♡" : "Removed from wishlist");
}

function addToCart(id, qty = 1) {
  id = Number(id);
  if (!getProduct(id)) return;
  cart[id] = Math.min(99, (Number(cart[id]) || 0) + qty);
  saveStore(STORAGE.cart, cart);
  renderCart();
  showToast("Added to your bag ✨");
}

function changeCartQty(id, amount) {
  id = Number(id);
  const next = (Number(cart[id]) || 0) + amount;
  if (next <= 0) delete cart[id];
  else cart[id] = Math.min(99, next);
  saveStore(STORAGE.cart, cart);
  renderCart();
}

function renderCart() {
  const count = cartCount();
  ["headerCartCount", "drawerCartCount"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  });

  const items = $("#cartItems");
  if (items) {
    const lines = getCartLines();
    items.innerHTML = lines.length ? lines.map(({ product, qty }) => `
      <article class="cart-line">
        <img src="${product.image}" alt="${safe(product.name)}">
        <div class="cart-line-info">
          <strong>${safe(product.name)}</strong>
          <span>${money(product.price)}</span>
          <div class="qty-controls">
            <button data-qty="${product.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <span>${qty}</span>
            <button data-qty="${product.id}" data-delta="1" aria-label="Increase quantity">+</button>
            <button class="remove" data-remove="${product.id}">Remove</button>
          </div>
        </div>
      </article>
    `).join("") : '<p class="empty">Your bag is waiting for a little glow.</p>';
  }

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const total = getTotal();

  if ($("#cartSubtotal")) $("#cartSubtotal").textContent = money(subtotal);
  if ($("#cartDiscount")) $("#cartDiscount").textContent = "−" + money(discount);
  if ($("#cartShipping")) $("#cartShipping").textContent = shipping === 0 && subtotal > 0 ? "FREE" : money(shipping);
  if ($("#cartTotal")) $("#cartTotal").textContent = money(total);

  const remaining = Math.max(0, 1999 - (subtotal - discount));
  if ($("#shippingMessage")) {
    $("#shippingMessage").textContent = subtotal === 0
      ? "Add products to get free shipping."
      : remaining === 0 ? "You've unlocked free shipping ✨" : `Add ${money(remaining)} more for free shipping.`;
  }
  if ($("#shippingProgress")) {
    $("#shippingProgress").style.width = `${Math.min(100, ((subtotal - discount) / 1999) * 100)}%`;
  }
  if ($("#checkoutButton")) $("#checkoutButton").disabled = count === 0;
}

function openCart() {
  $("#cartDrawer")?.classList.add("open");
  $("#cartOverlay")?.classList.add("show");
  $("#cartDrawer")?.setAttribute("aria-hidden", "false");
}

function closeCart() {
  $("#cartDrawer")?.classList.remove("open");
  $("#cartOverlay")?.classList.remove("show");
  $("#cartDrawer")?.setAttribute("aria-hidden", "true");
}

function renderProductDetail() {
  const name = $("#detailName");
  if (!name) return;

  const id = Number(new URLSearchParams(location.search).get("id")) || 1;
  const product = getProduct(id) || PRODUCTS[0];
  const image = $("#detailImage");
  const oldPrice = $("#detailOldPrice");
  const price = $("#detailPrice");

  name.textContent = product.name;
  if (image) {
    image.src = product.image;
    image.alt = product.name;
  }
  if (price) price.textContent = money(product.price);
  if (oldPrice) oldPrice.textContent = money(product.oldPrice);
  if ($("#detailCategory")) $("#detailCategory").textContent = product.category;
  if ($("#detailDescription")) $("#detailDescription").textContent = product.description;
  if ($("#detailIngredients")) $("#detailIngredients").textContent = product.ingredients;
  if ($("#detailRating")) $("#detailRating").textContent = `★★★★★ ${product.rating} (demo rating)`;

  const heart = $("#detailWishlist");
  if (heart) {
    heart.textContent = wishlist.includes(product.id) ? "♥ Saved" : "♡ Wishlist";
    heart.dataset.wishlist = product.id;
  }
  const addButton = $("#detailAdd");
  if (addButton) addButton.dataset.add = product.id;
  const qty = $("#detailQty");
  if (qty) qty.value = Math.max(1, Number(qty.value) || 1);

  const title = document.querySelector("title");
  if (title) title.textContent = `${product.name} | LUMIÈRE SKIN`;
}

function openCheckout() {
  if (!cartCount()) {
    showToast("Add a product to your bag first.");
    return;
  }
  closeCart();
  checkoutStep = 1;
  checkoutData = {};
  $("#checkoutBackdrop").hidden = false;
  document.body.classList.add("modal-open");
  renderCheckoutStep();
}

function closeCheckout() {
  $("#checkoutBackdrop").hidden = true;
  document.body.classList.remove("modal-open");
}

function updateCheckoutProgress() {
  $$("[data-step-dot]").forEach(dot => {
    const step = Number(dot.dataset.stepDot);
    dot.classList.toggle("active", step <= checkoutStep);
    dot.classList.toggle("complete", step < checkoutStep);
  });
}

function renderCheckoutStep() {
  const title = $("#checkoutTitle");
  const subtitle = $("#checkoutSubtitle");
  const content = $("#checkoutStepContent");
  if (!content) return;

  updateCheckoutProgress();

  if (checkoutStep === 1) {
    title.textContent = demoUser ? `Hello, ${demoUser.name}!` : "Welcome to your glow";
    subtitle.textContent = "Sign in or create a demo account to continue.";
    content.innerHTML = `
      <form id="demoLoginForm" class="checkout-form">
        <label>Your name<input id="checkoutName" maxlength="60" autocomplete="name" required value="${safe(demoUser?.name || "")}"></label>
        <label>Email address<input id="checkoutEmail" type="email" maxlength="120" autocomplete="email" required value="${safe(demoUser?.email || "")}"></label>
        <label>Demo password<input id="checkoutPassword" type="password" minlength="4" maxlength="60" autocomplete="off" required placeholder="Use a made-up demo password"></label>
        <button class="btn wide" type="submit">${demoUser ? "Continue to address" : "Sign in / Create demo account"}</button>
        <p class="note">This is a simulated login. Never enter your real password.</p>
      </form>`;
    return;
  }

  if (checkoutStep === 2) {
    title.textContent = "Where should we deliver?";
    subtitle.textContent = "Enter a fictional/demo address for your test order.";
    content.innerHTML = `
      <form id="demoAddressForm" class="checkout-form">
        <label>Full name<input id="addressName" maxlength="80" required value="${safe(checkoutData.name || demoUser?.name || "")}"></label>
        <label>Mobile number<input id="addressPhone" inputmode="numeric" maxlength="10" pattern="[0-9]{10}" placeholder="10-digit demo number" required value="${safe(checkoutData.phone || "")}"></label>
        <label>House / street / area<textarea id="addressLine" maxlength="220" rows="2" required>${safe(checkoutData.address || "")}</textarea></label>
        <div class="form-row">
          <label>City<input id="addressCity" maxlength="60" required value="${safe(checkoutData.city || "")}"></label>
          <label>State<input id="addressState" maxlength="60" required value="${safe(checkoutData.state || "")}"></label>
        </div>
        <label>PIN code<input id="addressPin" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" required value="${safe(checkoutData.pin || "")}"></label>
        <div class="form-row">
          <button type="button" class="btn secondary" id="backToLogin">Back</button>
          <button class="btn" type="submit">Continue to payment</button>
        </div>
      </form>`;
    return;
  }

  if (checkoutStep === 3) {
    title.textContent = "Review your order";
    subtitle.textContent = "Choose a simulated payment method and place your test order.";
    const lines = getCartLines();
    content.innerHTML = `
      <div class="checkout-summary">
        ${lines.map(({product, qty}) => `<p>${safe(product.name)} × ${qty}<b>${money(product.price * qty)}</b></p>`).join("")}
        <hr>
        <p>Subtotal <b>${money(getSubtotal())}</b></p>
        <p>Discount <b>−${money(getDiscount())}</b></p>
        <p>Shipping <b>${getShipping() === 0 ? "FREE" : money(getShipping())}</b></p>
        <p class="grand">Total <b>${money(getTotal())}</b></p>
      </div>
      <div class="delivery-preview">
        <strong>Delivering to</strong>
        <p>${safe(checkoutData.name)} · ${safe(checkoutData.phone)}</p>
        <p>${safe(checkoutData.address)}, ${safe(checkoutData.city)}, ${safe(checkoutData.state)} — ${safe(checkoutData.pin)}</p>
        <button type="button" class="text-link" id="editAddress">Edit address</button>
      </div>
      <form id="demoPaymentForm" class="checkout-form">
        <h3>Demo payment method</h3>
        <label class="payment-option"><input type="radio" name="demoPayment" value="Demo UPI" checked> UPI simulation <small>No UPI app opens</small></label>
        <label class="payment-option"><input type="radio" name="demoPayment" value="Demo card"> Card simulation <small>Do not enter card details</small></label>
        <label class="payment-option"><input type="radio" name="demoPayment" value="Demo cash on delivery"> Cash on delivery demo <small>No real delivery is arranged</small></label>
        <div class="form-row">
          <button type="button" class="btn secondary" id="backToAddress">Back</button>
          <button class="btn" type="submit">Place demo order · ${money(getTotal())}</button>
        </div>
      </form>`;
  }
}

function showOrderConfirmation(order) {
  const content = $("#checkoutStepContent");
  $("#checkoutTitle").textContent = "Your demo order is placed ✨";
  $("#checkoutSubtitle").textContent = "Success! This is a simulated order only.";
  $("#checkoutBackdrop")?.querySelectorAll("[data-step-dot]").forEach(dot => dot.classList.add("active"));
  content.innerHTML = `
    <div class="confirmation">
      <div class="success-mark">✓</div>
      <p class="eyebrow">ORDER CONFIRMED · DEMO ONLY</p>
      <h3>${safe(order.id)}</h3>
      <p>Order total: <strong>${money(order.total)}</strong></p>
      <p>Payment method: ${safe(order.payment)}</p>
      <p>Delivery address: ${safe(order.address.address)}, ${safe(order.address.city)}, ${safe(order.address.state)} ${safe(order.address.pin)}</p>
      <p class="note">No real payment was collected and no parcel will be sent.</p>
      <button class="btn wide" id="finishDemoOrder">Continue shopping</button>
    </div>`;
  renderOrderHistory();
}

function placeDemoOrder(payment) {
  const order = {
    id: "LS-DEMO-" + Date.now().toString().slice(-8),
    createdAt: new Date().toLocaleString("en-IN"),
    items: getCartLines().map(({product, qty}) => ({
      id: product.id, name: product.name, price: product.price, qty
    })),
    subtotal: getSubtotal(),
    discount: getDiscount(),
    shipping: getShipping(),
    total: getTotal(),
    payment,
    address: {...checkoutData}
  };

  orders.unshift(order);
  saveStore(STORAGE.orders, orders);
  cart = {};
  appliedCoupon = false;
  saveStore(STORAGE.cart, cart);
  renderCart();
  showOrderConfirmation(order);
}

function renderOrderHistory() {
  const target = $("#orderHistory");
  if (!target) return;
  if (!orders.length) {
    target.innerHTML = '<p class="empty">No demo orders yet. Your placed orders will appear here.</p>';
    return;
  }
  target.innerHTML = orders.map(order => `
    <article class="order-card">
      <div><span class="eyebrow">DEMO ORDER</span><h3>${safe(order.id)}</h3><small>${safe(order.createdAt)}</small></div>
      <div><strong>${money(order.total)}</strong><p>${order.items.length} product line(s)</p><small>${safe(order.payment)}</small></div>
      <details><summary>View details</summary>
        <p>${order.items.map(item => `${safe(item.name)} × ${item.qty}`).join("<br>")}</p>
        <p>${safe(order.address.address)}, ${safe(order.address.city)}, ${safe(order.address.state)} — ${safe(order.address.pin)}</p>
      </details>
    </article>
  `).join("");
}

/* Event delegation for product cards, wishlist and cart quantity buttons */
document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  if (add) {
    const id = Number(add.dataset.add);
    const qtyInput = $("#detailQty");
    const qty = add.id === "detailAdd" ? Math.max(1, Number(qtyInput?.value) || 1) : 1;
    addToCart(id, qty);
  }

  const wish = event.target.closest("[data-wishlist]");
  if (wish) toggleWishlist(Number(wish.dataset.wishlist));

  const quantity = event.target.closest("[data-qty]");
  if (quantity) changeCartQty(Number(quantity.dataset.qty), Number(quantity.dataset.delta));

  const remove = event.target.closest("[data-remove]");
  if (remove) {
    delete cart[remove.dataset.remove];
    saveStore(STORAGE.cart, cart);
    renderCart();
  }
});

$("#productSearch")?.addEventListener("input", renderProducts);

$("#categoryFilters")?.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  $$("#categoryFilters [data-category]").forEach(item => item.classList.toggle("active", item === button));
  renderProducts();
});

$("#wishlistToggle")?.addEventListener("click", () => {
  const onlyWishlist = document.body.dataset.wishlistOnly === "true";
  document.body.dataset.wishlistOnly = String(!onlyWishlist);
  $("#wishlistToggle").classList.toggle("active", !onlyWishlist);
  $("#wishlistToggle").setAttribute("aria-label", !onlyWishlist ? "Showing wishlist products" : "Show wishlist");
  $("#shop")?.scrollIntoView({behavior: "smooth"});
  renderProducts();
});

$("#cartOpen")?.addEventListener("click", openCart);
$("#cartClose")?.addEventListener("click", closeCart);
$("#cartOverlay")?.addEventListener("click", closeCart);
$("#checkoutButton")?.addEventListener("click", openCheckout);

$("#applyCoupon")?.addEventListener("click", () => {
  const code = ($("#couponInput")?.value || "").trim().toUpperCase();
  if (code === "GLOW10") {
    appliedCoupon = true;
    $("#couponMessage").textContent = "GLOW10 applied: 10% off ✨";
  } else {
    appliedCoupon = false;
    $("#couponMessage").textContent = "Invalid code. Try GLOW10.";
  }
  renderCart();
});

$("#checkoutClose")?.addEventListener("click", closeCheckout);
$("#checkoutBackdrop")?.addEventListener("click", event => {
  if (event.target.id === "checkoutBackdrop") closeCheckout();
});

$("#checkoutStepContent")?.addEventListener("submit", event => {
  event.preventDefault();

  if (event.target.id === "demoLoginForm") {
    const name = $("#checkoutName").value.trim();
    const email = $("#checkoutEmail").value.trim();
    const password = $("#checkoutPassword").value;
    if (name.length < 2 || !email || password.length < 4) {
      showToast("Enter the requested demo details.");
      return;
    }
    // Password is deliberately NOT stored.
    demoUser = {name, email};
    saveStore(STORAGE.user, demoUser);
    checkoutData.name = name;
    checkoutData.email = email;
    checkoutStep = 2;
    renderCheckoutStep();
  }

  if (event.target.id === "demoAddressForm") {
    checkoutData = {
      ...checkoutData,
      name: $("#addressName").value.trim(),
      phone: $("#addressPhone").value.trim(),
      address: $("#addressLine").value.trim(),
      city: $("#addressCity").value.trim(),
      state: $("#addressState").value.trim(),
      pin: $("#addressPin").value.trim()
    };
    checkoutStep = 3;
    renderCheckoutStep();
  }

  if (event.target.id === "demoPaymentForm") {
    const method = $('input[name="demoPayment"]:checked')?.value || "Demo UPI";
    placeDemoOrder(method);
  }
});

$("#checkoutStepContent")?.addEventListener("click", event => {
  if (event.target.id === "backToLogin") {
    checkoutStep = 1;
    renderCheckoutStep();
  }
  if (event.target.id === "backToAddress" || event.target.id === "editAddress") {
    checkoutStep = 2;
    renderCheckoutStep();
  }
  if (event.target.id === "finishDemoOrder") {
    closeCheckout();
    $("#orders")?.scrollIntoView({behavior: "smooth"});
    showToast("Thanks for trying the demo!");
  }
});

$("#loginOpen")?.addEventListener("click", () => {
  if (cartCount()) openCheckout();
  else {
    checkoutStep = 1;
    checkoutData = {};
    $("#checkoutBackdrop").hidden = false;
    document.body.classList.add("modal-open");
    renderCheckoutStep();
  }
});

$("#skinQuizSubmit")?.addEventListener("click", () => {
  const type = $('input[name="skinType"]:checked')?.value;
  const result = $("#skinQuizResult");
  if (!type || !result) {
    showToast("Please choose a skin type first.");
    return;
  }
  const suggestions = {
    oily: "Explore Soft Foam Cleanser and the BHA Liquid Exfoliant concept. Introduce exfoliants slowly.",
    dry: "Explore Cloud Cream Moisturiser and Dew Drop Serum for a hydration-focused routine.",
    combination: "Try a simple cleanser and lightweight moisturiser, adjusting products by area.",
    sensitive: "Keep the routine simple and fragrance-aware. Patch-test products and avoid introducing several actives together."
  };
  result.hidden = false;
  result.innerHTML = `<strong>Your routine idea</strong><p>${safe(suggestions[type])}</p><a class="text-link" href="#shop">Explore products ↗</a>`;
});

$("#reviewForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const review = {
    name: $("#reviewName").value.trim(),
    rating: Number($("#reviewRating").value),
    text: $("#reviewText").value.trim(),
    demo: true
  };
  if (!review.name || !review.text) return;
  const reviews = readStore(STORAGE.reviews, []);
  reviews.unshift(review);
  saveStore(STORAGE.reviews, reviews.slice(0, 20));
  renderUserReviews();
  event.target.reset();
  showToast("Demo review added in this browser.");
});

function renderUserReviews() {
  const target = $("#userReviews");
  if (!target) return;
  const reviews = readStore(STORAGE.reviews, []);
  target.innerHTML = reviews.map(review => `
    <article class="user-review">
      <b>${"★".repeat(Math.max(1, Math.min(5, review.rating)))}</b>
      <strong>${safe(review.name)}</strong>
      <p>${safe(review.text)}</p>
      <small>Demo review · browser only</small>
    </article>
  `).join("");
}

$("#newsletterForm")?.addEventListener("submit", event => {
  event.preventDefault();
  showToast("Thanks! This demo form doesn't send or store emails.");
  event.target.reset();
});

/* Demo help chat */
function addChatMessage(message, type) {
  const box = $("#chatMessages");
  if (!box) return;
  const p = document.createElement("p");
  p.className = `bubble ${type}`;
  p.textContent = message;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

function getChatReply(message) {
  const text = message.toLowerCase();
  if (text.includes("shipping") || text.includes("delivery")) return "Demo shipping is ₹99 below ₹1,999 and free above that threshold. No parcel is actually delivered.";
  if (text.includes("coupon") || text.includes("discount")) return "Try the demo coupon GLOW10 for 10% off your sample cart.";
  if (text.includes("payment") || text.includes("upi") || text.includes("card")) return "Checkout payment choices are simulations only. No payment app opens and no money is collected.";
  if (text.includes("order")) return "Open My orders to view sample orders placed in this browser.";
  if (text.includes("product") || text.includes("serum")) return "Browse the Shop section to explore our illustrative demo product catalogue.";
  return "I'm a simple demo assistant. Try asking about shipping, coupon, products, payment or orders.";
}

$("#chatOpen")?.addEventListener("click", () => { $("#chatBackdrop").hidden = false; });
$("#chatClose")?.addEventListener("click", () => { $("#chatBackdrop").hidden = true; });
$("#chatBackdrop")?.addEventListener("click", event => {
  if (event.target.id === "chatBackdrop") $("#chatBackdrop").hidden = true;
});
$("#chatForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const input = $("#chatInput");
  const message = input.value.trim();
  if (!message) return;
  addChatMessage(message, "user");
  input.value = "";
  addChatMessage(getChatReply(message), "bot");
});
$$("[data-chat]").forEach(button => {
  button.addEventListener("click", () => addChatMessage(getChatReply(button.dataset.chat), "bot"));
});

/* Mobile navigation and reveal animation */
$("#menuToggle")?.addEventListener("click", () => $("#nav")?.classList.toggle("nav-open"));
$$('#nav a').forEach(link => link.addEventListener("click", () => $("#nav")?.classList.remove("nav-open")));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  $$(".reveal, .product-card, .story, .reviews article").forEach(el => observer.observe(el));
} else {
  $$(".reveal, .product-card, .story, .reviews article").forEach(el => el.classList.add("revealed"));
}

if ($("#currentYear")) $("#currentYear").textContent = new Date().getFullYear();

renderProducts();
renderCart();
renderWishlistCount();
renderProductDetail();
renderOrderHistory();
renderUserReviews();
