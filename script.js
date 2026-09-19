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

    // Helper: Check if a product is sold out
    function isProductSoldOut(p) {
        const qty = p.quantity !== undefined ? Number(p.quantity) : 1;
        return p.isSoldOut === true || qty <= 0;
    }

    // 5. Create a product card HTML string
    function createProductCard(product) {
        const fp = Number(product.price).toLocaleString('en-US');
        const qty = product.quantity !== undefined ? Number(product.quantity) : 1;
        const isSoldOut = isProductSoldOut(product);

        let priceHtml = '', badgeHtml = '';
        if (product.originalPrice && Number(product.originalPrice) > Number(product.price)) {
            const fo = Number(product.originalPrice).toLocaleString('en-US');
            const disc = Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100);
            priceHtml = `<div class="price-container"><span class="product-price">${fp} ${product.currency}</span><span class="original-price">${fo} ${product.currency}</span></div>`;
            badgeHtml = `<div class="sale-badge">خصم ${disc}%</div>`;
        } else {
            priceHtml = `<span class="product-price">${fp} ${product.currency}</span>`;
        }

        let stockStatusHtml = '';
        if (isSoldOut) {
            badgeHtml = `<div class="sold-out-badge">نفدت الكمية</div>` + badgeHtml;
            stockStatusHtml = `<span class="stock-status stock-out">🔴 نفدت الكمية</span>`;
        } else if (qty === 1) {
            stockStatusHtml = `<span class="stock-status stock-urgent">🔥 متبقي قطعة واحدة فقط!</span>`;
        } else if (qty <= 3) {
            stockStatusHtml = `<span class="stock-status stock-low">⚡ متبقي ${qty} قطع فقط</span>`;
        } else {
            stockStatusHtml = `<span class="stock-status stock-available">🟢 متوفر بالمخزون</span>`;
        }

        const src = product.url ? `<a href="${product.url}" target="_blank" rel="noopener noreferrer" class="source-badge" onclick="event.stopPropagation()">موقع</a>` : '';
        const cLabel = product.condition === 'used' ? 'مستخدم' : 'جديد';
        const cClass = product.condition === 'used' ? 'condition-used' : 'condition-new';
        const tags = (product.tags && product.tags.length > 0) ? `<div class="product-card-tags">${product.tags.map(t => `<span class="product-tag">${t}</span>`).join('')}</div>` : '';
        const readMore = (product.description && product.description.length > 60) ? `<button class="read-more-btn" onclick="event.stopPropagation(); var p=this.previousElementSibling; if(p) p.classList.toggle('expanded'); this.textContent=(p && p.classList.contains('expanded'))?'أقل':'المزيد';">المزيد</button>` : '';

        return `<div class="product-card ${isSoldOut ? 'is-sold-out' : ''} reveal" data-category="${product.category}" onclick="if(window._openPopup) window._openPopup(${product.id})" style="cursor:pointer;">
            <div class="product-image ${product.noCrop ? 'no-crop' : ''}">
                ${badgeHtml}${src}
                <span class="condition-badge ${cClass}">${cLabel}</span>
                <img src="${product.image}" alt="${product.title} - متجر فوكس العراق" loading="lazy" decoding="async" width="300" height="300">
                <div class="product-card-overlay"><span class="view-details-hint">📸 عرض التفاصيل</span></div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                ${tags}
                <div class="product-desc-wrapper" style="flex-grow:1;">
                    <p class="product-desc">${formatDescription(product.description)}</p>
                    ${readMore}
                </div>
                <div class="product-meta">
                    ${priceHtml}
                    ${stockStatusHtml}
                </div>
            </div>
        </div>`;
    }

    // 6. Render products into both grids
    function renderProducts() {
        if (typeof products === 'undefined') return;
        const sortMode = document.getElementById('sort-select')?.value || 'default';
        let sorted = [...products];

        if (sortMode === 'price-asc') {
            sorted.sort((a, b) => (isProductSoldOut(a) - isProductSoldOut(b)) || (Number(a.price) - Number(b.price)));
        } else if (sortMode === 'price-desc') {
            sorted.sort((a, b) => (isProductSoldOut(a) - isProductSoldOut(b)) || (Number(b.price) - Number(a.price)));
        } else if (sortMode === 'date-desc') {
            sorted.sort((a, b) => (isProductSoldOut(a) - isProductSoldOut(b)) || (b.id - a.id));
        } else if (sortMode === 'date-asc') {
            sorted.sort((a, b) => (isProductSoldOut(a) - isProductSoldOut(b)) || (a.id - b.id));
        } else {
            // Default sorting: Push all sold-out products all the way down to the bottom
            sorted.sort((a, b) => (isProductSoldOut(a) - isProductSoldOut(b)) || ((a.sortOrder || 1) - (b.sortOrder || 1)) || (b.id - a.id));
        }

        // Featured products (prioritize available products so sold-out items are not shown first)
        const allFeatured = [...products]
            .filter(p => p.featured)
            .sort((a, b) => (isProductSoldOut(a) - isProductSoldOut(b)) || ((a.sortOrder || 1) - (b.sortOrder || 1)) || (b.id - a.id));

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

    // 8. Back to Top, Navbar & Scroll Progress Bar
    const backToTopBtn = document.getElementById('back-to-top');
    const navbar = document.querySelector('.navbar');
    const scrollProgressBar = document.getElementById('scroll-progress');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (backToTopBtn) backToTopBtn.classList.toggle('visible', scrollY > 300);
        if (navbar) {
            navbar.classList.toggle('scrolled', scrollY > 15);
        }
        if (scrollProgressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
            scrollProgressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 9. Mobile Menu
    const menuToggle = document.getElementById('menu-toggle');
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => { 
            if (window.innerWidth <= 768 && menuToggle) menuToggle.checked = false; 
        });
    });

    document.addEventListener('click', (e) => {
        if (menuToggle && menuToggle.checked && !e.target.closest('.nav-container')) {
            menuToggle.checked = false;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuToggle && menuToggle.checked) {
            menuToggle.checked = false;
        }
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
        
        const qty = p.quantity !== undefined ? Number(p.quantity) : 1;
        const isSoldOut = p.isSoldOut === true || qty <= 0;
        const isDemo = p.isDemo === true;

        let popupStockHtml = '';
        if (isSoldOut) {
            popupStockHtml = `<span class="popup-stock-badge stock-out">🔴 نفدت الكمية من المخزون</span>`;
        } else if (qty === 1) {
            popupStockHtml = `<span class="popup-stock-badge stock-urgent">🔥 متبقي قطعة واحدة فقط!</span>`;
        } else if (qty <= 3) {
            popupStockHtml = `<span class="popup-stock-badge stock-low">⚡ متبقي ${qty} قطع فقط</span>`;
        } else {
            popupStockHtml = `<span class="popup-stock-badge stock-available">🟢 متوفر بالمخزون (${qty} قطعة)</span>`;
        }

        const waBuy = `https://wa.me/9647746264867?text=${encodeURIComponent('مرحبا، أود شراء هذا المنتج:\n\nاسم المنتج: ' + p.title + '\nالسعر: ' + fp + ' ' + p.currency + '\nرمز المنتج: ' + p.id)}`;
        const waRestock = `https://wa.me/9647746264867?text=${encodeURIComponent('مرحبا، أود الاستفسار عن إمكانية توفير المنتج عند توفره مجدداً:\n\nاسم المنتج: ' + p.title + '\nالسعر: ' + fp + ' ' + p.currency + '\nرمز المنتج: ' + p.id)}`;

        let buyBtn = '';
        if (isDemo) {
            buyBtn = `<button class="btn btn-disabled popup-buy-btn" onclick="alert('هذا منتج تجريبي للعرض فقط')">منتج تجريبي</button>`;
        } else if (isSoldOut) {
            buyBtn = `<a href="${waRestock}" target="_blank" rel="noopener noreferrer" class="popup-soldout-btn">🔔 طلب توفير عند التوفر عبر واتساب</a>`;
        } else {
            buyBtn = `<a href="${waBuy}" target="_blank" rel="noopener noreferrer" class="btn btn-primary popup-buy-btn">شراء الآن عبر واتساب</a>`;
        }

        const cLabel = p.condition === 'used' ? 'مستخدم' : 'جديد';
        const cClass = p.condition === 'used' ? 'condition-used' : 'condition-new';
        const srcBtn = p.url ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer" class="btn popup-source-btn">زيارة الموقع الرسمي ↗</a>` : '';
        const tagsH = (p.tags && p.tags.length > 0) ? `<div class="popup-tags">${p.tags.map(t => `<span class="popup-tag">${t}</span>`).join('')}</div>` : '';
        const thumbs = imgs.length > 1
            ? `<div class="popup-thumbs">${imgs.map((im, i) => `<img src="${im}" class="popup-thumb${i===0?' active':''}" onclick="document.getElementById('popup-main-img').src='${im}'; document.querySelectorAll('.popup-thumb').forEach(t=>t.classList.remove('active')); this.classList.add('active');" alt="${p.title} - صورة ${i+1}" width="70" height="70" loading="lazy" decoding="async">`).join('')}</div>`
            : '';
        const discBadge = (!isSoldOut && disc) ? `<span class="popup-discount-badge">خصم ${disc}%</span>` : '';

        popup.innerHTML = `
            <div class="popup-inner">
                <button class="popup-close-btn" onclick="document.getElementById('product-popup').classList.remove('active');document.getElementById('product-popup-overlay').classList.remove('active');document.body.style.overflow='';" aria-label="إغلاق">✕</button>
                <div class="popup-gallery">
                    <div class="popup-main-img-wrap ${p.noCrop ? 'no-crop' : ''}">
                        <img id="popup-main-img" src="${imgs[0]}" alt="${p.title} - متجر فوكس" width="400" height="400" decoding="async">
                        ${discBadge}
                    </div>
                    ${thumbs}
                </div>
                <div class="popup-details">
                    <div class="popup-header">
                        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                            <span class="condition-badge ${cClass} popup-condition">${cLabel}</span>
                            ${popupStockHtml}
                        </div>
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
                    <div class="popup-guarantee-badge">
                        <span style="font-size: 1.35rem;">🛡️</span>
                        <div>
                            <strong>ضمان فوكس 100%:</strong> القطعة تعمل 100%، ولك كامل الحق بفحص المنتج ورفضه عند الاستلام. الأصلي لدينا 100% أصلي مع فحص دقيق للجودة قبل التسليم.
                        </div>
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
    // 13. Full Site Search (Omnibar Modal)
    // =============================================
    const searchModalOverlay = document.getElementById('search-modal-overlay');
    const searchModal = document.getElementById('search-modal');
    const searchModalInput = document.getElementById('search-modal-input');
    const searchModalResults = document.getElementById('search-modal-results');
    const searchTriggerBtn = document.getElementById('search-trigger-btn');
    const searchModalClose = document.getElementById('search-modal-close');

    const staticFaqs = [
        { q: 'هل التوصيل متوفر لجميع محافظات العراق؟', a: 'نعم، نوفر توصيل سريع وموثوق لجميع محافظات العراق (بغداد، البصرة، أربيل، الموصل، السليمانية، كركوك، النجف، كربلاء، وباقي المحافظات) حتى باب منزلك.', id: 'faq-1' },
        { q: 'هل المنتجات المعروضة أصلية 100%؟', a: 'بكل تأكيد، جميع منتجاتنا مستوردة مباشرة من مصادر عالمية معتمدة ومخازن أمازون الأصلية مع فحص دقيق للجودة قبل الشحن.', id: 'faq-2' },
        { q: 'ما هي طرق الدفع المتاحة؟', a: 'الدفع عند الاستلام متاح لجميع الطلبات في كافة المحافظات لضمان راحة بالك، كما ندعم التحويل عبر زين كاش والماستركارد.', id: 'faq-3' },
        { q: 'ما هو الضمان وسياسة الإرجاع؟', a: 'نقدم ضمان استبدال أو استرجاع لمدة 7 أيام في حال وجود أي عيب مصنعي أو اختلاف عن المواصفات المعروضة.', id: 'faq-4' },
        { q: 'كيف يمكنني إتمام الطلب؟', a: 'يمكنك الضغط على زر "شراء الآن عبر واتساب" في تفاصيل أي منتج، وسيقوم فريقنا بتأكيد طلبك وتفاصيل التوصيل فوراً.', id: 'faq-5' },
        { q: 'هل تتوفر منتجات جديدة ومستعملة؟', a: 'نعم، نوضح حالة كل قطعة بدقة عبر شارات (جديد / مستخدم) مع ذكر نسبة النظافة وفترة الاستخدام بكل شفافية.', id: 'faq-6' }
    ];

    function openSearchModal() {
        if (!searchModal || !searchModalOverlay) return;
        searchModalOverlay.classList.add('active');
        searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (searchModalInput) {
            searchModalInput.value = '';
            renderSearchResults('');
            setTimeout(() => searchModalInput.focus(), 60);
        }
    }

    function closeSearchModal() {
        if (!searchModal || !searchModalOverlay) return;
        searchModalOverlay.classList.remove('active');
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (searchTriggerBtn) searchTriggerBtn.addEventListener('click', openSearchModal);
    if (searchModalClose) searchModalClose.addEventListener('click', closeSearchModal);
    if (searchModalOverlay) {
        searchModalOverlay.addEventListener('click', (e) => {
            if (e.target === searchModalOverlay) closeSearchModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (searchModal && searchModal.classList.contains('active')) {
                closeSearchModal();
            } else {
                openSearchModal();
            }
        } else if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
            closeSearchModal();
        }
    });

    function renderSearchResults(term) {
        if (!searchModalResults) return;
        const q = term.trim().toLowerCase();

        // 1. Products
        const matchedProducts = typeof products !== 'undefined' ? products.filter(p => {
            if (!q) return true;
            return (p.title && p.title.toLowerCase().includes(q)) ||
                   (p.description && p.description.toLowerCase().includes(q)) ||
                   (p.category && p.category.toLowerCase().includes(q));
        }).slice(0, 5) : [];

        // 2. Blogs
        const matchedBlogs = typeof blogs !== 'undefined' ? blogs.filter(b => {
            if (!q) return true;
            return (b.title && b.title.toLowerCase().includes(q)) ||
                   (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
                   (b.category && b.category.toLowerCase().includes(q));
        }).slice(0, 4) : [];

        // 3. FAQs
        const matchedFaqs = staticFaqs.filter(f => {
            if (!q) return true;
            return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
        }).slice(0, 3);

        if (matchedProducts.length === 0 && matchedBlogs.length === 0 && matchedFaqs.length === 0) {
            searchModalResults.innerHTML = `
                <div class="search-empty-state">
                    <p>لم نجد نتائج مطابقة لـ "${term}".</p>
                    <p style="font-size:0.85rem;margin-top:6px;">جرب البحث بكلمات أخرى مثل "كاميرا"، "أمازون"، أو "شحن".</p>
                </div>
            `;
            return;
        }

        let html = '';

        if (matchedProducts.length > 0) {
            html += `<div class="search-result-group">
                <div class="search-result-group-title">🛍️ المنتجات (${matchedProducts.length})</div>`;
            matchedProducts.forEach(p => {
                const fp = Number(p.price).toLocaleString('en-US');
                html += `
                    <div class="search-result-item" onclick="closeSearchModal(); if(window._openPopup) window._openPopup(${p.id});">
                        <img src="${p.image}" class="search-result-thumb" alt="${p.title}">
                        <div class="search-result-details">
                            <div class="search-result-title">${p.title}</div>
                            <div class="search-result-meta">${p.condition === 'used' ? 'مستخدم' : 'جديد'}</div>
                        </div>
                        <div class="search-result-price">${fp} ${p.currency}</div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        if (matchedBlogs.length > 0) {
            html += `<div class="search-result-group">
                <div class="search-result-group-title">📝 مقالات المدونة (${matchedBlogs.length})</div>`;
            matchedBlogs.forEach(b => {
                html += `
                    <a href="blog.html?slug=${b.slug}" class="search-result-item" onclick="closeSearchModal()">
                        <div class="search-result-details">
                            <div class="search-result-title">${b.title}</div>
                            <div class="search-result-meta">قسم ${b.category} • ${b.date}</div>
                        </div>
                        <span style="color:var(--primary-color);font-weight:bold;">اقرأ &larr;</span>
                    </a>
                `;
            });
            html += `</div>`;
        }

        if (matchedFaqs.length > 0) {
            html += `<div class="search-result-group">
                <div class="search-result-group-title">❓ الأسئلة الشائعة (${matchedFaqs.length})</div>`;
            matchedFaqs.forEach(f => {
                html += `
                    <div class="search-result-item" onclick="closeSearchModal(); scrollToFaq('${f.id}');">
                        <div class="search-result-details">
                            <div class="search-result-title">${f.q}</div>
                            <div class="search-result-meta">${f.a.substring(0, 70)}...</div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        searchModalResults.innerHTML = html;
    }

    if (searchModalInput) {
        searchModalInput.addEventListener('input', () => {
            renderSearchResults(searchModalInput.value);
        });
    }

    window.closeSearchModal = closeSearchModal;

    // =============================================
    // 14. Expandable FAQ Accordion
    // =============================================
    function initFaqAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const questionBtn = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (questionBtn && answer) {
                questionBtn.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    // Close other items for smooth accordion
                    faqItems.forEach(other => {
                        if (other !== item) {
                            other.classList.remove('active');
                            const otherAns = other.querySelector('.faq-answer');
                            if (otherAns) otherAns.style.maxHeight = null;
                            const otherBtn = other.querySelector('.faq-question');
                            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                        }
                    });

                    if (isActive) {
                        item.classList.remove('active');
                        answer.style.maxHeight = null;
                        questionBtn.setAttribute('aria-expanded', 'false');
                    } else {
                        item.classList.add('active');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        questionBtn.setAttribute('aria-expanded', 'true');
                    }
                });
            }
        });
    }
    initFaqAccordion();

    window.scrollToFaq = function(faqId) {
        const target = document.getElementById(faqId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const btn = target.querySelector('.faq-question');
            if (btn && !target.classList.contains('active')) {
                btn.click();
            }
        }
    };

    // =============================================
    // 15. Cross-Platform Push Notifications Manager
    // (Supports Android, iOS 16.4+, and All Desktop Browsers)
    // =============================================
    const btnEnablePush = document.getElementById('btn-enable-push');
    const btnTestPush = document.getElementById('btn-test-push');
    const pushStatusBadge = document.getElementById('push-status-badge');
    const pushTitle = document.getElementById('push-title');
    const pushDesc = document.getElementById('push-desc');
    const navNotifyBtn = document.getElementById('nav-notify-btn');
    const navNotifyDot = document.getElementById('nav-notify-dot');

    // Device & Platform Detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         Boolean(window.navigator.standalone);

    // Register Service Worker for Android and iOS PWA Web Push
    let swRegistration = null;
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js', { scope: './' })
            .then(reg => {
                swRegistration = reg;
            })
            .catch(err => {
                console.warn('ServiceWorker registration error:', err);
            });
    }

    function updatePushUI() {
        if (!('Notification' in window)) {
            if (isIOS) {
                if (pushStatusBadge) {
                    pushStatusBadge.className = 'push-status-badge active unsupported';
                    pushStatusBadge.innerHTML = '📱 على آيفون: أضف الموقع للشاشة الرئيسية (Share > Add to Home Screen) لتفعيل الإشعارات.';
                }
                if (btnEnablePush) {
                    btnEnablePush.style.display = 'inline-flex';
                    btnEnablePush.textContent = '📱 طريقة التفعيل على آيفون (iOS)';
                }
                return;
            }
            if (pushStatusBadge) {
                pushStatusBadge.className = 'push-status-badge active unsupported';
                pushStatusBadge.innerHTML = '⚠️ متصفحك الحالي لا يدعم ميزة الإشعارات الفورية المباشرة.';
            }
            if (btnEnablePush) btnEnablePush.style.display = 'none';
            if (btnTestPush) btnTestPush.style.display = 'none';
            if (navNotifyBtn) navNotifyBtn.style.display = 'none';
            return;
        }

        const perm = Notification.permission;
        if (perm === 'granted') {
            if (btnEnablePush) btnEnablePush.style.display = 'none';
            if (btnTestPush) btnTestPush.style.display = 'inline-flex';
            if (pushTitle) pushTitle.textContent = 'أنت مشترك في الإشعارات الفورية! 🎉';
            if (pushDesc) pushDesc.textContent = 'ستصلك عروض متجر فوكس والتخفيضات الكبرى لحظة بلحظة كإشعار فوري على هاتفك أو حاسوبك.';
            if (pushStatusBadge) {
                pushStatusBadge.className = 'push-status-badge active granted';
                pushStatusBadge.innerHTML = '✓ الإشعارات مفعلة بنجاح على هذا الجهاز.';
            }
            if (navNotifyDot) navNotifyDot.style.display = 'none';
            if (navNotifyBtn) navNotifyBtn.title = 'الإشعارات مفعلة بنجاح ✓';
        } else if (perm === 'denied') {
            if (btnEnablePush) {
                btnEnablePush.style.display = 'inline-flex';
                btnEnablePush.disabled = true;
                btnEnablePush.textContent = 'تم حظر الإشعارات من إعدادات المتصفح';
            }
            if (btnTestPush) btnTestPush.style.display = 'none';
            if (pushStatusBadge) {
                pushStatusBadge.className = 'push-status-badge active denied';
                pushStatusBadge.innerHTML = '✕ تم رفض إذن الإشعارات سابقاً. لتفعيلها، يرجى السماح بها من إعدادات الموقع أو أيقونة القفل بجانب شريط الرابط.';
            }
            if (navNotifyDot) navNotifyDot.style.display = 'none';
        } else {
            // default / prompt
            if (btnEnablePush) {
                btnEnablePush.style.display = 'inline-flex';
                btnEnablePush.disabled = false;
                btnEnablePush.textContent = 'تفعيل الإشعارات الآن 🔔';
            }
            if (btnTestPush) btnTestPush.style.display = 'none';
            if (pushStatusBadge) pushStatusBadge.className = 'push-status-badge';
            if (navNotifyDot) navNotifyDot.style.display = 'block';
        }
    }

    // In-App Floating Notification Banner (Guaranteed visual on all browsers/iOS/webviews)
    function showInAppNotification(title, options = {}) {
        const existing = document.querySelector('.in-app-notify-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'in-app-notify-toast';
        const targetUrl = options.url || (options.data && options.data.url) || 'index.html#featured';

        toast.innerHTML = `
            <div class="in-app-notify-icon">
                <img src="logo.svg" alt="Focus">
            </div>
            <div class="in-app-notify-content">
                <div class="in-app-notify-header">
                    <h4 class="in-app-notify-title">${title || 'متجر فوكس 🛒'}</h4>
                    <span class="in-app-notify-time">الآن</span>
                </div>
                <p class="in-app-notify-body">${options.body || 'تخفيضات وعروض حصرية جديدة في المتجر!'}</p>
            </div>
            <button type="button" class="in-app-notify-close" title="إغلاق">&times;</button>
        `;

        document.body.appendChild(toast);

        // Click handler: navigate to url
        toast.addEventListener('click', (e) => {
            if (e.target.classList.contains('in-app-notify-close')) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';
                setTimeout(() => toast.remove(), 300);
                return;
            }
            if (targetUrl) {
                window.location.href = targetUrl;
            }
            toast.remove();
        });

        // Auto dismiss after 6.5 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 6500);
    }

    // Universal Push Notification Trigger (ServiceWorker + Desktop Fallback + In-App Toast)
    async function showPushNotification(title, options = {}) {
        const defaultOptions = {
            body: 'تخفيضات كبرى وعروض حصرية جديدة متوفرة الآن في متجر فوكس!',
            icon: 'logo.svg',
            badge: 'logo.svg',
            dir: 'rtl',
            lang: 'ar',
            vibrate: [200, 100, 200],
            data: {
                url: options.url || 'index.html#featured'
            }
        };
        const finalOptions = { ...defaultOptions, ...options };

        // 1. Always display In-App Toast Banner if the web page is currently open
        showInAppNotification(title || 'متجر فوكس 🛒', finalOptions);

        // 2. Trigger System / Native Notification if permission granted
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        // Method A: ServiceWorker (Required for Android & iOS PWA Web Push)
        if ('serviceWorker' in navigator) {
            try {
                const reg = swRegistration || await navigator.serviceWorker.ready;
                if (reg && typeof reg.showNotification === 'function') {
                    await reg.showNotification(title || 'متجر فوكس 🛒', finalOptions);
                    return;
                }
            } catch (swErr) {
                console.warn('ServiceWorker showNotification failed, trying fallback:', swErr);
            }
        }

        // Method B: Desktop new Notification Fallback
        try {
            const notify = new Notification(title || 'متجر فوكس 🛒', finalOptions);
            notify.onclick = function() {
                window.focus();
                if (finalOptions.data && finalOptions.data.url) {
                    window.location.href = finalOptions.data.url;
                } else if (finalOptions.url) {
                    window.location.href = finalOptions.url;
                }
                notify.close();
            };
        } catch (notifErr) {
            console.warn('Desktop new Notification failed:', notifErr);
        }
    }

    window.triggerPushNotification = showPushNotification;

    // Helper for iOS Safari guide
    function showIOSPushGuide() {
        let guide = document.getElementById('ios-push-guide-modal');
        if (!guide) {
            guide = document.createElement('div');
            guide.id = 'ios-push-guide-modal';
            guide.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;font-family:"IBM Plex Sans Arabic",sans-serif;';
            guide.innerHTML = `
                <div style="background:var(--card-bg,#fff);color:var(--text-main,#1f2937);border-radius:24px;max-width:440px;width:100%;padding:30px;box-shadow:0 25px 50px rgba(0,0,0,0.4);text-align:center;border:1px solid var(--border-color,#ddd);">
                    <div style="font-size:3rem;margin-bottom:12px;">📲</div>
                    <h3 style="margin-bottom:10px;font-size:1.3rem;">تفعيل الإشعارات على iPhone / iPad</h3>
                    <p style="color:var(--text-muted,#64748b);font-size:0.92rem;line-height:1.6;margin-bottom:20px;">
                        نظام Apple iOS يتطلب خطوة واحدة لتشغيل الإشعارات مثل التطبيقات تماماً:
                    </p>
                    <div style="background:var(--bg-alt,rgba(0,0,0,0.04));padding:16px;border-radius:14px;text-align:right;font-size:0.9rem;line-height:1.8;margin-bottom:20px;">
                        1. اضغط على زر <strong>المشاركة (Share ⬆️)</strong> أسفل شاشة Safari.<br>
                        2. اختر <strong>إضافة إلى الصفحة الرئيسية (Add to Home Screen ➕)</strong>.<br>
                        3. افتح متجر فوكس من الشاشة الرئيسية، واضغط 'تفعيل الإشعارات' لتصلك التخفيضات فوراً!
                    </div>
                    <button type="button" id="ios-guide-gotit-btn" style="width:100%;padding:13px;background:var(--primary-color,#2563eb);color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;font-family:inherit;font-size:1rem;">فهمت الخطوات ✓</button>
                </div>
            `;
            document.body.appendChild(guide);
            document.getElementById('ios-guide-gotit-btn').onclick = () => guide.remove();
            guide.onclick = (e) => { if (e.target === guide) guide.remove(); };
        }
    }

    // Universal Cross-Browser Permission Requester
    async function requestPushPermission() {
        if (isIOS && !('Notification' in window)) {
            showIOSPushGuide();
            return 'ios_guide';
        }

        if (!('Notification' in window)) {
            alert('للأسف، متصفحك الحالي لا يدعم ميزة الإشعارات الفورية (Web Notifications).');
            return 'unsupported';
        }

        try {
            // Must handle Promise + Callback API across all modern and older browsers
            let permission = await new Promise((resolve) => {
                let resolved = false;
                try {
                    const p = Notification.requestPermission((status) => {
                        if (!resolved) {
                            resolved = true;
                            resolve(status || Notification.permission);
                        }
                    });
                    if (p && typeof p.then === 'function') {
                        p.then((status) => {
                            if (!resolved) {
                                resolved = true;
                                resolve(status || Notification.permission);
                            }
                        }).catch(() => {
                            if (!resolved) {
                                resolved = true;
                                resolve(Notification.permission);
                            }
                        });
                    }
                } catch (e) {
                    Notification.requestPermission().then(resolve).catch(() => resolve(Notification.permission));
                }
            });

            updatePushUI();

            if (permission === 'granted') {
                showPushNotification('مرحبا بك في إشعارات متجر فوكس! 🔔', {
                    body: 'تم تفعيل الإشعارات بنجاح على هذا الجهاز. ستصلك أحدث الصفقات والمنتجات الحصرية فوراً!',
                    tag: 'welcome-notification'
                });
            } else if (permission === 'denied') {
                alert('تم حظر الإشعارات. يمكنك تفعيلها في أي وقت من إعدادات المتصفح (أيقونة القفل في شريط الرابط).');
            }

            return permission;
        } catch (err) {
            console.error('Error requesting notification permission:', err);
            return 'error';
        }
    }

    if (btnEnablePush) {
        btnEnablePush.addEventListener('click', requestPushPermission);
    }
    if (navNotifyBtn) {
        navNotifyBtn.addEventListener('click', () => {
            if (!('Notification' in window)) {
                if (isIOS) showIOSPushGuide();
                else alert('متصفحك لا يدعم الإشعارات.');
                return;
            }
            if (Notification.permission === 'granted') {
                showPushNotification('متجر فوكس 🔔', {
                    body: 'الإشعارات مفعلة لديك وتعمل بشكل ممتاز!',
                    tag: 'status-check'
                });
            } else {
                requestPushPermission();
            }
        });
    }
    if (btnTestPush) {
        btnTestPush.addEventListener('click', () => {
            showPushNotification('تخفيضات خاصة وحصرية! 🔥', {
                body: 'وصلت وجبة جديدة من كاميرات ومعدات التصوير الأصلية 100%، احصل على قطعتك الآن!',
                url: '#featured'
            });
        });
    }

    updatePushUI();

    // Listen to admin broadcast channel for instant push triggers across tabs
    try {
        const notifyChannel = new BroadcastChannel('focus_push_notifications');
        notifyChannel.onmessage = (event) => {
            const data = event.data;
            if (data && data.title) {
                showPushNotification(data.title, {
                    body: data.body,
                    url: data.url || '#products',
                    tag: 'admin-broadcast-' + Date.now()
                });
            }
        };
    } catch(e) {}

    // =============================================
    // 15c. Live Push Notification Feed (Pure JS - Across All Devices)
    // =============================================
    function checkLiveNotificationFeed() {
        if (typeof currentNotification === 'undefined' || !currentNotification || !currentNotification.active) {
            return;
        }

        const lastSeen = localStorage.getItem('focus_last_seen_push_id');
        const notifId = String(currentNotification.id || currentNotification.timestamp || '');

        if (notifId && lastSeen !== notifId) {
            // New active notification found!
            showPushNotification(currentNotification.title, {
                body: currentNotification.body,
                url: currentNotification.url || 'index.html#featured',
                icon: currentNotification.icon || 'logo.svg',
                badge: currentNotification.badge || 'logo.svg',
                tag: 'live-feed-' + notifId
            });

            // Mark as seen so visitor isn't spammed repeatedly with the same notification
            localStorage.setItem('focus_last_seen_push_id', notifId);
        }
    }

    // Check on load after 2 seconds
    setTimeout(checkLiveNotificationFeed, 2000);

    // Periodically check notifications.js every 60 seconds while browsing
    setInterval(() => {
        const script = document.createElement('script');
        script.src = `notifications.js?v=${Date.now()}`;
        script.onload = () => {
            checkLiveNotificationFeed();
            script.remove();
        };
        script.onerror = () => script.remove();
        document.head.appendChild(script);
    }, 60000);

    // =============================================
    // 15b. Push Notification 5-Minute Engagement Popup Trigger
    // =============================================
    const pushPopupOverlay = document.getElementById('push-popup-overlay');
    const pushPopupCloseBtn = document.getElementById('push-popup-close-btn');
    const pushPopupLaterBtn = document.getElementById('push-popup-later-btn');
    const pushPopupAllowBtn = document.getElementById('push-popup-allow-btn');

    function openPushPopup() {
        // Do not open if notifications already granted
        if ('Notification' in window && Notification.permission === 'granted') return;

        // Check if user dismissed recently (wait 24 hours before showing again)
        const lastDismissed = localStorage.getItem('focus_push_popup_dismissed');
        if (lastDismissed && (Date.now() - Number(lastDismissed)) < 24 * 60 * 60 * 1000) {
            return;
        }

        if (pushPopupOverlay) {
            pushPopupOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closePushPopup() {
        if (pushPopupOverlay) {
            pushPopupOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        localStorage.setItem('focus_push_popup_dismissed', Date.now());
    }

    if (pushPopupCloseBtn) pushPopupCloseBtn.addEventListener('click', closePushPopup);
    if (pushPopupLaterBtn) pushPopupLaterBtn.addEventListener('click', closePushPopup);
    if (pushPopupOverlay) {
        pushPopupOverlay.addEventListener('click', (e) => {
            if (e.target === pushPopupOverlay) closePushPopup();
        });
    }

    // Trigger permission request directly inside user click event stack
    if (pushPopupAllowBtn) {
        pushPopupAllowBtn.addEventListener('click', async () => {
            closePushPopup();
            await requestPushPermission();
        });
    }

    // Timer trigger: 5 minutes (5 * 60 * 1000 ms = 300,000 ms)
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    setTimeout(() => {
        openPushPopup();
    }, FIVE_MINUTES_MS);

    // Helper for testing popup in browser console: window.testPushPopup()
    window.testPushPopup = function() {
        openPushPopup();
    };

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pushPopupOverlay && pushPopupOverlay.classList.contains('active')) {
            closePushPopup();
        }
    });

    // =============================================
    // 16. Floating Contact Button (FAB)
    // =============================================
    const fabContainer = document.getElementById('floating-contact-container');
    const fabBtn = document.getElementById('floating-contact-btn');
    if (fabBtn && fabContainer) {
        fabBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fabContainer.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!fabContainer.contains(e.target)) {
                fabContainer.classList.remove('open');
            }
        });
    }

    // =============================================
    // 17. Simple Cookie Consent Banner
    // =============================================
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookieBtn = document.getElementById('accept-cookie-btn');
    const dismissCookieBtn = document.getElementById('dismiss-cookie-btn');
    if (cookieBanner) {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setTimeout(() => {
                cookieBanner.classList.add('visible');
            }, 1200);
        }
        function handleConsent() {
            localStorage.setItem('cookie_consent', 'accepted');
            cookieBanner.classList.remove('visible');
        }
        if (acceptCookieBtn) acceptCookieBtn.addEventListener('click', handleConsent);
        if (dismissCookieBtn) dismissCookieBtn.addEventListener('click', handleConsent);
    }

    // =============================================
    // 18. Confirmation Modal for Destructive Actions
    // =============================================
    window.showConfirmModal = function(options) {
        const {
            title = 'تأكيد الحذف',
            message = 'هل أنت متأكد من تنفيذ هذا الإجراء؟ لا يمكن التراجع عن هذه الخطوة.',
            confirmText = 'نعم، احذف',
            cancelText = 'إلغاء',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;

        let overlay = document.getElementById('confirm-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'confirm-modal-overlay';
            overlay.className = 'confirm-modal-overlay';
            overlay.innerHTML = `
                <div class="confirm-modal-box" role="dialog" aria-modal="true">
                    <div class="confirm-icon-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                    <h3 class="confirm-modal-title" id="confirm-modal-title">${title}</h3>
                    <p class="confirm-modal-desc" id="confirm-modal-desc">${message}</p>
                    <div class="confirm-modal-actions">
                        <button type="button" id="confirm-modal-yes" class="btn btn-danger" style="flex:1;">${confirmText}</button>
                        <button type="button" id="confirm-modal-no" class="btn btn-outline" style="flex:1;">${cancelText}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            document.getElementById('confirm-modal-title').textContent = title;
            document.getElementById('confirm-modal-desc').textContent = message;
            document.getElementById('confirm-modal-yes').textContent = confirmText;
            document.getElementById('confirm-modal-no').textContent = cancelText;
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const yesBtn = document.getElementById('confirm-modal-yes');
        const noBtn = document.getElementById('confirm-modal-no');

        const cleanUp = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKey);
        };

        const handleConfirm = () => {
            cleanUp();
            onConfirm();
        };

        const handleCancel = () => {
            cleanUp();
            onCancel();
        };

        const handleKey = (e) => {
            if (e.key === 'Escape') handleCancel();
        };

        yesBtn.onclick = handleConfirm;
        noBtn.onclick = handleCancel;
        overlay.onclick = (e) => {
            if (e.target === overlay) handleCancel();
        };
        document.addEventListener('keydown', handleKey);
    };

    // =============================================
    // 19. Password Visibility Toggle
    // =============================================
    function initPasswordToggles() {
        document.querySelectorAll('.password-field-wrapper').forEach(wrapper => {
            const input = wrapper.querySelector('input');
            const toggleBtn = wrapper.querySelector('.password-toggle-btn');
            if (input && toggleBtn && !toggleBtn.dataset.initialized) {
                toggleBtn.dataset.initialized = 'true';
                toggleBtn.addEventListener('click', () => {
                    const isPass = input.type === 'password';
                    input.type = isPass ? 'text' : 'password';
                    toggleBtn.innerHTML = isPass ? `
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                    ` : `
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    `;
                });
            }
        });
    }
    initPasswordToggles();
    window.initPasswordToggles = initPasswordToggles;

    // =============================================
    // 20. Outbound UTM Link Tracking
    // =============================================
    function applyUtmToOutboundLinks() {
        const currentHost = window.location.hostname;
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
            try {
                if (href.startsWith('http://') || href.startsWith('https://')) {
                    const url = new URL(href, window.location.href);
                    if (url.hostname !== currentHost && !url.searchParams.has('utm_source')) {
                        url.searchParams.set('utm_source', 'focus_shop');
                        url.searchParams.set('utm_medium', 'website');
                        url.searchParams.set('utm_campaign', 'store_referral');
                        link.setAttribute('href', url.toString());
                    }
                }
            } catch (err) {
                // Ignore parsing errors for custom schemes
            }
        });
    }
    applyUtmToOutboundLinks();
    window.applyUtmToOutboundLinks = applyUtmToOutboundLinks;

    // =============================================
    // 21. Code Snippet Copy-to-Clipboard
    // =============================================
    function initCodeSnippetCopy() {
        document.querySelectorAll('pre').forEach(pre => {
            if (pre.parentElement && pre.parentElement.classList.contains('code-snippet-wrap')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'code-snippet-wrap';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'code-copy-btn';
            copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>نسخ الكود</span>
            `;

            copyBtn.addEventListener('click', () => {
                const text = pre.innerText || pre.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    const originalHtml = copyBtn.innerHTML;
                    copyBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span style="color:#34d399;">تم النسخ! ✓</span>
                    `;
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHtml;
                    }, 2000);
                }).catch(() => {
                    alert('تم النسخ يدوياً!');
                });
            });

            wrapper.appendChild(copyBtn);
        });
    }
    initCodeSnippetCopy();
    window.initCodeSnippetCopy = initCodeSnippetCopy;

    // =============================================
    // 22. Initial Render
    // =============================================
    renderProducts();
    if (typeof filterProducts === 'function') filterProducts('all');
    observeReveals();
    applyUtmToOutboundLinks();
});
