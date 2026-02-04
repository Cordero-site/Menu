document.addEventListener('DOMContentLoaded', function () {
    // 1. Core Layout & Progressive Enhancement
    document.body.classList.add('js-enabled');

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu li a');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // 2. Carousel Logic
    const dishCarousel = document.querySelector('.dish-carousel');
    const carouselPrevBtn = document.querySelector('.carousel-btn.prev');
    const carouselNextBtn = document.querySelector('.carousel-btn.next');
    if (dishCarousel && carouselPrevBtn && carouselNextBtn) {
        carouselPrevBtn.addEventListener('click', () => { 
            const itemWidth = dishCarousel.querySelector('.dish-item').offsetWidth + 30;
            dishCarousel.scrollBy({ left: -itemWidth, behavior: 'smooth' }); 
        });
        carouselNextBtn.addEventListener('click', () => { 
            const itemWidth = dishCarousel.querySelector('.dish-item').offsetWidth + 30;
            dishCarousel.scrollBy({ left: itemWidth, behavior: 'smooth' }); 
        });
    }

    // 3. Scroll Reveal Logic (Crucial for visibility)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.reveal-on-scroll').forEach(section => {
        observer.observe(section);
    });

    // Staggered Menu Items
    const menuItems = document.querySelectorAll('.menu-item-box');
    if (menuItems.length > 0) {
        const menuObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100); 
                    menuObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        menuItems.forEach(item => menuObserver.observe(item));
    }

    // Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) backToTopBtn.classList.add('visible');
            else backToTopBtn.classList.remove('visible');
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 4. Order System Implementation ---
    initOrderSystem();

    function initOrderSystem() {
        const cart = {};

        // Create Floating Order Bar
        const orderBar = document.createElement('div');
        orderBar.className = 'order-floating-bar';
        orderBar.innerHTML = `
            <div class="order-info">
                <span class="order-count">0 items</span>
                <span class="order-total">Total: ₱0</span>
            </div>
            <button class="btn-order-now">Order Now <i class="fas fa-paper-plane"></i></button>
        `;
        document.body.appendChild(orderBar);

        const btnOrderNow = orderBar.querySelector('.btn-order-now');
        const countDisplay = orderBar.querySelector('.order-count');
        const totalDisplay = orderBar.querySelector('.order-total');

        // Setup Menu Items
        document.querySelectorAll('.menu-item-box').forEach(itemBox => {
            const tieredGrid = itemBox.querySelector('.tiered-prices-grid');
            const singlePrice = itemBox.querySelector('.item-price-main');
            const itemNameEl = itemBox.querySelector('.item-name');
            if (!itemNameEl) return;
            const itemName = itemNameEl.innerText;

            // Create Drawer and Action Area
            const drawer = document.createElement('div');
            drawer.className = 'quantity-drawer';
            const stepperContainer = document.createElement('div');
            stepperContainer.className = 'stepper-container';
            
            const actionArea = document.createElement('div');
            actionArea.className = 'action-area';

            const addBtn = document.createElement('button');
            addBtn.className = 'btn-add-initial';
            addBtn.innerText = 'Add to Order';

            const rollUpBtn = document.createElement('button');
            rollUpBtn.className = 'btn-rollup';
            rollUpBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Roll Up';

            // Gather Data & Inject Steppers
            const itemSizes = [];
            if (tieredGrid) {
                tieredGrid.querySelectorAll('.price-tier').forEach(tier => {
                    const labelEl = tier.querySelector('.tier-label');
                    const valEl = tier.querySelector('.tier-val');
                    if (labelEl && valEl) {
                        const sizeLabel = labelEl.innerText.split('(')[0].trim();
                        const priceRaw = valEl.innerText.replace(/[^\d.]/g, '');
                        itemSizes.push({ size: sizeLabel, price: priceRaw });
                    }
                });
            } else if (singlePrice) {
                const priceRaw = singlePrice.innerText.replace(/[^\d.]/g, '');
                itemSizes.push({ size: "Regular", price: priceRaw });
            }

            itemSizes.forEach(info => {
                const stepperRow = createStepperRow(info.size);
                stepperContainer.appendChild(stepperRow);
                setupStepperListeners(stepperRow, itemName, info.size, info.price, addBtn);
            });

            drawer.appendChild(stepperContainer);
            drawer.appendChild(rollUpBtn);
            
            actionArea.appendChild(addBtn);
            actionArea.appendChild(drawer);
            itemBox.appendChild(actionArea);

            addBtn.addEventListener('click', () => {
                drawer.classList.add('open');
            });

            rollUpBtn.addEventListener('click', () => {
                drawer.classList.remove('open');
            });
        });

        function createStepperRow(sizeLabel) {
            const row = document.createElement('div');
            row.className = 'size-stepper';
            row.innerHTML = `
                <span class="stepper-label">${sizeLabel}</span>
                <div class="qty-control">
                    <button class="qty-btn minus"><i class="fas fa-minus"></i></button>
                    <input type="text" class="qty-input" value="0" readonly>
                    <button class="qty-btn plus"><i class="fas fa-plus"></i></button>
                </div>
            `;
            return row;
        }

        function setupStepperListeners(row, name, size, price, addBtn) {
            const minusBtn = row.querySelector('.minus');
            const plusBtn = row.querySelector('.plus');
            const input = row.querySelector('.qty-input');
            const id = `${name} - ${size}`;

            plusBtn.addEventListener('click', () => {
                updateCart(id, name, size, price, 1);
                input.value = cart[id].qty;
                updateOrderBar();
                updateAddButton(addBtn, name);
            });

            minusBtn.addEventListener('click', () => {
                if (cart[id] && cart[id].qty > 0) {
                    updateCart(id, name, size, price, -1);
                    input.value = cart[id] ? cart[id].qty : 0;
                    updateOrderBar();
                    updateAddButton(addBtn, name);
                }
            });
        }

        function updateCart(id, name, size, price, change) {
            if (!cart[id]) {
                cart[id] = { name, size, price: parseFloat(price), qty: 0 };
            }
            cart[id].qty += change;
            if (cart[id].qty <= 0) delete cart[id];
        }

        function updateAddButton(btn, itemName) {
            let itemQty = 0;
            Object.values(cart).forEach(item => {
                if (item.name === itemName) itemQty += item.qty;
            });
            if (itemQty > 0) {
                btn.innerText = `Added (${itemQty}) to Order`;
                btn.style.backgroundColor = 'var(--color-primary-dark)';
            } else {
                btn.innerText = 'Add to Order';
                btn.style.backgroundColor = 'var(--color-primary)';
            }
        }

        function updateOrderBar() {
            let totalQty = 0;
            let totalPrice = 0;
            Object.values(cart).forEach(item => {
                totalQty += item.qty;
                totalPrice += item.qty * item.price;
            });
            countDisplay.innerText = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;
            totalDisplay.innerText = `Total: ₱${totalPrice.toLocaleString()}`;
            if (totalQty > 0) {
                orderBar.classList.add('active');
                document.body.classList.add('has-order-bar');
            } else {
                orderBar.classList.remove('active');
                document.body.classList.remove('has-order-bar');
            }
        }

                        btnOrderNow.addEventListener('click', async () => {

                            // 1. Validation: Ensure cart is not empty

                            const items = Object.values(cart);

                            if (items.length === 0) {

                                alert("Your cart is empty! Please add some items before ordering.");

                                return;

                            }

                

                            // 2. Build the order message

                            let message = "Hello! I would like to place an order:\n\n";

                            let grandTotal = 0;

                            items.forEach(item => {

                                const itemTotal = item.qty * item.price;

                                grandTotal += itemTotal;

                                message += `${item.qty}x ${item.name} (${item.size}) - ₱${itemTotal.toLocaleString()}\n`;

                            });

                            message += `\nTotal Estimated Price: ₱${grandTotal.toLocaleString()}\n\n[Auto-generated from Website]`;

                

                            // 3. Direct Share (Mobile) or Copy-Paste (Desktop)

                            if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {

                                try {

                                    await navigator.share({

                                        title: 'Order from Cordero Sinanglaoan',

                                        text: message

                                    });

                                } catch (err) {

                                    console.log("Share failed or cancelled, falling back to copy method.");

                                    copyToClipboardFallback(message);

                                }

                            } else {

                                copyToClipboardFallback(message);

                            }

                        });

                

                        async function copyToClipboardFallback(message) {

                            try {

                                await navigator.clipboard.writeText(message);

                                const proceed = confirm(

                                    "✅ ORDER DETAILS COPIED!\n\n" +

                                    "To complete your order:\n" +

                                    "1. Click OK to open Messenger.\n" +

                                    "2. Paste the message and send it to us."

                                );

                                if (proceed) {

                                    window.location.href = "https://m.me/lovella.cordero";

                                }

                            } catch (err) {

                                alert("Please manually copy your order and send it to us on Messenger:\n\n" + message);

                                window.location.href = "https://m.me/lovella.cordero";

                            }

                        }
    }
});