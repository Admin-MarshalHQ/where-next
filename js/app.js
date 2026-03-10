// ============================================
// "Where Next?" — Main Application
// ============================================

const App = {
  // --- State ---
  state: {
    screen: 'landing',
    gameId: null,
    playerNumber: null,
    playerName: '',
    currentPairIndex: 0,
    currentExpIndex: 0,
    responses: {
      thisOrThat: [],
      budgetCoins: { food: 0, accommodation: 0, activities: 0, transport: 0, nightlife: 0, rest: 0 },
      dealOrNoDeal: [],
      sliders: { pace: 0.5, planning: 0.5, social: 0.5, comfort: 0.5, food_adventure: 0.5 },
      wildcards: { must_not_miss: '', worry: '', perfect_day: '' },
      groundRules: ['']
    },
    scores: null,
    persona: null,
    transitioning: false
  },

  container: null,

  // --- Initialization ---
  init() {
    this.container = document.getElementById('app');
    FirebaseService.init();
    this.navigate('landing');
  },

  // --- Navigation ---
  navigate(screen) {
    if (this.state.transitioning) return;
    this.state.transitioning = true;

    const currentScreen = this.container.querySelector('.screen.active');
    if (currentScreen) {
      currentScreen.classList.add('exit');
      currentScreen.classList.remove('active');
    }

    this.state.screen = screen;

    setTimeout(() => {
      this.render();
      this.state.transitioning = false;
    }, currentScreen ? 250 : 0);
  },

  // --- Main Render ---
  render() {
    const renderers = {
      landing: () => this.renderLanding(),
      intro: () => this.renderIntro(),
      round1: () => this.renderRound1(),
      round2: () => this.renderRound2(),
      round3: () => this.renderRound3(),
      round4: () => this.renderRound4(),
      round5: () => this.renderRound5(),
      results: () => this.renderResults(),
      comparison: () => this.renderComparison(),
      share: () => this.renderShare()
    };

    const html = renderers[this.state.screen]?.() || '';
    // Remove old screens
    this.container.querySelectorAll('.screen').forEach(el => el.remove());
    // Insert new screen
    this.container.insertAdjacentHTML('beforeend', html);
    // Activate after a frame
    requestAnimationFrame(() => {
      const newScreen = this.container.querySelector('.screen:not(.active)');
      if (newScreen) newScreen.classList.add('active');
    });
  },

  // --- Progress Bar ---
  getProgress() {
    const screens = ['round1', 'round2', 'round3', 'round4', 'round5'];
    const idx = screens.indexOf(this.state.screen);
    if (idx < 0) return null;

    // Within-round progress
    let subProgress = 0;
    if (this.state.screen === 'round1') {
      subProgress = this.state.currentPairIndex / THIS_OR_THAT_PAIRS.length;
    } else if (this.state.screen === 'round3') {
      subProgress = this.state.currentExpIndex / EXPERIENCES.length;
    }

    const total = ((idx + subProgress) / screens.length) * 100;
    const roundNames = ['This or That', 'Budget Burner', 'Deal or No Deal', 'Pace Setter', 'Wildcards'];

    return { percent: total, label: `Round ${idx + 1} of 5 — ${roundNames[idx]}` };
  },

  renderProgressBar() {
    const progress = this.getProgress();
    if (!progress) return '';
    const canGoBack = this.canGoBack();
    return `
      <div class="progress-container">
        <div class="progress-top-row">
          ${canGoBack ? '<button class="back-btn" onclick="App.goBack()">← Back</button>' : '<span></span>'}
          <div class="progress-label">${progress.label}</div>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${progress.percent}%"></div>
        </div>
      </div>`;
  },

  canGoBack() {
    const s = this.state.screen;
    if (s === 'round1') return this.state.currentPairIndex > 0;
    if (s === 'round2') return true; // back to round 1
    if (s === 'round3') return true; // back to prev experience or round 2
    if (s === 'round4') return true; // back to round 3
    if (s === 'round5') return true; // back to round 4
    return false;
  },

  goBack() {
    if (this.state.transitioning) return;
    const s = this.state.screen;

    if (s === 'round1' && this.state.currentPairIndex > 0) {
      // Undo last This or That choice
      this.state.currentPairIndex--;
      this.state.responses.thisOrThat.pop();
      this.render();
      requestAnimationFrame(() => {
        const screen = this.container.querySelector('.screen:not(.active)');
        if (screen) screen.classList.add('active');
      });
    } else if (s === 'round2') {
      // Go back to last pair in Round 1
      this.state.currentPairIndex = THIS_OR_THAT_PAIRS.length - 1;
      this.state.responses.thisOrThat.pop();
      this.navigate('round1');
    } else if (s === 'round3' && this.state.currentExpIndex > 0) {
      // Undo last Deal or No Deal
      this.state.currentExpIndex--;
      this.state.responses.dealOrNoDeal.pop();
      this.render();
      requestAnimationFrame(() => {
        const screen = this.container.querySelector('.screen:not(.active)');
        if (screen) screen.classList.add('active');
      });
    } else if (s === 'round3' && this.state.currentExpIndex === 0) {
      // Go back to Round 2
      this.navigate('round2');
    } else if (s === 'round4') {
      // Go back to last experience in Round 3
      this.state.currentExpIndex = EXPERIENCES.length - 1;
      this.state.responses.dealOrNoDeal.pop();
      this.navigate('round3');
    } else if (s === 'round5') {
      this.navigate('round4');
    }
  },

  // ============================================
  // LANDING SCREEN
  // ============================================
  renderLanding() {
    return `
      <div class="screen landing">
        <div class="landing-icon">🌍</div>
        <h1>Where Next?</h1>
        <p class="subtitle">A little game I made for us. Play through a few quick rounds and let's see how our travel styles match up...</p>
        <div class="btn-group">
          <button class="btn btn-coral" onclick="App.pickPlayer('Rebecca')">I'm Rebecca 💃</button>
          <button class="btn btn-primary" onclick="App.pickPlayer('Sam')">I'm Sam 🎒</button>
        </div>
      </div>`;
  },

  async pickPlayer(name) {
    if (this.state.transitioning) return; // guard against double-tap
    this.state.transitioning = true;

    this.state.gameId = 'sam-and-rebecca';
    this.state.playerName = name;
    this.state.playerNumber = name === 'Rebecca' ? 1 : 2;
    this.state.currentPairIndex = 0;
    this.state.currentExpIndex = 0;

    try {
      // Check if this player already completed (await Firebase)
      const existing = await this.loadGame(this.state.gameId);
      const playerKey = `player_${this.state.playerNumber}`;
      if (existing && existing[playerKey]?.completed) {
        // Already played — go straight to results
        this.state.responses = existing[playerKey].responses;
        this.state.scores = existing[playerKey].scores;
        this.state.persona = existing[playerKey].persona;

        // Re-sync to Firebase in case it was missed (e.g. permissions were wrong earlier)
        this.saveGame();

        this.state.transitioning = false;
        this.navigate('results');
        return;
      }
    } catch (e) {
      console.warn('pickPlayer load error:', e);
    }

    this.state.transitioning = false;
    this.navigate('intro');
  },

  // ============================================
  // PERSONALISED INTRO
  // ============================================
  renderIntro() {
    const isRebecca = this.state.playerName === 'Rebecca';
    return `
      <div class="screen name-entry">
        <div class="landing-icon animate-bounce">${isRebecca ? '💕' : '🗺️'}</div>
        <h2>${isRebecca ? 'Hey Rebecca!' : 'Alright Sam'}</h2>
        ${isRebecca ? `
          <p>Sam made this little game for the two of you. There are 5 quick rounds — things like picking between travel styles, splitting a budget, and rating experiences.</p>
          <p style="margin-top:8px; opacity:0.7; font-size:13px;">It takes about 10 mins. Just go with your gut — there are no wrong answers. Once you're both done, you'll see how your travel styles compare!</p>
        ` : `
          <p>Quick fire rounds. Be honest, no peeking at Rebecca's answers!</p>
        `}
        <button class="btn btn-primary mt-16" onclick="App.navigate('round1')">Let's Go ✨</button>
      </div>`;
  },

  // ============================================
  // ROUND 1: THIS OR THAT
  // ============================================
  renderRound1() {
    const pair = THIS_OR_THAT_PAIRS[this.state.currentPairIndex];
    if (!pair) return this.completeRound1();

    return `
      <div class="screen">
        ${this.renderProgressBar()}
        <div class="round-header animate-in">
          <div class="round-number">Round 1</div>
          <div class="round-title">This or That</div>
          <div class="round-subtitle">Quick fire — just go with your gut!</div>
        </div>
        <div class="this-or-that-container">
          <div class="pair-counter">${this.state.currentPairIndex + 1} of ${THIS_OR_THAT_PAIRS.length}</div>
          <div class="choices-wrapper" id="choicesWrapper">
            <div class="choice-card card-enter" onclick="App.chooseThisOrThat('A')"
              style="background: linear-gradient(135deg, ${pair.optionA.colors[0]}, ${pair.optionA.colors[1]})">
              <div class="choice-emoji">${pair.optionA.emoji}</div>
              <div class="choice-title">${pair.optionA.title}</div>
            </div>
            <div class="choice-card card-enter" onclick="App.chooseThisOrThat('B')"
              style="background: linear-gradient(135deg, ${pair.optionB.colors[0]}, ${pair.optionB.colors[1]})">
              <div class="choice-emoji">${pair.optionB.emoji}</div>
              <div class="choice-title">${pair.optionB.title}</div>
            </div>
          </div>
          <div class="pair-reveals">${pair.reveals}</div>
        </div>
      </div>`;
  },

  chooseThisOrThat(choice) {
    if (this.state.transitioning) return;
    const pair = THIS_OR_THAT_PAIRS[this.state.currentPairIndex];
    this.state.responses.thisOrThat.push({ pairId: pair.id, choice });

    // Animate cards (guard against DOM being cleared by a concurrent re-render)
    const wrapper = document.getElementById('choicesWrapper');
    if (!wrapper) { setTimeout(() => { this.state.currentPairIndex++; this.render(); }, 0); return; }
    const cards = wrapper.querySelectorAll('.choice-card');

    cards.forEach((card, i) => {
      const isChosen = (choice === 'A' && i === 0) || (choice === 'B' && i === 1);
      card.classList.add(isChosen ? 'selected' : 'not-selected');
    });

    setTimeout(() => {
      this.state.currentPairIndex++;
      if (this.state.currentPairIndex >= THIS_OR_THAT_PAIRS.length) {
        this.navigate('round2');
      } else {
        this.render(); // Re-render same screen with next pair
        requestAnimationFrame(() => {
          const screen = this.container.querySelector('.screen:not(.active)');
          if (screen) screen.classList.add('active');
        });
      }
    }, 400);
  },

  completeRound1() {
    this.navigate('round2');
    return '<div class="screen"></div>';
  },

  // ============================================
  // ROUND 2: BUDGET BURNER
  // ============================================
  renderRound2() {
    const coins = this.state.responses.budgetCoins;
    const spent = Object.values(coins).reduce((a, b) => a + b, 0);
    const remaining = 10 - spent;

    const coinStackHtml = Array.from({ length: 10 }, (_, i) =>
      `<div class="coin ${i >= remaining ? 'spent' : ''}">$</div>`
    ).join('');

    const categoriesHtml = BUDGET_CATEGORIES.map(cat => {
      const count = coins[cat.id];
      const dots = Array.from({ length: 10 }, (_, i) =>
        `<div class="budget-dot ${i < count ? 'filled' : ''}"></div>`
      ).join('');

      return `
        <div class="budget-category">
          <div class="budget-cat-emoji">${cat.emoji}</div>
          <div class="budget-cat-info">
            <div class="budget-cat-title">${cat.title}</div>
            <div class="budget-cat-desc">${cat.description}</div>
            <div class="budget-dots">${dots}</div>
          </div>
          <div class="budget-controls">
            <button class="budget-btn minus" onclick="App.adjustBudget('${cat.id}', -1)" ${count <= 0 ? 'disabled' : ''}>−</button>
            <div class="budget-count">${count}</div>
            <button class="budget-btn plus" onclick="App.adjustBudget('${cat.id}', 1)" ${remaining <= 0 ? 'disabled' : ''}>+</button>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="screen">
        ${this.renderProgressBar()}
        <div class="round-header animate-in">
          <div class="round-number">Round 2</div>
          <div class="round-title">Budget Burner</div>
          <div class="round-subtitle">10 coins for our trip — where would you spend them?</div>
        </div>
        <div class="budget-container">
          <div class="coins-remaining">
            <div class="coin-count">${remaining}</div>
            <div class="coin-label">coins remaining</div>
            <div class="coin-stack">${coinStackHtml}</div>
          </div>
          <div class="budget-categories">${categoriesHtml}</div>
        </div>
        <div class="screen-footer">
          <button class="btn btn-primary" onclick="App.completeBudget()" ${remaining > 0 ? 'disabled style="opacity:0.5"' : ''}>
            ${remaining > 0 ? `Spend ${remaining} more coin${remaining > 1 ? 's' : ''}` : 'Continue →'}
          </button>
        </div>
      </div>`;
  },

  adjustBudget(categoryId, delta) {
    const coins = this.state.responses.budgetCoins;
    const spent = Object.values(coins).reduce((a, b) => a + b, 0);
    const newVal = coins[categoryId] + delta;
    if (newVal < 0 || (delta > 0 && spent >= 10)) return;
    coins[categoryId] = newVal;
    this.render();
    requestAnimationFrame(() => {
      const screen = this.container.querySelector('.screen:not(.active)');
      if (screen) screen.classList.add('active');
    });
  },

  completeBudget() {
    const spent = Object.values(this.state.responses.budgetCoins).reduce((a, b) => a + b, 0);
    if (spent < 10) return;
    this.navigate('round3');
  },

  // ============================================
  // ROUND 3: DEAL OR NO DEAL
  // ============================================
  renderRound3() {
    const exp = EXPERIENCES[this.state.currentExpIndex];
    if (!exp) return this.completeRound3();

    return `
      <div class="screen">
        ${this.renderProgressBar()}
        <div class="round-header animate-in">
          <div class="round-number">Round 3</div>
          <div class="round-title">Deal or No Deal</div>
          <div class="round-subtitle">Real experiences from our route — how keen are you?</div>
        </div>
        <div class="deal-container">
          <div class="experience-counter">${this.state.currentExpIndex + 1} of ${EXPERIENCES.length}</div>
          <div class="experience-card-wrapper">
            <div class="experience-card card-enter" id="expCard">
              <div class="exp-emoji">${exp.emoji}</div>
              <div class="exp-title">${exp.title}</div>
            </div>
          </div>
          <div class="deal-buttons">
            <button class="deal-btn must" onclick="App.rateDeal('must')">
              <div class="deal-btn-dot"></div>
              Must Do
            </button>
            <button class="deal-btn cool" onclick="App.rateDeal('cool')">
              <div class="deal-btn-dot"></div>
              Sounds Cool
            </button>
            <button class="deal-btn skip" onclick="App.rateDeal('skip')">
              <div class="deal-btn-dot"></div>
              Not Fussed
            </button>
          </div>
        </div>
      </div>`;
  },

  rateDeal(rating) {
    if (this.state.transitioning) return;
    const exp = EXPERIENCES[this.state.currentExpIndex];
    this.state.responses.dealOrNoDeal.push({ experienceId: exp.id, rating });

    // Animate card exit (guard against DOM being cleared by a concurrent re-render)
    const card = document.getElementById('expCard');
    if (!card) { setTimeout(() => { this.state.currentExpIndex++; this.render(); }, 0); return; }
    const exitClass = rating === 'must' ? 'exit-must' : rating === 'cool' ? 'exit-cool' : 'exit-skip';
    card.classList.add(exitClass);

    setTimeout(() => {
      this.state.currentExpIndex++;
      if (this.state.currentExpIndex >= EXPERIENCES.length) {
        this.navigate('round4');
      } else {
        this.render();
        requestAnimationFrame(() => {
          const screen = this.container.querySelector('.screen:not(.active)');
          if (screen) screen.classList.add('active');
        });
      }
    }, 350);
  },

  completeRound3() {
    this.navigate('round4');
    return '<div class="screen"></div>';
  },

  // ============================================
  // ROUND 4: PACE SETTER — SLIDERS
  // ============================================
  renderRound4() {
    const slidersHtml = SLIDER_CONFIGS.map(slider => {
      const value = this.state.responses.sliders[slider.id];
      return `
        <div class="slider-item animate-in">
          <div class="slider-header">
            <div class="slider-emoji">${slider.emoji}</div>
            <div class="slider-label">${slider.label}</div>
          </div>
          <div class="slider-track-wrapper">
            <input type="range" class="slider-input" min="0" max="100" value="${value * 100}"
              oninput="App.updateSlider('${slider.id}', this.value)">
          </div>
          <div class="slider-labels">
            <span>${slider.leftLabel}</span>
            <span style="text-align:right">${slider.rightLabel}</span>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="screen">
        ${this.renderProgressBar()}
        <div class="round-header animate-in">
          <div class="round-number">Round 4</div>
          <div class="round-title">Pace Setter</div>
          <div class="round-subtitle">How do you want our days to feel?</div>
        </div>
        <div class="sliders-container">${slidersHtml}</div>
        <div class="screen-footer">
          <button class="btn btn-primary" onclick="App.navigate('round5')">Continue →</button>
        </div>
      </div>`;
  },

  updateSlider(sliderId, value) {
    this.state.responses.sliders[sliderId] = parseInt(value) / 100;
  },

  // ============================================
  // ROUND 5: WILDCARDS
  // ============================================
  renderRound5() {
    const questionsHtml = WILDCARD_QUESTIONS.map((q, i) => `
      <div class="wildcard-item animate-in-delay-${i + 1}">
        <div class="wildcard-emoji">${q.emoji}</div>
        <div class="wildcard-question">${q.question}</div>
        <textarea class="wildcard-input" id="wildcard_${q.id}"
          placeholder="${q.placeholder}"
          oninput="App.updateWildcard('${q.id}', this.value)">${this.state.responses.wildcards[q.id]}</textarea>
      </div>
    `).join('');

    // Ground rules section
    const rules = this.state.responses.groundRules;
    const rulesHtml = rules.map((rule, i) => `
      <div class="ground-rule-row">
        <span class="ground-rule-num">${i + 1}.</span>
        <input type="text" class="ground-rule-input" value="${this.escapeHtml(rule)}"
          placeholder="${GROUND_RULE_SUGGESTIONS[i % GROUND_RULE_SUGGESTIONS.length]}"
          oninput="App.updateGroundRule(${i}, this.value)" maxlength="100">
        ${rules.length > 1 ? `<button class="ground-rule-remove" onclick="App.removeGroundRule(${i})">×</button>` : ''}
      </div>
    `).join('');

    return `
      <div class="screen">
        ${this.renderProgressBar()}
        <div class="round-header animate-in">
          <div class="round-number">Round 5</div>
          <div class="round-title">Final Thoughts</div>
          <div class="round-subtitle">Nearly there — a few last things about our trip</div>
        </div>
        <div class="wildcards-container">
          ${questionsHtml}

          <div class="wildcard-item ground-rules-section animate-in-delay-3">
            <div class="wildcard-emoji">📏</div>
            <div class="wildcard-question">Lay down your ground rules</div>
            <p class="ground-rules-hint">Non-negotiables, boundaries, things that'll keep the trip stress-free</p>
            <div class="ground-rules-list" id="groundRulesList">
              ${rulesHtml}
            </div>
            ${rules.length < 8 ? `<button class="ground-rule-add" onclick="App.addGroundRule()">+ Add another rule</button>` : ''}
          </div>
        </div>
        <div class="screen-footer">
          <button class="btn btn-accent" onclick="App.finishGame()">See My Results ✨</button>
        </div>
      </div>`;
  },

  updateWildcard(id, value) {
    this.state.responses.wildcards[id] = value;
  },

  // --- Utilities ---
  safeParseJSON(str, fallback = null) {
    if (str == null) return fallback;
    try { return JSON.parse(str); }
    catch (e) { console.warn('JSON parse failed:', e); return fallback; }
  },

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  updateGroundRule(index, value) {
    this.state.responses.groundRules[index] = value;
  },

  addGroundRule() {
    if (this.state.responses.groundRules.length >= 8) return;
    this.state.responses.groundRules.push('');
    // Re-render just the rules list area
    this.render();
    requestAnimationFrame(() => {
      const screen = this.container.querySelector('.screen:not(.active)');
      if (screen) screen.classList.add('active');
      // Focus the new input
      const inputs = document.querySelectorAll('.ground-rule-input');
      if (inputs.length) inputs[inputs.length - 1].focus();
    });
  },

  removeGroundRule(index) {
    this.state.responses.groundRules.splice(index, 1);
    if (this.state.responses.groundRules.length === 0) {
      this.state.responses.groundRules.push('');
    }
    this.render();
    requestAnimationFrame(() => {
      const screen = this.container.querySelector('.screen:not(.active)');
      if (screen) screen.classList.add('active');
    });
  },

  // ============================================
  // FINISH & CALCULATE
  // ============================================
  async finishGame() {
    // Calculate scores
    this.state.scores = PersonaEngine.calculateScores(this.state.responses);
    this.state.persona = PersonaEngine.determinePersona(this.state.scores);

    // Save to localStorage + Firebase (await ensures Firebase write completes)
    try {
      await this.saveGame();
    } catch (e) {
      console.warn('saveGame error in finishGame:', e);
    }

    this.navigate('results');
  },

  // ============================================
  // RESULTS SCREEN
  // ============================================
  renderResults() {
    const { scores, persona, playerName } = this.state;

    const scoreColors = {
      adventure: '#f5af19',
      culture: '#6a11cb',
      relaxation: '#00b894',
      social: '#e17055',
      budget: '#fdcb6e',
      food: '#ff6b6b'
    };

    const scoreBarsHtml = DIMENSIONS.map(dim => `
      <div class="score-row">
        <div class="score-label">${dim}</div>
        <div class="score-bar-bg">
          <div class="score-bar-fill" style="width: ${scores[dim] * 10}%; background: ${scoreColors[dim]}"></div>
        </div>
        <div class="score-value">${scores[dim]}</div>
      </div>
    `).join('');

    // Check if the other player has finished
    const otherPlayer = this.getOtherPlayer();
    const canCompare = !!otherPlayer;

    const wildcardHtml = Object.entries(this.state.responses.wildcards)
      .filter(([_, val]) => val.trim())
      .map(([key, val]) => {
        const q = WILDCARD_QUESTIONS.find(wq => wq.id === key);
        return `<div class="comparison-item">${q?.emoji || ''} <strong>${q?.question || key}</strong><br>"${val}"</div>`;
      }).join('');

    return `
      <div class="screen results-screen">
        <div class="results-content">
          <div class="results-header animate-in">
            <h2>You're done!</h2>
            <h1>${playerName}'s Travel Persona</h1>
          </div>

          <div class="persona-card animate-in-delay-1">
            <div class="persona-emoji">${persona.emoji}</div>
            <div class="persona-name">${persona.name}</div>
            <div class="persona-desc">${persona.description}</div>
          </div>

          <div class="radar-wrapper animate-in-delay-2">
            <div class="radar-title">Your Travel DNA</div>
            <canvas class="radar-chart" id="radarChart" width="280" height="280"></canvas>
            <div class="score-bars">${scoreBarsHtml}</div>
          </div>

          ${wildcardHtml ? `
          <div class="radar-wrapper animate-in-delay-3">
            <div class="radar-title">Your Wild Cards</div>
            ${wildcardHtml}
          </div>` : ''}

          ${this.renderGroundRulesResult(this.state.responses.groundRules, playerName)}
        </div>

        <div class="screen-footer screen-footer-dark">
          ${canCompare ?
            `<button class="btn btn-accent" onclick="App.navigate('comparison')">See How We Compare 🔥</button>` :
            `<button class="btn btn-primary" onclick="App.navigate('share')">
              ${this.state.playerName === 'Rebecca' ? "Done! Now get Sam to play 👀" : "Waiting for Rebecca... 💕"}
            </button>`
          }
        </div>
      </div>`;
  },

  renderGroundRulesResult(rules, name) {
    const filledRules = (rules || []).filter(r => r.trim());
    if (!filledRules.length) return '';
    return `
      <div class="radar-wrapper animate-in-delay-3">
        <div class="radar-title">📏 ${name ? name + "'s " : ''}Ground Rules</div>
        <div class="ground-rules-result">
          ${filledRules.map(r => `<div class="ground-rule-result-item">🚫 ${r}</div>`).join('')}
        </div>
      </div>`;
  },

  // ============================================
  // SHARE SCREEN
  // ============================================
  renderShare() {
    const isRebecca = this.state.playerName === 'Rebecca';
    return `
      <div class="screen share-screen">
        <div class="landing-icon animate-bounce">${isRebecca ? '🎒' : '💃'}</div>
        <h2 style="color:white; font-size:22px; margin-top:16px;">
          ${isRebecca ? 'Now hand the phone to Sam!' : "Now get Rebecca to play!"}
        </h2>
        <p style="color:rgba(255,255,255,0.6); font-size:14px;">
          ${isRebecca
            ? "Don't peek at each other's answers — the comparison at the end is the best bit!"
            : "She just needs to tap \"I'm Rebecca\" on the home screen and play through the rounds."
          }
        </p>

        <div class="btn-group" style="margin-top:24px;">
          <button class="btn btn-secondary" onclick="App.navigate('results')">Back to My Results</button>
          <button class="btn btn-accent" onclick="App.navigate('landing')">Go to Home Screen 🏠</button>
        </div>
        <p style="color:rgba(255,255,255,0.4); font-size:12px; margin-top:24px;">
          Once you've both played, hit "See How We Compare" from the results page 🔥
        </p>
      </div>`;
  },

  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  },

  // ============================================
  // COMPARISON VIEW
  // ============================================
  renderComparison() {
    const otherPlayer = this.getOtherPlayer();
    const otherName = this.state.playerName === 'Rebecca' ? 'Sam' : 'Rebecca';
    if (!otherPlayer) {
      return `<div class="screen share-screen">
        <div class="landing-icon">⏳</div>
        <h2 style="color:white">Waiting for ${otherName}...</h2>
        <p style="color:rgba(255,255,255,0.6)">${otherName} hasn't finished playing yet. Check back soon!</p>
        <button class="btn btn-secondary mt-24" onclick="App.navigate('results')">Back to Results</button>
      </div>`;
    }

    const player1 = {
      name: this.state.playerName,
      scores: this.state.scores,
      persona: this.state.persona,
      responses: this.state.responses
    };
    const player2 = otherPlayer;
    const comparison = PersonaEngine.generateComparison(player1, player2);

    const alignHtml = comparison.alignments.map(a =>
      `<div class="comparison-item">✅ ${a.message}</div>`
    ).join('');

    const diffHtml = comparison.differences.map(d =>
      `<div class="comparison-item">⚡ ${d.message}</div>`
    ).join('');

    const compHtml = comparison.compromises.map(c =>
      `<div class="comparison-item">💡 ${c}</div>`
    ).join('');

    const mustDoHtml = comparison.combinedMustDos.map(exp =>
      `<div class="comparison-item">${exp.emoji} ${exp.title}</div>`
    ).join('') || '<div class="comparison-item">No shared must-dos yet</div>';

    return `
      <div class="screen comparison-screen">
        <div class="comparison-content">
          <div class="comparison-header animate-in">
            <h2>Sam & Rebecca</h2>
            <h1>Trip Compatibility 💕</h1>
          </div>

          <div class="comparison-personas animate-in-delay-1">
            <div class="mini-persona">
              <div class="mini-persona-emoji">${this.state.persona.emoji}</div>
              <div class="mini-persona-name">${this.state.playerName}</div>
              <div class="mini-persona-type">${this.state.persona.name}</div>
            </div>
            <div class="mini-persona">
              <div class="mini-persona-emoji">${player2.persona.emoji}</div>
              <div class="mini-persona-name">${player2.name}</div>
              <div class="mini-persona-type">${player2.persona.name}</div>
            </div>
          </div>

          <div class="comparison-radar animate-in-delay-2">
            <div class="radar-title">Overlaid Travel DNA</div>
            <canvas class="radar-chart" id="comparisonRadar" width="280" height="280"></canvas>
          </div>

          ${alignHtml ? `
          <div class="comparison-section animate-in-delay-2">
            <div class="comparison-section-title align">🤝 Where You Align</div>
            ${alignHtml}
          </div>` : ''}

          ${diffHtml ? `
          <div class="comparison-section animate-in-delay-3">
            <div class="comparison-section-title differ">⚡ Where You Differ</div>
            ${diffHtml}
          </div>` : ''}

          ${compHtml ? `
          <div class="comparison-section">
            <div class="comparison-section-title compromise">💡 Potential Compromises</div>
            ${compHtml}
          </div>` : ''}

          <div class="comparison-section">
            <div class="comparison-section-title must-dos">🎯 Combined Must-Dos</div>
            ${mustDoHtml}
          </div>

          ${this.renderComparisonGroundRules(player1, player2)}
        </div>

        <div class="screen-footer screen-footer-dark">
          <button class="btn btn-secondary" onclick="App.navigate('results')">Back to My Results</button>
        </div>
      </div>`;
  },

  renderComparisonGroundRules(player1, player2) {
    const p1Rules = (player1.responses.groundRules || []).filter(r => r.trim());
    const p2Rules = (player2.responses.groundRules || []).filter(r => r.trim());
    if (!p1Rules.length && !p2Rules.length) return '';

    let html = `<div class="comparison-section">
      <div class="comparison-section-title" style="background:rgba(255,107,107,0.15); color:#fab1a0;">📏 Ground Rules</div>`;

    if (p1Rules.length) {
      html += `<div class="comparison-item" style="font-weight:600; opacity:0.6; margin-top:4px;">${player1.name}'s rules:</div>`;
      p1Rules.forEach(r => { html += `<div class="comparison-item">🚫 ${r}</div>`; });
    }
    if (p2Rules.length) {
      html += `<div class="comparison-item" style="font-weight:600; opacity:0.6; margin-top:8px;">${player2.name}'s rules:</div>`;
      p2Rules.forEach(r => { html += `<div class="comparison-item">🚫 ${r}</div>`; });
    }

    html += '</div>';
    return html;
  },

  // ============================================
  // RADAR CHART DRAWING
  // ============================================
  drawRadarChart(canvasId, datasets) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 280 * dpr;
    canvas.height = 280 * dpr;
    ctx.scale(dpr, dpr);

    const cx = 140, cy = 140, radius = 110;
    const dims = DIMENSIONS;
    const count = dims.length;
    const angleStep = (Math.PI * 2) / count;

    // Clear
    ctx.clearRect(0, 0, 280, 280);

    // Draw grid rings
    for (let ring = 1; ring <= 5; ring++) {
      const r = (ring / 5) * radius;
      ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines and labels
    dims.forEach((dim, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      const labelX = cx + (radius + 18) * Math.cos(angle);
      const labelY = cy + (radius + 18) * Math.sin(angle);
      ctx.font = '10px Poppins, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dim.charAt(0).toUpperCase() + dim.slice(1), labelX, labelY);
    });

    // Draw data polygons
    datasets.forEach(dataset => {
      ctx.beginPath();
      dims.forEach((dim, i) => {
        const val = (dataset.scores[dim] || 0) / 10;
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + radius * val * Math.cos(angle);
        const y = cy + radius * val * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();

      ctx.fillStyle = dataset.fillColor || 'rgba(108, 92, 231, 0.3)';
      ctx.fill();
      ctx.strokeStyle = dataset.strokeColor || '#6C5CE7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw dots
      dims.forEach((dim, i) => {
        const val = (dataset.scores[dim] || 0) / 10;
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + radius * val * Math.cos(angle);
        const y = cy + radius * val * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = dataset.strokeColor || '#6C5CE7';
        ctx.fill();
      });
    });
  },

  // ============================================
  // DATA PERSISTENCE (Firebase + localStorage fallback)
  // ============================================
  async saveGame() {
    const key = `wherenext_${this.state.gameId}`;
    const playerKey = `player_${this.state.playerNumber}`;
    // Strip functions from persona (Firestore can't store them)
    const personaObj = this.state.persona || {};
    const { test, ...personaSafe } = personaObj;
    const playerData = {
      name: this.state.playerName,
      completed: true,
      responses: this.state.responses,
      scores: this.state.scores,
      persona: personaSafe
    };

    // Always save to localStorage as fallback
    let gameData = this.safeParseJSON(localStorage.getItem(key), {});
    gameData[playerKey] = playerData;
    localStorage.setItem(key, JSON.stringify(gameData));

    // Also save to Firebase if available
    if (FirebaseService.enabled) {
      await FirebaseService.savePlayer(this.state.gameId, this.state.playerNumber, playerData);
    }
  },

  async loadGame(gameId) {
    // Try Firebase first
    if (FirebaseService.enabled) {
      const fbData = await FirebaseService.loadGame(gameId);
      if (fbData) {
        // Also cache to localStorage
        const key = `wherenext_${gameId}`;
        localStorage.setItem(key, JSON.stringify(fbData));
        return fbData;
      }
    }

    // Fallback to localStorage
    const key = `wherenext_${gameId}`;
    return this.safeParseJSON(localStorage.getItem(key), null);
  },

  getOtherPlayer() {
    // Synchronous localStorage check (for immediate rendering)
    const key = `wherenext_${this.state.gameId}`;
    const gameData = this.safeParseJSON(localStorage.getItem(key), null);
    if (!gameData) return null;

    const otherKey = this.state.playerNumber === 1 ? 'player_2' : 'player_1';
    const other = gameData[otherKey];
    if (!other || !other.completed) return null;

    return other;
  },

  // Check Firebase for other player (async)
  async checkForOtherPlayer() {
    if (!FirebaseService.enabled) return;
    const fbData = await FirebaseService.loadGame(this.state.gameId);
    if (fbData) {
      const key = `wherenext_${this.state.gameId}`;
      localStorage.setItem(key, JSON.stringify(fbData));
      // Re-render if we're on results and other player is now available
      if (this.state.screen === 'results' && !this._otherPlayerRenderPending) {
        this._otherPlayerRenderPending = true;
        this.render();
        requestAnimationFrame(() => {
          const screen = this.container.querySelector('.screen:not(.active)');
          if (screen) screen.classList.add('active');
          this._otherPlayerRenderPending = false;
        });
      }
    }
  },

  // ============================================
  // REAL-TIME LISTENER (cross-device sync)
  // ============================================
  _firebaseUnsubscribe: null,
  _otherPlayerRenderPending: false,

  startListeningForOtherPlayer() {
    // Stop any existing listener
    this.stopListeningForOtherPlayer();

    // Try real-time listener first
    if (FirebaseService.enabled) {
      this._firebaseUnsubscribe = FirebaseService.onGameUpdate(this.state.gameId, (data) => {
        if (!data) return;
        // Cache to localStorage
        const key = `wherenext_${this.state.gameId}`;
        localStorage.setItem(key, JSON.stringify(data));

        // Check if the other player has now completed
        const otherKey = this.state.playerNumber === 1 ? 'player_2' : 'player_1';
        if (data[otherKey]?.completed && this.state.screen === 'results' && !this.state.transitioning && !this._otherPlayerRenderPending) {
          this._otherPlayerRenderPending = true;
          this.render();
          requestAnimationFrame(() => {
            const screen = this.container.querySelector('.screen:not(.active)');
            if (screen) screen.classList.add('active');
            this._otherPlayerRenderPending = false;
          });
        }
      });
    }

    // Also do an immediate async check as fallback
    this.checkForOtherPlayer();
  },

  stopListeningForOtherPlayer() {
    if (this._firebaseUnsubscribe) {
      this._firebaseUnsubscribe();
      this._firebaseUnsubscribe = null;
    }
  },

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================
  afterRender() {
    // Draw radar charts after DOM is ready
    if (this.state.screen === 'results') {
      setTimeout(() => {
        this.drawRadarChart('radarChart', [{
          scores: this.state.scores,
          fillColor: 'rgba(108, 92, 231, 0.3)',
          strokeColor: '#6C5CE7'
        }]);
      }, 500);

      // Start listening for the other player's data (cross-device)
      this.startListeningForOtherPlayer();
    } else {
      // Stop listening when leaving results
      this.stopListeningForOtherPlayer();
    }

    if (this.state.screen === 'comparison') {
      setTimeout(() => {
        const other = this.getOtherPlayer();
        if (other) {
          this.drawRadarChart('comparisonRadar', [
            { scores: this.state.scores, fillColor: 'rgba(108, 92, 231, 0.3)', strokeColor: '#6C5CE7' },
            { scores: other.scores, fillColor: 'rgba(255, 107, 107, 0.3)', strokeColor: '#FF6B6B' }
          ]);
        }
      }, 500);
    }
  }
};

// Override render to include afterRender
const originalRender = App.render.bind(App);
App.render = function() {
  originalRender();
  const screenAtRender = App.state.screen;
  setTimeout(() => {
    if (App.state.screen === screenAtRender) App.afterRender();
  }, 100);
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
