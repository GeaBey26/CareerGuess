// Player database moved to data.js

// ==========================================
// SOUND MANAGER (WEB AUDIO API)
// ==========================================
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem('guess_player_sound') !== 'false';
    }

    init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('guess_player_sound', this.enabled);
        return this.enabled;
    }

    toggleUI() {
        const enabled = this.toggle();
        const btn = document.getElementById('sound-toggle');
        if (btn) btn.innerText = enabled ? '🔊' : '🔇';
        if (enabled) {
            this.init();
            this.playTone(440, 'sine', 0.1);
        }
    }

    playTone(freq, type, duration, volume = 0.1) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playCorrect() {
        this.playTone(523.25, 'sine', 0.1, 0.15); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.15), 100); // E5
    }

    playWrong() {
        this.playTone(220, 'triangle', 0.3, 0.2); // A3
    }

    playTick() {
        this.playTone(880, 'sine', 0.05, 0.05); // A5
    }

    playLevelUp() {
        [523, 659, 783, 1046].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sine', 0.3, 0.1), i * 150);
        });
    }
}

const sounds = new SoundManager();

// ==========================================
// ACHIEVEMENT MANAGER
// ==========================================
class AchievementManager {
    constructor() {
        this.achievements = [
            { id: 'first_win', icon: '🎯', tr: 'İlk Tahmin', en: 'First Guess', desc_tr: 'İlk oyuncuyu doğru tahmin et.', desc_en: 'Guess your first player correctly.' },
            { id: 'streak_5', icon: '🔥', tr: 'Sıcak Seri', en: 'Hot Streak', desc_tr: '5\'li seri yakala.', desc_en: 'Reach a streak of 5.' },
            { id: 'streak_10', icon: '🎉', tr: 'Efsane Seri', en: 'Godlike Streak', desc_tr: '10\'lu seri yakala.', desc_en: 'Reach a streak of 10.' },
            { id: 'score_100', icon: '💯', tr: 'Dalya', en: 'Century', desc_tr: 'Tek oyunda 100 puan yap.', desc_en: 'Score 100 points in a single game.' },
            { id: 'daily_win', icon: '📅', tr: 'Günlük Kahraman', en: 'Daily Hero', desc_tr: 'Bir Günlük Yarışmayı tamamla.', desc_en: 'Complete one Daily Challenge.' },
            { id: 'football_pro', icon: '⚽', tr: 'Futbol Gurmesi', en: 'Football Guru', desc_tr: 'Futbolda 500 toplam puan.', desc_en: 'Score 500 total points in Football.' },
            { id: 'basket_pro', icon: '🏀', tr: 'Basketbol Üstadı', en: 'Hoops Master', desc_tr: 'Basketbolda 500 toplam puan.', desc_en: 'Score 500 total points in Basketball.' },
            { id: 'f1_speed', icon: '🏎️', tr: 'Hız Tutkunu', en: 'Speed Demon', desc_tr: 'F1 kategorisinde oyna.', desc_en: 'Play in the F1 category.' },
            { id: 'esport_gamer', icon: '🎮', tr: 'Gerçek Oyuncu', en: 'True Gamer', desc_tr: 'E-Spor kategorisinde oyna.', desc_en: 'Play in E-Sports category.' },
            { id: 'multilingual', icon: '🌍', tr: 'Dünya İnsanı', en: 'Polyglot', desc_tr: '3 farklı dilde oyna.', desc_en: 'Play in 3 different languages.' }
        ];
    }

