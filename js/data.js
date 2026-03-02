// ============================================
// "Where Next?" — Game Data
// ============================================

const THIS_OR_THAT_PAIRS = [
  {
    id: 'beach_vs_mountain',
    optionA: { title: 'Beach Hammock', emoji: '🏖️', colors: ['#a8edea', '#fed6e3'] },
    optionB: { title: 'Mountain Summit', emoji: '⛰️', colors: ['#667db6', '#0082c8'] },
    reveals: 'Nature preference',
    scoreA: { relaxation: 2 },
    scoreB: { adventure: 2 }
  },
  {
    id: 'street_food_vs_restaurant',
    optionA: { title: 'Street Food Stall', emoji: '🍜', colors: ['#f7971e', '#ffd200'] },
    optionB: { title: 'Restaurant with a View', emoji: '🍷', colors: ['#834d9b', '#d04ed6'] },
    reveals: 'Food/budget style',
    scoreA: { food: 2, budget: 1 },
    scoreB: { food: 2, culture: 1 }
  },
  {
    id: 'hostel_vs_cabin',
    optionA: { title: 'Hostel Common Room', emoji: '🛏️', colors: ['#f2994a', '#f2c94c'] },
    optionB: { title: 'Private Cabin', emoji: '🏡', colors: ['#56ab2f', '#a8e063'] },
    reveals: 'Social vs. couple time',
    scoreA: { social: 2, budget: 1 },
    scoreB: { relaxation: 2 }
  },
  {
    id: 'ruins_vs_city',
    optionA: { title: 'Ancient Ruins', emoji: '🏛️', colors: ['#c9d6ff', '#e2e2e2'] },
    optionB: { title: 'Colourful City Street', emoji: '🎨', colors: ['#fc5c7d', '#6a82fb'] },
    reveals: 'History vs. culture',
    scoreA: { culture: 2, adventure: 1 },
    scoreB: { culture: 2, social: 1 }
  },
  {
    id: 'sunrise_vs_latenight',
    optionA: { title: 'Sunrise Hike', emoji: '🌅', colors: ['#f5af19', '#f12711'] },
    optionB: { title: 'Late-Night Bar', emoji: '🍸', colors: ['#0f0c29', '#302b63'] },
    reveals: 'Morning person vs. night owl',
    scoreA: { adventure: 2 },
    scoreB: { social: 2 }
  },
  {
    id: 'scuba_vs_zipline',
    optionA: { title: 'Scuba Diving', emoji: '🤿', colors: ['#00c6ff', '#0072ff'] },
    optionB: { title: 'Zip-Lining', emoji: '🧗', colors: ['#11998e', '#38ef7d'] },
    reveals: 'Water vs. land adventure',
    scoreA: { adventure: 2, relaxation: 1 },
    scoreB: { adventure: 3 }
  },
  {
    id: 'market_vs_museum',
    optionA: { title: 'Market Shopping', emoji: '🛍️', colors: ['#ee9ca7', '#ffdde1'] },
    optionB: { title: 'Museum Visit', emoji: '🖼️', colors: ['#bdc3c7', '#2c3e50'] },
    reveals: 'Activity style',
    scoreA: { food: 1, social: 1, budget: 1 },
    scoreB: { culture: 3 }
  },
  {
    id: 'bus_vs_flight',
    optionA: { title: 'Overnight Bus', emoji: '🚌', colors: ['#4b6cb7', '#182848'] },
    optionB: { title: 'Short Flight', emoji: '✈️', colors: ['#e0eafc', '#cfdef3'] },
    reveals: 'Transport comfort level',
    scoreA: { budget: 2, adventure: 1 },
    scoreB: { relaxation: 2 }
  },
  {
    id: 'party_vs_cove',
    optionA: { title: 'Busy Beach Party', emoji: '🎉', colors: ['#f953c6', '#b91d73'] },
    optionB: { title: 'Secluded Hidden Cove', emoji: '🏝️', colors: ['#43cea2', '#185a9d'] },
    reveals: 'Crowds vs. solitude',
    scoreA: { social: 3 },
    scoreB: { relaxation: 3 }
  },
  {
    id: 'cooking_vs_dance',
    optionA: { title: 'Cooking Class', emoji: '👨‍🍳', colors: ['#ff9966', '#ff5e62'] },
    optionB: { title: 'Dance Class', emoji: '💃', colors: ['#a18cd1', '#fbc2eb'] },
    reveals: 'Experience type',
    scoreA: { food: 2, culture: 1 },
    scoreB: { social: 2, culture: 1 }
  },
  {
    id: 'jungle_vs_desert',
    optionA: { title: 'Jungle Trek', emoji: '🌿', colors: ['#134e5e', '#71b280'] },
    optionB: { title: 'Desert Landscape', emoji: '🏜️', colors: ['#c2956d', '#eb9d6e'] },
    reveals: 'Terrain preference',
    scoreA: { adventure: 2, culture: 1 },
    scoreB: { adventure: 2 }
  },
  {
    id: 'boat_vs_road',
    optionA: { title: 'Boat Trip', emoji: '🚤', colors: ['#2193b0', '#6dd5ed'] },
    optionB: { title: 'Road Trip', emoji: '🚗', colors: ['#de6262', '#ffb88c'] },
    reveals: 'Transport romance',
    scoreA: { relaxation: 2, adventure: 1 },
    scoreB: { adventure: 2, social: 1 }
  },
  {
    id: 'wildlife_vs_volcano',
    optionA: { title: 'Wildlife Spotting', emoji: '🦁', colors: ['#a1c4fd', '#c2e9fb'] },
    optionB: { title: 'Volcano Hike', emoji: '🌋', colors: ['#f12711', '#f5af19'] },
    reveals: 'Nature sub-preference',
    scoreA: { adventure: 1, culture: 1, relaxation: 1 },
    scoreB: { adventure: 3 }
  },
  {
    id: 'music_vs_rooftop',
    optionA: { title: 'Live Music Venue', emoji: '🎵', colors: ['#6a11cb', '#2575fc'] },
    optionB: { title: 'Rooftop Cocktail Bar', emoji: '🍹', colors: ['#f7797d', '#FBD786'] },
    reveals: 'Nightlife style',
    scoreA: { social: 2, culture: 1 },
    scoreB: { relaxation: 2, social: 1 }
  },
  {
    id: 'waterfall_vs_hotspring',
    optionA: { title: 'Waterfall Swim', emoji: '🌊', colors: ['#00d2ff', '#3a7bd5'] },
    optionB: { title: 'Hot Springs Soak', emoji: '♨️', colors: ['#f093fb', '#f5576c'] },
    reveals: 'Relaxation style',
    scoreA: { adventure: 1, relaxation: 2 },
    scoreB: { relaxation: 3 }
  }
];

