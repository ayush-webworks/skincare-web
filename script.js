
"use strict";

/* =========================================
   GLOWVÉ — STOREFRONT DEMO
   Works with index.html and product.html
========================================= */

const PRODUCTS = [
  {
    id: "glow-cleanser",
    name: "Cloud Cleanser",
    category: "Cleanser",
    price: 399,
    tag: "DAILY FAVOURITE",
    description: "A gentle daily cleanser for a fresh, comfortable-feeling finish.",
    details: "Start your routine with a gentle cleanse. Massage onto damp skin and rinse with lukewarm water. Choose products according to your skin's needs.",
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "glow-serum",
    name: "Dew Drop Serum",
    category: "Serum",
    price: 599,
    tag: "GLOW ESSENTIAL",
    description: "A lightweight serum to make your skincare ritual feel special.",
    details: "Apply a small amount according to the product's instructions. Patch test new products first and introduce active ingredients gradually.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "glow-moisturiser",
    name: "Daily Cloud Cream",
    category: "Moisturiser",
    price: 499,
    tag: "EVERYDAY CARE",
    description: "A daily moisturiser to complete your simple skincare routine.",
    details: "Apply after cleansing and any serums in your routine. Use a moisturiser suited to your skin type and follow with sunscreen during the day.",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "glow-glow-kit",
    name: "The Glow Ritual Kit",
    category: "Set",
    price: 999,
    tag: "THE GLOW EDIT",
    description: "A curated skincare set for a thoughtful everyday ritual.",
    details: "Build a consistent routine with products suitable for your skin. Review each product's ingredients and directions before use.",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "glow-toner",
    name: "Petal Balance Toner",
    category: "Toner",
    price: 449,
    tag: "SOFT & SIMPLE",
    description: "A refreshing step to add to your personal skincare routine.",
    details: "Apply as directed on the product label. Avoid using products that cause irritation and stop use if a reaction occurs.",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "glow-night",
    name: "Night Bloom Cream",
    category: "Moisturiser",
    price: 649,
    tag: "EVENING RITUAL",
    description: "A comforting final step for your evening skincare routine.",
    details: "Use at night as directed. Introduce new skincare products one at a time to help identify any irritation.",
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "glow-eye",
    name: "Soft Focus Eye Cream",
    category: "Moisturiser",
    price: 549,
    tag: "LITTLE LUXURY",
    description: "A considered extra for a gentle, feel-good skincare ritual.",
    details: "Use only as directed, avoiding direct contact with the eyes. Patch test before adding a new product to your routine.",
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "glow-mask",
    name: "Sunday Reset Mask",
    category: "Mask",
    price: 699,
    tag: "SELF-CARE PICK",
    description: "Make a little room for a relaxing skincare moment.",
    details: "Follow the usage directions and recommended contact time on the product label. Do not leave a mask on longer than directed.",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=85"
  }
];

const KEYS = {
  cart: "glowve_demo_cart_v1",
  wishlist: "glowve_demo_wishlist_v1"
};

const state = {
  filter: "All",
  search: "",
  cart: readStorage(KEYS.cart, []),
  wishlist: readStorage(KEYS.wishlist, [])
};

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveStorage() {
  try {
    localStorage.setItem(KEYS.cart, JSON.stringify(state.cart));
    localStorage.setItem(KEYS.wishlist, JSON.stringify(state.wishlist));
  } catch (error) {
    showToast("Browser storage is unavailable.");
  }
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character];
  });
}

function getProduct(id) {
  return PRODUCTS.find(function (product) {
    return product.id === id;
  });
}

function productLink(product) {
  return "product.html?id=" + encodeURIComponent(product.id);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2600);
}

function getCartQuantity() {
  return state.cart.reduce(function (total, item) {
    return total + item.quantity;
  }, 0);
}

