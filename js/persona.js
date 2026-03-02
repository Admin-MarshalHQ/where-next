// ============================================
// "Where Next?" — Persona Engine
// ============================================

const PersonaEngine = {

  // Calculate scores across all 6 dimensions from all round responses
  calculateScores(responses) {
    const scores = { adventure: 0, culture: 0, relaxation: 0, social: 0, budget: 0, food: 0 };
    const maxRaw = { adventure: 0, culture: 0, relaxation: 0, social: 0, budget: 0, food: 0 };

    // --- Round 1: This or That ---
    if (responses.thisOrThat) {
      responses.thisOrThat.forEach(answer => {
        const pair = THIS_OR_THAT_PAIRS.find(p => p.id === answer.pairId);
        if (!pair) return;
        const chosen = answer.choice === 'A' ? pair.scoreA : pair.scoreB;
        const maxOption = {};
        // Add max possible from both options
        [pair.scoreA, pair.scoreB].forEach(opt => {
          Object.entries(opt).forEach(([dim, val]) => {
            maxOption[dim] = Math.max(maxOption[dim] || 0, val);
          });
        });
        Object.entries(chosen).forEach(([dim, val]) => { scores[dim] += val; });
        Object.entries(maxOption).forEach(([dim, val]) => { maxRaw[dim] += val; });
      });
    }

    // --- Round 2: Budget Burner ---
    if (responses.budgetCoins) {
      const totalCoins = 10;
      BUDGET_CATEGORIES.forEach(cat => {
        const coins = responses.budgetCoins[cat.id] || 0;
        const dim = cat.dimension;
        scores[dim] += coins * 0.8; // Scale: 0-8 per dimension max
        maxRaw[dim] += totalCoins * 0.8;
      });
    }

    // --- Round 3: Deal or No Deal ---
    if (responses.dealOrNoDeal) {
      responses.dealOrNoDeal.forEach(answer => {
        const exp = EXPERIENCES.find(e => e.id === answer.experienceId);
        if (!exp) return;
        const multiplier = answer.rating === 'must' ? 1.0 : answer.rating === 'cool' ? 0.5 : 0;
        Object.entries(exp.tags).forEach(([dim, val]) => {
          scores[dim] += val * multiplier;
          maxRaw[dim] += val;
        });
      });
    }

    // --- Round 4: Pace Setter Sliders ---
    if (responses.sliders) {
      SLIDER_CONFIGS.forEach(slider => {
        const value = responses.sliders[slider.id];
        if (value === undefined) return;
        // value is 0-1. 0 = fully left, 1 = fully right
        Object.entries(slider.leftScores).forEach(([dim, val]) => {
          scores[dim] += val * (1 - value);
          maxRaw[dim] += val;
        });
        Object.entries(slider.rightScores).forEach(([dim, val]) => {
          scores[dim] += val * value;
          maxRaw[dim] += val;
        });
      });
    }

    // Normalize all scores to 0-10 scale
    const normalized = {};
    DIMENSIONS.forEach(dim => {
      if (maxRaw[dim] > 0) {
        normalized[dim] = Math.round((scores[dim] / maxRaw[dim]) * 10 * 10) / 10;
      } else {
        normalized[dim] = 5; // default middle
      }
      normalized[dim] = Math.max(0, Math.min(10, normalized[dim]));
    });

    return normalized;
  },

  // Determine travel persona from scores
  determinePersona(scores) {
    const personas = [
      {
        name: 'The Explorer',
        emoji: '🧭',
        description: 'All about hikes, ruins, and early mornings. You want to see it all and tick off bucket-list adventures.',
        color: '#11998e',
        test: (s) => s.adventure >= 7 && s.culture >= 5
      },
      {
        name: 'The Viber',
        emoji: '🌺',
        description: 'Beaches, nightlife, and going with the flow. No alarm clocks, just good vibes and golden hour.',
        color: '#f953c6',
        test: (s) => s.relaxation >= 7 && s.social >= 5 && s.adventure < 6
      },
      {
        name: 'The Adventurer',
        emoji: '🎒',
        description: 'Every adrenaline activity on the list, budget-conscious, and loves meeting people in hostels.',
        color: '#f5af19',
        test: (s) => s.adventure >= 8
      },
      {
        name: 'The Culture Vulture',
        emoji: '🏛️',
        description: 'Cities, food, history, and museums. You travel to learn and taste everything a place has to offer.',
        color: '#6a11cb',
        test: (s) => s.culture >= 7 && s.food >= 5
      },
      {
        name: 'The Foodie Wanderer',
        emoji: '🍜',
        description: 'The trip revolves around meals. Street markets, cooking classes, and wine tastings are your non-negotiables.',
        color: '#ff6b6b',
        test: (s) => s.food >= 7
      },
      {
        name: 'The Social Butterfly',
        emoji: '🦋',
        description: 'You thrive in hostels and group tours. Meeting locals and fellow travellers is what makes a trip.',
        color: '#00b894',
        test: (s) => s.social >= 7
      },
      {
        name: 'The Balanced Traveller',
        emoji: '🧘',
        description: 'A mix of everything with built-in downtime. You appreciate variety and value a good balance of adventure and rest.',
        color: '#0984e3',
        test: () => true // fallback
      }
    ];

    // Find the best matching persona
    for (const persona of personas) {
      if (persona.test(scores)) {
        return persona;
      }
    }
    return personas[personas.length - 1]; // fallback
  },

  // Generate comparison between two players
  generateComparison(player1, player2) {
    const alignments = [];
    const differences = [];
    const compromises = [];

    // Compare dimension scores
    DIMENSIONS.forEach(dim => {
      const diff = Math.abs(player1.scores[dim] - player2.scores[dim]);
      const label = dim.charAt(0).toUpperCase() + dim.slice(1);
      if (diff <= 2) {
        alignments.push({
          dimension: dim,
          message: `You both value ${label.toLowerCase()} about the same!`
        });
      } else {
        const who1 = player1.scores[dim] > player2.scores[dim] ? player1.name : player2.name;
        const who2 = player1.scores[dim] > player2.scores[dim] ? player2.name : player1.name;
        differences.push({
          dimension: dim,
          message: `${who1} wants more ${label.toLowerCase()} than ${who2}`
        });
      }
    });

    // Compare Deal or No Deal responses
    const combinedMustDos = [];
    if (player1.responses.dealOrNoDeal && player2.responses.dealOrNoDeal) {
      const p1Musts = new Set(player1.responses.dealOrNoDeal.filter(r => r.rating === 'must').map(r => r.experienceId));
      const p2Musts = new Set(player2.responses.dealOrNoDeal.filter(r => r.rating === 'must').map(r => r.experienceId));

      p1Musts.forEach(id => {
        if (p2Musts.has(id)) {
          const exp = EXPERIENCES.find(e => e.id === id);
          if (exp) combinedMustDos.push(exp);
        }
      });
    }

    // Generate compromises based on differences
    differences.forEach(diff => {
      switch (diff.dimension) {
        case 'adventure':
          compromises.push('Alternate: one adventure day, one chill day');
          break;
        case 'social':
          compromises.push('Mix it up: some hostel nights, some private stays');
          break;
        case 'budget':
          compromises.push('Splurge on one thing each, save on the rest');
          break;
        case 'relaxation':
          compromises.push('Schedule proper rest days between big activities');
          break;
        case 'food':
          compromises.push('One street food meal, one nice restaurant per day');
          break;
        case 'culture':
          compromises.push('Alternate museum days with outdoor adventures');
          break;
      }
    });

    // Compare budget allocations
    const budgetAlignments = [];
    const budgetDifferences = [];
    if (player1.responses.budgetCoins && player2.responses.budgetCoins) {
      BUDGET_CATEGORIES.forEach(cat => {
        const p1 = player1.responses.budgetCoins[cat.id] || 0;
        const p2 = player2.responses.budgetCoins[cat.id] || 0;
        if (Math.abs(p1 - p2) <= 1) {
          budgetAlignments.push(`${cat.emoji} ${cat.title}`);
        } else {
          const who = p1 > p2 ? player1.name : player2.name;
          budgetDifferences.push(`${who} prioritises ${cat.title.toLowerCase()} more`);
        }
      });
    }

    return {
      alignments,
      differences,
      compromises: [...new Set(compromises)],
      combinedMustDos,
      budgetAlignments,
      budgetDifferences
    };
  }
};