const BUDGET_CATEGORIES = [
  { id: 'food', title: 'Food & Drink', emoji: '🍽️', description: 'Street food ↔ nice restaurants', dimension: 'food' },
  { id: 'accommodation', title: 'Accommodation', emoji: '🏠', description: 'Dorms ↔ boutique hotels', dimension: 'relaxation' },
  { id: 'activities', title: 'Activities & Experiences', emoji: '🎯', description: 'Free walks ↔ paid tours', dimension: 'adventure' },
  { id: 'transport', title: 'Transport Comfort', emoji: '🚐', description: 'Chicken buses ↔ private transfers', dimension: 'budget' },
  { id: 'nightlife', title: 'Nightlife & Going Out', emoji: '🎆', description: 'Bar hopping, clubs, events', dimension: 'social' },
  { id: 'rest', title: 'Rest & Downtime', emoji: '🧘', description: 'Spa days, slow mornings, beach days', dimension: 'relaxation' }
];

const EXPERIENCES = [
  { id: 'chichen_itza', title: 'Chichén Itzá day trip', emoji: '🏛️', tags: { culture: 2, adventure: 1 } },
  { id: 'cenote', title: 'Cenote swimming', emoji: '💎', tags: { adventure: 2, relaxation: 1 } },
  { id: 'acatenango', title: 'Acatenango volcano overnight hike', emoji: '🌋', tags: { adventure: 3 } },
  { id: 'volcano_boarding', title: 'Volcano boarding (Nicaragua)', emoji: '🏂', tags: { adventure: 3 } },
  { id: 'san_blas', title: 'San Blas Islands (Panama)', emoji: '🏝️', tags: { relaxation: 2, adventure: 1 } },
  { id: 'salsa', title: 'Salsa dancing in Colombia', emoji: '💃', tags: { social: 2, culture: 1 } },
  { id: 'coffee_farm', title: 'Coffee farm tour', emoji: '☕', tags: { culture: 2, food: 1 } },
  { id: 'lost_city', title: 'Lost City Trek (5 days, Colombia)', emoji: '🗿', tags: { adventure: 3 } },
  { id: 'machu_picchu', title: 'Machu Picchu / Inca Trail', emoji: '🏔️', tags: { adventure: 2, culture: 2 } },
  { id: 'uyuni', title: 'Uyuni Salt Flats jeep tour', emoji: '🚙', tags: { adventure: 2, culture: 1 } },
  { id: 'death_road', title: 'Death Road cycling (Bolivia)', emoji: '🚴', tags: { adventure: 3 } },
  { id: 'perito_moreno', title: 'Perito Moreno glacier', emoji: '🧊', tags: { adventure: 2 } },
  { id: 'tango', title: 'Tango show in Buenos Aires', emoji: '🕺', tags: { culture: 2, social: 1 } },
  { id: 'wine_mendoza', title: 'Wine tasting in Mendoza', emoji: '🍷', tags: { food: 2, relaxation: 1 } },
  { id: 'sandboarding', title: 'Sandboarding in Huacachina', emoji: '🏜️', tags: { adventure: 3 } },
  { id: 'cooking_class', title: 'Cooking class (any country)', emoji: '👨‍🍳', tags: { food: 2, culture: 1 } },
  { id: 'scuba', title: 'Scuba / snorkelling', emoji: '🤿', tags: { adventure: 2 } },
  { id: 'patagonia', title: 'Multi-day hiking (Patagonia)', emoji: '🥾', tags: { adventure: 3 } },
  { id: 'surf', title: 'Surf lessons', emoji: '🏄', tags: { adventure: 2, social: 1 } }
];

