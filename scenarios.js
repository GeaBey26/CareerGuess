const scenarios = [
    {
        id: 1,
        title: "Ceza Sahası Karışıklığı",
        description: "Dakika 88. Deplasman takımı forveti ceza sahasına giriyor. Defans oyuncusu arkadan kayarak müdahale ediyor. Önce topa temas var gibi görünüyor ama forvet acı içinde yerde.",
        details: [
            "Hız: Yüksek",
            "Temas Noktası: Ayak bileği",
            "Topa Temas: Var (Cılız)"
        ],
        choices: [
            { text: "DEVAM", outcome: "WRONG", feedback: "Yanlış! Arkadan kontrolsüz geliş, rakip sağlığını tehlikeye atıyor. Topa temas kurtarmaz." },
            { text: "PENALTI + SARI KART", outcome: "CORRECT", feedback: "Doğru! Müdahale sert ve dikkatsiz, ancak gaddarca değil." },
            { text: "PENALTI + KIRMIZI KART", outcome: "WRONG", feedback: "Biraz ağır. Oyuncu topa oynamaya çalıştı, bariz gol şansı tartışılır." }
        ]
    },
    {
        id: 2,
        title: "Elle Oynama İddiası",
        description: "Korner kullanıldı. Top kalabalıkta bir oyuncunun eline çarptı. Oyuncu elini vücuduna yapıştırmış durumda ve arkası dönük.",
        details: [
            "Mesafe: Çok yakın",
            "El Konumu: Doğal",
            "Kasıt: Yok"
        ],
        choices: [
            { text: "PENALTI", outcome: "WRONG", feedback: "Yanlış. El vücuda yapışık ve doğal konumda." },
            { text: "DEVAM", outcome: "CORRECT", feedback: "Doğru! Çarpma olarak değerlendirilmeli, el doğal konumda." },
            { text: "VAR İNCELEMESİ", outcome: "NEUTRAL", feedback: "İnceledin... Kararın değişmedi. Zaman kaybı ama emin olmak iyidir. (Puan kazanamadın)" }
        ]
    },
    {
        id: 3,
        title: "Ofsayt Tuzağı",
        description: "Ara pası atıldı. Forvet savunmanın arkasına sarktı ve golü attı. Yan hakem bayrağı kaldırdı. VAR çizgisine bakıyorsun.",
        details: [
            "Fark: Santimler",
            "Vücut: Omuz önde",
            "Ayak: Çizgide"
        ],
        choices: [
            { text: "GOLÜ VER", outcome: "WRONG", feedback: "Yanlış. Omuz ofsayt sayılır." },
            { text: "OFSAYT - GOL İPTAL", outcome: "CORRECT", feedback: "Doğru! Teknolojik ölçüme göre omuz önde." }
        ]
    },
    {
        id: 4,
        title: "Teknik Direktör Çıldırdı",
        description: "Ev sahibi takımın teknik direktörü taç çizgisi kenarında 4. hakeme bağırıyor ve su şişesini sahaya fırlatıyor.",
        details: [
            "Agresiflik: %100",
            "Eylem: Sahaya madde atma",
            "Dil: Hakaret içeriyor"
        ],
        choices: [
            { text: "UYARI", outcome: "WRONG", feedback: "Yetersiz. Sahaya madde atmak ve hakaret direkt ihraç gerektirir." },
            { text: "SARI KART", outcome: "WRONG", feedback: "Yetersiz. Otoriten sarsılır." },
            { text: "KIRMIZI KART", outcome: "CORRECT", feedback: "Mükemmel! Taviz yok. Tribüne gönder." }
        ]
    }
];

export default scenarios;
