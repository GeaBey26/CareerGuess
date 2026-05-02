    showLeaderboard() {
        this.showScreen('leaderboard-screen');
        authManager.renderLeaderboard();
    }

    // Navigation Methods
    showScreen(id, pushState = true) {
        const target = document.getElementById(id);
        if (!target) return;

        // Hide all screens
        document.querySelectorAll('.start-screen, .game-container, #multiplayer-screen').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('fade-page');
        });
        
        target.classList.remove('hidden');
        target.classList.add('fade-page');

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
                alert("Veri tabanı hatası! (players)");
                return;
            }

            // Filter by Difficulty AND Status
            let sourceArray = players; // Default football
            if (this.currentSport === 'basketball') {
                if (typeof basketballPlayers === 'undefined') {
                    alert("Basketbol verisi yüklenemedi!");
                    return;
                }
                sourceArray = basketballPlayers; // Fix: Assign to sourceArray
            } else if (this.currentSport === 'nhl') {
                if (typeof nhlPlayers === 'undefined') {
                    alert("NHL verisi yüklenemedi!");
                    return;
                }
                sourceArray = nhlPlayers;
            } else if (this.currentSport === 'nfl') {
                if (typeof nflPlayers === 'undefined') {
                    alert("NFL verisi yüklenemedi!");
                    return;
                }
                sourceArray = nflPlayers;
            } else if (this.currentSport === 'volleyball') {
                if (typeof volleyballPlayers === 'undefined') {
                    alert("Voleybol verisi yüklenemedi!");
                    return;
                }
                sourceArray = volleyballPlayers;
            } else if (this.currentSport === 'cricket') {
                if (typeof cricketPlayers === 'undefined') {
                    alert("Kriket verisi yüklenemedi!");
                    return;
                }
                sourceArray = cricketPlayers;
            } else if (this.currentSport === 'f1') {
                if (typeof f1Players === 'undefined') {
                    alert("Formula 1 verisi yüklenemedi!");
                    return;
                }
                sourceArray = f1Players;
            } else if (this.currentSport === 'tennis') {
                if (typeof tennisPlayers === 'undefined') {
                    alert("Tenis verisi yüklenemedi!");
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
                
                let statusMatch = (this.playerStatus === 'all' || !this.playerStatus) || p.status === this.playerStatus;
                
                if (this.playerStatus === 'tr') {
                    statusMatch = (p.nationality === 'Türkiye' || p.nationality === 'Turkey');
                }
                
                return diffMatch && statusMatch;
            });

            console.log(`Filtered Players Count: ${this.activePlayers.length} for ${difficulty}/${this.playerStatus}`);

            // RANDOMIZE: Shuffle the filtered list so every game session is unique
            this.activePlayers = this.shuffleArray([...this.activePlayers]);

            if (this.activePlayers.length === 0) {
                alert(`HATA: ${this.currentSport} kategorisinde bu zorlukta oyuncu bulunamadı!`);
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
                <h1 class="title">${t.msg_time_up || 'SÜRE DOLDU!'}</h1>
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
