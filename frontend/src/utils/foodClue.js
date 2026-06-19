// Derives a color-coded "food clue" for a store so allergy-anxious / dietary users
// can tell at a glance what kind of food a mystery bag likely contains.
// We don't have structured allergen data, so we infer from category + name keywords.
// (PRD "clue" concept: look at the food category to match your diet.)

const KEYWORD_RULES = [
  { test: /sushi|seafood|\bfish\b|ocean|poke|oyster|shrimp|crab|lobster/i,
    clue: { label: 'Seafood · may contain fish/shellfish', color: '#2563eb', emoji: '🐟', diet: 'seafood' } },
  { test: /steak|grill|bbq|burger|meat|butcher|beef|pork|chicken|deli|smokehouse/i,
    clue: { label: 'Meat · may contain beef/pork/poultry', color: '#dc2626', emoji: '🥩', diet: 'meat' } },
  { test: /veg|salad|green|garden|plant|vegan/i,
    clue: { label: 'Veggie · plant-forward', color: '#16a34a', emoji: '🥗', diet: 'veggie' } },
  { test: /bakery|bread|pastry|patisserie|bagel|donut|cake/i,
    clue: { label: 'Bakery · contains gluten', color: '#16a34a', emoji: '🥐', diet: 'bakery' } },
]

const CATEGORY_CLUES = {
  bakery:     { label: 'Bakery · contains gluten', color: '#16a34a', emoji: '🥐', diet: 'bakery' },
  cafe:       { label: 'Café · light bites', color: '#16a34a', emoji: '☕', diet: 'cafe' },
  grocery:    { label: 'Grocery · mixed items', color: '#0d9488', emoji: '🛒', diet: 'mixed' },
  restaurant: { label: 'Restaurant · mixed menu', color: '#ea580c', emoji: '🍽️', diet: 'mixed' },
  other:      { label: 'Surprise · mixed items', color: '#6b7280', emoji: '🎁', diet: 'mixed' },
}

export function getFoodClue(store) {
  if (!store) return CATEGORY_CLUES.other
  const haystack = `${store.name || ''} ${store.category || ''} ${store.description || ''}`
  for (const rule of KEYWORD_RULES) {
    if (rule.test.test(haystack)) return rule.clue
  }
  return CATEGORY_CLUES[(store.category || '').toLowerCase()] || CATEGORY_CLUES.other
}

// --- Dietary preferences (Phase 2a) -------------------------------------
export const DIETARY_OPTIONS = [
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'no_seafood', label: 'No seafood/shellfish' },
  { key: 'gluten_free', label: 'Gluten-free' },
]

const DIET_CONFLICTS = {
  vegetarian: ['meat', 'seafood'],
  vegan: ['meat', 'seafood', 'bakery'],
  no_seafood: ['seafood'],
  gluten_free: ['bakery'],
}

// Returns the conflicting preference's label for a store, or null if safe.
export function dietaryConflict(prefs, store) {
  const diet = getFoodClue(store).diet
  for (const p of prefs || []) {
    if ((DIET_CONFLICTS[p] || []).includes(diet)) {
      return DIETARY_OPTIONS.find(o => o.key === p)?.label || p
    }
  }
  return null
}
