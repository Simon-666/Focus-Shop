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
        "title": "كاميرا رقمية احترافية",
        "price": "450000",
        "originalPrice": "500000",
        "currency": "د.ع",
        "category": "photography",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        "description": "كاميرا احترافية بدقة 4K مع عدسة 50mm، مثالية للمصورين المحترفين والمبتدئين.",
        "url": "https://amazon.com",
        "featured": false,
        "isDemo": true,
        "sortOrder": 1
    },
    {
        "id": 2,
        "title": "خيمة تخييم عائلية",
        "price": "120000",
        "originalPrice": "150000",
        "currency": "د.ع",
        "category": "camping",
        "image": "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=600&q=80",
        "description": "خيمة واسعة تتسع لـ 4 أشخاص، مقاومة للماء والرياح، سهلة التركيب.",
        "url": "https://amazon.com",
        "featured": false,
        "isDemo": true,
        "sortOrder": 1
    },
    {
        "id": 3,
        "title": "حذاء رياضي للجري",
        "price": "85000",
        "originalPrice": "100000",
        "currency": "د.ع",
        "category": "clothing",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
        "description": "حذاء مريح وخفيف الوزن، مصمم خصيصاً للجري والمسافات الطويلة.",
        "url": "https://amazon.com",
        "featured": false,
        "isDemo": true,
        "sortOrder": 1
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
        "featured": false,
        "sortOrder": 1
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
        "featured": false,
        "sortOrder": 1
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
        "featured": false,
        "sortOrder": 1
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
        "featured": false,
        "sortOrder": 1
    },
    {
        "id": 1776611502245,
        "title": "Mella ساعة ذكية لتعليم وقت النوم للاطفال",
        "price": "25000",
        "originalPrice": "77500",
        "currency": "د.ع",
        "category": "home",
        "image": "https://littlehippo.com/cdn/shop/files/Pink-bluegreen-light_edit_2048x.jpg?v=1729104363",
        "description": "\nميلا (Mella) من Little Hippo هي ساعة تدريب ذكية ومضيئة للأطفال، صُممت لتحسين عادات النوم.\nالمزايا:\nمؤشر ضوئي: ألوان تعليمية (أحمر للنوم، أصفر للاستعداد، أخضر للاستيقاظ).\nوقت القيلولة: إعدادات مخصصة للقيلولة.\nأصوات مهدئة: تحتوي على أصوات طبيعية وموسيقى هادئة.\nشاشة رقمية: واجهة بسيطة لتعلم الوقت.\nخاصية قفل الأمان: لمنع الأطفال من تغيير الإعدادات.\nتساعد طفلك على معرفة وقت النوم والنهوض بشكل ممتع وآمن.\n",
        "url": "https://littlehippo.com/products/mella",
        "featured": true,
        "isDemo": false,
        "noCrop": true,
        "sortOrder": 1
    },
    {
        "id": 1776611664989,
        "title": "Quntis Monitor Light Bar Focus Black, PRO+",
        "price": "50000",
        "originalPrice": "120000",
        "currency": "د.ع",
        "category": "pc",
        "image": "https://www.quntis.com/cdn/shop/files/31279278096450.jpg?v=1710310541&width=1000",
        "description": "مصباح Quntis Monitor Light Bar PRO+ (51 سم) هو حل إضاءة احترافي يتميز بـ:\nتصميم ذكي: يتناسب مع الشاشات المسطحة والمنحنية، مع ريموت كنترول لاسلكي للتحكم السهل.\nحماية العين: تقنية تمنع الوهج وانعكاس الضوء على الشاشة، مما يقلل إجهاد العين.\nتحكم ذكي: مستشعر مدمج للتعتيم التلقائي حسب إضاءة الغرفة، مع إمكانية تعديل السطوع ودرجة اللون يدوياً.\nمثالي للعمل والألعاب: يوفر إضاءة مكتبية مركزة توفر مساحة على الطاولة بفضل التصميم المعلق.",
        "url": "https://www.quntis.com/products/monitor-light-bar-pro-with-remote-control-eye-care-technology-computer-monitor-lamp-with-auto-dimming-no-screen-glare",
        "featured": true,
        "isDemo": false,
        "noCrop": true,
        "sortOrder": 1
    },
    {
        "id": 1776611968243,
        "title": "Meike lens adapter EF - EOS R 0.71 X",
        "price": "120000",
        "originalPrice": "353400",
        "currency": "د.ع",
        "category": "photography",
        "image": "https://meikeglobal.com/cdn/shop/files/B29A7949.png?v=1717129704&width=1985",
        "description": "محول عدسة افضل من الاصلي أهم مميزات محول Meike 0.71x Locking في نقاط مختصرة:\nزيادة الإضاءة: يمنحك وقفة ضوئية إضافية (مثلاً تتحول f/4 إلى f/2.8).\nتوسيع الزاوية: يقلل البعد البؤري بمقدار 0.71x لتعويض \"الكروب سنسور\".\nقفل سينمائي: نظام تثبيت دوار يمنع اهتزاز العدسة نهائياً (Zero Play).\nجودة بصرية: يحتوي على 5 عناصر زجاجية لتركيز الضوء على الحساس.\nمتانة المعدن: تصميم قوي من الفولاذ المقاوم للصدأ مع حماية من الطقس.\nدعم إلكتروني: نقل كامل لبيانات الـ EXIF ودعم الفوكس التلقائي (AF).",
        "url": "https://meikeglobal.com/products/speedbooster?variant=44212080804068",
        "featured": true,
        "isDemo": false,
        "noCrop": true,
        "sortOrder": 1
    }
];