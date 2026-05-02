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
            this.hintBtn.innerText = `${t.btn_hint || 'İpucu'} 2${penaltyText}`; 
        } else if (this.hintStep === 1) {
            // Second Hint: Nationality
            this.showMessage(`${t.hint_2_prefix || 'Nationality:'} ${this.currentPlayer.flag} ${this.currentPlayer.nationality}`, "success");
            this.hintStep = 2; // Locked
            this.hintBtn.disabled = true;
            this.hintBtn.innerText = t.msg_used_hint || 'İpucu Kullanıldı';
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
            .replace(/Ğ/g, 'g')
            .replace(/Ü/g, 'u')
            .replace(/Ş/g, 's')
            .replace(/I/g, 'i')
            .replace(/İ/g, 'i')
            .replace(/Ö/g, 'o')
            .replace(/Ç/g, 'c')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .toLowerCase();
    }

    resetStreak() {
        this.streak = 0;
        this.updateStats();
    }

    updateStats() {
        if (this.scoreEl) this.scoreEl.innerText = this.score;
        if (this.streakEl) this.streakEl.innerText = this.streak;
        if (this.scoreEl) {
            this.scoreEl.classList.add("up");
            setTimeout(() => this.scoreEl.classList.remove("up"), 300);
        }
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
    }

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

        if (!this.timerInterval) this.startTimer();
    }

    generateQuizOptions() {
        const correct = this.currentPlayer;
        let distractors = this.activePlayers
            .filter(p => p.name !== correct.name)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

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
        if (!grid) return;
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
            this.showMessage("Yanlış Cevap! -10 Puan", "error");
            this.resetStreak();

            const correctBtn = Array.from(document.querySelectorAll('.option-btn'))
                .find(b => b.dataset.name === this.currentPlayer.name);
            if (correctBtn) correctBtn.classList.add('correct');

            this.canGuess = false;
            if (!isCorrect) {
                setTimeout(() => this.nextRound(), 2000);
            }
        }
    }

    useJoker(type) {
        if (this.jokers[type]) return; // Already used

        const btn = document.getElementById(`joker-${type === '50:50' ? '50' : type === '2x' ? '2x' : 'time'}`);
        if (!btn) return;

        this.jokers[type] = true;
        btn.disabled = true;
        btn.classList.add('active'); 

        if (type === '50:50') {
            const wrongBtns = Array.from(document.querySelectorAll('.option-btn'))
                .filter(b => b.dataset.name !== this.currentPlayer.name);

            wrongBtns.slice(0, 2).forEach(b => {
                b.disabled = true;
                b.style.opacity = '0.3';
            });
            this.showMessage("50:50 Kullanıldı! İki yanlış şık elendi.", "success");
        }
        else if (type === '2x') {
            this.doubleDipActive = true;
            this.showMessage("Çift Cevap Hakkı Tanımlandı!", "success");
        }
        else if (type === 'time') {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.showMessage("Süre Donduruldu!", "success");
        }
    }

    initJokers() {
        this.jokers = { '50:50': false, '2x': false, 'time': false };
        const j50 = document.getElementById('joker-50');
        const j2x = document.getElementById('joker-2x');
        const jTime = document.getElementById('joker-time');
        if (j50) j50.disabled = false, j50.onclick = () => this.useJoker('50:50');
        if (j2x) j2x.disabled = false, j2x.onclick = () => this.useJoker('2x');
        if (jTime) jTime.disabled = false, jTime.onclick = () => this.useJoker('time');
    }
}


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
        const modal = document.getElementById('dc-modal');
        if (modal) modal.classList.remove('hidden');
        if (!this.currentSport) {
            this.showCategorySelect();
        } else {
            this.playSport(this.currentSport);
        }
    }

    close() {
        const modal = document.getElementById('dc-modal');
        if (modal) modal.classList.add('hidden');
        this.currentSport = null;
    }

    showCategorySelect() {
        this.currentSport = null;
        const categories = [
            { id: 'football', name: 'Futbol', icon: '⚽' },
            { id: 'basketball', name: 'Basketbol', icon: '🏀' },
            { id: 'volleyball', name: 'Voleybol', icon: '🏐' },
            { id: 'tennis', name: 'Tenis', icon: '🎾' },
            { id: 'f1', name: 'Formula 1', icon: '🏎️' },
            { id: 'esports_lol', name: 'LoL', icon: '⚔️' },
            { id: 'esports_cs', name: 'CS', icon: '🔫' },
            { id: 'esports_valorant', name: 'Valorant', icon: '🎯' },
            { id: 'nfl', name: 'NFL', icon: '🏈' },
            { id: 'nhl', name: 'NHL', icon: '🏒' },
            { id: 'cricket', name: 'Kriket', icon: '🏏' }
        ];

        let cardsHTML = categories.map(cat => {
            const completed = this.isCompleted(cat.id);
            const streak = this.getStreak(cat.id);
            return `
                <div class="dc-cat-card ${completed ? 'completed' : ''}" onclick="dailyChallenge.playSport('${cat.id}')">
                    <div class="dc-cat-icon">${cat.icon}</div>
                    <div class="dc-cat-name">${cat.name}</div>
                    ${streak > 0 ? `<div class="dc-cat-streak">🔥 ${streak}</div>` : ''}
                    ${completed ? '<div class="dc-cat-status">✓ Tamamlandı</div>' : ''}
                </div>
            `;
        }).join('');

        const modal = document.getElementById('dc-modal');
        if (modal) {
            modal.innerHTML = `
                <div class="dc-box">
                    <button class="dc-close" onclick="dailyChallenge.close()">✖</button>
                    <div class="dc-header">
                        <div class="dc-fire">🔥</div>
                        <h2 class="dc-title">Günlük Meydan Okuma</h2>
                        <p class="dc-date">Kategori Seç</p>
                    </div>
                    <div class="dc-cat-grid">
                        ${cardsHTML}
                    </div>
                </div>
            `;
        }
    }

    playSport(sport) {
        this.currentSport = sport;
        this.player = this.getDailyPlayer(sport);
        if (!this.player) {
            alert("Veri yüklenemedi!");
            this.showCategorySelect();
            return;
        }
        this.renderModal();
    }

    getVisibleClues(player, attempts) {
        const totalTeams = player.career.length;
        const revealedTeamsCount = Math.min(1 + attempts, totalTeams);
        const career = player.career.slice(0, revealedTeamsCount);
        
        let extraInfo = [];
        if (attempts >= totalTeams) {
            extraInfo.push(`📍 Ülke: ${player.nationality}`);
        }
        if (attempts >= totalTeams + 1) {
            extraInfo.push(`👤 Mevki: ${player.position}`);
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
            `<div class="dc-guess ${g.correct ? 'correct' : 'wrong'}">${g.correct ? '✅' : '❌'} ${g.text}</div>`
        ).join('');

        let resultSection = '';
        if (done) {
            const streak = this.getStreak(sport);
            resultSection = `
                <div class="dc-result ${state.won ? 'won' : 'lost'}">
                    <div class="dc-result-icon">${state.won ? '🏆' : '💀'}</div>
                    <div class="dc-result-text">${state.won ? 'Tebrikler! Bildin!' : 'Maalesef Olmadı!'}</div>
                    <div class="dc-answer">Cevap: <strong>${p.name}</strong></div>
                    <div class="dc-streak-info">Güncel Seri: 🔥 ${streak}</div>
                    <button class="dc-share-btn" onclick="dailyChallenge.share('${sport}')">📋 Sonucu Paylaş</button>
                    <div class="dc-next-time">Yeni oyuncu yarın gelecek!</div>
                </div>`;
        }

        const inputSection = !done ? `
            <div class="dc-input-wrap">
                <input type="text" id="dc-guess-input" class="dc-input" placeholder="Oyuncu ismini yaz..." autocomplete="off" oninput="dailyChallenge.handleSuggest(this.value)">
                <div id="dc-suggestions" class="dc-suggestions hidden"></div>
                <button class="dc-submit-btn" onclick="dailyChallenge.submitGuess()">Tahmin Et</button>
            </div>
            <div class="dc-attempts-left">🎯 ${attemptsLeft} hakkın kaldı</div>` : '';

        const modal = document.getElementById('dc-modal');
        if (modal) {
            modal.innerHTML = `
                <div class="dc-box">
                    <div class="dc-top-nav" style="display:flex; justify-content:space-between; width:100%; margin-bottom:20px;">
                        <button class="dc-back-btn" onclick="dailyChallenge.showCategorySelect()" style="color:var(--text-secondary); font-weight:600; background:none; border:none; cursor:pointer;">← Kategoriye Dön</button>
                        <button class="dc-close-btn" onclick="dailyChallenge.close()" style="color:var(--text-secondary); font-weight:600; background:none; border:none; cursor:pointer;">Kapat ✖</button>
                    </div>
                    <div class="dc-header">
                        <div class="dc-fire">🔥</div>
                        <h2 class="dc-title">Günlük ${this.getSportName(sport)}</h2>
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
                        <button onclick="dailyChallenge.close()" style="background:none; border:none; color:var(--text-secondary); font-size:0.85rem; cursor:pointer; text-decoration:underline;">Ana Menüye Dön</button>
                    </div>
                </div>
            `;
        }

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
        
        if (!sourceArray || sourceArray.length === 0) sourceArray = players;
        
        const norm = v => v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const matches = sourceArray.filter(p => norm(p.name).includes(norm(val))).slice(0, 6);
        const box = document.getElementById('dc-suggestions');
        if (!box) return;
        if (matches.length === 0) { box.classList.add('hidden'); return; }
        box.innerHTML = matches.map(p =>
            `<div class="dc-suggestion-item" onclick="dailyChallenge.pickSuggestion('${p.name.replace(/'/g,"&#39;")}')">${p.flag || '👤'} ${p.name}</div>`
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
            this.setStreak(sport, 0); 
        }

        this.saveState(sport, state);
        this.renderModal();
        this.updateBadge();
    }

    share(sport) {
        const state = this.getState(sport);
        const emojiLine = state.guesses.map(g => g.correct ? '🟩' : '🟧').join('') + ` (${state.attempts}/${this.maxAttempts})`;
        const text = `🔥 CareerGuess - Günlük ${this.getSportName(sport)} ${this.todayKey}\n${emojiLine}\nSerim: 🔥 ${this.getStreak(sport)}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.dc-share-btn');
                if (btn) { btn.textContent = '✅ Kopyalandı!'; setTimeout(() => btn.textContent = '📋 Paylaş', 2000); }
            });
        }
    }

    updateBadge() {
        const badge = document.querySelector('.daily-challenge-badge');
        if (!badge) return;
        const sports = ['football', 'basketball', 'volleyball'];
        const allDone = sports.every(s => this.isCompleted(s));
        if (allDone) {
            badge.innerHTML = '<span>✅</span><span>Bütün Günlükler Bitti!</span>';
            badge.style.color = '#4ade80';
        } else {
            badge.innerHTML = '<span>🔥</span><span>Günlük Meydan Okuma</span>';
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

    const badge = document.querySelector('.daily-challenge-badge');
    if (badge) badge.style.cursor = 'pointer', badge.onclick = () => dailyChallenge.open();
});


// ========================
// AUTHENTICATION MANAGER
// ========================
class AuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('guess_player_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('guess_player_current_user')) || null;

        this.overlay = document.getElementById('auth-overlay');
        this.loginForm = document.getElementById('login-form-container');
        this.signupForm = document.getElementById('signup-form-container');

        this.loginUser = document.getElementById('login-username');
        this.loginPass = document.getElementById('login-password');
        this.signupUser = document.getElementById('signup-username');
        this.signupEmail = document.getElementById('signup-email');
        this.signupPass = document.getElementById('signup-password');

        this.loginBtn = document.getElementById('login-submit-btn');
        this.signupBtn = document.getElementById('signup-submit-btn');

        this.authContainer = document.querySelector('.auth-buttons');
        this.avatarTab = 'all';

        this.init();
    }

    init() {
        if (this.loginBtn) this.loginBtn.onclick = () => this.login();
        if (this.signupBtn) this.signupBtn.onclick = () => this.signup();

        const s2s = document.getElementById('switch-to-signup');
        const s2l = document.getElementById('switch-to-login');
        if (s2s) s2s.onclick = () => this.showForm('signup');
        if (s2l) s2l.onclick = () => this.showForm('login');

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
            if (this.loginForm) this.loginForm.classList.remove('hidden');
            if (this.signupForm) this.signupForm.classList.add('hidden');
        } else {
            if (this.loginForm) this.loginForm.classList.add('hidden');
            if (this.signupForm) this.signupForm.classList.remove('hidden');
        }
    }

    signup() {
        const username = this.signupUser.value.trim();
        const email = this.signupEmail.value.trim();
        const password = this.signupPass.value;
        const errorEl = document.getElementById('signup-error');

        if (username.length < 3 || password.length < 4) {
            this.showError(errorEl, "Kullanıcı adı en az 3, şifre en az 4 karakter olmalı.");
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showError(errorEl, "Bu kullanıcı adı zaten alınmış.");
            return;
        }

        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password, 
            avatar: '👤',
            stats: {}
        };

        this.users.push(newUser);
        this.saveUsers();
        this.currentUser = newUser;
        this.saveCurrentUser();
        this.closeModal();
        this.updateUI();
        alert("Kayıt başarılı! Hoş geldin, " + username);
    }

    login() {
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
            this.showError(errorEl, "Kullanıcı adı veya şifre hatalı.");
        }
    }

    logout() {
        if (confirm("Çıkış yapmak istiyor musun?")) {
            this.currentUser = null;
            localStorage.removeItem('guess_player_current_user');
            this.updateUI();
        }
    }

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
            { id: 'football', name: t.football, icon: '⚽' },
            { id: 'basketball', name: t.basketball, icon: '🏀' },
            { id: 'nfl', name: t.nfl, icon: '🏈' },
            { id: 'nhl', name: t.nhl, icon: '🏒' },
            { id: 'volleyball', name: t.volleyball, icon: '🏐' },
            { id: 'cricket', name: t.cricket, icon: '🏏' },
            { id: 'f1', name: t.f1, icon: '🏎️' },
            { id: 'tennis', name: t.tennis, icon: '🎾' },
            { id: 'esports_lol', name: 'LoL', icon: '⚔️' },
            { id: 'esports_cs', name: 'CS', icon: '🔫' },
            { id: 'esports_valorant', name: 'VALORANT', icon: '🎯' }
        ];

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
                        <span>${t.stat_highscore || 'En Yüksek Skor:'}</span>
                        <span class="stat-value">${stat.highscore || 0}</span>
                    </div>
                </div>
            `;
        }).join('');

        const avatarEl = document.getElementById('profile-modal-avatar');
        if (avatarEl) avatarEl.innerText = this.currentUser.avatar || '👤';
        const nameEl = document.getElementById('profile-username');
        if (nameEl) nameEl.innerText = this.currentUser.username;

        const achContainer = document.getElementById('profile-achievements-container');
        if (achContainer) achContainer.innerHTML = achievements.render(this.currentUser);

        this.renderRadarChart();
        this.renderLeaderboard();
    }

    renderLeaderboard() {
        const container = document.getElementById('main-leaderboard-container');
        if (!container) return;

        const allLocalUsers = Object.values(this.users).map(u => ({
            username: u.username,
            avatar: u.avatar || '👤',
            score: Object.values(u.stats || {}).reduce((acc, s) => acc + (s.highscore || 0), 0),
            isMe: (this.currentUser && u.username === this.currentUser.username)
        }));

        const rivals = [
            { username: 'TahminCan (Global #1)', score: 2200, avatar: '🦥' },
            { username: 'Gol Kralı', score: 1500, avatar: '⚽' },
            { username: 'E-Sporcu', score: 850, avatar: '🎮' }
        ];

        let finalBoard = [...allLocalUsers];
        rivals.forEach(r => {
            if (!finalBoard.find(u => u.username === r.username)) {
                finalBoard.push(r);
            }
        });
        
        finalBoard.sort((a, b) => b.score - a.score);
        const topPlayers = finalBoard.slice(0, 10);

        const lang = window.game ? window.game.currentLang : 'tr';
        const t = TRANSLATIONS[lang];

        container.innerHTML = `
            <div class="leaderboard-section">
                <span class="section-title">${t.leaderboard_title || 'LİDERLİK TABLOSU'}</span>
                <div class="leaderboard-list">
                    ${topPlayers.map((u, i) => `
                        <div class="leaderboard-item ${u.isMe ? 'is-me' : ''}">
                            <div class="rank">#${i + 1}</div>
                            <div class="lb-avatar">${u.avatar}</div>
                            <div class="lb-name">${u.username} ${u.isMe ? t.lb_you || '(SENSİN)' : ''}</div>
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

        const stats = this.currentUser.stats || {};
        const values = cats.map(c => Math.min(100, (stats[c.id]?.highscore || 0)));

        let gridLines = '';
        for (let i = 1; i <= 5; i++) {
            const r = (radius / 5) * i;
            const points = cats.map((_, j) => {
                const angle = j * angleStep - Math.PI / 2;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ');
            gridLines += `<polygon points="${points}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />`;
        }

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
        if (streak > (this.currentUser.stats[category].maxStreak || 0)) {
            this.currentUser.stats[category].maxStreak = streak;
            updated = true;
        }

        if (score > (this.currentUser.stats[category].highscore || 0)) {
            this.currentUser.stats[category].highscore = score;
            updated = true;
        }

        if (updated) {
            const userIndex = this.users.findIndex(u => u.username === this.currentUser.username);
            if (userIndex !== -1) {
                this.users[userIndex].stats = this.currentUser.stats;
            }
            this.saveUsers();
            this.saveCurrentUser();
            if (typeof achievements !== 'undefined') {
                achievements.check(this.currentUser);
            }
        }
    }

    renderAvatarSelection() {
        const grid = document.getElementById('avatar-grid');
        if (!grid) return;

        const avatars = {
            football: ['⚽', '🧤', '🧦', '👟', '🟨', '🟥', '📢', '🏟️'],
            basketball: ['🏀', '⛹️', '🧺', '👟', '⏳', '👑', '🔥', '💪'],
            nfl: ['🏈', '🛡️', '🏃‍♂️', '🎯', '🚩', '🏟️'],
            nhl: ['🏒', '⛸️', '🧤', '🧔', '❄️', '🏑', '🛡️'],
            volleyball: ['🏐', '🏐', '👍', '👟', '🏐', '💪', '✨'],
            cricket: ['🏏', '🥎', '🏟️', '🧢', '☀️', '🌳', '🧦'],
            f1: ['🏎️', '🏁', '🚥', '🚧', '🔧', '⛽', '🏎️', '🛠️'],
            tennis: ['🎾', '🎾', '🏟️', '👟', '🏆', '💨', '🥎'],
            esports: ['⌨️', '🖱️', '🎧', '🕹️', '⚔️', '🔫', '🎯', '💻', '🎮'],
            others: ['👤', '😎', '🔥', '✨', '🌟', '💎', '🏀', '🚀']
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
        
        const idx = this.users.findIndex(u => u.username === this.currentUser.username);
        if (idx !== -1) this.users[idx].avatar = emoji;

        this.saveUsers();
        this.saveCurrentUser();
        this.updateUI();
        
        const avatarEl = document.getElementById('profile-modal-avatar');
        if (avatarEl) avatarEl.innerText = emoji;
        this.renderAvatarSelection();
    }

    updateUI() {
        if (!this.authContainer) return;

        const soundIcon = sounds.enabled ? '🔊' : '🔇';
        const soundBtn = `<button id="sound-toggle" class="auth-btn utility-btn" onclick="sounds.toggleUI()" title="Ses">${soundIcon}</button>`;
        const lbBtn = `<button id="leaderboard-top-btn" class="auth-btn utility-btn" onclick="game.showLeaderboard()" title="Liderlik">🏆</button>`;

        if (this.currentUser) {
            const avatar = this.currentUser.avatar || '👤';
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
                    <button class="auth-btn logout" onclick="authManager.logout()">${t.btn_logout || 'Çıkış'}</button>
                </div>
            `;
        } else {
            const lang = window.game ? window.game.currentLang : 'tr';
            const t = TRANSLATIONS[lang];
            this.authContainer.innerHTML = `
                ${soundBtn}
                ${lbBtn}
                <button class="auth-btn login" onclick="authManager.openModal('login')">${t.btn_login || 'Giriş Yap'}</button>
                <button class="auth-btn signup" onclick="authManager.openModal('signup')">${t.btn_signup || 'Kayıt Ol'}</button>
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
        document.body.appendChild(downloadAnchorNode); 
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

class CookieManager {
    constructor() {
        this.banner = document.getElementById('gp-cookie-panel');
        this.init();
    }

    init() {
        if (!localStorage.getItem('guess_player_cookies_accepted')) {
            setTimeout(() => {
                if (this.banner) this.banner.classList.remove('hidden');
            }, 1000); 
        }
    }

    accept() {
        localStorage.setItem('guess_player_cookies_accepted', 'true');
        if (this.banner) this.banner.classList.add('hidden');
    }
}

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

const authManager = new AuthManager();
const cookieManager = new CookieManager();
const infoManager = new InfoManager();

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
        
        if (this.inQueue) {
            this.stopQueue();
        } else {
            this.startQueue();
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
        const btn = document.getElementById('matchmaking-btn');
        if (btn) btn.innerText = "Sıradan Çık";
        document.getElementById('queue-status')?.classList.remove('hidden');
        
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
        const btn = document.getElementById('matchmaking-btn');
        if (btn) btn.innerText = "Hızlı Maç Bul";
        document.getElementById('queue-status')?.classList.add('hidden');
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
                alert("Simülasyon Modu: Firebase anahtarlarınız eksik olduğu için gerçek eşleşme yapılamıyor.");
                this.stopQueue();
            }, 5000);
        } else {
            const mockID = "TEST";
            this.roomID = mockID;
            this.showRoomUI(mockID);
            const p1 = document.getElementById('p1-name');
            if (p1) p1.innerText = authManager.currentUser?.username || 'Siz';
            alert("Simülasyon Modu: Oda oluşturuldu (KOD: TEST).");
        }
    }

    showRoomUI(id) {
        document.querySelector('.multi-actions')?.classList.add('hidden');
        document.getElementById('room-info')?.classList.remove('hidden');
        const idEl = document.getElementById('display-room-id');
        if (idEl) {
            idEl.innerText = id;
            idEl.onclick = () => {
                navigator.clipboard.writeText(id);
                alert("Oda kodu kopyalandı!");
            };
        }
    }

    async joinRoom(id, isMatchmaking = false) {
        const snapshot = await this.db.ref(`rooms/${id}`).once('value');
        if (!snapshot.exists() && !isMatchmaking) return alert("Oda bulunamadı!");

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

            if (game.playing) {
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
        game.startGame(diff);
        document.getElementById('multiplayer-hud')?.classList.remove('hidden');
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

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.remove('correct', 'wrong');
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

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    triggerFlash();
  });
});

const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
clickSound.volume = 0.4;

document.querySelectorAll('button, .card').forEach(el => {
  el.addEventListener('click', () => {
    clickSound.currentTime = 0;
    clickSound.play().catch(err => console.log('Audio play blocked:', err));
  });
});