function getCartTotal() {
  return state.cart.reduce(function (total, item) {
    const product = getProduct(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const filtered = PRODUCTS.filter(function (product) {
    const matchesCategory =
      state.filter === "All" || product.category === state.filter;

    const searchable =
      (product.name + " " + product.category + " " + product.description)
        .toLowerCase();

    return matchesCategory && searchable.includes(state.search.toLowerCase());
  });

  const count = document.getElementById("resultCount");
  const empty = document.getElementById("emptyState");

  if (count) count.textContent = filtered.length + " lovely finds";
  if (empty) empty.hidden = filtered.length !== 0;

  grid.innerHTML = filtered.map(function (product) {
    const saved = state.wishlist.includes(product.id);

    return `
      <article class="product-card">
        <div class="product-image-wrap">
          <a href="${productLink(product)}" aria-label="View ${escapeHTML(product.name)}">
            <img src="${escapeHTML(product.image)}"
                 alt="${escapeHTML(product.name)}"
                 loading="lazy">
          </a>
          <span class="product-tag">${escapeHTML(product.tag)}</span>
          <button class="wish-button ${saved ? "saved" : ""}"
            data-action="wishlist"
            data-id="${product.id}"
            aria-label="${saved ? "Remove from" : "Add to"} wishlist">
            ${saved ? "♥" : "♡"}
          </button>
        </div>
        <div class="product-info">
          <span class="product-category">${escapeHTML(product.category)}</span>
          <h3><a href="${productLink(product)}">${escapeHTML(product.name)}</a></h3>
          <p>${escapeHTML(product.description)}</p>
          <div class="product-bottom">
            <span class="product-price">${money(product.price)}</span>
            <button class="add-button" data-action="add" data-id="${product.id}">
              Add to bag +
            </button>
          </div>
          <a class="details-link" href="${productLink(product)}">View product details ↗</a>
        </div>
      </article>`;
  }).join("");
}

function renderCounts() {
  const cartCount = document.getElementById("cartCount");
  const wishlistCount = document.getElementById("wishlistCount");

  if (cartCount) cartCount.textContent = getCartQuantity();
  if (wishlistCount) wishlistCount.textContent = state.wishlist.length;
}

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;

  const existing = state.cart.find(function (item) {
    return item.id === id;
  });

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ id: id, quantity: 1 });
  }

  saveStorage();
  renderCart();
  renderCounts();
  showToast(product.name + " added to your bag.");
}

function changeQuantity(id, difference) {
  const item = state.cart.find(function (entry) {
    return entry.id === id;
  });

  if (!item) return;

  item.quantity += difference;

  if (item.quantity <= 0) {
    state.cart = state.cart.filter(function (entry) {
      return entry.id !== id;
    });
  }

  saveStorage();
  renderCart();
  renderCounts();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(function (item) {
    return item.id !== id;
  });

  saveStorage();
  renderCart();
  renderCounts();
  showToast("Item removed from your bag.");
}

function renderCart() {
  const list = document.getElementById("cartItems");
  const subtotal = document.getElementById("cartSubtotal");

  if (!list) return;

  if (!state.cart.length) {
    list.innerHTML = `
      <div class="drawer-empty">
        <strong>Your bag is taking a little break.</strong>
        <p>Discover something lovely for your routine.</p>
      </div>`;
  } else {
    list.innerHTML = state.cart.map(function (item) {
      const product = getProduct(item.id);
      if (!product) return "";

      return `
        <article class="drawer-product">
          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
          <div>
            <h3>${escapeHTML(product.name)}</h3>
            <p>${money(product.price)}</p>
            <div class="quantity-controls">
              <button data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button data-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-button" data-action="remove-cart" data-id="${product.id}">Remove</button>
          </div>
          <strong>${money(product.price * item.quantity)}</strong>
        </article>`;
    }).join("");
  }

  if (subtotal) subtotal.textContent = money(getCartTotal());
}

function toggleWishlist(id) {
  const product = getProduct(id);
  if (!product) return;

  if (state.wishlist.includes(id)) {
    state.wishlist = state.wishlist.filter(function (savedId) {
      return savedId !== id;
    });
    showToast("Removed from your wishlist.");
  } else {
    state.wishlist.push(id);
    showToast("Saved to your wishlist.");
  }

  saveStorage();
  renderProducts();
  renderWishlist();
  renderCounts();
}

function renderWishlist() {
  const list = document.getElementById("wishlistItems");
  if (!list) return;

  if (!state.wishlist.length) {
    list.innerHTML = `
      <div class="drawer-empty">
        <strong>Your wishlist is waiting.</strong>
        <p>Tap the heart on anything you love.</p>
      </div>`;
    return;
  }

  list.innerHTML = state.wishlist.map(function (id) {
    const product = getProduct(id);
    if (!product) return "";

    return `
      <article class="drawer-product">
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
        <div>
          <h3>${escapeHTML(product.name)}</h3>
          <p>${money(product.price)}</p>
          <button class="remove-button" data-action="wishlist" data-id="${product.id}">Remove</button>
        </div>
        <button class="add-button" data-action="add" data-id="${product.id}">Add</button>
      </article>`;
  }).join("");
}

function openDrawer(id) {
  const drawer = document.getElementById(id);
  const overlay = document.getElementById("overlay");
  if (!drawer || !overlay) return;

  document.querySelectorAll(".drawer").forEach(function (other) {
    other.classList.remove("open");
    other.setAttribute("aria-hidden", "true");
  });

  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  document.body.classList.add("no-scroll");
}

function closeDrawers() {
  document.querySelectorAll(".drawer").forEach(function (drawer) {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  });

  const overlay = document.getElementById("overlay");
  if (overlay) overlay.hidden = true;
  document.body.classList.remove("no-scroll");
}

