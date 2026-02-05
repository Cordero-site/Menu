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

    // Catering Expand Logic
    const learnMoreBtns = document.querySelectorAll('.learn-more-toggle');
    learnMoreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const details = btn.nextElementSibling;
            if (details && details.classList.contains('service-details')) {
                details.classList.toggle('visible');

                // Toggle Button Text/Icon
                const icon = btn.querySelector('i');
                if (details.classList.contains('visible')) {
                    btn.childNodes[0].textContent = "Show Less ";
                    if (icon) icon.className = "fas fa-chevron-up";
                } else {
                    btn.childNodes[0].textContent = "Learn More ";
                    if (icon) icon.className = "fas fa-chevron-down";
                }
            }
        });
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

        let selectedPlatform = null; // Stores 'sms' or 'messenger'
        let selectedService = null;
        let selectedPayment = null;

        // 1. Inject Modal HTML (Updated for 2 Steps)
        const modalHTML = `
        <div id="orderModal" class="modal-overlay">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                
                <!-- STEP 1: Platform Selection -->
                <div id="modal-step-1">
                    <div class="modal-header">
                        <h2>Start Your Order</h2>
                    </div>
                    
                    <div class="order-summary-container">
                        <div id="popup-summary-content" class="order-summary">
                            <div class="summary-placeholder">
                                <p>Ready to experience our authentic flavors?</p>
                            </div>
                        </div>
                        <div id="popup-total-price" style="text-align: right; font-weight: bold; font-size: 1.2rem; margin-top: 10px; color: #7F5539;"></div>
                    </div>

                    <div class="platform-section">
                        <p style="margin-bottom: 15px; font-weight: 500;">Choose where to send your order:</p>
                        <div class="platform-buttons">
                            <button class="btn-platform btn-sms" id="btnSelectSMS">
                                <i class="fas fa-sms"></i>
                                Text Message
                            </button>
                            <button class="btn-platform btn-messenger" id="btnSelectMessenger">
                                <i class="fab fa-facebook-messenger"></i>
                                Messenger
                            </button>
                        </div>
                        
                         <button id="btnOrderMore" class="btn-order-more" style="margin-top: 20px; background: transparent; border: 1px solid #7F5539; color: #7F5539; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 600; transition: all 0.3s; width: 100%;" onmouseover="this.style.background='#7F5539';this.style.color='#fff'" onmouseout="this.style.background='transparent';this.style.color='#7F5539'">
                            <i class="fas fa-plus"></i> Order More
                        </button>
                    </div>
                </div>

                <!-- STEP 2: Service Selection (Hidden by default) -->
                <div id="modal-step-2" style="display: none;">
                    <button id="btnBackToStep1" style="background:none; border:none; cursor:pointer; font-size:1.5rem; float:left; color:#7F5539;"><i class="fas fa-arrow-left"></i></button>
                    <div class="modal-header">
                        <h2>Order Options</h2>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <!-- Service Type -->
                        <p style="text-align:left; font-weight:600; margin-bottom:5px; color:#555;">Service Type:</p>
                        <div class="platform-buttons" style="margin-top:5px; margin-bottom: 20px;">
                            <button class="btn-platform" id="btnServicePickup" style="background:#fff; border: 2px solid #7F5539; color:#7F5539;">
                                <i class="fas fa-shopping-bag" style="font-size: 1.5rem; margin-bottom:5px;"></i>
                                Pick Up
                            </button>
                            <button class="btn-platform" id="btnServiceDelivery" style="background:#fff; border: 2px solid #7F5539; color:#7F5539;">
                                <i class="fas fa-motorcycle" style="font-size: 1.5rem; margin-bottom:5px;"></i>
                                Delivery
                            </button>
                        </div>

                        <!-- Address Input (Hidden initially) -->
                        <div id="address-section" style="display:none; margin-bottom: 20px; text-align: left; opacity: 0; transition: all 0.5s ease; transform: translateY(-10px);">
                            <label style="display:block; font-weight:600; margin-bottom:5px; color:#555;">Delivery Address:</label>
                            <textarea id="delivery-address" placeholder="Please enter your complete address..." rows="2" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-family:inherit; resize:vertical;"></textarea>
                        </div>
                        
                        <!-- Payment Method -->
                        <p style="text-align:left; font-weight:600; margin-bottom:5px; color:#555;">Payment Method:</p>
                        <div class="platform-buttons" style="margin-top:5px;">
                             <button class="btn-platform" id="btnPayCash" style="background:#fff; border: 2px solid #7F5539; color:#7F5539;">
                                <i class="fas fa-money-bill-wave" style="font-size: 1.5rem; margin-bottom:5px;"></i>
                                Cash
                             </button>
                             <button class="btn-platform" id="btnPayGcash" style="background:#fff; border: 2px solid #7F5539; color:#7F5539;">
                                <i class="fas fa-mobile-alt" style="font-size: 1.5rem; margin-bottom:5px;"></i>
                                GCash
                             </button>
                        </div>

                        <button id="btnFinalSend" class="btn-disabled" disabled style="margin-top: 25px; background: #28a745; color: white; border: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; cursor: pointer; width: 100%; font-size: 1rem; transition: all 0.3s;">
                            Confirm & Send Order <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Modal Elements
        const modal = document.getElementById('orderModal');
        const closeBtn = document.querySelector('.close-modal');
        const summaryContent = document.getElementById('popup-summary-content');
        const totalPriceEl = document.getElementById('popup-total-price');
        const step1 = document.getElementById('modal-step-1');
        const step2 = document.getElementById('modal-step-2');
        const btnOrderMore = document.getElementById('btnOrderMore');
        const addressSection = document.getElementById('address-section');
        const addressInput = document.getElementById('delivery-address');
        const btnFinalSend = document.getElementById('btnFinalSend');
        const btnServicePickup = document.getElementById('btnServicePickup');
        const btnServiceDelivery = document.getElementById('btnServiceDelivery');
        const btnPayCash = document.getElementById('btnPayCash');
        const btnPayGcash = document.getElementById('btnPayGcash');

        // Functions to Open/Close Modal
        window.openOrderPopup = function () {
            updatePopupContent();
            // Reset to step 1
            step1.style.display = 'block';
            step2.style.display = 'none';
            selectedService = null;
            selectedPayment = null;

            // Clear styles
            [btnServicePickup, btnServiceDelivery, btnPayCash, btnPayGcash].forEach(btn => {
                if (btn) btn.classList.remove('selected');
            });
            if (btnFinalSend) {
                btnFinalSend.classList.add('btn-disabled');
                btnFinalSend.disabled = true;
            }
            if (addressSection) {
                addressSection.style.display = 'none';
                addressSection.style.opacity = '0';
            }
            if (addressInput) addressInput.value = '';

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Hide floating bar
            const floatBar = document.querySelector('.order-floating-bar');
            if (floatBar) floatBar.classList.add('temp-hidden');
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';

            // Show floating bar
            const floatBar = document.querySelector('.order-floating-bar');
            if (floatBar) floatBar.classList.remove('temp-hidden');
        }

        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        if (btnOrderMore) btnOrderMore.addEventListener('click', closeModal);

        // Step 1: Select Platform
        document.getElementById('btnSelectSMS').addEventListener('click', () => {
            selectedPlatform = 'sms';
            goToStep2();
        });

        document.getElementById('btnSelectMessenger').addEventListener('click', () => {
            selectedPlatform = 'messenger';
            goToStep2();
        });

        function goToStep2() {
            step1.style.display = 'none';
            step2.style.display = 'block';
        }

        document.getElementById('btnBackToStep1').addEventListener('click', () => {
            step2.style.display = 'none';
            step1.style.display = 'block';
        });

        // Step 2 Logic: Service Selection
        function updateSendButton() {
            const isDelivery = selectedService === 'DELIVERY';
            const address = addressInput.value.trim();
            const valid = selectedService && selectedPayment && (!isDelivery || address.length > 0);

            if (valid) {
                btnFinalSend.classList.remove('btn-disabled');
                btnFinalSend.disabled = false;
            } else {
                btnFinalSend.classList.add('btn-disabled');
                btnFinalSend.disabled = true;
            }
        }

        btnServicePickup.addEventListener('click', () => {
            selectedService = 'PICK UP';
            btnServicePickup.classList.add('selected');
            btnServiceDelivery.classList.remove('selected');

            // Hide address with animation
            addressSection.style.opacity = '0';
            addressSection.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (selectedService === 'PICK UP') addressSection.style.display = 'none';
            }, 500);

            updateSendButton();
        });

        btnServiceDelivery.addEventListener('click', () => {
            selectedService = 'DELIVERY';
            btnServiceDelivery.classList.add('selected');
            btnServicePickup.classList.remove('selected');

            addressSection.style.display = 'block';
            // Trigger reflow
            void addressSection.offsetWidth;
            addressSection.style.opacity = '1';
            addressSection.style.transform = 'translateY(0)';

            updateSendButton();
        });

        addressInput.addEventListener('input', updateSendButton);

        // Payment Selection
        btnPayCash.addEventListener('click', () => {
            selectedPayment = 'CASH';
            btnPayCash.classList.add('selected');
            btnPayGcash.classList.remove('selected');
            updateSendButton();
        });

        btnPayGcash.addEventListener('click', () => {
            selectedPayment = 'GCASH';
            btnPayGcash.classList.add('selected');
            btnPayCash.classList.remove('selected');
            updateSendButton();
        });

        // Final Send
        if (btnFinalSend) {
            btnFinalSend.addEventListener('click', () => {
                finalizeOrder(selectedService, selectedPayment, addressInput.value.trim());
            });
        }

        // Modal Logic: Populate Content
        function updatePopupContent() {
            const items = Object.values(cart);
            let grandTotal = 0;

            if (items.length === 0) {
                summaryContent.innerHTML = `
                    <div class="summary-placeholder">
                        <p>Your cart is currently empty.</p>
                        <p style="font-size: 0.9rem; margin-top: 5px;">You can still proceed to message us directly!</p>
                    </div>`;
                totalPriceEl.textContent = '';
                return;
            }

            let html = '<ul style="list-style: none; padding: 0;">';
            items.forEach(item => {
                const total = item.qty * item.price;
                grandTotal += total;
                html += `
                <li style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 8px 0;">
                    <span>${item.qty}x <strong>${item.name}</strong> (${item.size})</span>
                    <span>₱${total.toLocaleString()}</span>
                </li>`;
            });
            html += '</ul>';

            summaryContent.innerHTML = html;
            totalPriceEl.textContent = `Total: ₱${grandTotal.toLocaleString()}`;
        }

        // Generate Message Function
        function getOrderMessage(serviceType, paymentMethod, address) {
            const items = Object.values(cart);
            let msg = items.length === 0 ? "Hi, I would like to place an order." : "Hello! I would like to place an order:\n\n";

            if (items.length > 0) {
                let grandTotal = 0;
                items.forEach(item => {
                    const total = item.qty * item.price;
                    grandTotal += total;
                    msg += `${item.qty}x ${item.name} (${item.size}) - ₱${total.toLocaleString()}\n`;
                });
                msg += `\nTotal Estimated Price: ₱${grandTotal.toLocaleString()}`;
            }

            msg += `\n\nSERVICE TYPE: ${serviceType}`;
            msg += `\nPAYMENT METHOD: ${paymentMethod}`;
            if (serviceType === 'DELIVERY' && address) {
                msg += `\nDELIVERY ADDRESS: ${address}`;
            }
            msg += `\nDate: ${new Date().toLocaleString()}`;

            return msg;
        }

        function finalizeOrder(serviceType, paymentMethod, address) {
            const message = getOrderMessage(serviceType, paymentMethod, address);

            if (selectedPlatform === 'sms') {
                const phoneNumber = "09692832346";
                window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
            } else {
                const fbLink = "https://m.me/lovella.cordero";
                navigator.clipboard.writeText(message).then(() => {
                    alert("Order details copied! Relocating to Messenger...");
                    window.open(fbLink, '_blank');
                }).catch(() => {
                    window.open(fbLink, '_blank');
                });
            }

            // Optional: Close modal after action
            setTimeout(closeModal, 1000);
        }


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

        // Updated Order Button Listener: Opens Popup instead of Alert
        btnOrderNow.addEventListener('click', () => {
            // Validation: Cart empty?
            if (Object.keys(cart).length === 0) {
                alert("Your cart is empty! Please add items first.");
                return;
            }
            openOrderPopup();
        });
    }
    // --- 5. Contact Popup System ---
    initContactSystem();

    function initContactSystem() {
        const contactModalHTML = `
        <div id="contactModal" class="modal-overlay">
            <div class="modal-content">
                <span class="close-modal contact-close">&times;</span>
                <div class="modal-header">
                    <h2>Contact Us</h2>
                </div>
                
                <div style="margin: 20px 0;">
                    <div class="contact-input-group">
                        <label for="contact-name">Your Name</label>
                        <input type="text" id="contact-name" class="contact-input" placeholder="e.g. Juan dela Cruz">
                    </div>
                    
                    <div class="contact-input-group">
                        <label for="contact-inquiry">Your Inquiry</label>
                        <textarea id="contact-inquiry" class="contact-textarea" placeholder="How can we help you today?"></textarea>
                    </div>

                    <p style="text-align:left; font-weight:600; margin-bottom:10px; color:#555; margin-top: 20px;">Send via:</p>
                    <div class="platform-buttons">
                         <button class="btn-platform btn-sms" id="btnContactSMS">
                            <i class="fas fa-sms"></i>
                            Text Message
                        </button>
                        <button class="btn-platform btn-messenger" id="btnContactMessenger">
                            <i class="fab fa-facebook-messenger"></i>
                            Messenger
                        </button>
                    </div>

                     <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        <p style="font-weight:600; color:#555; margin-bottom: 15px;">Visit Us</p>
                        <a href="https://www.facebook.com/profile.php?id=100057577024468" target="_blank" style="display: inline-flex; align-items: center; gap: 10px; color: #1877F2; font-weight: 500; text-decoration: none; padding: 10px 20px; background: #e7f3ff; border-radius: 20px; transition: background 0.3s;">
                            <i class="fab fa-facebook" style="font-size: 1.2rem;"></i>
                            Cordero Sinanglaoan
                        </a>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', contactModalHTML);

        const modal = document.getElementById('contactModal');
        const closeBtn = modal.querySelector('.contact-close');
        const nameInput = document.getElementById('contact-name');
        const inquiryInput = document.getElementById('contact-inquiry');
        const btnSMS = document.getElementById('btnContactSMS');
        const btnMessenger = document.getElementById('btnContactMessenger');

        window.openContactPopup = function () {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Hide floating bar if present
            const floatBar = document.querySelector('.order-floating-bar');
            if (floatBar) floatBar.classList.add('temp-hidden');
        };

        function closeContactModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Show floating bar
            const floatBar = document.querySelector('.order-floating-bar');
            if (floatBar) floatBar.classList.remove('temp-hidden');
        }

        closeBtn.addEventListener('click', closeContactModal);
        window.addEventListener('click', (e) => { if (e.target === modal) closeContactModal(); });

        // Hook up to existing Contact links
        const contactLinks = document.querySelectorAll('a[href="#footer"], a[href="#contact"]');
        contactLinks.forEach(link => {
            // Check if it's actually a contact link text to be sure
            if (link.textContent.toLowerCase().includes('contact')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.openContactPopup();
                    // Close mobile menu if open
                    const hamburger = document.querySelector('.hamburger');
                    const navMenu = document.querySelector('.nav-menu');
                    if (navMenu.classList.contains('active')) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                    }
                });
            }
        });

        // Send Logic
        function getContactMessage() {
            const name = nameInput.value.trim() || "Valued Customer";
            const inquiry = inquiryInput.value.trim();
            if (!inquiry) {
                alert("Please enter your inquiry first.");
                return null;
            }
            return `Hi, I'm ${name}.\n\nI have an inquiry:\n${inquiry}`;
        }

        btnSMS.addEventListener('click', () => {
            const msg = getContactMessage();
            if (msg) {
                const phoneNumber = "09692832346";
                window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(msg)}`;
                setTimeout(closeContactModal, 1000);
            }
        });

        btnMessenger.addEventListener('click', () => {
            const msg = getContactMessage();
            if (msg) {
                const fbLink = "https://m.me/lovella.cordero";
                // Try to copy to clipboard for convenience
                navigator.clipboard.writeText(msg).then(() => {
                    alert("Message copied! Relocating to Messenger...");
                    window.open(fbLink, '_blank');
                }).catch(() => {
                    window.open(fbLink, '_blank');
                });
                setTimeout(closeContactModal, 1000);
            }
        });
    }
});