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
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        htmlElement.setAttribute('data-theme', 'dark');
    }
    themeToggleBtn.addEventListener('click', () => {
        const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
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
            btn.addEventListener('click', () => {
                if (typeof filterProducts === 'function') filterProducts(cat.id);
            });
            categoryFiltersContainer.appendChild(btn);
        });
    }

    // 4. Helper: format description text
    function formatDescription(desc) {
        if (!desc) return '';
        const div = document.createElement('div');
        div.textContent = desc;
        const escaped = div.innerHTML;
        return escaped.split('\n').map(line => {
            line = line.trim();
            if (!line) return '';
            const ci = line.indexOf(':');
            if (ci > 0 && ci < 50 && !line.startsWith('http')) {
                return `<span style="color:var(--primary-color);font-weight:bold;margin-left:5px;">•</span><strong>${line.substring(0, ci + 1)}</strong>${line.substring(ci + 1)}`;
            }
            if (line.startsWith('- ') || line.startsWith('• ')) {
                return `<span style="color:var(--primary-color);font-weight:bold;margin-left:5px;">•</span>${line.substring(2)}`;
            }
            return line;
        }).join('\n');
    }

    // 5. Create a product card HTML string
    function createProductCard(product) {
        const fp = Number(product.price).toLocaleString('en-US');
        let priceHtml = '', badgeHtml = '';
        if (product.originalPrice && Number(product.originalPrice) > Number(product.price)) {
            const fo = Number(product.originalPrice).toLocaleString('en-US');
            const disc = Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100);
            priceHtml = `<div class="price-container"><span class="product-price">${fp} ${product.currency}</span><span class="original-price">${fo} ${product.currency}</span></div>`;
            badgeHtml = `<div class="sale-badge">خصم ${disc}%</div>`;
        } else {
            priceHtml = `<span class="product-price">${fp} ${product.currency}</span>`;
        }
        const src = product.url ? `<a href="${product.url}" target="_blank" rel="noopener noreferrer" class="source-badge" onclick="event.stopPropagation()">موقع</a>` : '';
        const cLabel = product.condition === 'used' ? 'مستخدم' : 'جديد';
        const cClass = product.condition === 'used' ? 'condition-used' : 'condition-new';
        const tags = (product.tags && product.tags.length > 0) ? `<div class="product-card-tags">${product.tags.map(t => `<span class="product-tag">${t}</span>`).join('')}</div>` : '';
        const readMore = (product.description && product.description.length > 60) ? `<button class="read-more-btn" onclick="event.stopPropagation(); var p=this.previousElementSibling; if(p) p.classList.toggle('expanded'); this.textContent=(p && p.classList.contains('expanded'))?'أقل':'المزيد';">المزيد</button>` : '';

        return `<div class="product-card reveal" data-category="${product.category}" onclick="if(window._openPopup) window._openPopup(${product.id})" style="cursor:pointer;">
            <div class="product-image ${product.noCrop ? 'no-crop' : ''}">
                ${badgeHtml}${src}
                <span class="condition-badge ${cClass}">${cLabel}</span>
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <div class="product-card-overlay"><span class="view-details-hint">📸 عرض التفاصيل</span></div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                ${tags}
                <div class="product-desc-wrapper" style="flex-grow:1;">
                    <p class="product-desc">${formatDescription(product.description)}</p>
                    ${readMore}
                </div>
                <div class="product-meta">${priceHtml}</div>
            </div>
        </div>`;
    }

    // 6. Render products into both grids
    function renderProducts() {
        if (typeof products === 'undefined') return;
        const sortMode = document.getElementById('sort-select')?.value || 'default';
        let sorted = [...products];
        if (sortMode === 'price-asc') sorted.sort((a, b) => Number(a.price) - Number(b.price));
        else if (sortMode === 'price-desc') sorted.sort((a, b) => Number(b.price) - Number(a.price));
        else if (sortMode === 'date-desc') sorted.sort((a, b) => b.id - a.id);
        else if (sortMode === 'date-asc') sorted.sort((a, b) => a.id - b.id);
        else sorted.sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1) || b.id - a.id);

        // Featured products
        const allFeatured = [...products]
            .sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1) || b.id - a.id)
            .filter(p => p.featured);

        const fg = document.getElementById('featured-grid');
        const fs = document.getElementById('featured');
        if (fg && allFeatured.length > 0) {
            fg.innerHTML = allFeatured.slice(0, 4).map(createProductCard).join('');
            if (fs) fs.classList.remove('hidden');
            // Start rotation if more than 4
            if (allFeatured.length > 4) startFeaturedRotation(allFeatured);
        } else if (fs) {
            fs.classList.add('hidden');
        }

        // Main products grid
        const mg = document.getElementById('main-products-grid');
        if (mg) {
            mg.innerHTML = sorted.map(createProductCard).join('');
        }
    }


    // 7. Search and filter
    const searchInput = document.getElementById('search-input');
    function filterProducts(cat) {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const mg = document.getElementById('main-products-grid');
        if (!mg) return;
        const cards = mg.querySelectorAll('.product-card');
        let visible = 0;
        categoryFiltersContainer.querySelectorAll('.btn-outline').forEach(b => {
            b.classList.toggle('active', b.dataset.filter === cat);
        });
        cards.forEach(card => {
            const t = (card.querySelector('.product-title')?.textContent || '').toLowerCase();
            const d = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();
            const show = (t.includes(term) || d.includes(term)) && (cat === 'all' || card.dataset.category === cat);
            card.style.display = show ? 'flex' : 'none';
            if (show) visible++;
        });
        const noResults = document.getElementById('no-results');
        if (noResults) noResults.classList.toggle('hidden', visible > 0);
    }
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const f = categoryFiltersContainer.querySelector('.active')?.dataset.filter || 'all';
            filterProducts(f);
        });
    }
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            renderProducts();
            const f = categoryFiltersContainer.querySelector('.active')?.dataset.filter || 'all';
            filterProducts(f);
        });
    }

    // 8. Back to Top & Navbar
    const backToTopBtn = document.getElementById('back-to-top');
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('visible', window.scrollY > 300);
        navbar.style.boxShadow = window.scrollY > 10 ? 'var(--shadow-md)' : 'var(--shadow-sm)';
    });
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 9. Mobile Menu
    const menuToggle = document.getElementById('menu-toggle');
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => { if (window.innerWidth <= 768) menuToggle.checked = false; });
    });

    // 10. SPA Navigation
    function handleNavigation() {
        const hash = window.location.hash || '#home';
        const home = document.getElementById('home');
        const feat = document.getElementById('featured');
        const prod = document.getElementById('products');
        const blog = document.getElementById('blog');
        if (hash === '#blog' && blog) {
            if (home) home.classList.add('hidden');
            if (feat) feat.classList.add('hidden');
            if (prod) prod.classList.add('hidden');
            blog.classList.remove('hidden');
        } else {
            if (home) home.classList.remove('hidden');
            if (prod) prod.classList.remove('hidden');
            if (blog) blog.classList.add('hidden');
            if (feat) {
                const hasFeat = typeof products !== 'undefined' && products.some(p => p.featured);
                feat.classList.toggle('hidden', !hasFeat);
            }
        }
        // Trigger reveal check on nav
        if (typeof observeReveals === 'function') observeReveals();
    }
    window.addEventListener('hashchange', handleNavigation);
    handleNavigation();

    // =============================================
    // 10b. Scroll Reveal Observer
    // =============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, { threshold: 0.1 });

    function observeReveals() {
        const reveals = document.querySelectorAll('.reveal:not(.reveal-visible)');
        reveals.forEach(el => revealObserver.observe(el));
    }
    observeReveals();

    // =============================================
    // 11. POPUP — simple global function
    // =============================================
    const popup = document.getElementById('product-popup');
    const overlay = document.getElementById('product-popup-overlay');

    function closePopup() {
        if (popup) popup.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    if (overlay) overlay.addEventListener('click', closePopup);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

    // This is the global function called by onclick on cards
    window._openPopup = function(id) {
        const p = products.find(x => x.id === id);
        if (!p || !popup || !overlay) return;

        const imgs = [p.image, ...(p.images || [])].filter(Boolean);
        const fp = Number(p.price).toLocaleString('en-US');
        const fo = p.originalPrice ? Number(p.originalPrice).toLocaleString('en-US') : null;
        const disc = (p.originalPrice && Number(p.originalPrice) > Number(p.price))
            ? Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100) : null;
        const wa = `https://wa.me/9647747597922?text=${encodeURIComponent('مرحباً، أود شراء هذا المنتج:\n\nاسم المنتج: ' + p.title + '\nالسعر: ' + fp + ' ' + p.currency + '\nرمز المنتج: ' + p.id)}`;
        const isDemo = p.isDemo === true;
        const cLabel = p.condition === 'used' ? 'مستخدم' : 'جديد';
        const cClass = p.condition === 'used' ? 'condition-used' : 'condition-new';
        const buyBtn = isDemo
            ? `<button class="btn btn-disabled popup-buy-btn" onclick="alert('هذا منتج تجريبي للعرض فقط')">منتج تجريبي</button>`
            : `<a href="${wa}" target="_blank" rel="noopener noreferrer" class="btn btn-primary popup-buy-btn">شراء الآن عبر واتساب</a>`;
        const srcBtn = p.url ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer" class="btn popup-source-btn">زيارة الموقع الرسمي ↗</a>` : '';
        const tagsH = (p.tags && p.tags.length > 0) ? `<div class="popup-tags">${p.tags.map(t => `<span class="popup-tag">${t}</span>`).join('')}</div>` : '';
        const thumbs = imgs.length > 1
            ? `<div class="popup-thumbs">${imgs.map((im, i) => `<img src="${im}" class="popup-thumb${i===0?' active':''}" onclick="document.getElementById('popup-main-img').src='${im}'; document.querySelectorAll('.popup-thumb').forEach(t=>t.classList.remove('active')); this.classList.add('active');" alt="صورة ${i+1}">`).join('')}</div>`
            : '';
        const discBadge = disc ? `<span class="popup-discount-badge">خصم ${disc}%</span>` : '';

        popup.innerHTML = `
            <div class="popup-inner">
                <button class="popup-close-btn" onclick="document.getElementById('product-popup').classList.remove('active');document.getElementById('product-popup-overlay').classList.remove('active');document.body.style.overflow='';" aria-label="إغلاق">✕</button>
                <div class="popup-gallery">
                    <div class="popup-main-img-wrap ${p.noCrop ? 'no-crop' : ''}">
                        <img id="popup-main-img" src="${imgs[0]}" alt="${p.title}">
                        ${discBadge}
                    </div>
                    ${thumbs}
                </div>
                <div class="popup-details">
                    <div class="popup-header">
                        <span class="condition-badge ${cClass} popup-condition">${cLabel}</span>
                        <h2 class="popup-title">${p.title}</h2>
                    </div>
                    ${tagsH}
                    <div class="popup-price-block">
                        <span class="popup-price">${fp} ${p.currency}</span>
                        ${fo && disc ? `<span class="popup-original-price">${fo} ${p.currency}</span>` : ''}
                    </div>
                    <div class="popup-desc-block">
                        <h4 class="popup-desc-title">تفاصيل المنتج</h4>
                        <p class="popup-desc-text">${formatDescription(p.description)}</p>
                    </div>
                    <div class="popup-actions">${buyBtn}${srcBtn}</div>
                </div>
            </div>`;

        popup.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // =============================================
    // 12. Featured Rotation — fade to next 4 every 5s
    // =============================================
    let rotationTimer = null;
    let rotationIdx = 0;

    function startFeaturedRotation(allFeatured) {
        if (rotationTimer) clearInterval(rotationTimer);
        rotationIdx = 0;
        rotationTimer = setInterval(() => {
            const fg = document.getElementById('featured-grid');
            if (!fg) return;
            
            // Fade out
            fg.style.transition = 'opacity 1.2s ease';
            fg.style.opacity = '0';
            
            setTimeout(() => {
                rotationIdx = (rotationIdx + 4) % allFeatured.length;
                const batch = [];
                for (let i = 0; i < 4; i++) {
                    const product = allFeatured[(rotationIdx + i) % allFeatured.length];
                    if (product) batch.push(product);
                }
                
                fg.innerHTML = batch.map(createProductCard).join('');
                
                // Trigger reveal for new cards
                if (typeof observeReveals === 'function') observeReveals();
                
                // Fade in
                fg.style.opacity = '1';
            }, 1200);
        }, 6000);
    }
    // =============================================
    // 13. Initial Render
    // =============================================
    renderProducts();
    if (typeof filterProducts === 'function') filterProducts('all');
    observeReveals();
});