function showProductDialog(id) {
  const product = getProduct(id);
  const dialog = document.getElementById("productDialog");
  const content = document.getElementById("productDialogContent");

  if (!product || !dialog || !content) return;

  content.innerHTML = `
    <div class="dialog-product">
      <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
      <div class="dialog-product-copy">
        <span class="eyebrow">${escapeHTML(product.category)} · GLOWVÉ</span>
        <h2>${escapeHTML(product.name)}</h2>
        <strong class="dialog-price">${money(product.price)}</strong>
        <p>${escapeHTML(product.description)}</p>
        <p>${escapeHTML(product.details)}</p>
        <button class="button button-dark" data-action="add" data-id="${product.id}">Add to bag +</button>
        <p class="small-note">Demo product listing. Check actual product ingredients and packaging before purchase.</p>
      </div>
    </div>`;

  if (typeof dialog.showModal === "function") dialog.showModal();
}

function renderStandaloneProduct() {
  const container = document.getElementById("standaloneProduct");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = getProduct(id) || PRODUCTS[0];

  document.title = product.name + " | Glowvé";

  container.innerHTML = `
    <section class="detail-product">
      <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
      <div class="detail-copy">
        <span class="eyebrow">${escapeHTML(product.category)} · THE GLOW EDIT</span>
        <h1>${escapeHTML(product.name)}</h1>
        <p>${escapeHTML(product.description)}</p>
        <strong class="detail-price">${money(product.price)}</strong>
        <p>${escapeHTML(product.details)}</p>
        <button class="button button-dark" data-action="add" data-id="${product.id}">Add to bag +</button>
        <button class="button button-light" data-action="wishlist" data-id="${product.id}">♡ Save to wishlist</button>
        <p class="small-note">Demo storefront: orders and payments are not processed.</p>
      </div>
    </section>`;
}

function setupFilters() {
  document.querySelectorAll(".filter-button").forEach(function (button) {
    button.addEventListener("click", function () {
      state.filter = button.dataset.filter || "All";

      document.querySelectorAll(".filter-button").forEach(function (other) {
        other.classList.toggle("active", other === button);
      });

      renderProducts();
    });
  });
}

function setupSearch() {
  const toggle = document.getElementById("searchToggle");
  const panel = document.getElementById("searchPanel");
  const input = document.getElementById("productSearch");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden && input) input.focus();
    });
  }

  if (input) {
    input.addEventListener("input", function () {
      state.search = input.value.trim();
      renderProducts();
    });
  }
}

function setupNewsletter() {
  const form = document.getElementById("newsletterForm");
  const message = document.getElementById("newsletterMessage");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (message) {
      message.textContent = "Thanks! This demo form isn't connected to an email service yet.";
    }

    form.reset();
  });
}

function setupCheckout() {
  const button = document.getElementById("checkoutButton");
  if (!button) return;

  button.addEventListener("click", function () {
    if (!state.cart.length) {
      showToast("Your bag is empty.");
      return;
    }

    showToast("Demo only: secure checkout is not connected yet.");
  });
}

function setupEvents() {
  document.addEventListener("click", function (event) {
    const actionElement = event.target.closest("[data-action]");

    if (actionElement) {
      const action = actionElement.dataset.action;
      const id = actionElement.dataset.id;

      if (action === "add") addToCart(id);
      if (action === "wishlist") toggleWishlist(id);
      if (action === "increase") changeQuantity(id, 1);
      if (action === "decrease") changeQuantity(id, -1);
      if (action === "remove-cart") removeFromCart(id);

      return;
    }

    if (event.target.closest("#cartToggle")) {
      renderCart();
      openDrawer("cartDrawer");
      return;
    }

    if (event.target.closest("#wishlistToggle")) {
      renderWishlist();
      openDrawer("wishlistDrawer");
      return;
    }

    if (event.target.closest("[data-close]")) {
      closeDrawers();
      return;
    }

    if (event.target.id === "overlay") {
      closeDrawers();
    }

    const productCard = event.target.closest(".product-card");
    if (productCard && !event.target.closest("a, button")) {
      const button = productCard.querySelector('[data-action="add"]');
      if (button) showProductDialog(button.dataset.id);
    }
  });

  const dialog = document.getElementById("productDialog");
  const closeDialog = document.getElementById("dialogClose");

  if (closeDialog && dialog) {
    closeDialog.addEventListener("click", function () {
      dialog.close();
    });
  }

  if (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeDrawers();
  });
}

function initialiseGlowve() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  renderProducts();
  renderCart();
  renderWishlist();
  renderCounts();
  renderStandaloneProduct();

  setupFilters();
  setupSearch();
  setupNewsletter();
  setupCheckout();
  setupEvents();
}

initialiseGlowve();
