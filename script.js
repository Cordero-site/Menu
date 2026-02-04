document.addEventListener('DOMContentLoaded', function () {
    // Add js-enabled class to body for progressive enhancement animations
    document.body.classList.add('js-enabled');

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu li a');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        // Toggle body scroll for better mobile UX
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = ''; // Restore scroll
        });
    });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { navbar.classList.add('scrolled'); }
        else { navbar.classList.remove('scrolled'); }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });

    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 150)) { current = section.getAttribute('id'); }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) { link.classList.add('active'); }
        });
    });

    const dishCarousel = document.querySelector('.dish-carousel');
    const carouselPrevBtn = document.querySelector('.carousel-btn.prev');
    const carouselNextBtn = document.querySelector('.carousel-btn.next');
    if (dishCarousel && carouselPrevBtn && carouselNextBtn) {
        carouselPrevBtn.addEventListener('click', () => { 
            const itemWidth = dishCarousel.querySelector('.dish-item').offsetWidth + 30; // item + gap
            dishCarousel.scrollBy({ left: -itemWidth, behavior: 'smooth' }); 
        });
        carouselNextBtn.addEventListener('click', () => { 
            const itemWidth = dishCarousel.querySelector('.dish-item').offsetWidth + 30; // item + gap
            dishCarousel.scrollBy({ left: itemWidth, behavior: 'smooth' }); 
        });
    }

    const categoryTeasers = document.querySelectorAll('.cat-teaser');
    const menuCategories = document.querySelectorAll('.menu-category');
    categoryTeasers.forEach(teaser => {
        teaser.addEventListener('click', () => {
            const targetId = teaser.getAttribute('data-target');
            menuCategories.forEach(cat => cat.classList.remove('active'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                const wrapper = document.querySelector('.menu-wrapper');
                const offsetPosition = wrapper.getBoundingClientRect().top + window.pageYOffset - 100;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });



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

    // Staggered Animation for Menu Items
    const menuItems = document.querySelectorAll('.menu-item-box');
    if (menuItems.length > 0) {
        const menuObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger items that appear in the same batch
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 150); 
                    menuObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        menuItems.forEach(item => {
            menuObserver.observe(item);
        });
    }

    // Catering Accordion Logic Removed
    
    // Learn More Toggle Logic
    const learnMoreBtns = document.querySelectorAll('.learn-more-toggle');
    learnMoreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const details = btn.nextElementSibling;
            details.classList.toggle('visible');
            
            if (details.classList.contains('visible')) {
                btn.innerHTML = `Show Less <i class="fas fa-chevron-up"></i>`;
            } else {
                btn.innerHTML = `Learn More <i class="fas fa-chevron-down"></i>`;
            }
        });
    });

    // Back to Top Button Logic
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});