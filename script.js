document.addEventListener('DOMContentLoaded', () => {
    // 1. Loading Animation
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.classList.add('hidden'), 500);
    }, 1000);

    // 2. Dark/Light Mode Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            htmlElement.setAttribute('data-theme', 'dark');
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // 3. Render Categories Filter
    const categoryFiltersContainer = document.getElementById('category-filters');
    if (typeof categories !== 'undefined' && categoryFiltersContainer) {
        categories.forEach((cat, index) => {
            const btn = document.createElement('button');
            btn.className = `btn btn-outline ${index === 0 ? 'active' : ''}`;
            btn.dataset.filter = cat.id;
            btn.textContent = cat.name;
            btn.addEventListener('click', () => filterProducts(cat.id));
            categoryFiltersContainer.appendChild(btn);
        });
    }

    // 4. Render Products
    const featuredGrid = document.getElementById('featured-grid');
    const mainGrid = document.getElementById('main-products-grid');
    const noResultsMsg = document.getElementById('no-results');

    function createProductCard(product) {
        let priceHtml = '';
        let badgeHtml = '';
        const formattedPrice = Number(product.price).toLocaleString('en-US');
        
        if (product.originalPrice && Number(product.originalPrice) > Number(product.price)) {
            const formattedOriginal = Number(product.originalPrice).toLocaleString('en-US');
            const discount = Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100);
            
            priceHtml = `
                <div class="price-container">
                    <span class="product-price">${formattedPrice} ${product.currency}</span>
                    <span class="original-price">${formattedOriginal} ${product.currency}</span>
                </div>
            `;
            badgeHtml = `<div class="sale-badge">خصم ${discount}%</div>`;
        } else {
            priceHtml = `<span class="product-price">${formattedPrice} ${product.currency}</span>`;
        }

        const waMessage = encodeURIComponent(`مرحباً، أود شراء هذا المنتج:\n\nاسم المنتج: ${product.title}\nالسعر: ${formattedPrice} ${product.currency}\nرمز المنتج: ${product.id}`);
        const waUrl = `https://wa.me/9647747597922?text=${waMessage}`;

        return `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    ${badgeHtml}
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-meta">
                        ${priceHtml}
                        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">شراء الآن</a>
                    </div>
                </div>
            </div>
        `;
    }

    function renderProducts() {
        if (typeof products === 'undefined') return;

        // Render Featured Products (first 3 that are featured)
        const featuredProducts = products.filter(p => p.featured).slice(0, 3);
        if (featuredGrid && featuredProducts.length > 0) {
            featuredGrid.innerHTML = featuredProducts.map(createProductCard).join('');
        } else if (featuredGrid) {
            document.getElementById('featured').classList.add('hidden');
        }

        // Render All Products
        if (mainGrid) {
            mainGrid.innerHTML = products.map(createProductCard).join('');
        }
    }

    renderProducts();

    // 5. Search and Filter Logic
    const searchInput = document.getElementById('search-input');
    
    function filterProducts(categoryToFilter = 'all') {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const allCards = Array.from(mainGrid.getElementsByClassName('product-card'));
        let visibleCount = 0;

        // Update active filter button
        const filterBtns = categoryFiltersContainer.querySelectorAll('.btn-outline');
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === categoryToFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        allCards.forEach(card => {
            const title = card.querySelector('.product-title').textContent.toLowerCase();
            const desc = card.querySelector('.product-desc').textContent.toLowerCase();
            const category = card.dataset.category;
            
            const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);
            const matchesCategory = categoryToFilter === 'all' || category === categoryToFilter;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (visibleCount === 0) {
            noResultsMsg.classList.remove('hidden');
        } else {
            noResultsMsg.classList.add('hidden');
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const activeFilter = categoryFiltersContainer.querySelector('.active').dataset.filter;
            filterProducts(activeFilter);
        });
    }

    // 6. Back to Top Button & Sticky Navbar
    const backToTopBtn = document.getElementById('back-to-top');
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        // Back to top visibility
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }

        // Navbar shadow on scroll
        if (window.scrollY > 10) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'var(--shadow-sm)';
        }
    });

    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 7. Mobile Menu Close on Link Click
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                menuToggle.checked = false;
            }
        });
    });
});
