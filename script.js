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
            btn.textContent = category;
            
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
        gridContainer.textContent = "";
        const items = menuData[categoryName];

        items.forEach(function(item) {
            const card = document.createElement("div");
            card.className = "product-card fade-in visible";
            
            if (item.img !== "") {
                const img = document.createElement("img");
                img.className = "product-card-image";
                img.src = item.img;
                img.alt = item.name;
                card.appendChild(img);
            } else {
                const placeholder = document.createElement("div");
                placeholder.className = "product-card-placeholder";
                placeholder.textContent = "☕";
                card.appendChild(placeholder);
            }

            const bodyDiv = document.createElement("div");
            bodyDiv.className = "product-card-body";

            const title = document.createElement("h3");
            title.className = "product-card-name";
            title.textContent = item.name;

            const desc = document.createElement("p");
            desc.className = "product-card-desc";
            desc.textContent = item.desc;

            const footerDiv = document.createElement("div");
            footerDiv.className = "product-card-footer";

            const priceSpan = document.createElement("span");
            priceSpan.className = "product-card-price";
            priceSpan.textContent = "₺" + item.price;

            const addButton = document.createElement("button");
            addButton.className = "add-to-cart-btn";
            addButton.textContent = "Ekle";
            
            addButton.addEventListener("click", function() {
                addToCart(item);
            });

            footerDiv.appendChild(priceSpan);
            footerDiv.appendChild(addButton);

            bodyDiv.appendChild(title);
            bodyDiv.appendChild(desc);
            bodyDiv.appendChild(footerDiv);

            card.appendChild(bodyDiv);
            gridContainer.appendChild(card);
        });
    }

    let cart = []; 
    const savedCart = localStorage.getItem("ulusFirinCart");
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
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
        cartItemsContainer.textContent = "";
        
        let totalItems = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            const emptyDiv = document.createElement("div");
            emptyDiv.className = "cart-empty";
            const emptyText = document.createElement("p");
            emptyText.textContent = "Sepetiniz boş";
            emptyDiv.appendChild(emptyText);
            cartItemsContainer.appendChild(emptyDiv);

            checkoutBtn.disabled = true;
            cartBadge.classList.remove("show");
            cartTotalPrice.textContent = "₺0";
            localStorage.setItem("ulusFirinCart", JSON.stringify(cart));
            return;
        }

        checkoutBtn.disabled = false;

        cart.forEach(function(item, index) {
            totalItems += item.qty;
            totalPrice += (item.price * item.qty);

            const itemDiv = document.createElement("div");
            itemDiv.className = "cart-item";
            
            const infoDiv = document.createElement("div");
            infoDiv.className = "cart-item-info";
            
            const nameSpan = document.createElement("span");
            nameSpan.className = "cart-item-name";
            nameSpan.textContent = item.name;
            
            const priceSpan = document.createElement("span");
            priceSpan.className = "cart-item-price";
            priceSpan.textContent = "₺" + (item.price * item.qty);

            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(priceSpan);

            const controlsDiv = document.createElement("div");
            controlsDiv.className = "cart-item-controls";

            const minusBtn = document.createElement("button");
            minusBtn.className = "qty-btn minus-btn";
            minusBtn.textContent = "-";
            minusBtn.addEventListener("click", function() { changeQty(index, -1); });

            const qtySpan = document.createElement("span");
            qtySpan.className = "cart-item-qty";
            qtySpan.textContent = item.qty;

            const plusBtn = document.createElement("button");
            plusBtn.className = "qty-btn plus-btn";
            plusBtn.textContent = "+";
            plusBtn.addEventListener("click", function() { changeQty(index, 1); });

            const removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.textContent = "Sil";
            removeBtn.addEventListener("click", function() { removeItem(index); });

            controlsDiv.appendChild(minusBtn);
            controlsDiv.appendChild(qtySpan);
            controlsDiv.appendChild(plusBtn);
            controlsDiv.appendChild(removeBtn);

            itemDiv.appendChild(infoDiv);
            itemDiv.appendChild(controlsDiv);

            cartItemsContainer.appendChild(itemDiv);
        });

        cartBadge.textContent = totalItems;
        cartBadge.classList.add("show");
        cartTotalPrice.textContent = "₺" + totalPrice;
        
        localStorage.setItem("ulusFirinCart", JSON.stringify(cart));
    }

    const orderModal = document.getElementById("order-modal");
    const orderModalClose = document.getElementById("order-modal-close");
    const orderForm = document.getElementById("order-form");
    const orderSummaryBox = document.getElementById("order-summary-box");

    checkoutBtn.addEventListener("click", function() {
        toggleCart();
        
        orderSummaryBox.textContent = "";
        
        const summaryTitle = document.createElement("strong");
        summaryTitle.textContent = "Sipariş Özeti:";
        orderSummaryBox.appendChild(summaryTitle);
        orderSummaryBox.appendChild(document.createElement("br"));

        let total = 0;
        cart.forEach(function(item) {
            const itemLine = document.createElement("span");
            itemLine.textContent = item.qty + "x " + item.name + " - ₺" + (item.price * item.qty);
            orderSummaryBox.appendChild(itemLine);
            orderSummaryBox.appendChild(document.createElement("br"));
            total += (item.price * item.qty);
        });

        orderSummaryBox.appendChild(document.createElement("br"));
        
        const totalLine = document.createElement("strong");
        totalLine.textContent = "Genel Toplam: ₺" + total;
        orderSummaryBox.appendChild(totalLine);

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
        successName.textContent = "Teşekkürler, " + customerName + "!";
        successModal.classList.add("open");
    }

    successCloseBtn.addEventListener("click", function() {
        successModal.classList.remove("open");
    });

    const toastDiv = document.getElementById("toast");

    function showToast(message, isError) {
        toastDiv.textContent = "";
        
        const icon = document.createElement("i");
        if (isError) {
            toastDiv.classList.add("toast-error");
            icon.className = "fas fa-exclamation-circle";
        } else {
            toastDiv.classList.remove("toast-error");
            icon.className = "fas fa-check-circle";
        }
        icon.style.marginRight = "8px";
        
        const textSpan = document.createElement("span");
        textSpan.textContent = message;

        toastDiv.appendChild(icon);
        toastDiv.appendChild(textSpan);

        toastDiv.classList.add("show");

        setTimeout(function() {
            toastDiv.classList.remove("show");
        }, 3000);
    }

    renderMenu();
    updateCartUI();

});
