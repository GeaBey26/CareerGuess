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