    check(user) {
        if (!user || !user.stats) return [];
        const unlocked = user.achievements || [];
        const newlyUnlocked = [];

        // Simple check logic
        const totalScore = Object.values(user.stats).reduce((acc, s) => acc + (s.highscore || 0), 0);
        const maxStreakGlobal = Object.values(user.stats).reduce((max, s) => Math.max(max, s.maxStreak || 0), 0);

        const conditions = {
            'first_win': totalScore >= 10,
            'streak_5': maxStreakGlobal >= 5,
            'streak_10': maxStreakGlobal >= 10,
            'score_100': totalScore >= 100,
            'f1_speed': user.stats['f1']?.highscore > 0,
            'esport_gamer': user.stats['esports']?.highscore > 0
        };

        this.achievements.forEach(ach => {
            if (conditions[ach.id] && !unlocked.includes(ach.id)) {
                unlocked.push(ach.id);
                newlyUnlocked.push(ach);
            }
        });

        if (newlyUnlocked.length > 0) {
            user.achievements = unlocked;
            authManager.saveUsers();
            authManager.saveCurrentUser();
            newlyUnlocked.forEach(ach => {
                const msg = `🏆 BAŞARIM AÇILDI: ${ach.tr}`;
                if (window.game) window.game.showMessage(msg, 'success');
                if (typeof sounds !== 'undefined') sounds.playLevelUp();
            });
        }
        return unlocked;
    }

