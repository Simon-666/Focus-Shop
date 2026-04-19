const categories = [
    {
        "id": "all",
        "name": "الكل"
    },
    {
        "id": "photography",
        "name": "التصوير"
    },
    {
        "id": "home",
        "name": "المنزل"
    },
    {
        "id": "camping",
        "name": "التخييم والصيد"
    },
    {
        "id": "clothing",
        "name": "الأحذية والملابس"
    },
    {
        "id": "pc",
        "name": "الكمبيوتر والإنتاجية"
    }
];

const products = [
    {
        "id": 1,
        "isDemo": true,
        "title": "كاميرا رقمية احترافية",
        "price": "450000",
        "originalPrice": "500000",
        "currency": "د.ع",
        "category": "photography",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        "description": "كاميرا احترافية بدقة 4K مع عدسة 50mm، مثالية للمصورين المحترفين والمبتدئين.",
        "url": "https://amazon.com",
        "featured": true
    },
    {
        "id": 2,
        "isDemo": true,
        "title": "خيمة تخييم عائلية",
        "price": "120000",
        "originalPrice": "150000",
        "currency": "د.ع",
        "category": "camping",
        "image": "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=600&q=80",
        "description": "خيمة واسعة تتسع لـ 4 أشخاص، مقاومة للماء والرياح، سهلة التركيب.",
        "url": "https://amazon.com",
        "featured": true
    },
    {
        "id": 3,
        "isDemo": true,
        "title": "حذاء رياضي للجري",
        "price": "85000",
        "originalPrice": "100000",
        "currency": "د.ع",
        "category": "clothing",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
        "description": "حذاء مريح وخفيف الوزن، مصمم خصيصاً للجري والمسافات الطويلة.",
        "url": "https://amazon.com",
        "featured": true
    },
    {
        "id": 4,
        "isDemo": true,
        "title": "شاشة كمبيوتر 27 بوصة",
        "price": "210000",
        "originalPrice": "250000",
        "currency": "د.ع",
        "category": "pc",
        "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
        "description": "شاشة عالية الدقة 144Hz، ألوان زاهية، مثالية للألعاب والإنتاجية.",
        "url": "https://amazon.com",
        "featured": false
    },
    {
        "id": 5,
        "isDemo": true,
        "title": "لوحة مفاتيح ميكانيكية",
        "price": "65000",
        "originalPrice": "80000",
        "currency": "د.ع",
        "category": "pc",
        "image": "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80",
        "description": "لوحة مفاتيح بإضاءة RGB، مفاتيح زرقاء سريعة الاستجابة.",
        "url": "https://amazon.com",
        "featured": false
    },
    {
        "id": 7,
        "isDemo": true,
        "title": "حقيبة ظهر للسفر",
        "price": "45000",
        "originalPrice": "55000",
        "currency": "د.ع",
        "category": "clothing",
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        "description": "حقيبة متينة ومقاومة للماء، مع مساحة مخصصة للكمبيوتر المحمول.",
        "url": "https://amazon.com",
        "featured": false
    },
    {
        "id": 10,
        "isDemo": true,
        "title": "مصباح مكتبي ذكي",
        "price": "40000",
        "originalPrice": "50000",
        "currency": "د.ع",
        "category": "home",
        "image": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80",
        "description": "مصباح مكتب بإضاءة قابلة للتعديل والتحكم باللمس، مريح للعين.",
        "url": "https://amazon.com",
        "featured": false
    }
];