const SLIDER_CONFIGS = [
  { id: 'pace', label: 'Pace', leftLabel: 'Go go go', rightLabel: 'Slow & soak it in', leftScores: { adventure: 2 }, rightScores: { relaxation: 2 }, emoji: '⚡' },
  { id: 'planning', label: 'Planning', leftLabel: 'Every day mapped out', rightLabel: 'Wing it completely', leftScores: { culture: 1 }, rightScores: { adventure: 2 }, emoji: '📋' },
  { id: 'social', label: 'Social', leftLabel: 'Meet everyone', rightLabel: 'Just us two', leftScores: { social: 2 }, rightScores: { relaxation: 2 }, emoji: '👋' },
  { id: 'comfort', label: 'Comfort', leftLabel: 'Roughing it is fun', rightLabel: 'I need a good bed', leftScores: { adventure: 1, budget: 2 }, rightScores: { relaxation: 2 }, emoji: '🛏️' },
  { id: 'food_adventure', label: 'Food Adventure', leftLabel: "I'll eat anything", rightLabel: 'Keep it safe', leftScores: { food: 2, adventure: 1 }, rightScores: { relaxation: 1 }, emoji: '🌶️' }
];

const WILDCARD_QUESTIONS = [
  { id: 'must_not_miss', question: "What's the one thing you'd be gutted to miss on our trip?", emoji: '💔', placeholder: 'e.g. Watching sunset from a rooftop in Cartagena...' },
  { id: 'worry', question: "What's your biggest travel worry or pet peeve?", emoji: '😬', placeholder: 'e.g. Long bus journeys without AC...' },
  { id: 'perfect_day', question: 'Describe your perfect day together on this trip', emoji: '✨', placeholder: 'e.g. Wake up early, hike to a viewpoint, then spend the afternoon at a beach bar...' }
];

const GROUND_RULE_SUGGESTIONS = [
  'No overnight buses longer than 8 hours',
  'At least one rest day per week',
  'Always have travel insurance',
  'No skipping meals to save money',
  'Must have AC in accommodation',
  'No more than 2 back-to-back early mornings',
  'Always keep a backup of important documents',
  'At least one nice dinner per week',
  'No bunk beds',
  'Always book transport in advance'
];

const DIMENSIONS = ['adventure', 'culture', 'relaxation', 'social', 'budget', 'food'];