    render(user) {
        const unlocked = user.achievements || [];
        const lang = (window.game && window.game.currentLang) || 'tr';
        const t = TRANSLATIONS[lang];

        return `
            <div class="achievements-section">
                <span class="section-title">${t.achievements_title || 'BAŞARIMLAR'}</span>
                <div class="achievements-grid">
                    ${this.achievements.map(ach => {
                        const name = lang === 'tr' ? ach.tr : (ach.en || ach.tr);
                        const desc = lang === 'tr' ? ach.desc_tr : (ach.desc_en || ach.desc_tr);
                        return `
                            <div class="achievement-item ${unlocked.includes(ach.id) ? 'unlocked' : 'locked'}" title="${desc}">
                                <div class="ach-icon">${ach.icon}</div>
                                <div class="ach-name">${name}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
}

const achievements = new AchievementManager();

const TRANSLATIONS = {
    tr: {
        title_category: "CAREER GUESS",
        subtitle_category: "Branşını Seç ve Başla!",
        football: "FUTBOL",
        basketball: "BASKETBOL",
        nhl: "NHL",
        nfl: "NFL",
        volleyball: "VOLEYBOL",
        cricket: "KRİKET",
        f1: "FORMULA 1",
        tennis: "TENİS",
        esports: "E-SPOR",
        title_esports_select: "OYUN SEÇ VE BAŞLA",
        subtitle_esports: "Hangi oyunu oynamak istersin?",
        back: "← Geri",
        title_setup: "OYUN AYARLARI",
        status_all: "Hepsi",
        status_active: "Aktif",
        status_retired: "Emekli",
        status_tr: "Türkler",
        diff_easy: "KOLAY",
        diff_medium: "ORTA",
        diff_hard: "ZOR",
        title_mode: "OYUN TÜRÜ SEÇ",
        subtitle_mode: "Nasıl oynamak istersin?",
        mode_classic: "SÜRESİZ",
        mode_classic_desc: "Rahat rahat, acele yok.",
        mode_timed: "SÜRELİ",
        mode_timed_desc: "60 saniye. Hızını göster!",
        title_game_football: "CAREER GUESS",
        title_game_basketball: "CAREER GUESS (BASKETBOL)",
        title_game_nhl: "CAREER GUESS (NHL)",
        title_game_nfl: "CAREER GUESS (NFL)",
        title_game_volleyball: "CAREER GUESS (VOLEYBOL)",
        title_game_cricket: "CAREER GUESS (KRİKET)",
        title_game_f1: "CAREER GUESS (F1)",
        title_game_tennis: "CAREER GUESS (TENİS)",
        title_game_esports: "CAREER GUESS (E-SPOR)",
        subtitle_game: "Kariyer geçmişine bak ve oyuncuyu tahmin et!",
        score: "Skor",
        streak: "Seri",
        input_placeholder: "İsim yaz...",
        btn_give_up: "Pes Et",
        btn_hint: "İpucu",
        btn_guess: "Tahmin Et",
        msg_correct: "Doğru! +10 Puan",
        msg_wrong: "Yanlış Cevap! -10 Puan",
        msg_used_hint: "İpucu Kullanıldı",
        hint_1_prefix: "İpucu 1: Pozisyon -",
        hint_2_prefix: "İpucu 2: Ülke -",
        msg_pass: "Pas geçildi.",
        msg_finished: "Tebrikler! Tüm oyuncuları bildin!",
        msg_time_up: "SÜRE BİTTİ!",
        msg_total_score: "Toplam Skor:",
        btn_play_again: "TEKRAR OYNA",
        confirm_exit: "Çıkmak istediğine emin misin? Oyun sıfırlanacak.",
        btn_login: "Giriş Yap",
        btn_signup: "Kayıt Ol",
        btn_logout: "Çıkış Yap",
        profile_title: "OYUNCU PROFİLİ",
        achievements_title: "BAŞARIMLAR",
        leaderboard_title: "LİDERLİK TABLOSU",
        stat_max_streak: "Max Seri:",
        stat_highscore: "En Yüksek Skor:",
        lb_you: "(SENSİN)",
        footer_rights: "Tüm hakları saklıdır.",
        footer_privacy: "Gizlilik Politikası",
        footer_terms: "Kullanım Şartları",
        cookie_text: "Bu site deneyim ve reklamlar için çerez kullanır.",
        cookie_info: "Daha Fazla Bilgi",
        cookie_accept: "Kabul Et",
        btn_close: "Kapat",
        cookie_info_title: "Çerez Bilgisi",
        privacy_content: "GİZLİLİK POLİTİKASI\n\n1. Veriler\nİlerleme yerel olarak kaydedilir.\n\n2. Reklamlar\nÇerez kullanan üçüncü taraf reklamlar gösterebiliriz.\n\n3. İletişim\nSorularınız için bizimle iletişime geçin.",
        terms_content: "KULLANIM ŞARTLARI\n\n1. Kullanım\nBu oyun eğlence amaçlıdır.\n\n2. Telif Hakkı\nİçerikler ve tasarım koruma altındadır.\n\n3. Sorumluluk\nOyun 'olduğu gibi' sunulur. Kesintilerden sorumlu değiliz.",
    },
    en: {
        title_category: "CAREER GUESS",
        subtitle_category: "Choose your sport!",
        football: "FOOTBALL",
        basketball: "BASKETBALL",
        nhl: "NHL",
        nfl: "NFL",
        volleyball: "VOLLEYBALL",
        cricket: "CRICKET",
        f1: "FORMULA 1",
        tennis: "TENNIS",
        esports: "E-SPORTS",
        title_esports_select: "CHOOSE GAME",
        subtitle_esports: "Which game do you want to play?",
        back: "← Back",
        title_setup: "SETTINGS",
        status_all: "All",
        status_active: "Active",
        status_retired: "Retired",
        status_tr: "Turkish",
        diff_easy: "EASY",
        diff_medium: "MEDIUM",
        diff_hard: "HARD",
        title_mode: "GAME MODE",
        subtitle_mode: "How do you want to play?",
        mode_classic: "CLASSIC",
        mode_classic_desc: "No rush, just fun.",
        mode_timed: "TIMED",
        mode_timed_desc: "60 seconds. Show your speed!",
        title_game_football: "CAREER GUESS",
        title_game_basketball: "CAREER GUESS (BASKETBALL)",
        title_game_nhl: "CAREER GUESS (NHL)",
        title_game_nfl: "CAREER GUESS (NFL)",
        title_game_volleyball: "CAREER GUESS (VOLLEYBALL)",
        title_game_cricket: "CAREER GUESS (CRICKET)",
        title_game_f1: "CAREER GUESS (F1)",
        title_game_tennis: "CAREER GUESS (TENNIS)",
        title_game_esports: "CAREER GUESS (E-SPORTS)",
        subtitle_game: "Check the career path and guess the player!",
        score: "Score",
        streak: "Streak",
        input_placeholder: "Type a name...",
        btn_give_up: "Give Up",
        btn_hint: "Hint",
        btn_guess: "Guess",
        msg_correct: "Correct! +10 Pts",
        msg_wrong: "Wrong! -10 Pts",
        msg_used_hint: "Hint Used",
        hint_1_prefix: "Hint 1: Position -",
        hint_2_prefix: "Hint 2: Nationality -",
        msg_pass: "Passed.",
        msg_finished: "Congratulations! You guessed all players!",
        msg_time_up: "TIME'S UP!",
        msg_total_score: "Total Score:",
        btn_play_again: "PLAY AGAIN",
        confirm_exit: "Are you sure you want to exit? Progress will be lost.",
        btn_login: "Login",
        btn_signup: "Sign Up",
        btn_logout: "Logout",
        profile_title: "PLAYER PROFILE",
        achievements_title: "ACHIEVEMENTS",
        leaderboard_title: "LEADERBOARD",
        stat_max_streak: "Max Streak:",
        stat_highscore: "High Score:",
        lb_you: "(YOU)",
        footer_rights: "All rights reserved.",
        footer_privacy: "Privacy Policy",
        footer_terms: "Terms of Use",
        cookie_text: "This site uses cookies for experience and ads.",
        cookie_info: "More Info",
        cookie_accept: "Accept",
        btn_close: "Close",
        cookie_info_title: "Cookie Information",
        privacy_content: "PRIVACY POLICY\n\n1. Data\nProgress is saved locally.\n\n2. Ads\nWe may show third-party ads using cookies.\n\n3. Contact\nContact us for questions.",
        terms_content: "TERMS OF USE\n\n1. Use\nThis game is for entertainment only.\n\n2. Copyright\nContents are protected.\n\n3. Liability\nGame is provided 'as is'.",
    },
    es: {
        title_category: "CAREER GUESS",
        subtitle_category: "¡Elige tu deporte!",
        football: "FÚTBOL",
        basketball: "BALONCESTO",
        nhl: "NHL",
        nfl: "NFL",
        volleyball: "VOLEIBOL",
        cricket: "CRÍQUET",
        f1: "FÓRMULA 1",
        tennis: "TENIS",
        esports: "E-SPORTS",
        title_esports_select: "ELIGE JUEGO",
        subtitle_esports: "¿Qué juego quieres jugar?",
        back: "← Volver",
        title_setup: "CONFIGURACIÓN",
        status_all: "Todos",
        status_active: "Activo",
        status_retired: "Retirado",
        status_tr: "Turcos",
        diff_easy: "FÁCIL",
        diff_medium: "MEDIO",
        diff_hard: "DIFÍCIL",
        title_mode: "MODO DE JUEGO",
        subtitle_mode: "¿Cómo quieres jugar?",
        mode_classic: "CLÁSICO",
        mode_classic_desc: "Sin prisa, solo diversión.",
        mode_timed: "CON TIEMPO",
        mode_timed_desc: "60 segundos. ¡Demuestra tu velocidad!",
        score: "Puntuación",
        streak: "Racha",
        input_placeholder: "Escribe un nombre...",
        btn_give_up: "Rendirse",
        btn_hint: "Pista",
        btn_guess: "Adivinar",
        msg_correct: "¡Correcto! +10 Pts",
        msg_wrong: "¡Incorrecto! -10 Pts",
        msg_used_hint: "Pista Usada",
        hint_1_prefix: "Pista 1: Posición -",
        hint_2_prefix: "Pista 2: Nacionalidad -",
        msg_pass: "Saltado.",
        msg_finished: "¡Felicidades! ¡Has adivinado todos los jugadores!",
        msg_time_up: "¡SE ACABÓ EL TIEMPO!",
        msg_total_score: "Puntuación Total:",
        btn_play_again: "JUGAR DE NUEVO",
        confirm_exit: "¿Seguro que quieres salir? El progreso se perderá.",
        btn_login: "Iniciar Sesión",
        btn_signup: "Registrarse",
        btn_logout: "Cerrar Sesión",
        profile_title: "PERFIL DE JUGADOR",
        achievements_title: "LOGROS",
        leaderboard_title: "TABLA DE CLASIFICACIÓN",
        stat_max_streak: "Racha Máxima:",
        stat_highscore: "Puntuación Más Alta:",
        lb_you: "(TÚ)",
        footer_rights: "Todos los derechos reservados.",
        footer_privacy: "Política de Privacidad",
        footer_terms: "Términos de Uso",
        cookie_text: "Este sitio utiliza cookies para experiencia y anuncios.",
        cookie_info: "Más Información",
        cookie_accept: "Aceptar",
        btn_close: "Cerrar",
        cookie_info_title: "Información de Cookies",
        privacy_content: "POLÍTICA DE PRIVACIDAD\n\n1. Data\nProgreso guardado localmente.\n\n2. Anuncios\nPodemos mostrar anuncios de terceros que usen cookies.\n\n3. Contacto\nContáctenos si tiene dudas.",
        terms_content: "TÉRMINOS DE USO\n\n1. Uso\nEste juego es solo para entretenimiento.\n\n2. Derechos\nContenido protegido.\n\n3. Responsabilidad\nEl juego se proporciona 'tal cual'.",
    },
    hi: {
        title_category: "CAREER GUESS",
        subtitle_category: "अपना खेल चुनें!",
        football: "फ़ुटबॉल",
        basketball: "बास्केटबॉल",
        nhl: "NHL",
        nfl: "NFL",
        volleyball: "वॉलीबॉल",
        cricket: "क्रिकेट",
        f1: "फॉर्मूला 1",
        tennis: "टेनिस",
        esports: "ई-स्पोर्ट्स",
        title_esports_select: "खेल चुनें",
        subtitle_esports: "आप कौन सा खेल खेलना चाहते हैं?",
        back: "← वापस",
        title_setup: "सेटिंग्स",
        status_all: "सभी",
        status_active: "सक्रिय",
        status_retired: "रिटायर्ड",
        status_tr: "तुर्की",
        diff_easy: "आसान",
        diff_medium: "मध्यम",
        diff_hard: "कठिन",
        title_mode: "गेम मोड",
        subtitle_mode: "आप कैसे खेलना चाहते हैं?",
        mode_classic: "क्लासिक",
        mode_classic_desc: "कोई जल्दी नहीं, बस मज़ा।",
        mode_timed: "समयबद्ध",
        mode_timed_desc: "60 सेकंड। अपनी गति दिखाएं!",
        score: "स्कोर",
        streak: "स्ट्रीक",
        input_placeholder: "नाम लिखें...",
        btn_give_up: "हार मान लें",
        btn_hint: "संकेत",
        btn_guess: "अनुमान लगाएं",
        msg_correct: "सही! +10 अंक",
        msg_wrong: "गलत! -10 अंक",
        msg_used_hint: "संकेत उपयोग किया गया",
        hint_1_prefix: "संकेत 1: स्थिति -",
        hint_2_prefix: "संकेत 2: राष्ट्रीयता -",
        msg_pass: "पास किया गया।",
        msg_finished: "बधाई हो! आपने सभी खिलाड़ियों का अनुमान लगा लिया!",
        msg_time_up: "समय समाप्त!",
        msg_total_score: "कुल स्कोर:",
        btn_play_again: "फिर से खेलें",
        confirm_exit: "क्या आप वाकई बाहर निकलना चाहते हैं? प्रगति खो जाएगी।",
        btn_login: "लॉगिन",
        btn_signup: "साइन अप",
        btn_logout: "लॉगआउट",
        profile_title: "खिलाड़ी प्रोफ़ाइल",
        achievements_title: "उपलब्धियां",
        leaderboard_title: "लीडरबोर्ड",
        stat_max_streak: "अधिकतम स्ट्रीक:",
        stat_highscore: "उच्चतम स्कोर:",
        lb_you: "(आप)",
        footer_rights: "सर्वाधिकार सुरक्षित।",
        footer_privacy: "गोपनीयता नीति",
        footer_terms: "उपयोग की शर्तें",
        cookie_text: "यह साइट अनुभव और विज्ञापनों के लिए कुकीज़ का उपयोग करती है।",
        cookie_info: "अधिक जानकारी",
        cookie_accept: "स्वीकार करें",
        btn_close: "बंद करें",
        cookie_info_title: "कुकी जानकारी",
        privacy_content: "गोपनीयता नीति\n\n1. डेटा\nप्रगति स्थानीय रूप से सहेजी जाती है।\n\n2. विज्ञापन\nहम कुकीज़ का उपयोग करके तीसरे पक्ष के विज्ञापन दिखा सकते हैं।\n\n3. संपर्क\nप्रश्नों के लिए हमसे संपर्क करें।",
        terms_content: "उपयोग की शर्तें\n\n1. उपयोग\nयह गेम केवल मनोरंजन के लिए है।\n\n2. कॉपीराइट\nसामग्री सुरक्षित है।\n\n3. दायित्व\nगेम 'जैसा है' प्रदान किया गया है।",
    }
};

class Game {
    constructor() {
        this.currentLang = 'tr'; // Default language

        this.score = 0;
        this.streak = 0;
        this.timer = 60;
        this.hintStep = 0;
        this.usedPlayers = new Set();
        this.currentPlayer = null;
        this.timerInterval = null;
        this.gameMode = 'classic'; // 'classic', 'timed', 'quiz'
        this.currentIndex = 0; // Tracking
        this.questionCount = 0; // Tracking for quiz mode

        // Ensure activePlayers is initialized to avoid errors
        this.activePlayers = (typeof players !== 'undefined') ? players : [];
        this.canGuess = true;
        this.selectedDifficulty = 'all'; // Default
        this.playerStatus = 'all'; // Default
        this.currentSport = 'football'; // Default

        // DOM Elements
        this.startScreen = document.getElementById('category-screen'); // Entry point
        this.gameContainer = document.getElementById('game-container');
        this.inputEl = document.getElementById('guess-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.skipBtn = document.getElementById('give-up-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.scoreEl = document.getElementById('score');
        this.streakEl = document.getElementById('streak');
        this.messageEl = document.getElementById('message-area');
        this.timelineEl = document.getElementById('career-timeline');
        this.suggestionsEl = document.getElementById('suggestions');
        this.timerArea = document.getElementById('timer-area');
        this.timerVal = document.getElementById('timer-val');
        this.titleEl = document.getElementById('game-title');
        this.backBtn = document.getElementById('back-btn');

        // Selectors
        this.statusButtons = document.querySelectorAll('.filter-btn');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.diffButtons = document.querySelectorAll('.diff-btn');

        this.initStartScreen();

        // Handle browser back/forward buttons
        if (!history.state) {
            history.replaceState({ screen: 'category-screen' }, "", "");
        }
        window.onpopstate = (event) => {
            if (event.state && event.state.screen) {
                this.showScreen(event.state.screen, false);
            } else {
                this.showScreen('category-screen', false);
            }
        };

        this.addEventListeners();
    }

    initStartScreen() {
        window.game = this;
        this.gameMode = 'endless';
        this.playerStatus = 'all';

        this.statusButtons.forEach(btn => {
            if (btn.dataset.status === this.playerStatus) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        this.statusButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    this.statusButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.playerStatus = btn.dataset.status;
                } catch (e) {
                    alert("Status Error: " + e.message);
                }
            });
        });

        this.diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    const difficulty = btn.dataset.diff;
                    console.log("Difficulty clicked:", difficulty);
                    this.selectedDifficulty = difficulty; // Save diff
                    this.showScreen('gametype-screen'); // Go to mode select
                } catch (e) {
                    alert("Setup Error: " + e.message);
                    console.error(e);
                }
            });
        });

        // Initialize Language
        this.setLanguage('tr');
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    setLanguage(lang) {
        if (!TRANSLATIONS[lang]) return;
        this.currentLang = lang;

        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (TRANSLATIONS[lang][key]) {
                el.innerText = TRANSLATIONS[lang][key];
            }
        });

        // Update placeholders
        if (this.inputEl && TRANSLATIONS[lang]['input_placeholder']) {
            this.inputEl.placeholder = TRANSLATIONS[lang]['input_placeholder'];
        }

        // Update active dynamic elements if needed
        if (this.gameMode === 'timed' && this.hintBtn) {
            const hintText = TRANSLATIONS[lang]['btn_hint'];
            this.hintBtn.innerText = `${hintText} (-5s)`;
        }
    }
