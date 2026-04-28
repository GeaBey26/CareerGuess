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
        if (btn) btn.innerText = enabled ? 'ğŸ”Š' : 'ğŸ”‡';
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
            { id: 'first_win', icon: 'ğŸ¯', tr: 'Ä°lk Tahmin', en: 'First Guess', desc_tr: 'Ä°lk oyuncuyu doÄŸru tahmin et.', desc_en: 'Guess your first player correctly.' },
            { id: 'streak_5', icon: 'ğŸ”¥', tr: 'SÄ±cak Seri', en: 'Hot Streak', desc_tr: '5\'li seri yakala.', desc_en: 'Reach a streak of 5.' },
            { id: 'streak_10', icon: 'ğŸ†', tr: 'Efsane Seri', en: 'Godlike Streak', desc_tr: '10\'lu seri yakala.', desc_en: 'Reach a streak of 10.' },
            { id: 'score_100', icon: 'ğŸ’¯', tr: 'Dalya', en: 'Century', desc_tr: 'Tek oyunda 100 puan yap.', desc_en: 'Score 100 points in a single game.' },
            { id: 'daily_win', icon: 'ğŸ“…', tr: 'GÃ¼nlÃ¼k Kahraman', en: 'Daily Hero', desc_tr: 'Bir GÃ¼nlÃ¼k YarÄ±ÅŸmayÄ± tamamla.', desc_en: 'Complete one Daily Challenge.' },
            { id: 'football_pro', icon: 'âš½', tr: 'Futbol Gurmesi', en: 'Football Guru', desc_tr: 'Futbolda 500 toplam puan.', desc_en: 'Score 500 total points in Football.' },
            { id: 'basket_pro', icon: 'ğŸ€', tr: 'Basketbol ÃœstadÄ±', en: 'Hoops Master', desc_tr: 'Basketbolda 500 toplam puan.', desc_en: 'Score 500 total points in Basketball.' },
            { id: 'f1_speed', icon: 'ğŸï¸', tr: 'HÄ±z Tutkunu', en: 'Speed Demon', desc_tr: 'F1 kategorisinde oyna.', desc_en: 'Play in the F1 category.' },
            { id: 'esport_gamer', icon: 'ğŸ®', tr: 'GerÃ§ek Oyuncu', en: 'True Gamer', desc_tr: 'E-Spor kategorisinde oyna.', desc_en: 'Play in E-Sports category.' },
            { id: 'multilingual', icon: 'ğŸŒ', tr: 'DÃ¼nya Ä°nsanÄ±', en: 'Polyglot', desc_tr: '3 farklÄ± dilde oyna.', desc_en: 'Play in 3 different languages.' }
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
                const msg = `ğŸ† BAÅARIM AÃ‡ILDI: ${ach.tr}`;
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
                <span class="section-title">${t.achievements_title || 'BAÅARIMLAR'}</span>
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
        football: "FUTBOL",
        basketball: "BASKETBOL",
        nhl: "NHL",
        nfl: "NFL",
        volleyball: "VOLEYBOL",
        cricket: "KRÄ°KET",
        f1: "FORMULA 1",
        tennis: "TENÄ°S",
        esports: "E-SPOR",
        title_esports_select: "OYUN SEÃ‡ ğŸ•¹ï¸",
        subtitle_esports: "Hangi oyunu oynamak istersin?",

        back: "â† Geri",
        title_setup: "OYUN AYARLARI",
        status_all: "Hepsi",
        status_active: "Aktif",
        status_retired: "Emekli",
        diff_easy: "KOLAY",
        diff_medium: "ORTA",
        diff_hard: "ZOR",

        title_mode: "OYUN TÃœRÃœ SEÃ‡",
        subtitle_mode: "NasÄ±l oynamak istersin?",
        mode_classic: "SÃœRESÄ°Z",
        mode_classic_desc: "Rahat rahat, acele yok.",
        mode_timed: "SÃœRELÄ°",
        mode_timed_desc: "60 saniye. HÄ±zÄ±nÄ± gÃ¶ster!",

        title_game_football: "CAREER GUESS",
        title_game_basketball: "CAREER GUESS (BASKETBALL)",
        title_game_nfl: "CAREER GUESS (NFL)",
        title_game_volleyball: "CAREER GUESS (VOLLEYBALL)",
        title_game_cricket: "CAREER GUESS (CRICKET)",
        title_game_f1: "CAREER GUESS (F1)",
        title_game_tennis: "CAREER GUESS (TENNIS)",
        title_game_esports: "CAREER GUESS (E-SPOR)",
        subtitle_game: "Kariyer geÃ§miÅŸine bak ve futbolcuyu tahmin et!",

        score: "Skor",
        streak: "Seri",
        input_placeholder: "Ä°sim yaz...",
        btn_give_up: "Pes Et",
        btn_hint: "Ä°pucu",
        btn_guess: "Tahmin Et",

        msg_correct: "DoÄŸru! +10 Puan",
        msg_wrong: "YanlÄ±ÅŸ Cevap! -10 Puan",
        msg_used_hint: "Ä°pucu KullanÄ±ldÄ±",
        hint_1_prefix: "Ä°pucu 1: Pozisyon -",
        hint_2_prefix: "Ä°pucu 2: Ãœlke -",
        msg_pass: "Pas geÃ§ildi.",
        msg_finished: "Tebrikler! TÃ¼m oyuncularÄ± bildin!",
        msg_time_up: "SÃœRE BÄ°TTÄ°! âŒ›",
        msg_total_score: "Toplam Skor:",
        btn_play_again: "TEKRAR OYNA",
        confirm_exit: "Ã‡Ä±kmak istediÄŸine emin misin? Oyun sÄ±fÄ±rlanacak.",
        btn_login: "GiriÅŸ Yap",
        btn_signup: "KayÄ±t Ol",
        btn_logout: "Ã‡Ä±kÄ±ÅŸ Yap",

        profile_title: "OYUNCU PROFÄ°LÄ° ğŸ†",
        achievements_title: "BAÅARIMLAR",
        leaderboard_title: "LÄ°DERLÄ°K TABLOSU",
        stat_max_streak: "Max Seri:",
        stat_highscore: "En YÃ¼ksek Skor:",
        lb_you: "(SENSÄ°N)",
        lb_puan: "Puan",

        radar_football: "Futbol",
        radar_basketball: "Basket",
        radar_nfl: "NFL",
        radar_nhl: "NHL",
        radar_volleyball: "Voley",
        radar_cricket: "Kriket",
        radar_f1: "F1",
        radar_tennis: "Tenis",
        radar_esports: "E-Spor",

        // Footer & Cookies
        footer_rights: "TÃ¼m haklarÄ± saklÄ±dÄ±r.",
        footer_privacy: "Gizlilik PolitikasÄ±",
        footer_terms: "KullanÄ±m ÅartlarÄ±",
        cookie_text: "Bu web sitesi, size en iyi deneyimi sunmak iÃ§in Ã§erezleri kullanÄ±r.",
        cookie_info: "Daha Fazla Bilgi",
        cookie_accept: "Kabul Et",
        btn_close: "Kapat",

        cookie_info_title: "Ã‡erez Bilgilendirmesi",
        privacy_content: "GÄ°ZLÄ°LÄ°K POLÄ°TÄ°KASI\n\n1. Veri Saklama\nOyun ilerlemeniz cihazÄ±nÄ±zda (localStorage) saklanÄ±r.\n\n2. Reklamlar ve Ã‡erezler\nSitemizde Ã¼Ã§Ã¼ncÃ¼ taraf reklamlar gÃ¶sterilebilir. Reklam saÄŸlayÄ±cÄ±lar, size uygun reklamlar sunmak iÃ§in Ã§erez kullanabilir.\n\n3. Ä°letiÅŸim\nSorularÄ±nÄ±z iÃ§in bizimle iletiÅŸime geÃ§ebilirsiniz.",
        terms_content: "KULLANIM ÅARTLARI\n\n1. KullanÄ±m\nBu oyun eÄŸlence amaÃ§lÄ±dÄ±r.\n\n2. Telif HakkÄ±\nÄ°Ã§erikler ve tasarÄ±m koruma altÄ±ndadÄ±r.\n\n3. Sorumluluk\nOyun 'olduÄŸu gibi' sunulur. Kesintilerden sorumlu deÄŸiliz.",
        cookie_info_content: "Ã‡EREZ POLÄ°TÄ°KASI\n\nSitemizin Ã§alÄ±ÅŸmasÄ± ve (varsa) reklam gÃ¶sterimi iÃ§in Ã§erezler kullanÄ±labilir. 'Kabul Et' diyerek buna onay vermiÅŸ olursunuz.",
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
        title_esports_select: "SELECT GAME ğŸ•¹ï¸",
        subtitle_esports: "Which game do you want to play?",

        back: "â† Back",
        title_setup: "GAME SETTINGS",
        status_all: "All",
        status_active: "Active",
        status_retired: "Retired",
        diff_easy: "EASY",
        diff_medium: "MEDIUM",
        diff_hard: "HARD",

        title_mode: "SELECT GAME MODE",
        subtitle_mode: "How do you want to play?",
        mode_classic: "CLASSIC",
        mode_classic_desc: "No rush, just fun.",
        mode_timed: "TIMED",
        mode_timed_desc: "60 seconds. Show your speed!",

        title_game_football: "CAREER GUESS",
        title_game_basketball: "CAREER GUESS (BASKETBALL)",
        title_game_nfl: "CAREER GUESS (NFL)",
        title_game_volleyball: "CAREER GUESS (VOLLEYBALL)",
        title_game_cricket: "CAREER GUESS (CRICKET)",
        title_game_f1: "CAREER GUESS (F1)",
        title_game_tennis: "CAREER GUESS (TENNIS)",
        title_game_esports: "CAREER GUESS (E-SPORTS)",
        subtitle_game: "Check the career path and guess the player!",

        score: "Score",
        streak: "Streak",
        input_placeholder: "Type generic name...",
        btn_give_up: "Give Up",
        btn_hint: "Get Hint",
        btn_guess: "Guess",

        msg_correct: "Correct! +10 Points",
        msg_wrong: "Wrong answer! -10 Points",
        msg_used_hint: "Hint Used",
        hint_1_prefix: "Hint 1: Position -",
        hint_2_prefix: "Hint 2: Nationality -",
        msg_pass: "Skipped.",
        msg_finished: "Congratulations! You guessed all players!",
        msg_time_up: "TIME'S UP! âŒ›",
        msg_total_score: "Total Score:",
        btn_play_again: "PLAY AGAIN",
        confirm_exit: "Are you sure you want to return to menu? Game will be reset.",
        btn_login: "Login",
        btn_signup: "Sign Up",
        btn_logout: "Logout",

        profile_title: "PLAYER PROFILE ğŸ†",
        achievements_title: "ACHIEVEMENTS",
        leaderboard_title: "LEADERBOARD",
        stat_max_streak: "Max Streak:",
        stat_highscore: "High Score:",
        lb_you: "(YOU)",
        lb_puan: "Points",

        radar_football: "Football",
        radar_basketball: "Basketball",
        radar_nfl: "NFL",
        radar_nhl: "NHL",
        radar_volleyball: "Volleyball",
        radar_cricket: "Cricket",
        radar_f1: "F1",
        radar_tennis: "Tennis",
        radar_esports: "E-Sports",

        // Footer & Cookies
        footer_rights: "All rights reserved.",
        footer_privacy: "Privacy Policy",
        footer_terms: "Terms of Use",
        cookie_text: "This website uses cookies to ensure you get the best experience.",
        cookie_info: "Learn More",
        cookie_accept: "Accept",
        btn_close: "Close",

        cookie_info_title: "Cookie Information",
        privacy_content: "PRIVACY POLICY\n\n1. Data Storage\nYour progress is stored locally.\n\n2. Ads & Cookies\nWe may display third-party advertisements. Ad providers may use cookies to personalize content.\n\n3. Contact\nContact us for questions.",
        terms_content: "TERMS OF USE\n\n1. Usage\nFor entertainment only.\n\n2. Copyright\nProtected content.\n\n3. Liability\nProvided 'as is'.",
        cookie_info_content: "COOKIE POLICY\n\nWe use cookies for site functionality and ad personalization. By accepting, you consent to this.",
    },
    hi: {
        title_category: "CAREER GUESS",
        subtitle_category: "à¤…à¤ªà¤¨à¤¾ à¤–à¥‡à¤² à¤šà¥à¤¨à¥‡à¤‚!",
        football: "à¤«à¤¼à¥à¤Ÿà¤¬à¥‰à¤²",
        basketball: "à¤¬à¤¾à¤¸à¥à¤•à¥‡à¤Ÿà¤¬à¥‰à¤²",
        nhl: "à¤à¤¨à¤à¤šà¤à¤²",
        nfl: "à¤à¤¨à¤à¤«à¤à¤²",
        volleyball: "à¤µà¥‰à¤²à¥€à¤¬à¥‰à¤²",
        cricket: "à¤•à¥à¤°à¤¿à¤•à¥‡à¤Ÿ",
        f1: "à¤«à¥‰à¤°à¥à¤®à¥‚à¤²à¤¾ 1",
        tennis: "à¤Ÿà¥‡à¤¨à¤¿à¤¸",
        esports: "à¤ˆ-à¤¸à¥à¤ªà¥‹à¤°à¥à¤Ÿà¥à¤¸",
        title_esports_select: "à¤–à¥‡à¤² à¤šà¥à¤¨à¥‡à¤‚ ğŸ•¹ï¸",
        subtitle_esports: "à¤†à¤ª à¤•à¥Œà¤¨ à¤¸à¤¾ à¤–à¥‡à¤² à¤–à¥‡à¤²à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚?",

        back: "â† à¤µà¤¾à¤ªà¤¸",
        title_setup: "à¤–à¥‡à¤² à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸",
        status_all: "à¤¸à¤­à¥€",
        status_active: "à¤¸à¤•à¥à¤°à¤¿à¤¯",
        status_retired: "à¤¸à¥‡à¤µà¤¾à¤¨à¤¿à¤µà¥ƒà¤¤à¥à¤¤",
        diff_easy: "à¤†à¤¸à¤¾à¤¨",
        diff_medium: "à¤®à¤§à¥à¤¯à¤®",
        diff_hard: "à¤•à¤ à¤¿à¤¨",

        title_mode: "à¤—à¥‡à¤® à¤®à¥‹à¤¡ à¤šà¥à¤¨à¥‡à¤‚",
        subtitle_mode: "à¤†à¤ª à¤•à¥ˆà¤¸à¥‡ à¤–à¥‡à¤²à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚?",
        mode_classic: "à¤•à¥à¤²à¤¾à¤¸à¤¿à¤•",
        mode_classic_desc: "à¤•à¥‹à¤ˆ à¤œà¤²à¥à¤¦à¥€ à¤¨à¤¹à¥€à¤‚, à¤¬à¤¸ à¤®à¤œà¤¼à¤¾à¥¤",
        mode_timed: "à¤¸à¤®à¤¯à¤¬à¤¦à¥à¤§",
        mode_timed_desc: "60 à¤¸à¥‡à¤•à¤‚à¤¡à¥¤ à¤…à¤ªà¤¨à¥€ à¤—à¤¤à¤¿ à¤¦à¤¿à¤–à¤¾à¤à¤‚!",

        title_game_football: "CAREER GUESS",
        title_game_basketball: "CAREER GUESS (BASKETBALL)",
        title_game_nhl: "CAREER GUESS (à¤à¤¨à¤à¤šà¤à¤²)",
        title_game_nfl: "CAREER GUESS (NFL)",
        title_game_volleyball: "CAREER GUESS (VOLLEYBALL)",
        title_game_cricket: "CAREER GUESS (CRICKET)",
        title_game_f1: "CAREER GUESS (F1)",
        title_game_tennis: "CAREER GUESS (TENNIS)",
        title_game_esports: "CAREER GUESS (E-SPORTS)",
        subtitle_game: "à¤•à¤°à¤¿à¤¯à¤° à¤ªà¤¥ à¤¦à¥‡à¤–à¥‡à¤‚ à¤”à¤° à¤–à¤¿à¤²à¤¾à¤¡à¤¼à¥€ à¤•à¤¾ à¤…à¤¨à¥à¤®à¤¾à¤¨ à¤²à¤—à¤¾à¤à¤‚!",

        score: "à¤¸à¥à¤•à¥‹à¤°",
        streak: "à¤²à¤—à¤¾à¤¤à¤¾à¤°",
        input_placeholder: "à¤¨à¤¾à¤® à¤Ÿà¤¾à¤‡à¤ª à¤•à¤°à¥‡à¤‚...",
        btn_give_up: "à¤¹à¤¾à¤° à¤®à¤¾à¤¨ à¤²à¥‡à¤‚",
        btn_hint: "à¤¸à¤‚à¤•à¥‡à¤¤",
        btn_guess: "à¤…à¤¨à¥à¤®à¤¾à¤¨",

        msg_correct: "à¤¸à¤¹à¥€! +10 à¤…à¤‚à¤•",
        msg_wrong: "à¤—à¤²à¤¤ à¤œà¤µà¤¾à¤¬! -10 à¤…à¤‚à¤•",
        msg_used_hint: "à¤¸à¤‚à¤•à¥‡à¤¤ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾",
        hint_1_prefix: "à¤¸à¤‚à¤•à¥‡à¤¤ 1:",
        hint_2_prefix: "à¤¸à¤‚à¤•à¥‡à¤¤ 2: à¤¸à¥à¤¥à¤¾à¤¨ -",
        msg_pass: "à¤›à¥‹à¤¡à¤¼ à¤¦à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾à¥¤",
        msg_finished: "à¤¬à¤§à¤¾à¤ˆ à¤¹à¥‹! à¤†à¤ªà¤¨à¥‡ à¤¸à¤­à¥€ à¤–à¤¿à¤²à¤¾à¤¡à¤¼à¤¿à¤¯à¥‹à¤‚ à¤•à¤¾ à¤…à¤¨à¥à¤®à¤¾à¤¨ à¤²à¤—à¤¾à¤¯à¤¾!",
        msg_time_up: "à¤¸à¤®à¤¯ à¤¸à¤®à¤¾à¤ªà¥à¤¤! âŒ›",
        msg_total_score: "à¤•à¥à¤² à¤¸à¥à¤•à¥‹à¤°:",
        btn_play_again: "à¤«à¤¿à¤° à¤¸à¥‡ à¤–à¥‡à¤²à¥‡à¤‚",
        confirm_exit: "à¤•à¥à¤¯à¤¾ à¤†à¤ª à¤µà¤¾à¤•à¤ˆ à¤®à¥‡à¤¨à¥‚ à¤ªà¤° à¤²à¥Œà¤Ÿà¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚? à¤–à¥‡à¤² à¤°à¥€à¤¸à¥‡à¤Ÿ à¤¹à¥‹ à¤œà¤¾à¤à¤—à¤¾à¥¤",
        btn_login: "à¤²à¥‰à¤— à¤‡à¤¨",
        btn_signup: "à¤¸à¤¾à¤‡à¤¨ à¤…à¤ª",

        profile_title: "à¤–à¤¿à¤²à¤¾à¤¡à¤¼à¥€ à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤² ğŸ†",
        stat_total_score: "à¤•à¥à¤² à¤¸à¥à¤•à¥‹à¤°",
        stat_max_streak: "à¤…à¤§à¤¿à¤•à¤¤à¤® à¤¸à¥à¤Ÿà¥à¤°à¥€à¤•",

        // Footer & Cookies
        footer_rights: "à¤¸à¤°à¥à¤µà¤¾à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤à¥¤",
        footer_privacy: "à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾ à¤¨à¥€à¤¤à¤¿",
        footer_terms: "à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¥€ à¤¶à¤°à¥à¤¤à¥‡à¤‚",
        cookie_text: "à¤¯à¤¹ à¤µà¥‡à¤¬à¤¸à¤¾à¤‡à¤Ÿ à¤†à¤ªà¤•à¥‹ à¤¸à¤°à¥à¤µà¤¶à¥à¤°à¥‡à¤·à¥à¤  à¤…à¤¨à¥à¤­à¤µ à¤¦à¥‡à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥à¤•à¥€à¤œà¤¼ à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤°à¤¤à¥€ à¤¹à¥ˆà¥¤",
        cookie_info: "à¤…à¤§à¤¿à¤• à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€",
        cookie_accept: "à¤¸à¥à¤µà¥€à¤•à¤¾à¤° à¤•à¤°à¥‡à¤‚",
        btn_close: "à¤¬à¤‚à¤¦ à¤•à¤°à¥‡à¤‚",

        cookie_info_title: "à¤•à¥à¤•à¥€ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€",
        privacy_content: "à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾ à¤¨à¥€à¤¤à¤¿\n\n1. à¤¡à¥‡à¤Ÿà¤¾ à¤­à¤‚à¤¡à¤¾à¤°à¤£\nà¤†à¤ªà¤•à¥€ à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¥‚à¤ª à¤¸à¥‡ à¤¸à¤‚à¤—à¥à¤°à¤¹à¥€à¤¤ à¤¹à¥ˆà¥¤\n\n2. à¤µà¤¿à¤œà¥à¤à¤¾à¤ªà¤¨ à¤”à¤° à¤•à¥à¤•à¥€à¤œà¤¼\nà¤¹à¤® à¤¤à¥ƒà¤¤à¥€à¤¯-à¤ªà¤•à¥à¤· à¤µà¤¿à¤œà¥à¤à¤¾à¤ªà¤¨ à¤ªà¥à¤°à¤¦à¤°à¥à¤¶à¤¿à¤¤ à¤•à¤° à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤µà¤¿à¤œà¥à¤à¤¾à¤ªà¤¨ à¤ªà¥à¤°à¤¦à¤¾à¤¤à¤¾ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤•à¥‹ à¤µà¥ˆà¤¯à¤•à¥à¤¤à¤¿à¤•à¥ƒà¤¤ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥à¤•à¥€à¤œà¤¼ à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤° à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤\n\n3. à¤¸à¤‚à¤ªà¤°à¥à¤•\nà¤ªà¥à¤°à¤¶à¥à¤¨à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤ à¤¹à¤®à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤",
        terms_content: "à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¥€ à¤¶à¤°à¥à¤¤à¥‡à¤‚\n\n1. à¤‰à¤ªà¤¯à¥‹à¤—\nà¤•à¥‡à¤µà¤² à¤®à¤¨à¥‹à¤°à¤‚à¤œà¤¨ à¤•à¥‡ à¤²à¤¿à¤à¥¤\n\n2. à¤•à¥‰à¤ªà¥€à¤°à¤¾à¤‡à¤Ÿ\nà¤¸à¤‚à¤°à¤•à¥à¤·à¤¿à¤¤ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€à¥¤\n\n3. à¤¦à¤¾à¤¯à¤¿à¤¤à¥à¤µ\n'à¤œà¥ˆà¤¸à¤¾ à¤¹à¥ˆ' à¤ªà¥à¤°à¤¦à¤¾à¤¨ à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾à¥¤",
        cookie_info_content: "à¤•à¥à¤•à¥€ à¤¨à¥€à¤¤à¤¿\n\nà¤¹à¤® à¤¸à¤¾à¤‡à¤Ÿ à¤•à¥€ à¤•à¤¾à¤°à¥à¤¯à¤•à¥à¤·à¤®à¤¤à¤¾ à¤”à¤° à¤µà¤¿à¤œà¥à¤à¤¾à¤ªà¤¨ à¤µà¥ˆà¤¯à¤•à¥à¤¤à¤¿à¤•à¤°à¤£ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥à¤•à¥€à¤œà¤¼ à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤¸à¥à¤µà¥€à¤•à¤¾à¤° à¤•à¤°à¤•à¥‡, à¤†à¤ª à¤‡à¤¸à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¤¹à¤®à¤¤à¤¿ à¤¦à¥‡à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤",
    },
    es: {
        title_category: "CAREER GUESS",
        subtitle_category: "Â¡Elige tu deporte!",
        football: "FÃšTBOL",
        basketball: "BALONCESTO",
        nhl: "NHL",
        nfl: "NFL",
        volleyball: "VOLEIBOL",
        cricket: "CRÃQUET",
        f1: "FÃ“RMULA 1",
        tennis: "TENIS",
        esports: "E-SPORTS",
        title_esports_select: "ELIGE JUEGO ğŸ•¹ï¸",
        subtitle_esports: "Â¿QuÃ© juego quieres jugar?",

        back: "â† Volver",
        title_setup: "CONFIGURACIÃ“N",
        status_all: "Todos",
        status_active: "Activo",
        status_retired: "Retirado",
        diff_easy: "FÃCIL",
        diff_medium: "MEDIO",
        diff_hard: "DIFÃCIL",

        title_mode: "MODO DE JUEGO",
        subtitle_mode: "Â¿CÃ³mo quieres jugar?",
        mode_classic: "CLÃSICO",
        mode_classic_desc: "Sin prisa, solo diversiÃ³n.",
        mode_timed: "CON TIEMPO",
        mode_timed_desc: "60 segundos. Â¡Demuestra tu velocidad!",
        score: "PuntuaciÃ³n",
        streak: "Racha",
        input_placeholder: "Escribe el nombre...",
        btn_give_up: "Rendirse",
        btn_hint: "Pista",
        btn_guess: "Adivinar",

        msg_correct: "Â¡Correcto! +10 Puntos",
        msg_wrong: "Â¡Incorrecto! -10 Puntos",
        msg_used_hint: "Pista Usada",
        hint_1_prefix: "Pista 1:",
        hint_2_prefix: "Pista 2: PosiciÃ³n -",
        msg_pass: "Saltado.",
        msg_finished: "Â¡Felicidades! Â¡Has adivinado todos los jugadores!",
        msg_time_up: "Â¡SE ACABÃ“ EL TIEMPO! âŒ›",
        msg_total_score: "PuntuaciÃ³n Total:",
        btn_play_again: "JUGAR DE NUEVO",
        confirm_exit: "Â¿Seguro que quieres volver al menÃº? El juego se reiniciarÃ¡.",
        btn_login: "Iniciar SesiÃ³n",
        btn_signup: "Registrarse",

        profile_title: "PERFIL DE JUGADOR ğŸ†",
        stat_total_score: "PuntuaciÃ³n Total",
        stat_max_streak: "Racha MÃ¡xima",

        // Footer & Cookies
        footer_rights: "Todos los derechos reservados.",
        footer_privacy: "PolÃ­tica de Privacidad",
        footer_terms: "TÃ©rminos de Uso",
        cookie_text: "Este sitio utiliza cookies para experiencia y anuncios.",
        cookie_info: "MÃ¡s InformaciÃ³n",
        cookie_accept: "Aceptar",
        btn_close: "Cerrar",

        cookie_info_title: "InformaciÃ³n de Cookies",
        privacy_content: "POLÃTICA DE PRIVACIDAD\n\n1. Datos\nProgreso guardado localmente.\n\n2. Anuncios\nPodemos mostrar anuncios de terceros que usen cookies.\n\n3. Contacto\nContÃ¡ctenos si tiene dudas.",
        terms_content: "TÃ‰RMINOS DE USO\n\n1. Uso\nSolo entretenimiento.\n\n2. Derechos\nContenido protegido.",
        cookie_info_content: "POLÃTICA DE COOKIES\n\nUsamos cookies para funcionalidad y anuncios. Al aceptar, das tu consentimiento.",
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
        this.canGuess = true;

        // DOM Elements
        this.startScreen = document.getElementById('category-screen'); // Entry point
        this.gameContainer = document.getElementById('game-container');
        this.inputEl = document.getElementById('guess-input');
        // ... rest of elements
        this.submitBtn = document.getElementById('submit-btn');
        this.skipBtn = document.getElementById('give-up-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.scoreEl = document.getElementById('score');
        this.streakEl = document.getElementById('streak');
        this.messageEl = document.getElementById('message-area');
        this.timelineEl = document.getElementById('career-timeline');
        this.suggestionsEl = document.getElementById('suggestions');
        this.timerArea = document.getElementById('timer-area');
        /* this.timerVal is missing in original code's variable list but used later. 
           Let's assume it was grabbed or I should grab it now. */
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
        // Expose game instance for HTML onclick helpers
        window.game = this;

        // Default Selections
        this.gameMode = 'classic';

        // Mode Selection Removed - Default to Endless (Classic behavior)
        this.gameMode = 'endless';

        // Initialize Status
        this.playerStatus = 'all';

        // Default status 'all'
        this.statusButtons.forEach(btn => {
            if (btn.dataset.status === this.playerStatus) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Result of initStartScreen

        // Status Selection
        this.statusButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    console.log("Status clicked:", btn.dataset.status);
                    this.statusButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.playerStatus = btn.dataset.status;
                } catch (e) {
                    alert("Status Error: " + e.message);
                }
            });
        });

        // Difficulty Selection (GO TO MODE SELECT)
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

    showLeaderboard() {
        this.showScreen('leaderboard-screen');
        authManager.renderLeaderboard();
    }

    // Navigation Methods
    showScreen(id, pushState = true) {
        const target = document.getElementById(id);
        if (!target) return;

        // Hide all screens
        document.querySelectorAll('.start-screen, .game-container, #multiplayer-screen').forEach(el => el.classList.add('hidden'));
        
        target.classList.remove('hidden');

        if (pushState) {
            history.pushState({ screen: id }, "", "");
        }
    }

    goToSetup(sport) {
        try {
            console.log("Selected Sport:", sport);
            this.currentSport = sport;

            // Update Title dynamically
            if (this.titleEl) {
                let titleKey = 'title_game_football';
                if (sport === 'basketball') titleKey = 'title_game_basketball';
                if (sport === 'nhl') titleKey = 'title_game_nhl';
                if (sport === 'nfl') titleKey = 'title_game_nfl';
                if (sport === 'volleyball') titleKey = 'title_game_volleyball';
                if (sport === 'cricket') titleKey = 'title_game_cricket';
                if (sport === 'f1') titleKey = 'title_game_f1';
                if (sport === 'tennis') titleKey = 'title_game_tennis';

                this.titleEl.innerText = TRANSLATIONS[this.currentLang][titleKey] || titleKey;

                // Update subtitle for national team mode
                const subtitleKey = 'subtitle_game';
                const subEl = document.querySelector('header p');
                if (subEl) subEl.innerText = TRANSLATIONS[this.currentLang][subtitleKey];
            }

            if (sport === 'f1' || sport === 'tennis') {
                this.playerStatus = 'all';
                this.selectedDifficulty = 'all'; // New 'all' state
                this.showScreen('gametype-screen'); // Skip Setup
            } else if (sport === 'esports') {
                this.showScreen('esports-screen'); // Go to sub-menu
            } else {
                this.showScreen('setup-screen');
            }
        } catch (e) {
            alert("Nav Error: " + e.message);
        }
    }

    startGameWithMode(mode) {
        console.log("Starting with mode:", mode);
        this.gameMode = mode;
        this.startGame(this.selectedDifficulty);
    }

    selectEsport(subGame) {
        // Handle E-Sports sub-selection
        try {
            console.log("Selected E-Sport:", subGame);
            this.currentSport = 'esports_' + subGame; // e.g., 'esports_lol'

            // Set Titles dynamically (Generic for now, or specific if needed)
            this.titleEl.innerText = `${TRANSLATIONS[this.currentLang]['esports']} - ${subGame.toUpperCase()}`;

            // Skip Difficulty/Status -> Go to Mode Select
            this.playerStatus = 'all';
            this.selectedDifficulty = 'all';
            this.showScreen('gametype-screen');
        } catch (e) {
            alert("Esports Select Error: " + e.message);
        }
    }

    startGame(difficulty) {
        try {
            console.log("Starting game with Difficulty:", difficulty, "Status:", this.playerStatus);

            // Check global players
            if (typeof players === 'undefined') {
                alert("Veri tabanÄ± hatasÄ±! (players)");
                return;
            }

            // Filter by Difficulty AND Status
            let sourceArray = players; // Default football
            if (this.currentSport === 'basketball') {
                if (typeof basketballPlayers === 'undefined') {
                    alert("Basketbol verisi yÃ¼klenemedi!");
                    return;
                }
                sourceArray = basketballPlayers; // Fix: Assign to sourceArray
            } else if (this.currentSport === 'nhl') {
                if (typeof nhlPlayers === 'undefined') {
                    alert("NHL verisi yÃ¼klenemedi!");
                    return;
                }
                sourceArray = nhlPlayers;
            } else if (this.currentSport === 'nfl') {
                if (typeof nflPlayers === 'undefined') {
                    alert("NFL verisi yÃ¼klenemedi!");
                    return;
                }
                sourceArray = nflPlayers;
            } else if (this.currentSport === 'volleyball') {
                if (typeof volleyballPlayers === 'undefined') {
                    alert("Voleybol verisi yÃ¼klenemedi!");
                    return;
                }
                sourceArray = volleyballPlayers;
            } else if (this.currentSport === 'cricket') {
                if (typeof cricketPlayers === 'undefined') {
                    alert("Kriket verisi yÃ¼klenemedi!");
                    return;
                }
                sourceArray = cricketPlayers;
            } else if (this.currentSport === 'f1') {
                if (typeof f1Players === 'undefined') {
                    alert("Formula 1 verisi yÃ¼klenemedi!");
                    return;
                }
                sourceArray = f1Players;
            } else if (this.currentSport === 'tennis') {
                if (typeof tennisPlayers === 'undefined') {
                    alert("Tenis verisi yÃ¼klenemedi!");
                    return;
                }
                sourceArray = tennisPlayers;
            } else if (this.currentSport === 'esports_lol') {
                if (typeof lolPlayers === 'undefined') { alert("LoL verisi yok!"); return; }
                sourceArray = lolPlayers;
            } else if (this.currentSport === 'esports_cs') {
                if (typeof csPlayers === 'undefined') { alert("CS verisi yok!"); return; }
                sourceArray = csPlayers;
            } else if (this.currentSport === 'esports_valorant') {
                if (typeof valorantPlayers === 'undefined') { alert("Valorant verisi yok!"); return; }
                sourceArray = valorantPlayers;
            }

            this.activePlayers = sourceArray.filter(p => {
                const diffMatch = (difficulty === 'all' || !difficulty) || p.difficulty === difficulty;
                const statusMatch = (this.playerStatus === 'all' || !this.playerStatus) || p.status === this.playerStatus;
                return diffMatch && statusMatch;
            });

            console.log(`Filtered Players Count: ${this.activePlayers.length} for ${difficulty}/${this.playerStatus}`);

            // RANDOMIZE: Shuffle the filtered list so every game session is unique
            this.activePlayers = this.shuffleArray([...this.activePlayers]);

            if (this.activePlayers.length === 0) {
                alert(`HATA: ${this.currentSport} kategorisinde bu zorlukta oyuncu bulunamadÄ±!`);
                return;
            }

            // Setup UI based on mode
            this.updateUIForMode();
            this.currentIndex = 0; // New index-based tracking
            this.score = 0; // Reset score
            this.usedPlayers = new Set(); // Keep for backward compat/checks
            this.questionCount = 0; // Reset question count

            if (this.gameMode === 'quiz') {
                this.initJokers();
                this.timer = 15; // 15s for quiz
            }

            // UI Transition
            document.querySelectorAll('.start-screen').forEach(el => el.classList.add('hidden'));
            this.gameContainer.classList.remove('hidden');

            // Force redraw/reflow hack
            void this.gameContainer.offsetWidth;
            this.gameContainer.style.opacity = "1";

            this.nextRound();
            if (this.gameMode === 'timed' || this.gameMode === 'quiz') {
                this.startTimer();
            }
        } catch (e) {
            alert("StartGame Error: " + e.message + "\n" + e.stack);
            console.error(e);
        }
    }

    addEventListeners() {
        this.submitBtn.addEventListener('click', () => this.checkGuess());
        this.skipBtn.addEventListener('click', () => this.giveUp());
        this.hintBtn.addEventListener('click', () => this.showHint());

        this.inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkGuess();
        });

        this.inputEl.addEventListener('input', (e) => this.handleInput(e.target.value));

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.input-area')) {
                this.suggestionsEl.classList.remove('visible');
            }
        });

        // Navigation
        // if (this.backBtn) this.backBtn.addEventListener('click', () => this.returnToMenu());
        if (this.titleEl) this.titleEl.addEventListener('click', () => this.returnToMenu());
    }

    returnToMenu() {
        const msg = TRANSLATIONS[this.currentLang]['confirm_exit'];
        if (confirm(msg)) {
            location.reload();
        }
    }

    startTimer() {
        this.timer = 60;
        this.timer = this.gameMode === 'quiz' ? 15 : 60; // 15s for quiz, 60s for timed
        this.timerVal.innerText = this.timer;
        this.timerArea.classList.remove('hidden');
        // Fix: clear any existing interval
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            this.timer--;
            if (typeof sounds !== 'undefined') sounds.playTick();
            this.timerVal.innerText = this.timer;

            if (this.timer <= 10) {
                this.timerArea.classList.add('danger');
            } else {
                this.timerArea.classList.remove('danger');
            }

            if (this.timer <= 0) {
                this.gameOver();
            }
        }, 1000);
    }

    gameOver() {
        clearInterval(this.timerInterval);
        if (typeof authManager !== 'undefined') {
            if (this.gameMode === 'timed') {
                authManager.updateStats(this.currentSport, this.streak, this.score);
            }
        }
        const t = TRANSLATIONS[this.currentLang];
        this.gameContainer.innerHTML = `
            <div class="game-over-premium" style="text-align:center; padding: 40px; animation: pageEnter 0.6s ease-out both;">
                <h1 class="title">${t.msg_time_up || 'SÃœRE DOLDU!'}</h1>
                <div class="stats" style="margin: 20px 0; justify-content: center; gap: 20px;">
                    <div class="score-item">${t.msg_total_score || 'Toplam Skor'}: <b style="font-size: 24px;">${this.score}</b></div>
                </div>
                <button class="guess" onclick="location.reload()" style="margin-top:20px; width: 100%; max-width: 250px;">${t.btn_play_again || 'Tekrar Oyna'}</button>
            </div>
        `;
    }

    nextRound() {
        this.canGuess = true; // Unlock
        try {
            // Quiz Mode Limit: 10 Questions
            if (this.gameMode === 'quiz') {
                if (this.questionCount >= 10) {
                    this.gameOver();
                    return;
                }
                this.questionCount++;
            }

            if (this.currentIndex >= this.activePlayers.length) {
                if (this.timerInterval) clearInterval(this.timerInterval);
                this.showMessage(TRANSLATIONS[this.currentLang]['msg_finished'], "success");
                setTimeout(() => location.reload(), 3000);
                return;
            }

            let player = this.activePlayers[this.currentIndex];
            console.log(`Current Index: ${this.currentIndex}, Next Player: ${player ? player.name : 'NONE'}`);
            this.currentIndex++;
            this.currentPlayer = player;
            this.usedPlayers.add(player.name);

            this.renderCareer(this.currentPlayer.career);
            this.messageEl.classList.add('hidden');

            if (this.gameMode === 'quiz') {
                this.startQuizRound();
            } else {
                if (this.inputEl) {
                    this.inputEl.value = '';
                    this.inputEl.focus();
                }
                // Reset Hint State
                this.hintStep = 0;
                if (this.hintBtn) {
                    this.hintBtn.disabled = false;
                    const hintText = TRANSLATIONS[this.currentLang]['btn_hint'];
                    this.hintBtn.innerText = this.gameMode === 'timed' ? `${hintText} (-5s)` : hintText;
                }
                if (this.suggestionsEl) this.suggestionsEl.classList.remove('visible');
            }

        this.updateStats();
    } catch (e) {
        alert("NextRound Error: " + e.message);
        console.error(e);
    }
}

    renderCareer(career) {
        console.log("Rendering Career:", career);
        if (!career || career.length === 0) return;

        this.timelineEl.innerHTML = '';
        
        career.forEach((step, index) => {
            const el = document.createElement('div');
            el.className = 'path-item';
            el.style.animationDelay = `${index * 0.1}s`;
            el.innerHTML = `<span class="years">${step.years}</span><span class="team">${step.team}</span>`;
            this.timelineEl.appendChild(el);
        });
    }



    checkGuess() {
        if (!this.canGuess) {
            console.log("Guessing is currently locked (Transitioning...)");
            return;
        }
        const guess = this.inputEl.value.trim().toLowerCase();
        if (!guess) return;

        const targetName = this.normalizeString(this.currentPlayer.name);
        const guessName = this.normalizeString(guess);
        const t = TRANSLATIONS[this.currentLang];

        if (targetName === guessName || this.checkPartialMatch(guessName, targetName)) {
            if (typeof sounds !== 'undefined') sounds.playCorrect();
            this.handleWin();
        } else {
            if (typeof sounds !== 'undefined') sounds.playWrong();
            this.score = Math.max(0, this.score - 10); // Deduct 10 points
            this.updateStats();
            this.showMessage(t.msg_wrong || 'Wrong Answer!', "error");
            this.resetStreak();
            if (this.gameMode === 'timed') {
                this.timer = Math.max(0, this.timer - 5); // 5 sec penalty
                this.timerVal.innerText = this.timer;
                this.showFloatingText("-5s", "red");
            }
        }
    }

    handleWin() {
        if (!this.canGuess) return;
        this.canGuess = false; // Lock guessing
        
        const t = TRANSLATIONS[this.currentLang];
        this.score += 10; // +10 points flat
        this.streak++;
        this.updateStats(); // Internal UI update
        
        // Multiplayer Sync
        if (typeof multiplayerManager !== 'undefined' && multiplayerManager.roomID) {
            multiplayerManager.updateMyScore(this.score);
        }
        if (typeof authManager !== 'undefined') {
            // Only save stats if in TIMED mode
            if (this.gameMode === 'timed') {
                authManager.updateStats(this.currentSport, this.streak, this.score);
            }
        }
        this.showMessage(`${t.msg_correct || 'Correct!'} | ${this.currentPlayer.flag} ${this.currentPlayer.name}`, "success");

        if (this.gameMode === 'timed') {
            this.timer += 5; // +5 reward
            this.timerVal.innerText = this.timer;
            this.showFloatingText("+5s", "green");
        }

        console.log("Win Handled. Moving to next in 1.5s...");
        setTimeout(() => {
            console.log("Timeout fired. Calling nextRound...");
            this.nextRound();
        }, 1500);
    }

    showFloatingText(text, color) {
        this.timerArea.style.transform = "scale(1.2)";
        this.timerArea.style.borderColor = color;
        this.timerArea.style.color = color;
        setTimeout(() => {
            this.timerArea.style.transform = "scale(1)";
            this.timerArea.style.borderColor = "var(--border-color)";
            this.timerArea.style.color = "var(--warning)";
        }, 300);
    }

    giveUp() {
        const t = TRANSLATIONS[this.currentLang];
        this.showMessage(`${t.msg_pass || 'Passed!'} ${this.currentPlayer.flag} ${this.currentPlayer.name}`, "error");
        this.resetStreak();
        setTimeout(() => {
            this.nextRound();
        }, 2000);
    }

    showHint() {
        if (this.gameMode === 'timed') {
            this.timer = Math.max(0, this.timer - 5);
            this.timerVal.innerText = this.timer;
            this.showFloatingText("-5s", "orange");
        }

        const t = TRANSLATIONS[this.currentLang];

        if (this.hintStep === 0) {
            // First Hint: Position
            this.showMessage(`${t.hint_1_prefix || 'Position:'} ${this.currentPlayer.position}`, "success");
            this.hintStep = 1;
            const penaltyText = this.gameMode === 'timed' ? ` (-5s)` : "";
            this.hintBtn.innerText = `${t.btn_hint || 'Ä°pucu'} 2${penaltyText}`; 
        } else if (this.hintStep === 1) {
            // Second Hint: Nationality
            this.showMessage(`${t.hint_2_prefix || 'Nationality:'} ${this.currentPlayer.flag} ${this.currentPlayer.nationality}`, "success");
            this.hintStep = 2; // Locked
            this.hintBtn.disabled = true;
            this.hintBtn.innerText = t.msg_used_hint || 'Ä°pucu KullanÄ±ldÄ±';
        }
    }

    checkPartialMatch(guess, target) {
        const targetParts = target.split(' ');
        if (targetParts.length > 1) {
            return targetParts.some(part => part === guess && part.length > 3);
        }
        return false;
    }

    normalizeString(str) {
        if (!str) return "";
        return str
            .replace(/Ä/g, 'g')
            .replace(/Ãœ/g, 'u')
            .replace(/Å/g, 's')
            .replace(/I/g, 'i')
            .replace(/Ä°/g, 'i')
            .replace(/Ã–/g, 'o')
            .replace(/Ã‡/g, 'c')
            .replace(/ÄŸ/g, 'g')
            .replace(/Ã¼/g, 'u')
            .replace(/ÅŸ/g, 's')
            .replace(/Ä±/g, 'i')
            .replace(/Ã¶/g, 'o')
            .replace(/Ã§/g, 'c')
            .toLowerCase();
    }

    resetStreak() {
        this.streak = 0;
        this.updateStats();
    }

    updateStats() {
        this.scoreEl.innerText = this.score;
        this.streakEl.innerText = this.streak;
        this.scoreEl.classList.add("up");
        setTimeout(() => this.scoreEl.classList.remove("up"), 300);
    }

    showMessage(text, type) {
        this.messageEl.innerText = text;
        this.messageEl.className = `message ${type}`;
        this.messageEl.classList.remove('hidden');
    }

    handleInput(val) {
        if (!val || val.length < 1) {
            this.suggestionsEl.classList.remove('visible');
            return;
        }

        const inputVal = this.normalizeString(val);
        let matches = [];

        // Filter active players (existing logic)
        const seen = new Set();
        for (const p of this.activePlayers) {
            const normalizedName = this.normalizeString(p.name);
            if (normalizedName.includes(inputVal) && !seen.has(normalizedName)) {
                seen.add(normalizedName);
                matches.push(p);
                if (matches.length >= 5) break;
            }
        }

        this.renderSuggestions(matches);
    }

    renderSuggestions(matches) {
        this.suggestionsEl.innerHTML = '';
        if (matches.length === 0) {
            this.suggestionsEl.classList.remove('visible');
            return;
        }

        matches.forEach(player => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerText = player.name;
            div.addEventListener('click', (e) => {
                console.log("Suggestion clicked:", player.name); // DEBUG
                e.stopPropagation(); // prevent closing immediately
                this.inputEl.value = player.name;
                this.suggestionsEl.classList.remove('visible');
                this.inputEl.focus();
            });
            this.suggestionsEl.appendChild(div);
        });
        this.suggestionsEl.classList.add('visible');
        console.log("Suggestions rendered and visible for:", matches.map(m => m.name)); // DEBUG
    }
    // --- Quiz Mode Logic ---

    updateUIForMode() {
        // Reset manual display overrides
        if (this.inputEl && this.inputEl.parentElement) {
            this.inputEl.parentElement.style.display = '';
        }

        // Quiz mode logic removed
        this.gameContainer.classList.remove('quiz-mode');
        if (this.hintBtn) this.hintBtn.style.display = 'block';
    }

    startQuizRound() {
        this.quizOptions = this.generateQuizOptions();
        this.renderQuizButtons();
        this.canGuess = true;
        this.doubleDipActive = false;

        // Timer handling only if we decide Quiz has a timer (User asked for Freeze Time joker, imply timer)
        // Let's enable timer for Quiz mode too, maybe strict 15s?
        // User said "Freeze time", suggesting timed pressure.
        if (!this.timerInterval) this.startTimer();
    }

    generateQuizOptions() {
        // Correct Answer
        const correct = this.currentPlayer;

        // 3 Wrong Answers (Distractors)
        // Try to get same nationality or position or difficulty
        let distractors = this.activePlayers
            .filter(p => p.name !== correct.name)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        // Fallback if not enough
        while (distractors.length < 3) {
            const random = players[Math.floor(Math.random() * players.length)];
            if (random.name !== correct.name && !distractors.includes(random)) {
                distractors.push(random);
            }
        }

        return [...distractors, correct].sort(() => 0.5 - Math.random());
    }

    renderQuizButtons() {
        const grid = document.getElementById('quiz-options');
        grid.innerHTML = '';

        const letters = ['A', 'B', 'C', 'D'];

        this.quizOptions.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span style="color:var(--accent); font-weight:800; margin-right:8px;">${letters[index]})</span> ${opt.name}`;
            btn.dataset.name = opt.name;
            btn.onclick = () => this.handleQuizGuess(btn, opt);
            grid.appendChild(btn);
        });
    }

    handleQuizGuess(btn, option) {
        if (!this.canGuess) return;

        const isCorrect = (option.name === this.currentPlayer.name);

        if (isCorrect) {
            if (typeof sounds !== 'undefined') sounds.playCorrect();
            btn.classList.add('correct');
            this.canGuess = false;
            this.handleWin();
        } else {
            if (typeof sounds !== 'undefined') sounds.playWrong();
            btn.classList.add('wrong');
            btn.disabled = true;

            if (this.doubleDipActive) {
                this.showMessage(TRANSLATIONS[this.currentLang]['joker_double_dip_active'] || "Double Dip Active! You have one more try.", "warning");
                this.doubleDipActive = false; // Consumed
                return;
            }

            this.score = Math.max(0, this.score - 10);
            this.updateStats();
            this.showMessage("YanlÄ±ÅŸ Cevap! -10 Puan", "error");
            this.resetStreak();

            // Show correct one
            const correctBtn = Array.from(document.querySelectorAll('.option-btn'))
                .find(b => b.dataset.name === this.currentPlayer.name);
            if (correctBtn) correctBtn.classList.add('correct');

            this.canGuess = false;
            // Removed duplicate setTimeout as handleWin handles it if correct, 
            // or we need a specific one for wrong quiz answer
            if (!isCorrect) {
                setTimeout(() => this.nextRound(), 2000);
            }
        }
    }

    // Jokers
    useJoker(type) {
        if (this.jokers[type]) return; // Already used

        const btn = document.getElementById(`joker-${type === '50:50' ? '50' : type === '2x' ? '2x' : 'time'}`);
        if (!btn) return;

        this.jokers[type] = true;
        btn.disabled = true;
        btn.classList.add('active'); // Visual feedback that it WAS used this game/round? 
        // Actually usually jokers are once per game.
        // But for Endless mode, maybe reset every X rounds? 
        // Let's assume once per session for now or reset on game over.

        if (type === '50:50') {
            const wrongBtns = Array.from(document.querySelectorAll('.option-btn'))
                .filter(b => b.dataset.name !== this.currentPlayer.name);

            // Disable 2 random wrong buttons
            wrongBtns.slice(0, 2).forEach(b => {
                b.disabled = true;
                b.style.opacity = '0.3';
            });
            this.showMessage("50:50 KullanÄ±ldÄ±! Ä°ki yanlÄ±ÅŸ ÅŸÄ±k elendi.", "success");
        }
        else if (type === '2x') {
            this.doubleDipActive = true;
            this.showMessage("Ã‡ift Cevap HakkÄ± TanÄ±mlandÄ±!", "success");
        }
        else if (type === 'time') {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.showMessage("SÃ¼re Donduruldu!", "success");
        }
    }

    initJokers() {
        this.jokers = { '50:50': false, '2x': false, 'time': false };
        document.getElementById('joker-50').disabled = false;
        document.getElementById('joker-2x').disabled = false;
        document.getElementById('joker-time').disabled = false;

        document.getElementById('joker-50').onclick = () => this.useJoker('50:50');
        document.getElementById('joker-2x').onclick = () => this.useJoker('2x');
        document.getElementById('joker-time').onclick = () => this.useJoker('time');
    }
}


// =====================================================
// DAILY CHALLENGE SYSTEM
// =====================================================
// DAILY CHALLENGE SYSTEM
// =====================================================
class DailyChallenge {
    constructor() {
        this.todayKey = this.getTodayKey();
        this.maxAttempts = 5;
        this.currentSport = null;
        this.player = null;
    }

    getTodayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    getStorageKey(sport) {
        return `dc_${sport}_${this.todayKey}`;
    }

    getStreakKey(sport) {
        return `streak_dc_${sport}`;
    }

    getState(sport) {
        return JSON.parse(localStorage.getItem(this.getStorageKey(sport)) || 'null') || { attempts: 0, won: false, guesses: [], hintsUsed: 0 };
    }

    saveState(sport, state) {
        localStorage.setItem(this.getStorageKey(sport), JSON.stringify(state));
    }

    getStreak(sport) {
        return parseInt(localStorage.getItem(this.getStreakKey(sport)) || '0');
    }

    setStreak(sport, val) {
        localStorage.setItem(this.getStreakKey(sport), val);
    }

    getDailyPlayer(sport) {
        let sourceArray = [];
        if (sport === 'football') sourceArray = players;
        else if (sport === 'basketball') sourceArray = basketballPlayers;
        else if (sport === 'nhl') sourceArray = nhlPlayers;
        else if (sport === 'nfl') sourceArray = nflPlayers;
        else if (sport === 'volleyball') sourceArray = volleyballPlayers;
        else if (sport === 'cricket') sourceArray = cricketPlayers;
        else if (sport === 'f1') sourceArray = f1Players;
        else if (sport === 'tennis') sourceArray = tennisPlayers;
        else if (sport === 'esports_lol') sourceArray = lolPlayers;
        else if (sport === 'esports_cs') sourceArray = csPlayers;
        else if (sport === 'esports_valorant') sourceArray = valorantPlayers;

        if (!sourceArray || sourceArray.length === 0) return null;

        const dateStr = this.todayKey.replace(/-/g, '');
        // Use sport name in seed to make players different across sports
        let seed = parseInt(dateStr.slice(-6)) + sport.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        seed = ((seed * 1664525 + 1013904223) >>> 0);
        const idx = seed % sourceArray.length;
        return sourceArray[idx];
    }

    isCompleted(sport) {
        const state = this.getState(sport);
        return state && (state.won || state.attempts >= this.maxAttempts);
    }

    open() {
        document.getElementById('dc-modal').classList.remove('hidden');
        if (!this.currentSport) {
            this.showCategorySelect();
        } else {
            this.playSport(this.currentSport);
        }
    }

    close() {
        document.getElementById('dc-modal').classList.add('hidden');
        this.currentSport = null;
    }

    showCategorySelect() {
        this.currentSport = null;
        const categories = [
            { id: 'football', name: 'Futbol', icon: 'âš½' },
            { id: 'basketball', name: 'Basketbol', icon: 'ğŸ€' },
            { id: 'volleyball', name: 'Voleybol', icon: 'ğŸ' },
            { id: 'tennis', name: 'Tenis', icon: 'ğŸ¾' },
            { id: 'f1', name: 'Formula 1', icon: 'ğŸï¸' },
            { id: 'esports_lol', name: 'LoL', icon: 'âš”ï¸' },
            { id: 'esports_cs', name: 'CS', icon: 'ğŸ”«' },
            { id: 'esports_valorant', name: 'Valorant', icon: 'ğŸ¯' },
            { id: 'nfl', name: 'NFL', icon: 'ğŸˆ' },
            { id: 'nhl', name: 'NHL', icon: 'ğŸ’' },
            { id: 'cricket', name: 'Kriket', icon: 'ğŸ' }
        ];

        let cardsHTML = categories.map(cat => {
            const completed = this.isCompleted(cat.id);
            const streak = this.getStreak(cat.id);
            return `
                <div class="dc-cat-card ${completed ? 'completed' : ''}" onclick="dailyChallenge.playSport('${cat.id}')">
                    <div class="dc-cat-icon">${cat.icon}</div>
                    <div class="dc-cat-name">${cat.name}</div>
                    ${streak > 0 ? `<div class="dc-cat-streak">ğŸ”¥ ${streak}</div>` : ''}
                    ${completed ? '<div class="dc-cat-status">âœ“ TamamlandÄ±</div>' : ''}
                </div>
            `;
        }).join('');

        document.getElementById('dc-modal').innerHTML = `
            <div class="dc-box">
                <button class="dc-close" onclick="dailyChallenge.close()">âœ•</button>
                <div class="dc-header">
                    <div class="dc-fire">ğŸ”¥</div>
                    <h2 class="dc-title">GÃ¼nlÃ¼k Meydan Okuma</h2>
                    <p class="dc-date">Kategori SeÃ§</p>
                </div>
                <div class="dc-cat-grid">
                    ${cardsHTML}
                </div>
            </div>
        `;
    }

    playSport(sport) {
        this.currentSport = sport;
        this.player = this.getDailyPlayer(sport);
        if (!this.player) {
            alert("Veri yÃ¼klenemedi!");
            this.showCategorySelect();
            return;
        }
        this.renderModal();
    }

    getVisibleClues(player, attempts) {
        const totalTeams = player.career.length;
        // Revealing teams first
        // attempts = 0 -> 1 team
        // attempts = 1 -> 2 teams
        // ...
        const revealedTeamsCount = Math.min(1 + attempts, totalTeams);
        const career = player.career.slice(0, revealedTeamsCount);
        
        let extraInfo = [];
        // Only show extra info if all teams are already revealed
        if (attempts >= totalTeams) {
            extraInfo.push(`ğŸ“ Ãœlke: ${player.nationality}`);
        }
        if (attempts >= totalTeams + 1) {
            extraInfo.push(`ğŸ‘¤ Mevki: ${player.position}`);
        }
        
        return { career, extraInfo };
    }

    renderModal() {
        const sport = this.currentSport;
        const p = this.player;
        const state = this.getState(sport);
        const done = this.isCompleted(sport);
        const { career, extraInfo } = this.getVisibleClues(p, state.attempts);
        const attemptsLeft = this.maxAttempts - state.attempts;

        const careerHTML = career.map(s =>
            `<div class="dc-career-item"><span class="dc-year">${s.years}</span><span class="dc-team">${s.team}</span></div>`
        ).join('');

        const extraHTML = extraInfo.map(info => `<div class="dc-info-item">${info}</div>`).join('');

        const guessesHTML = state.guesses.map(g =>
            `<div class="dc-guess ${g.correct ? 'correct' : 'wrong'}">${g.correct ? 'âœ…' : 'âŒ'} ${g.text}</div>`
        ).join('');

        let resultSection = '';
        if (done) {
            const streak = this.getStreak(sport);
            resultSection = `
                <div class="dc-result ${state.won ? 'won' : 'lost'}">
                    <div class="dc-result-icon">${state.won ? 'ğŸ†' : 'ğŸ’€'}</div>
                    <div class="dc-result-text">${state.won ? 'Tebrikler! Bildin!' : 'Maalesef OlmadÄ±!'}</div>
                    <div class="dc-answer">Cevap: <strong>${p.name}</strong></div>
                    <div class="dc-streak-info">GÃ¼ncel Seri: ğŸ”¥ ${streak}</div>
                    <button class="dc-share-btn" onclick="dailyChallenge.share('${sport}')">ğŸ“‹ Sonucu PaylaÅŸ</button>
                    <div class="dc-next-time">Yeni oyuncu yarÄ±n gelecek!</div>
                </div>`;
        }

        const inputSection = !done ? `
            <div class="dc-input-wrap">
                <input type="text" id="dc-guess-input" class="dc-input" placeholder="Oyuncu ismini yaz..." autocomplete="off" oninput="dailyChallenge.handleSuggest(this.value)">
                <div id="dc-suggestions" class="dc-suggestions hidden"></div>
                <button class="dc-submit-btn" onclick="dailyChallenge.submitGuess()">Tahmin Et</button>
            </div>
            <div class="dc-attempts-left">ğŸ¯ ${attemptsLeft} hakkÄ±n kaldÄ±</div>` : '';

        // Category Selector Back Button + Close Modal button
        document.getElementById('dc-modal').innerHTML = `
            <div class="dc-box">
                <div class="dc-top-nav" style="display:flex; justify-content:space-between; width:100%; margin-bottom:20px;">
                    <button class="dc-back-btn" onclick="dailyChallenge.showCategorySelect()" style="color:var(--text-secondary); font-weight:600; background:none; border:none; cursor:pointer;">â† Kategoriye DÃ¶n</button>
                    <button class="dc-close-btn" onclick="dailyChallenge.close()" style="color:var(--text-secondary); font-weight:600; background:none; border:none; cursor:pointer;">Kapat âœ•</button>
                </div>
                <div class="dc-header">
                    <div class="dc-fire">ğŸ”¥</div>
                    <h2 class="dc-title">GÃ¼nlÃ¼k ${this.getSportName(sport)}</h2>
                    <p class="dc-date">${this.todayKey}</p>
                </div>
                <div class="dc-clues">
                    <p class="dc-clue-label">Kariyer Yolu</p>
                    ${careerHTML}
                    <div class="dc-extra-infos">${extraHTML}</div>
                </div>
                ${guessesHTML ? `<div class="dc-guesses">${guessesHTML}</div>` : ''}
                ${inputSection}
                ${resultSection}
                <div style="margin-top:20px; text-align:center;">
                    <button onclick="dailyChallenge.close()" style="background:none; border:none; color:var(--text-secondary); font-size:0.85rem; cursor:pointer; text-decoration:underline;">Ana MenÃ¼ye DÃ¶n</button>
                </div>
            </div>
        `;

        if (!done) {
            const inp = document.getElementById('dc-guess-input');
            if (inp) {
                inp.addEventListener('keypress', e => { if (e.key === 'Enter') this.submitGuess(); });
                inp.focus();
            }
        }
    }

    getSportName(sport) {
        const names = { football: 'Futbol', basketball: 'Basketbol', volleyball: 'Voleybol', esports_lol: 'LoL', esports_cs: 'CS', f1: 'F1', tennis: 'Tenis' };
        return names[sport] || sport;
    }

    handleSuggest(val) {
        if (!val || val.length < 2) {
            document.getElementById('dc-suggestions')?.classList.add('hidden');
            return;
        }
        
        // Dynamic source mapping based on category
        let sourceArray = [];
        const sport = this.currentSport;
        
        if (sport === 'football') sourceArray = players;
        else if (sport === 'basketball') sourceArray = basketballPlayers;
        else if (sport === 'volleyball') sourceArray = volleyballPlayers;
        else if (sport === 'f1') sourceArray = f1Players;
        else if (sport === 'tennis') sourceArray = tennisPlayers;
        else if (sport === 'esports_lol') sourceArray = lolPlayers;
        else if (sport === 'esports_cs') sourceArray = csPlayers;
        else if (sport === 'esports_valorant') sourceArray = valorantPlayers;
        else if (sport === 'nhl') sourceArray = nhlPlayers;
        else if (sport === 'nfl') sourceArray = nflPlayers;
        else if (sport === 'cricket') sourceArray = cricketPlayers;
        
        // Fallback to football if something goes wrong
        if (!sourceArray || sourceArray.length === 0) sourceArray = players;
        
        const norm = v => v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const matches = sourceArray.filter(p => norm(p.name).includes(norm(val))).slice(0, 6);
        const box = document.getElementById('dc-suggestions');
        if (!box) return;
        if (matches.length === 0) { box.classList.add('hidden'); return; }
        box.innerHTML = matches.map(p =>
            `<div class="dc-suggestion-item" onclick="dailyChallenge.pickSuggestion('${p.name.replace(/'/g,"&#39;")}')">${p.flag || 'ğŸ‘¤'} ${p.name}</div>`
        ).join('');
        box.classList.remove('hidden');
    }

    pickSuggestion(name) {
        const inp = document.getElementById('dc-guess-input');
        if (inp) inp.value = name;
        document.getElementById('dc-suggestions')?.classList.add('hidden');
    }

    submitGuess() {
        const sport = this.currentSport;
        const state = this.getState(sport);
        const inp = document.getElementById('dc-guess-input');
        if (!inp) return;
        const guess = inp.value.trim();
        if (!guess) return;

        const p = this.player;
        const norm = v => v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const correct = norm(guess) === norm(p.name) ||
            norm(p.name).split(' ').some(part => part.length > 3 && norm(guess) === part);

        state.attempts++;
        state.guesses.push({ text: guess, correct });
        
        if (correct) {
            state.won = true;
            this.setStreak(sport, this.getStreak(sport) + 1);
        } else if (state.attempts >= this.maxAttempts) {
            this.setStreak(sport, 0); // Reset streak on fail
        }

        this.saveState(sport, state);
        this.renderModal();
        this.updateBadge();
    }

    share(sport) {
        const state = this.getState(sport);
        const emojiLine = state.guesses.map(g => g.correct ? 'ğŸŸ©' : 'ğŸŸ¥').join('') + ` (${state.attempts}/${this.maxAttempts})`;
        const text = `ğŸ”¥ CareerGuess - GÃ¼nlÃ¼k ${this.getSportName(sport)} ${this.todayKey}\n${emojiLine}\nSerim: ğŸ”¥ ${this.getStreak(sport)}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.dc-share-btn');
                if (btn) { btn.textContent = 'âœ… KopyalandÄ±!'; setTimeout(() => btn.textContent = 'ğŸ“‹ PaylaÅŸ', 2000); }
            });
        }
    }

    updateBadge() {
        const badge = document.querySelector('.daily-challenge-badge');
        if (!badge) return;
        // Simple indicator if ANY challenge is available
        const sports = ['football', 'basketball', 'volleyball'];
        const allDone = sports.every(s => this.isCompleted(s));
        if (allDone) {
            badge.innerHTML = '<span>âœ…</span><span>BÃ¼tÃ¼n GÃ¼nlÃ¼kler Bitti!</span>';
            badge.style.color = '#4ade80';
        } else {
            badge.innerHTML = '<span>ğŸ”¥</span><span>GÃ¼nlÃ¼k Meydan Okuma</span>';
            badge.style.color = '#facc15';
        }
    }

    init() {
        this.updateBadge();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded");
    new Game();
    window.dailyChallenge = new DailyChallenge();
    dailyChallenge.init();

    // Make badge clickable
    const badge = document.querySelector('.daily-challenge-badge');
    if (badge) badge.style.cursor = 'pointer', badge.onclick = () => dailyChallenge.open();
});


// Global instances for utility management

// ========================
// AUTHENTICATION MANAGER
// ========================
class AuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('guess_player_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('guess_player_current_user')) || null;

        // DOM Elements
        this.overlay = document.getElementById('auth-overlay');
        this.loginForm = document.getElementById('login-form-container');
        this.signupForm = document.getElementById('signup-form-container');

        // Inputs
        this.loginUser = document.getElementById('login-username');
        this.loginPass = document.getElementById('login-password');
        this.signupUser = document.getElementById('signup-username');
        this.signupEmail = document.getElementById('signup-email');
        this.signupPass = document.getElementById('signup-password');

        // Buttons
        this.loginBtn = document.getElementById('login-submit-btn');
        this.signupBtn = document.getElementById('signup-submit-btn');

        // Auth Buttons on Main Screen
        this.authContainer = document.querySelector('.auth-buttons');
        this.avatarTab = 'all';

        this.init();
    }

    init() {
        // Event Listeners
        if (this.loginBtn) this.loginBtn.onclick = () => this.login();
        if (this.signupBtn) this.signupBtn.onclick = () => this.signup();

        if (document.getElementById('switch-to-signup'))
            document.getElementById('switch-to-signup').onclick = () => this.showForm('signup');

        if (document.getElementById('switch-to-login'))
            document.getElementById('switch-to-login').onclick = () => this.showForm('login');

        // Main Screen Buttons (Handled by inline onclicks or reused here if needed)
        // document.querySelector('.auth-btn.login').onclick = () => this.openModal('login');
        // document.querySelector('.auth-btn.signup').onclick = () => this.openModal('signup');

        // Check Logic
        this.updateUI();
    }

    openModal(mode) {
        if (!this.overlay) return;
        this.overlay.classList.remove('hidden');
        this.showForm(mode);
    }

    closeModal() {
        if (!this.overlay) return;
        this.overlay.classList.add('hidden');
        this.clearInputs();
        document.querySelectorAll('.error-msg').forEach(el => el.classList.add('hidden'));
    }

    showForm(mode) {
        if (mode === 'login') {
            this.loginForm.classList.remove('hidden');
            this.signupForm.classList.add('hidden');
        } else {
            this.loginForm.classList.add('hidden');
            this.signupForm.classList.remove('hidden');
        }
    }

    signup() {
        console.log("Signup clicked");
        const username = this.signupUser.value.trim();
        const email = this.signupEmail.value.trim();
        const password = this.signupPass.value;
        const errorEl = document.getElementById('signup-error');

        if (username.length < 3 || password.length < 4) {
            this.showError(errorEl, "KullanÄ±cÄ± adÄ± en az 3, ÅŸifre en az 4 karakter olmalÄ±.");
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showError(errorEl, "Bu kullanÄ±cÄ± adÄ± zaten alÄ±nmÄ±ÅŸ.");
            return;
        }

        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password, // In a real app, hash this!
            avatar: 'ğŸ‘¤',
            stats: {}
        };

        this.users.push(newUser);
        this.saveUsers();

        // Auto login
        this.currentUser = newUser;
        this.saveCurrentUser();

        this.closeModal();
        this.updateUI();
        alert("KayÄ±t baÅŸarÄ±lÄ±! HoÅŸ geldin, " + username);
    }

    login() {
        console.log("Login clicked");
        const username = this.loginUser.value.trim();
        const password = this.loginPass.value;
        const errorEl = document.getElementById('login-error');

        const user = this.users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = user;
            this.saveCurrentUser();
            this.closeModal();
            this.updateUI();
        } else {
            this.showError(errorEl, "KullanÄ±cÄ± adÄ± veya ÅŸifre hatalÄ±.");
        }
    }

    logout() {
        if (confirm("Ã‡Ä±kÄ±ÅŸ yapmak istiyor musun?")) {
            this.currentUser = null;
            localStorage.removeItem('guess_player_current_user');
            this.updateUI();
        }
    }

    // --- Profile & Stats ---
    openProfile() {
        if (!this.currentUser) return;
        const modal = document.getElementById('profile-modal');
        if (modal) {
            this.renderAvatarSelection();
            this.renderProfileStats();
            modal.classList.remove('hidden');
        }
    }

    closeProfile() {
        const modal = document.getElementById('profile-modal');
        if (modal) modal.classList.add('hidden');
    }

    renderProfileStats() {
        const container = document.getElementById('profile-stats-container');
        if (!container || !this.currentUser) return;

        const lang = window.game ? window.game.currentLang : 'tr';
        const t = TRANSLATIONS[lang];

        const categories = [
            { id: 'football', name: t.football, icon: 'âš½' },
            { id: 'basketball', name: t.basketball, icon: 'ğŸ€' },
            { id: 'nfl', name: t.nfl, icon: 'ğŸˆ' },
            { id: 'nhl', name: t.nhl, icon: 'ğŸ’' },
            { id: 'volleyball', name: t.volleyball, icon: 'ğŸ' },
            { id: 'cricket', name: t.cricket, icon: 'ğŸ' },
            { id: 'f1', name: t.f1, icon: 'ğŸï¸' },
            { id: 'tennis', name: t.tennis, icon: 'ğŸ¾' },
            { id: 'esports_lol', name: 'LoL', icon: 'âš”ï¸' },
            { id: 'esports_cs', name: 'CS', icon: 'ğŸ”«' },
            { id: 'esports_valorant', name: 'VALORANT', icon: 'ğŸ¯' }
        ];

        // Ensure stats object exists
        if (!this.currentUser.stats) this.currentUser.stats = {};

        container.innerHTML = categories.map(cat => {
            const stat = this.currentUser.stats[cat.id] || { maxStreak: 0, highscore: 0 };
            return `
                <div class="stat-card">
                    <h4>${cat.icon} ${cat.name}</h4>
                    <div class="stat-item">
                        <span>${t.stat_max_streak || 'Max Seri:'}</span>
                        <span class="stat-value">${stat.maxStreak || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span>${t.stat_highscore || 'En YÃ¼ksek Skor:'}</span>
                        <span class="stat-value">${stat.highscore || 0}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Update Modal Header UI
        const avatarEl = document.getElementById('profile-modal-avatar');
        if (avatarEl) avatarEl.innerText = this.currentUser.avatar || 'ğŸ‘¤';
        const nameEl = document.getElementById('profile-username');
        if (nameEl) nameEl.innerText = this.currentUser.username;

        // Render Achievements
        const achContainer = document.getElementById('profile-achievements-container');
        if (achContainer) achContainer.innerHTML = achievements.render(this.currentUser);

        // Render Radar Chart
        this.renderRadarChart();

        // Render Leaderboard
        this.renderLeaderboard();
    }

    renderLeaderboard() {
        const container = document.getElementById('main-leaderboard-container');
        if (!container) return;

        // 1. Get ALL registered users from the local database
        const allLocalUsers = Object.values(this.users).map(u => ({
            username: u.username,
            avatar: u.avatar || 'ğŸ‘¤',
            score: Object.values(u.stats || {}).reduce((acc, s) => acc + (s.highscore || 0), 0),
            isMe: (this.currentUser && u.username === this.currentUser.username)
        }));

        // 2. Add top legendary AI rivals for extra challenge
        const rivals = [
            { username: 'TahminCan (Global #1)', score: 2200, avatar: 'ğŸ¦' },
            { username: 'Gol KralÄ±', score: 1500, avatar: 'âš½' },
            { username: 'E-Sporcu', score: 850, avatar: 'ğŸ®' }
        ];

        // 3. Combine and deduplicate
        let finalBoard = [...allLocalUsers];
        rivals.forEach(r => {
            if (!finalBoard.find(u => u.username === r.username)) {
                finalBoard.push(r);
            }
        });
        
        // 4. Sort and limit to Top 10
        finalBoard.sort((a, b) => b.score - a.score);
        const topPlayers = finalBoard.slice(0, 10);

        const lang = window.game ? window.game.currentLang : 'tr';
        const t = TRANSLATIONS[lang];

        container.innerHTML = `
            <div class="leaderboard-section">
                <span class="section-title">${t.leaderboard_title || 'LÄ°DERLÄ°K TABLOSU'}</span>
                <div class="leaderboard-list">
                    ${topPlayers.map((u, i) => `
                        <div class="leaderboard-item ${u.isMe ? 'is-me' : ''}">
                            <div class="rank">#${i + 1}</div>
                            <div class="lb-avatar">${u.avatar}</div>
                            <div class="lb-name">${u.username} ${u.isMe ? t.lb_you || '(SENSÄ°N)' : ''}</div>
                            <div class="lb-score">${u.score} ${t.lb_puan || 'Puan'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderRadarChart() {
        const container = document.getElementById('radar-chart-container');
        if (!container) return;

        const lang = window.game ? window.game.currentLang : 'tr';
        const t = TRANSLATIONS[lang];

        const cats = [
            { id: 'football', label: t.radar_football || 'Futbol' },
            { id: 'basketball', label: t.radar_basketball || 'Basket' },
            { id: 'nfl', label: t.radar_nfl || 'NFL' },
            { id: 'nhl', label: t.radar_nhl || 'NHL' },
            { id: 'volleyball', label: t.radar_volleyball || 'Voley' },
            { id: 'cricket', label: t.radar_cricket || 'Kriket' },
            { id: 'f1', label: t.radar_f1 || 'F1' },
            { id: 'tennis', label: t.radar_tennis || 'Tenis' },
            { id: 'esports', label: t.radar_esports || 'E-Spor' }
        ];

        const size = 250;
        const center = size / 2;
        const radius = 80;
        const angleStep = (Math.PI * 2) / cats.length;

        // Get max scores for normalization (scale 0-100)
        const stats = this.currentUser.stats || {};
        const values = cats.map(c => Math.min(100, (stats[c.id]?.highscore || 0)));

        // Generate Grid Lines
        let gridLines = '';
        for (let i = 1; i <= 5; i++) {
            const r = (radius / 5) * i;
            const points = cats.map((_, j) => {
                const angle = j * angleStep - Math.PI / 2;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ');
            gridLines += `<polygon points="${points}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />`;
        }

        // Generate Labels & Axis
        let axisAndLabels = '';
        cats.forEach((cat, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            const lx = center + (radius + 25) * Math.cos(angle);
            const ly = center + (radius + 15) * Math.sin(angle);

            axisAndLabels += `
                <line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
                <text x="${lx}" y="${ly}" text-anchor="middle" class="radar-label">${cat.label}</text>
            `;
        });

        // Generate Data Polygon
        const dataPoints = values.map((v, i) => {
            const r = (radius * v) / 100;
            const angle = i * angleStep - Math.PI / 2;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        }).join(' ');

        container.innerHTML = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                ${gridLines}
                ${axisAndLabels}
                <polygon points="${dataPoints}" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" stroke-width="2">
                    <animate attributeName="opacity" from="0" to="1" dur="0.8s" />
                </polygon>
                ${values.map((v, i) => {
                    const r = (radius * v) / 100;
                    const angle = i * angleStep - Math.PI / 2;
                    return `<circle cx="${center + r * Math.cos(angle)}" cy="${center + r * Math.sin(angle)}" r="3" fill="#22c55e" />`;
                }).join('')}
            </svg>
        `;
    }

    updateStats(category, streak, score) {
        if (!this.currentUser) return;

        if (!this.currentUser.stats) this.currentUser.stats = {};
        if (!this.currentUser.stats[category]) {
            this.currentUser.stats[category] = { maxStreak: 0, highscore: 0 };
        }

        let updated = false;
        // Update Max Streak
        if (streak > (this.currentUser.stats[category].maxStreak || 0)) {
            this.currentUser.stats[category].maxStreak = streak;
            updated = true;
        }

        // Update High Score
        if (score > (this.currentUser.stats[category].highscore || 0)) {
            this.currentUser.stats[category].highscore = score;
            updated = true;
        }

        if (updated) {
            // Update in users array too
            const userIndex = this.users.findIndex(u => u.username === this.currentUser.username);
            if (userIndex !== -1) {
                this.users[userIndex].stats = this.currentUser.stats;
            }
            this.saveUsers();
            this.saveCurrentUser();
            
            // Check achievements if defined
            if (typeof achievements !== 'undefined') {
                achievements.check(this.currentUser);
            }
        }
    }

    renderAvatarSelection() {
        const grid = document.getElementById('avatar-grid');
        if (!grid) return;

        const avatars = {
            football: ['âš½', 'ğŸ¥…', 'ğŸ§¤', 'ğŸ‘Ÿ', 'ğŸŸ¨', 'ğŸŸ¥', 'ğŸ“£', 'ğŸŸï¸'],
            basketball: ['ğŸ€', 'â›¹ï¸', 'ğŸ§º', 'ğŸ‘Ÿ', 'â±ï¸', 'ğŸ‘‘', 'ğŸ”¥', 'ğŸ’ª'],
            nfl: ['ğŸˆ', 'ğŸ›¡ï¸', 'ğŸƒâ€â™‚ï¸', 'ğŸ¯', 'ğŸš©', 'ğŸ“'],
            nhl: ['ğŸ’', 'â›¸ï¸', 'ğŸ¥…', 'ğŸ§Š', 'â„ï¸', 'ğŸ©¹', 'ğŸ›¡ï¸'],
            volleyball: ['ğŸ', 'ğŸ–ï¸', 'ğŸ‘', 'ğŸ‘Ÿ', 'ğŸ”', 'ğŸ’ª', 'âœ¨'],
            cricket: ['ğŸ', 'ğŸ¥', 'ğŸŸï¸', 'ğŸ§¢', 'ğŸŒ', 'ğŸŒ³', 'ğŸ§¤'],
            f1: ['ğŸï¸', 'ğŸ', 'ğŸš¥', 'ğŸ›', 'ğŸ”§', 'â›½', 'ğŸ¾', 'ğŸ› ï¸'],
            tennis: ['ğŸ¾', 'ğŸ¸', 'ğŸŸï¸', 'ğŸ‘Ÿ', 'ğŸ†', 'ğŸ’¨', 'ğŸ¥'],
            esports: ['âŒ¨ï¸', 'ğŸ–±ï¸', 'ğŸ§', 'ğŸ•¹ï¸', 'âš”ï¸', 'ğŸ”«', 'ğŸ¯', 'ğŸ’»', 'ğŸ®'],
            others: ['ğŸ‘¤', 'ğŸ˜', 'ğŸ”¥', 'âœ¨', 'ğŸŒŸ', 'ğŸ’', 'ğŸ€', 'ğŸš€']
        };

        let list = [];
        if (this.avatarTab === 'all') {
            list = Object.values(avatars).flat();
        } else {
            list = avatars[this.avatarTab] || [];
        }

        grid.innerHTML = list.map(emoji => `
            <div class="avatar-item ${this.currentUser.avatar === emoji ? 'active' : ''}" 
                 onclick="authManager.setAvatar('${emoji}')">
                ${emoji}
            </div>
        `).join('');

        // Update Tab active state
        document.querySelectorAll('.avatar-tab').forEach(btn => {
            const onclickText = btn.getAttribute('onclick') || '';
            const tabMatch = onclickText.match(/'([^']+)'/);
            if (tabMatch) {
                const tab = tabMatch[1];
                btn.classList.toggle('active', tab === this.avatarTab);
            }
        });
    }

    switchAvatarTab(tab) {
        this.avatarTab = tab;
        this.renderAvatarSelection();
    }

    setAvatar(emoji) {
        if (!this.currentUser) return;
        this.currentUser.avatar = emoji;
        
        // Update in users array
        const idx = this.users.findIndex(u => u.username === this.currentUser.username);
        if (idx !== -1) this.users[idx].avatar = emoji;

        this.saveUsers();
        this.saveCurrentUser();
        this.updateUI();
        
        // Refresh Current Modal
        const avatarEl = document.getElementById('profile-modal-avatar');
        if (avatarEl) avatarEl.innerText = emoji;
        this.renderAvatarSelection();
    }

    updateUI() {
        if (!this.authContainer) return;

        const soundIcon = sounds.enabled ? 'ğŸ”Š' : 'ğŸ”‡';
        const soundBtn = `<button id="sound-toggle" class="auth-btn utility-btn" onclick="sounds.toggleUI()" title="Ses">${soundIcon}</button>`;
        const lbBtn = `<button id="leaderboard-top-btn" class="auth-btn utility-btn" onclick="game.showLeaderboard()" title="Liderlik">ğŸ†</button>`;

        if (this.currentUser) {
            const avatar = this.currentUser.avatar || 'ğŸ‘¤';
            const lang = window.game ? window.game.currentLang : 'tr';
            const t = TRANSLATIONS[lang];
            this.authContainer.innerHTML = `
                ${soundBtn}
                ${lbBtn}
                <div class="user-profile">
                    <button class="user-name-btn" onclick="authManager.openProfile()">
                        <span class="user-avatar-icon">${avatar}</span>
                        <span class="username-text">${this.currentUser.username}</span>
                    </button>
                    <button class="auth-btn logout" onclick="authManager.logout()">${t.btn_logout || 'Ã‡Ä±kÄ±ÅŸ'}</button>
                </div>
            `;
        } else {
            const lang = window.game ? window.game.currentLang : 'tr';
            const t = TRANSLATIONS[lang];
            this.authContainer.innerHTML = `
                ${soundBtn}
                ${lbBtn}
                <button class="auth-btn login" onclick="authManager.openModal('login')">${t.btn_login || 'GiriÅŸ Yap'}</button>
                <button class="auth-btn signup" onclick="authManager.openModal('signup')">${t.btn_signup || 'KayÄ±t Ol'}</button>
            `;
        }
    }

    saveUsers() {
        localStorage.setItem('guess_player_users', JSON.stringify(this.users));
    }

    saveCurrentUser() {
        localStorage.setItem('guess_player_current_user', JSON.stringify(this.currentUser));
    }

    showError(el, msg) {
        if (el) {
            el.innerText = msg;
            el.classList.remove('hidden');
        } else {
            alert(msg);
        }
    }

    clearInputs() {
        if (this.loginUser) this.loginUser.value = '';
        if (this.loginPass) this.loginPass.value = '';
        if (this.signupUser) this.signupUser.value = '';
        if (this.signupEmail) this.signupEmail.value = '';
        if (this.signupPass) this.signupPass.value = '';
    }

    exportData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.users));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "guess_player_users.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

// --- Cookies & Standard Web Elements ---
class CookieManager {
    constructor() {
        this.banner = document.getElementById('gp-cookie-panel');
        this.init();
    }

    init() {
        if (!localStorage.getItem('guess_player_cookies_accepted')) {
            setTimeout(() => {
                if (this.banner) this.banner.classList.remove('hidden');
            }, 1000); // 1s instead of 2s for better response
        }


    }

    accept() {
        localStorage.setItem('guess_player_cookies_accepted', 'true');
        if (this.banner) this.banner.classList.add('hidden');
    }
}

// --- Info Pages (Privacy, Terms, Cookies) ---
class InfoManager {
    constructor() {
        this.modal = document.getElementById('info-modal');
        this.titleEl = document.getElementById('info-title');
        this.contentEl = document.getElementById('info-content');
    }

    open(type) {
        if (!this.modal) return;

        const lang = game.currentLang;
        let titleKey = '';
        let contentKey = '';

        switch (type) {
            case 'privacy':
                titleKey = 'footer_privacy';
                contentKey = 'privacy_content';
                break;
            case 'terms':
                titleKey = 'footer_terms';
                contentKey = 'terms_content';
                break;
            case 'cookies':
                titleKey = 'cookie_info_title';
                contentKey = 'cookie_info_content';
                break;
        }

        this.titleEl.innerText = TRANSLATIONS[lang][titleKey] || 'Info';
        this.contentEl.innerText = TRANSLATIONS[lang][contentKey] || 'Content not waiting...';

        this.modal.classList.remove('hidden');
    }

    close() {
        if (this.modal) this.modal.classList.add('hidden');
    }
}

// Global instances
const authManager = new AuthManager();
const cookieManager = new CookieManager();
const infoManager = new InfoManager();

// ========================
// MULTIPLAYER MANAGER
// ========================
class MultiplayerManager {
    constructor() {
        this.roomID = null;
        this.isHost = false;
        this.opponent = null;
        this.inQueue = false;
        this.db = typeof db !== 'undefined' ? db : null;

        this.init();
    }

    init() {
        // UI Bindings - Attach even if db is null for Simulation Mode
        document.getElementById('matchmaking-btn')?.addEventListener('click', () => this.toggleMatchmaking());
        document.getElementById('create-room-btn')?.addEventListener('click', () => this.createRoom());
        document.getElementById('join-room-btn')?.addEventListener('click', () => {
            const id = document.getElementById('room-id-input').value.toUpperCase();
            if (id) this.joinRoom(id);
        });
        document.getElementById('start-game-btn')?.addEventListener('click', () => this.startGame());
        document.getElementById('multi-back-btn')?.addEventListener('click', () => this.leaveRoom());
    }

    async toggleMatchmaking() {
        if (!this.db) {
            this.startSimulation('queue');
            return;
        }
        
        const btn = document.getElementById('matchmaking-btn');
        const status = document.getElementById('queue-status');
        
        if (this.inQueue) {
            this.stopQueue();
        } else {
            this.startQueue();
            
            // Matchmaking logic
            const queueRef = this.db.ref('queue');
            queueRef.once('value', snapshot => {
                const queue = snapshot.val() || {};
                const playersInQueue = Object.keys(queue);
                
                if (playersInQueue.length > 0) {
                    const rival = playersInQueue[0];
                    const roomId = `MATCH_${Date.now()}`;
                    queueRef.child(rival).remove();
                    this.joinRoom(roomId, true); 
                } else {
                    queueRef.child(authManager.currentUser?.username || 'Guest').set({ joinedAt: Date.now() });
                    queueRef.child(authManager.currentUser?.username || 'Guest').on('value', snap => {
                        if (snap.val() && snap.val().roomId) this.joinRoom(snap.val().roomId, false);
                    });
                }
            });
        }
    }

    startQueue() {
        this.inQueue = true;
        document.getElementById('matchmaking-btn').innerText = "SÄ±radan Ã‡Ä±k";
        document.getElementById('queue-status').classList.remove('hidden');
        
        let seconds = 0;
        this.queueTimerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            const timerEl = document.querySelector('.queue-timer');
            if (timerEl) timerEl.innerText = `${mins}:${secs}`;
        }, 1000);
    }

    stopQueue() {
        this.inQueue = false;
        document.getElementById('matchmaking-btn').innerText = "HÄ±zlÄ± MaÃ§ Bul";
        document.getElementById('queue-status').classList.add('hidden');
        clearInterval(this.queueTimerInterval);
        if (this.db) this.db.ref('queue').child(authManager.currentUser?.username || 'Guest').remove();
    }

    async createRoom() {
        if (!this.db) {
            this.startSimulation('room');
            return;
        }
        
        try {
            const id = Math.random().toString(36).substring(2, 6).toUpperCase();
            this.roomID = id;
            this.isHost = true;
            
            await this.db.ref(`rooms/${id}`).set({
                host: authManager.currentUser?.username || 'Host',
                status: 'waiting',
                players: {
                    p1: { name: authManager.currentUser?.username || 'Host', score: 0, ready: true }
                },
                createdAt: Date.now()
            });

            this.showRoomUI(id);
            this.listenToRoom(id);
        } catch (error) {
            alert("Hata: " + error.message);
        }
    }

    startSimulation(type) {
        if (type === 'queue') {
            this.startQueue();
            setTimeout(() => {
                alert("SimÃ¼lasyon Modu: Firebase anahtarlarÄ±nÄ±z eksik olduÄŸu iÃ§in gerÃ§ek eÅŸleÅŸme yapÄ±lamÄ±yor. LÃ¼tfen firebase-config.js dosyasÄ±nÄ± gÃ¼ncelleyin.");
                this.stopQueue();
            }, 5000);
        } else {
            const mockID = "TEST";
            this.roomID = mockID;
            this.showRoomUI(mockID);
            document.getElementById('p1-name').innerText = authManager.currentUser?.username || 'Siz';
            alert("SimÃ¼lasyon Modu: Oda oluÅŸturuldu (KOD: TEST). GerÃ§ek baÄŸlantÄ± iÃ§in Firebase anahtarlarÄ± gereklidir.");
        }
    }

    showRoomUI(id) {
        document.querySelector('.multi-actions').classList.add('hidden');
        document.getElementById('room-info').classList.remove('hidden');
        document.getElementById('display-room-id').innerText = id;
        
        // Add copy functionality
        document.getElementById('display-room-id').onclick = () => {
            navigator.clipboard.writeText(id);
            alert("Oda kodu kopyalandÄ±!");
        };
    }

    async joinRoom(id, isMatchmaking = false) {
        const snapshot = await this.db.ref(`rooms/${id}`).once('value');
        if (!snapshot.exists() && !isMatchmaking) return alert("Oda bulunamadÄ±!");

        this.roomID = id;
        this.isHost = isMatchmaking;

        if (!this.isHost) {
            await this.db.ref(`rooms/${id}/players/p2`).set({
                name: authManager.currentUser?.username || 'Guest',
                score: 0,
                ready: true
            });
        }

        this.showRoomUI(id);
        this.listenToRoom(id);
    }

    listenToRoom(id) {
        this.db.ref(`rooms/${id}`).on('value', snapshot => {
            const data = snapshot.val();
            if (!data) return;

            const p1 = data.players?.p1;
            const p2 = data.players?.p2;

            if (p1) document.getElementById('p1-name').innerText = p1.name;
            if (p2) {
                document.getElementById('p2-name').innerText = p2.name;
                document.getElementById('p2-status').innerText = "HAZIR";
                if (this.isHost && data.status === 'waiting') {
                    document.getElementById('start-game-btn').classList.remove('hidden');
                }
            }

            if (data.status === 'playing' && !game.playing) {
                this.beginActualGame();
            }

            // Sync scores during game
            if (game.playing) {
                const myKey = this.isHost ? 'p1' : 'p2';
                const oppKey = this.isHost ? 'p2' : 'p1';
                
                if (data.players[oppKey]) {
                    this.opponentScore = data.players[oppKey].score;
                    document.getElementById('opp-score').innerText = this.opponentScore;
                }
            }
        });
    }

    startGame() {
        if (!this.isHost) return;
        this.db.ref(`rooms/${this.roomID}`).update({ status: 'playing' });
    }

    beginActualGame() {
        game.showScreen('game-screen');
        const sport = game.currentSport || 'football';
        const diff = game.currentDifficulty || 'easy';
        game.startNewGame(sport, diff);
        document.getElementById('multiplayer-hud').classList.remove('hidden');
    }

    updateMyScore(score) {
        if (!this.roomID || !this.db) return;
        const key = this.isHost ? 'p1' : 'p2';
        this.db.ref(`rooms/${this.roomID}/players/${key}`).update({ score });
    }

    leaveRoom() {
        if (this.roomID && this.db) {
            this.db.ref(`rooms/${this.roomID}`).remove();
        }
        game.showScreen('category-screen');
    }
}

const multiplayerManager = new MultiplayerManager();

document.querySelectorAll('.card, .game-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
});

// DEMO: herhangi bir karta tıklayınca efekt verir (Test amaçlı)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.remove('correct', 'wrong');
    // Rastgele doğru/yanlış efekti
    if (Math.random() > 0.5) {
      card.classList.add('correct');
    } else {
      card.classList.add('wrong');
    }
    setTimeout(() => {
      card.classList.remove('correct', 'wrong');
    }, 600);
  });
});

function triggerFlash() {
  document.body.classList.add('flash');
  setTimeout(() => document.body.classList.remove('flash'), 300);
} 

// Kategori secildiÄŸinde flash efekti tetikle
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    triggerFlash();
  });
});

