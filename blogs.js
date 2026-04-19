const blogs = [
    {
        "id": 1,
        "slug": "camera-guide-beginners",
        "title": "الدليل الشامل لاختيار الكاميرا الاحترافية الأولى لك",
        "excerpt": "تعرف على أهم المعايير والمواصفات التي يجب أن تبحث عنها عند شراء كاميرا جديدة، وكيف تتجنب الأخطاء الشائعة.",
        "content": "<p>اختيار الكاميرا المناسبة يمكن أن يكون مهمة صعبة للمبتدئين. في هذا الدليل، سنشرح لك الفروق الأساسية بين كاميرات DSLR وكاميرات Mirrorless.</p><h3>1. الميزانية</h3><p>حدد ميزانيتك قبل البدء. تذكر أنك ستحتاج أيضاً لشراء عدسات إضافية وحقيبة.</p><h3>2. نوع التصوير</h3><p>هل تصور مناظر طبيعية؟ بورتريه؟ رياضات؟ كل نوع يتطلب مواصفات معينة.</p>",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        "category": "التصوير الفوتوغرافي",
        "author": "فريق فوكس",
        "date": "19 أبريل 2026",
        "seoTitle": "دليل اختيار الكاميرا للمبتدئين | متجر فوكس",
        "seoDesc": "دليل شامل للمبتدئين لاختيار الكاميرا الاحترافية الأولى مع نصائح لتجنب الأخطاء الشائعة."
    },
    {
        "id": 1776619374823,
        "title": "بضاعة أمازون الأصلية وصلت للعراق",
        "slug": "Amazon-finds",
        "category": "نصائح",
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAC3CAMAAAAGjUrGAAAAkFBMVEUAAADNESX///8Bez3JAAAAcirP39UAdC8Af0Ha6eCxzryoybUAcywAdjPI2s4AcCbi8OmAs5UAfDrG3tFYnHPu9PAAbyFlo36ixrCSvKMAaQ5uqYYAbR1TmnDT5twAahQ1jFm71sY7j18khk+Ht5ro8OsAZgA7jl1HlGaPt50phlFVnHN5ro7p9O8Ygkijwq2KhnNNAAAEMElEQVR4nO3abVuiQACFYddZRIVpfEMwXXypNmvV/f//bmdQSDigtTmZXOf+0JWIZk8DjGONH1TUuPYL+IbYBLEJYhPEJohNEJsgNkFsgtgEsQliE8QmiE0QmyA2QWyC2ASxCWITxCaITRCbIDZBbILYBLEJYhPEJohNEJsgNkFsgtgEsQliE8QmiE0QmyA2QWyC2ASxCWITxCaITRCbIDZBbILYBLEJYhPEJohNEJsgNkFsgtgEsQlq/KSiRpOK2ASxCWITxCaITRCbIDZBbILYBLEJYhN0K016d1/3s26lidf+up91xSbLTmFDGFTv3BvkbnYml389mes1Gc6mhS0DGVXvfhQh1k3uF0Mrr8q4WpOlEmqZ39QWvticeswoGUhTTzdxhFp0Lb20azXpKiHcXf7oaQshR1UPWPU7y9+mSTjvJk3EbFm17yddqYk3FsLpFzbqJn7ZzsPRpD9eh87cPODB9fdNZGjrxV2nSaSTqMfiVt1kULZ3M4g2ZkyYUdIbC/fQpJj0Yq7SJNIHzhivHJVNjvRUPZtMTJKSS8zZJo93dW3yopMor+SOc03C+1ZNm/TNKCm9jJ5uEixcp6ZNNtVX0dNNhkrUtEmokxTnaqkzTZyaNgl9PS+pmpWfaPL4VNsmI1ePklZ+W2udnlyqm4R6BlvTJr90Ej/ObRo+K+m391ehqibBs6vq2mStk8j8W5zJbCA09cvcqGjSGUhRvyb7+dlK6t++l7tDz9T1+UVvV+b4qRono/o1CV6Td2sv+oqzK6waLfUp97U3lUKaNYKqJtPaNEl//Ui6+yZ6OOx27bxkdaDr7tcISpvEd3Fdxkn8cPhmKw7v6k2TErqGV91k2FZ+cmzdfpNWqET6/VQemsz8MuM/J5ps9fnGVaIOTZb3UrjpZPVFymTh9emu3FPx2Dma5W7080TbVdYkbm7zTawsytoZJ8/6Cutshp2gGWz7Uqy9KIq8SuYcmzUJNvO35zHH1ku80F8nnn4e+ehNpEjX2TbNzmtxmfsi7DQZmvEuHaXGSpnTiHuSFFkTofd3sinM1k+eJjntmL32Xw/jxDy/tPKpj6Vz7KL0fFota2ICZitwHVW2b9okmewVPyO6BEtNuv7/NxHpJasZO+eaSFjUvQBLTYLyC+/7mmR//PPjROwsvHhb85MPHjy5JtnB844mNg4eW01CPVCc9xuv9WNcdXTD6NyX7Tv3ju6Zly3sfpKtJmt9Wmh9gPlzv91Kn6V83yd9bB7fuDR75xN58qPf78xSEz0Nc5K/YHcVn9v327HTZOrI8X7aPdsvF90UG01au5laHxaPJjt7/ydii4Um2+hvt3d+t+/rVv6f7SuxCWITxCaITRCbIDZBbILYBLEJYhPEJqhBRERERERERERERERERERERERERERERERERERERERERESf9g8b1fmLKDkNnQAAAABJRU5ErkJggg==",
        "author": "فريق فوكس",
        "date": "19-4-2026",
        "excerpt": "بضاعة امزون بدون تعب بالعراق و كردستان ",
        "content": "متجر فوكس: بضاعة أمازون الأصلية وصلت للعراق بخصومات خرافية (تخطت الـ 66%!)شلونكم عيوني؟ هواي منا يشوفون منتجات على \"أمازون\" ويتمنون يشتروها بس يخافون من حيرة الشحن، الأسعار المبالغ بيها، أو البضاعة تطلع مو أصلية. اليوم جبنا لكم الحل النهائي: متجر فوكس (Fox Store).متجر فوكس مو مجرد محل عادي، هو وجهتكم الأولى لـ أفضل بضاعة أمازون بالعراق. ليش؟ لأن الخصومات عدنا حقيقية وتوصل لـ 66% على ماركات عالمية، والتوصيل يوصلك وين ما كنت، من بغداد الحبيبة للبصرة الفيحاء وكل محافظاتنا العزيزة.شنو اللي يميز متجر فوكس؟بمتجرنا، ركزنا على الجودة والسعر اللي \"يكسر السوق\". عدنا أقسام متنوعة تلبي كل احتياجاتكم:قسم التصوير: لأصحاب المحتوى والمصورين المحترفين.قسم الكمبيوتر والإنتاجية: حتى تطور \"السيتاب\" مالتك وتزيد إنتاجيتك.قسم المنزل: أجهزة ذكية تخلي حياتك أسهل.التخييم، الملابس، والأحذية: كلشي تحتاجه بطلعاتك وكشختك.صيدات متجر فوكس (منتجات مختارة بأقوى التخفيضات)شفنا لكم كم قطعة بمتجرنا حالياً كاسرة الدنيا بالسعر والمواصفات:1. محول العدسات Meike EF - EOS R (Speedbooster)إذا أنت مصور، هذا الجهاز \"لُقطة\". محول Meike مو بس يربط عدسات EF على كاميرات الـ Mirrorless، بل هو أفضل من الأصلي بفضل تقنياته:إضاءة أقوى: يحول عدستك من f/4 إلى f/2.8 (يعطيك وقفة ضوئية إضافية).زاوية أوسع: يقلل الكروب سنسور بمقدار 0.71x.السعر: جان بـ ~~353,400 د.ع~~، هسة بـ 120,000 د.ع بس! (توفير أكثر من 66%).2. مصباح الشاشة الذكي Quntis Monitor Light Bar PRO+لكل واحد يقضي ساعات قدام الكمبيوتر، هذا المصباح ضروري لصحة عيونك:حماية العين: يمنع انعكاس الضوء على الشاشة ويقلل الإجهاد.تحكم لاسلكي: يجي وياه ريموت يجنن للتحكم بالسطوع واللون.السعر: جان بـ ~~120,000 د.ع~~، هسة بـ 50,000 د.ع بس!3. ساعة ميلا (Mella) لتعليم النوم للأطفالتريد طفلك يتعلم وكت النوم والجلوس بدون تعب؟ ساعة ميلا هي الحل الأمثل للأهالي بالعراق:ألوان تعليمية: أحمر للنوم، أخضر للاستيقاظ.أصوات مهدئة: تساعد الطفل ينام بعمق.السعر: جانت بـ ~~77,500 د.ع~~، هسة بـ 25,000 د.ع بس!جدول مقارنة الأسعار (شوف الفرق بنفسك!)المنتجالسعر الأصليسعر متجر فوكسنسبة الخصممحول عدسات Meike353,400 د.ع120,000 د.ع66%مصباح Quntis PRO+120,000 د.ع50,000 د.ع58%ساعة Mella للأطفال77,500 د.ع25,000 د.ع67%",
        "seoTitle": "متجر فوكس: بضاعة أمازون الأصلية وصلت للعراق بخصومات خرافية (تخطت الـ 66%!)",
        "seoDesc": "متجر فوكس العراق، بضاعة أمازون في بغداد، تخفيضات أجهزة تصوير، إكسسوارات كمبيوتر أصلية، أجهزة منزلية ذكية العراق، أرخص أسعار في أربيل والبصرة. بغداد، نينوى،الموصل البصرة، أربيل، النجف، كربلاء، ذي قار، بابل، السليمانية، الأنبار، كركوك، ديالى، صلاح الدين، دهوك، ميسان، واسط، القادسية، المثنى، حلبجة"
    }
];
