document.addEventListener("DOMContentLoaded", function() {
  
    const header = document.getElementById("header");
    const hamburger = document.querySelector(".hamburger-menu");
    const navLinks = document.querySelector(".nav-links");

    window.addEventListener("scroll", function() {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    hamburger.addEventListener("click", function() {
        navLinks.classList.toggle("active");
    });

    const links = navLinks.querySelectorAll("a");
    links.forEach(function(link) {
        link.addEventListener("click", function() {
            navLinks.classList.remove("active");
        });
    });

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    const fadeElements = document.querySelectorAll(".about-content, .location-content, .section-title");
    fadeElements.forEach(function(el) {
        el.classList.add("fade-in");
        observer.observe(el);
    });

    const menuData = {
        "Fırın Ürünleri": [
            { name: "Simit", price: 25, img: "./assets/simit.webp", desc: "Geleneksel çıtır simit, susamlı" },
            { name: "Su Böreği", price: 85, img: "./assets/borek.webp", desc: "El açması, peynirli su böreği" },
            { name: "Kruvasan", price: 55, img: "./assets/kruvasan-cad97ccc-9a81-4d67-a90a-7b9561865adc.webp", desc: "Tereyağlı, taze kruvasan" },
            { name: "Ev Poğaçası", price: 40, img: "./assets/pogca.webp", desc: "Peynirli ev poğaçası" }
        ],
        "Tatlılar": [
            { name: "Cheesecake", price: 120, img: "./assets/cheesecake.webp", desc: "Meyveli cheesecake dilimi" },
            { name: "Çikolatalı Pasta", price: 130, img: "./assets/pastalar.webp", desc: "Bol çikolatalı özel pasta dilimi" }
        ],
        "İçecekler": [
            { name: "Filtre Kahve", price: 55, img: "./assets/filtre-kahve-faydalari-dozze.jpg.webp", desc: "Taze çekilmiş filtre kahve" },
            { name: "Caffè Latte", price: 70, img: "./assets/latte.webp", desc: "Kremamsı sütlü latte" }
        ]
    };

    const tabsContainer = document.getElementById("menu-tabs");
    const gridContainer = document.getElementById("menu-grid");

    function renderMenu() {
        const categories = Object.keys(menuData);
        
        categories.forEach(function(category, index) {
            const btn = document.createElement("button");
            btn.className = "menu-tab";
            if (index === 0) btn.classList.add("menu-tab-active");
            btn.innerText = category;
            
            btn.addEventListener("click", function() {
                document.querySelectorAll(".menu-tab").forEach(function(b) {
                    b.classList.remove("menu-tab-active");
                });
                btn.classList.add("menu-tab-active");
                renderGrid(category);
            });
            
            tabsContainer.appendChild(btn);
        });

        renderGrid(categories[0]);
    }

    function renderGrid(categoryName) {
        gridContainer.innerHTML = "";
        const items = menuData[categoryName];

        items.forEach(function(item) {
            let imageHTML = "";
            if (item.img !== "") {
                imageHTML = `<img class="product-card-image" src="${item.img}" alt="${item.name}">`;
            } else {
                imageHTML = `<div class="product-card-placeholder">☕</div>`;
            }

            const card = document.createElement("div");
            card.className = "product-card fade-in visible";
            
            card.innerHTML = `
                ${imageHTML}
                <div class="product-card-body">
                    <h3 class="product-card-name">${item.name}</h3>
                    <p class="product-card-desc">${item.desc}</p>
                    <div class="product-card-footer">
                        <span class="product-card-price">₺${item.price}</span>
                        <button class="add-to-cart-btn">Ekle</button>
                    </div>
                </div>
            `;

            const addButton = card.querySelector(".add-to-cart-btn");
            addButton.addEventListener("click", function() {
                addToCart(item);
            });

            gridContainer.appendChild(card);
        });
    }

    let cart = []; 
    
    const cartFloatBtn = document.getElementById("cart-float-btn");
    const cartBadge = document.getElementById("cart-badge");
    const cartPanel = document.getElementById("cart-panel");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartCloseBtn = document.getElementById("cart-close-btn");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalPrice = document.getElementById("cart-total-price");
    const checkoutBtn = document.getElementById("checkout-btn");

    function toggleCart() {
        cartPanel.classList.toggle("open");
        cartOverlay.classList.toggle("open");
    }
    
    cartFloatBtn.addEventListener("click", toggleCart);
    cartCloseBtn.addEventListener("click", toggleCart);
    cartOverlay.addEventListener("click", toggleCart);

    function addToCart(product) {
        let existingItem = null;
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].name === product.name) {
                existingItem = cart[i];
                break;
            }
        }

        if (existingItem !== null) {
            existingItem.qty++;
        } else {
            cart.push({
                name: product.name,
                price: product.price,
                qty: 1
            });
        }
        
        updateCartUI();
        showToast(product.name + " sepete eklendi!", false);
    }

    function changeQty(index, amount) {
        cart[index].qty += amount;
        
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        updateCartUI();
    }

    function removeItem(index) {
        cart.splice(index, 1);
        updateCartUI();
    }

    function updateCartUI() {
        cartItemsContainer.innerHTML = "";
        
        let totalItems = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="cart-empty"><p>Sepetiniz boş</p></div>`;
            checkoutBtn.disabled = true;
            cartBadge.style.display = "none";
            cartTotalPrice.innerText = "₺0";
            return;
        }

        checkoutBtn.disabled = false;

        cart.forEach(function(item, index) {
            totalItems += item.qty;
            totalPrice += (item.price * item.qty);

            const itemDiv = document.createElement("div");
            itemDiv.className = "cart-item";
            
            itemDiv.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">₺${item.price * item.qty}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn minus-btn">-</button>
                    <span class="cart-item-qty">${item.qty}</span>
                    <button class="qty-btn plus-btn">+</button>
                    <button class="remove-btn">Sil</button>
                </div>
            `;
            itemDiv.querySelector(".plus-btn").addEventListener("click", function() { changeQty(index, 1); });
            itemDiv.querySelector(".minus-btn").addEventListener("click", function() { changeQty(index, -1); });
            itemDiv.querySelector(".remove-btn").addEventListener("click", function() { removeItem(index); });

            cartItemsContainer.appendChild(itemDiv);
        });
        cartBadge.innerText = totalItems;
        cartBadge.style.display = "flex";
        cartTotalPrice.innerText = "₺" + totalPrice;
    }

    const orderModal = document.getElementById("order-modal");
    const orderModalClose = document.getElementById("order-modal-close");
    const orderForm = document.getElementById("order-form");
    const orderSummaryBox = document.getElementById("order-summary-box");

    checkoutBtn.addEventListener("click", function() {
        toggleCart();
        
        let summaryText = "<strong>Sipariş Özeti:</strong><br/>";
        let total = 0;
        cart.forEach(function(item) {
            summaryText += `${item.qty}x ${item.name} - ₺${item.price * item.qty}<br/>`;
            total += (item.price * item.qty);
        });
        summaryText += `<br/><strong>Genel Toplam: ₺${total}</strong>`;
        
        orderSummaryBox.innerHTML = summaryText;
        orderModal.classList.add("open");
    });

    orderModalClose.addEventListener("click", function() {
        orderModal.classList.remove("open");
    });

    orderForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const name = document.getElementById("order-name").value;
        const phone = document.getElementById("order-phone").value;

        if (name === "" || phone === "") {
            showToast("Lütfen gerekli alanları doldurun.", true);
            return;
        }

        orderModal.classList.remove("open");
        cart = []; 
        updateCartUI(); 
        orderForm.reset();

        showSuccess(name);
    });

    const successModal = document.getElementById("success-modal");
    const successCloseBtn = document.getElementById("success-close-btn");
    const successName = document.getElementById("success-name");

    function showSuccess(customerName) {
        successName.innerText = "Teşekkürler, " + customerName + "!";
        successModal.classList.add("open");
    }

    successCloseBtn.addEventListener("click", function() {
        successModal.classList.remove("open");
    });

    const toastDiv = document.getElementById("toast");

    function showToast(message, isError) {
        toastDiv.innerHTML = message;
        
        if (isError) {
            toastDiv.classList.add("toast-error");
        } else {
            toastDiv.classList.remove("toast-error");
        }

        toastDiv.classList.add("show");

        setTimeout(function() {
            toastDiv.classList.remove("show");
        }, 3000);
    }

    renderMenu();
    updateCartUI();

});