// ============================================================
//  NutriFit -- app.js  (Full Clean Implementation)
//  Sections: 1. Calculator  2. Food Database  3. AI Meal Plan
// ============================================================

'use strict';

// -- Global State ----------------------------------------------------
let globalCalories = 0;
let globalProtein  = 0;
let globalCarbs    = 0;
let globalFat      = 0;

let foodDatabase     = [];
let filteredFoodList = [];
let currentPage      = 1;
const ITEMS_PER_PAGE = 9;   // 3x3 grid

// -- Macro Preset Ratios (protein%, carbs%, fat%) --------------------
const MACRO_PRESETS = {
  'balanced'    : { protein: 30, carbs: 40, fat: 30 },
  'low-fat'     : { protein: 35, carbs: 50, fat: 15 },
  'low-carbs'   : { protein: 40, carbs: 20, fat: 40 },
  'high-carbs'  : { protein: 20, carbs: 55, fat: 25 },
  'high-protein': { protein: 45, carbs: 35, fat: 20 },
};

// ====================================================================
//  SECTION 1 - CALCULATOR
// ====================================================================

function initCalculator() {
  const form = document.getElementById('macro-form');
  if (!form) return;

  const goalSel   = document.getElementById('goal');
  const rateGroup = document.getElementById('rate-group');
  if (goalSel && rateGroup) {
    goalSel.addEventListener('change', () => {
      rateGroup.style.display = goalSel.value === 'maintain' ? 'none' : '';
    });
    goalSel.dispatchEvent(new Event('change'));
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    calculateMacros();
  });

  document.querySelectorAll('.preset-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.preset-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (globalCalories > 0) applyPreset(btn.dataset.preset);
    });
  });
}

function calculateMacros() {
  var age      = parseFloat(document.getElementById('age').value);
  var weight   = parseFloat(document.getElementById('weight').value);
  var height   = parseFloat(document.getElementById('height').value);
  var gender   = document.getElementById('gender').value;
  var activity = parseFloat(document.getElementById('activity').value);
  var goal     = document.getElementById('goal').value;
  var rateEl   = document.getElementById('rate');
  var rate     = rateEl ? parseFloat(rateEl.value) || 0.5 : 0.5;

  if (isNaN(age) || isNaN(weight) || isNaN(height)) return;

  var bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  var tdee = bmr * activity;
  if (goal === 'lose') { tdee -= rate * 1100; }
  else if (goal === 'gain') { tdee += rate * 550; }

  globalCalories = Math.round(tdee);

  var activeBtn   = document.querySelector('.preset-btn.active');
  var activePreset = activeBtn ? activeBtn.dataset.preset : 'balanced';
  applyPreset(activePreset);

  var area = document.getElementById('results-area');
  if (area) { area.classList.remove('hidden'); }

  setText('val-calories', globalCalories.toLocaleString());
  setText('range-calories', 'Target range: ' + Math.round(globalCalories * 0.95).toLocaleString() + ' - ' + Math.round(globalCalories * 1.05).toLocaleString() + ' kcal');

  var sugar  = Math.round(globalCalories * 0.10 / 4);
  var satFat = Math.round(globalCalories * 0.10 / 9);
  setText('val-sugar',     sugar);
  setText('range-sugar',   'Safe Cap: Max ' + sugar + 'g');
  setText('val-sat-fat',   satFat);
  setText('range-sat-fat', 'Safe Cap: Max ' + satFat + 'g');
}

function applyPreset(preset) {
  var ratio = MACRO_PRESETS[preset] || MACRO_PRESETS['balanced'];
  var cal   = globalCalories;

  globalProtein = Math.round(cal * (ratio.protein / 100) / 4);
  globalCarbs   = Math.round(cal * (ratio.carbs   / 100) / 4);
  globalFat     = Math.round(cal * (ratio.fat     / 100) / 9);

  setText('val-protein',   globalProtein + 'g');
  setText('range-protein', 'Range: Min ' + Math.round(globalProtein * 0.85) + 'g | Max ' + Math.round(globalProtein * 1.15) + 'g');
  setText('val-carbs',     globalCarbs + 'g');
  setText('range-carbs',   'Range: Min ' + Math.round(globalCarbs * 0.85) + 'g | Max ' + Math.round(globalCarbs * 1.15) + 'g');
  setText('val-fat',       globalFat + 'g');
  setText('range-fat',     'Range: Min ' + Math.round(globalFat * 0.85) + 'g | Max ' + Math.round(globalFat * 1.15) + 'g');
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) { el.textContent = val; }
}

// ====================================================================
//  SECTION 2 - FOOD DATABASE
//  Data sources: FOOD_DATABASE (foodData.js) + USDA_FOOD_DATABASE (usdaData.js)
// ====================================================================

function normalizeFoodItem(item) {
  // Extract micros from nested object if present
  var micros  = item.micros || {};
  var fiber   = null, sodium = null, vitC = null, calcium = null, iron = null, potassium = null;

  // Helper: parse numeric from string like "5.4 g" or "438 mg"
  function parseNum(val) {
    if (val == null) return null;
    var n = parseFloat(String(val));
    return isNaN(n) ? null : n;
  }

  fiber     = parseNum(micros['Fiber']     || micros['fiber']     || null);
  sodium    = parseNum(micros['Sodium']    || micros['sodium']    || null);
  vitC      = parseNum(micros['Vitamin C'] || micros['vitaminC']  || null);
  calcium   = parseNum(micros['Calcium']   || micros['calcium']   || null);
  iron      = parseNum(micros['Iron']      || micros['iron']      || null);
  potassium = parseNum(micros['Potassium'] || micros['potassium'] || null);

  // Calorie mapping: check explicit properties (calories, energy, kcal, nf_calories, Energy, Calories, micros)
  var rawCal = item.calories != null ? item.calories :
               (item.energy != null ? item.energy :
               (item.kcal != null ? item.kcal :
               (item.nf_calories != null ? item.nf_calories :
               (item.Energy != null ? item.Energy :
               (item.Calories != null ? item.Calories :
               (micros['Energy'] != null ? micros['Energy'] :
               (micros['Calories'] != null ? micros['Calories'] :
               (micros['energy'] != null ? micros['energy'] :
               (micros['calories'] != null ? micros['calories'] : null)))))))));

  var calories = parseNum(rawCal);

  // Fallback: calculate calories from macronutrients (4 kcal/g protein, 4 kcal/g carbs, 9 kcal/g fat)
  if (calories == null) {
    var p = parseNum(item.protein);
    var c = parseNum(item.carbs);
    var f = parseNum(item.fat);
    if (p != null || c != null || f != null) {
      calories = Math.round(((p || 0) * 4) + ((c || 0) * 4) + ((f || 0) * 9));
    }
  }

  return {
    name     : item.name        || item.description || 'Unknown Food',
    category : item.category    || '',
    serving  : item.serving     || item.servingSize  || '100g',
    calories : calories,
    protein  : item.protein     != null ? item.protein  : null,
    carbs    : item.carbs       != null ? item.carbs    : null,
    fat      : item.fat         != null ? item.fat      : null,
    sugar    : item.sugar       != null ? item.sugar    : null,
    satFat   : item.satFat      != null ? item.satFat   : null,
    fiber    : fiber,
    sodium   : sodium,
    vitaminC : vitC,
    calcium  : calcium,
    iron     : iron,
    potassium: potassium,
  };
}

function initFoodDatabase() {
  if (typeof FOOD_DATABASE !== 'undefined' && Array.isArray(FOOD_DATABASE)) {
    FOOD_DATABASE.forEach(function(item) { foodDatabase.push(normalizeFoodItem(item)); });
  }
  if (typeof USDA_FOOD_DATABASE !== 'undefined' && Array.isArray(USDA_FOOD_DATABASE)) {
    USDA_FOOD_DATABASE.forEach(function(item) { foodDatabase.push(normalizeFoodItem(item)); });
  }

  filteredFoodList = foodDatabase.slice();
  renderPage(1);

  var searchInput = document.getElementById('food-search-input');
  if (!searchInput) return;

  var debounceTimer;
  searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
      var query = searchInput.value.trim().toLowerCase();
      if (query.length === 0) {
        filteredFoodList = foodDatabase.slice();
      } else {
        filteredFoodList = foodDatabase.filter(function(item) {
          return (item.name || '').toLowerCase().indexOf(query) !== -1 ||
                 (item.category || '').toLowerCase().indexOf(query) !== -1;
        });
      }
      renderPage(1);
    }, 280);
  });
}

function renderPage(page) {
  currentPage  = page;
  var container  = document.getElementById('food-results-container');
  var pagination = document.getElementById('food-pagination-container');
  if (!container || !pagination) return;

  var total      = filteredFoodList.length;
  var totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  var start = (currentPage - 1) * ITEMS_PER_PAGE;
  var slice = filteredFoodList.slice(start, start + ITEMS_PER_PAGE);

  if (slice.length === 0) {
    container.innerHTML = '<p class="no-results">No foods found. Try a different search term.</p>';
  } else {
    container.innerHTML = slice.map(buildFoodCard).join('');
  }

  pagination.innerHTML = buildPagination(currentPage, totalPages);

  pagination.querySelectorAll('[data-page]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var p = parseInt(btn.dataset.page, 10);
      if (p >= 1 && p <= totalPages) renderPage(p);
    });
  });
}

function fmt(val) { return val != null ? val : '--'; }

function buildFoodCard(item) {
  var catBadge  = item.category ? '<span class="cat-badge">' + item.category + '</span>' : '';
  var microParts = [];
  if (item.fiber     != null) microParts.push('Fiber: <b>' + item.fiber + 'g</b>');
  if (item.sodium    != null) microParts.push('Sodium: <b>' + item.sodium + 'mg</b>');
  if (item.vitaminC  != null) microParts.push('Vit-C: <b>' + item.vitaminC + 'mg</b>');
  if (item.calcium   != null) microParts.push('Ca: <b>' + item.calcium + 'mg</b>');
  if (item.iron      != null) microParts.push('Iron: <b>' + item.iron + 'mg</b>');
  if (item.potassium != null) microParts.push('K: <b>' + item.potassium + 'mg</b>');
  var microHTML = microParts.length ? '<div class="micro-row">' + microParts.map(function(m) { return '<span class="micro-tag">' + m + '</span>'; }).join('') + '</div>' : '';

  return '<div class="food-card">' +
    '<div class="food-card-header"><div class="food-name">' + item.name + '</div>' + catBadge + '</div>' +
    '<div class="food-serving">Serving: ' + item.serving + '</div>' +
    '<div class="food-macros">' +
      '<div class="macro-pill calories-pill"><span class="mpval">' + fmt(item.calories) + '</span><span class="mplabel">Calories</span></div>' +
      '<div class="macro-pill protein-pill"><span class="mpval">' + fmt(item.protein) + 'g</span><span class="mplabel">Protein</span></div>' +
      '<div class="macro-pill carbs-pill"><span class="mpval">' + fmt(item.carbs) + 'g</span><span class="mplabel">Carbohydrates</span></div>' +
      '<div class="macro-pill fat-pill"><span class="mpval">' + fmt(item.fat) + 'g</span><span class="mplabel">Fat</span></div>' +
      '<div class="macro-pill sugar-pill"><span class="mpval">' + fmt(item.sugar) + 'g</span><span class="mplabel">Sugar</span></div>' +
      '<div class="macro-pill sat-pill"><span class="mpval">' + fmt(item.satFat) + 'g</span><span class="mplabel">Saturated Fat</span></div>' +
    '</div>' +
    microHTML +
    '</div>';
}

function buildPagination(current, total) {
  if (total <= 1) return '';
  var prev = current > 1
    ? '<button class="page-btn" data-page="' + (current - 1) + '">&lsaquo; Prev</button>'
    : '<button class="page-btn disabled" disabled>&lsaquo; Prev</button>';
  var next = current < total
    ? '<button class="page-btn" data-page="' + (current + 1) + '">Next &rsaquo;</button>'
    : '<button class="page-btn disabled" disabled>Next &rsaquo;</button>';
  return prev + '<span class="page-info">Page ' + current + ' of ' + total + '</span>' + next;
}

// ====================================================================
//  SECTION 3 - AI MEAL PLAN
// ====================================================================

function initAiMealPlan() {
  var btn = document.getElementById('generate-ai-meals-btn');
  if (!btn) return;
  btn.addEventListener('click', generateAiMealPlan);
}

function generateAiMealPlan() {
  var output = document.getElementById('ai-meals-output');
  var grid   = document.getElementById('meals-grid');
  var bar    = document.getElementById('ai-summary-bar');
  if (!output || !grid) return;

  if (globalCalories === 0) {
    showToast('Please calculate your macros first in Section 1 before generating a meal plan.');
    return;
  }

  var allergenRaw  = (document.getElementById('allergen-input') ? document.getElementById('allergen-input').value : '').toLowerCase();
  var allergens    = allergenRaw.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  var sweetToggle  = document.getElementById('sweet-toggle');
  var includeSweet = sweetToggle ? sweetToggle.value !== 'no' : true;

  var btn = document.getElementById('generate-ai-meals-btn');
  btn.disabled = true;
  btn.innerHTML = '<span>Generating...</span>';

  setTimeout(function() {
    var meals = buildMealPlan(allergens, includeSweet);

    if (bar) {
      bar.innerHTML =
        '<span>Target: <b>' + globalCalories + ' kcal</b></span>' +
        '<span>Protein: <b>' + globalProtein + 'g</b></span>' +
        '<span>Carbs: <b>' + globalCarbs + 'g</b></span>' +
        '<span>Fat: <b>' + globalFat + 'g</b></span>' +
        (allergens.length ? '<span>Avoiding: <b>' + allergens.join(', ') + '</b></span>' : '');
    }

    grid.innerHTML = meals.map(buildMealCard).join('');
    output.classList.remove('hidden');

    btn.disabled = false;
    btn.innerHTML = '<span>Regenerate Meal Plan</span>';
  }, 900);
}

var MEAL_POOL = {
  breakfast: [
    { name: 'Greek Yogurt Parfait',      desc: 'Greek yogurt layered with mixed berries, granola, and honey',               tags: ['dairy','gluten'],        emoji: '🫙', cal: 380, p: 22, c: 45, f: 10 },
    { name: 'Avocado & Egg Toast',        desc: 'Whole-grain toast with mashed avocado, poached eggs, and chili flakes',     tags: ['gluten','egg'],          emoji: '🥑', cal: 420, p: 20, c: 38, f: 20 },
    { name: 'Oatmeal Power Bowl',         desc: 'Rolled oats with banana, almond butter, chia seeds, and cinnamon',          tags: ['gluten','nuts'],         emoji: '🥣', cal: 450, p: 14, c: 60, f: 14 },
    { name: 'Veggie Omelette',            desc: 'Three-egg omelette with spinach, tomatoes, mushrooms, and feta cheese',     tags: ['egg','dairy'],           emoji: '🍳', cal: 360, p: 28, c: 8,  f: 22 },
    { name: 'Smoothie Bowl',              desc: 'Blended acai, frozen berries, banana topped with sliced fruit',             tags: [],                        emoji: '🫐', cal: 320, p: 8,  c: 52, f: 9  },
    { name: 'Overnight Chia Pudding',     desc: 'Chia seeds soaked overnight in almond milk, topped with mango and kiwi',   tags: ['nuts'],                  emoji: '🥭', cal: 290, p: 10, c: 36, f: 12 },
    { name: 'Turkey Breakfast Wrap',      desc: 'Whole-wheat tortilla with lean turkey, scrambled eggs, and salsa',          tags: ['gluten','egg'],          emoji: '🌯', cal: 430, p: 32, c: 42, f: 11 },
  ],
  lunch: [
    { name: 'Grilled Chicken Salad',      desc: 'Mixed greens, grilled chicken, cherry tomatoes, cucumber, lemon dressing',  tags: [],                        emoji: '🥗', cal: 390, p: 40, c: 18, f: 14 },
    { name: 'Quinoa Buddha Bowl',          desc: 'Quinoa base with roasted chickpeas, avocado, cucumber, tahini drizzle',    tags: ['nuts'],                  emoji: '🥙', cal: 480, p: 18, c: 58, f: 18 },
    { name: 'Salmon and Brown Rice',       desc: 'Pan-seared salmon over steamed brown rice with broccoli, soy-ginger glaze',tags: ['fish','soy'],            emoji: '🐟', cal: 520, p: 42, c: 44, f: 16 },
    { name: 'Turkey Lettuce Wraps',        desc: 'Lean ground turkey cooked with ginger, garlic in crispy lettuce cups',    tags: [],                        emoji: '🥬', cal: 350, p: 36, c: 12, f: 14 },
    { name: 'Lentil Veggie Soup',          desc: 'Hearty red lentil soup with carrots, celery, cumin, and warm pita bread', tags: ['gluten'],                emoji: '🍲', cal: 410, p: 20, c: 56, f: 8  },
    { name: 'Chickpea Wrap',               desc: 'Spiced roasted chickpeas in a whole-wheat wrap with hummus and peppers',  tags: ['gluten','nuts'],         emoji: '🫘', cal: 440, p: 18, c: 58, f: 12 },
    { name: 'Beef Veggie Stir Fry',        desc: 'Lean beef strips with bell peppers, snap peas, carrots in garlic sauce',  tags: ['soy'],                   emoji: '🥩', cal: 480, p: 38, c: 32, f: 18 },
  ],
  dinner: [
    { name: 'Baked Salmon Fillet',         desc: 'Herb-crusted salmon with roasted asparagus, cherry tomatoes, lemon sauce', tags: ['fish'],                  emoji: '🦪', cal: 490, p: 44, c: 12, f: 28 },
    { name: 'Chicken and Sweet Potato',    desc: 'Rosemary roasted chicken thigh with sweet potato mash and green beans',   tags: [],                        emoji: '🍗', cal: 530, p: 42, c: 40, f: 18 },
    { name: 'Beef Tenderloin and Quinoa',  desc: 'Grilled lean beef tenderloin with quinoa pilaf and roasted vegetables',   tags: [],                        emoji: '🥩', cal: 580, p: 50, c: 38, f: 22 },
    { name: 'Shrimp Cauliflower Rice',     desc: 'Garlic-butter shrimp over cauliflower rice with lemon and spinach',       tags: ['shellfish'],             emoji: '🦐', cal: 370, p: 36, c: 14, f: 16 },
    { name: 'Turkey Stuffed Peppers',      desc: 'Bell peppers stuffed with lean turkey, brown rice, black beans, tomatoes', tags: [],                       emoji: '🫑', cal: 460, p: 38, c: 42, f: 12 },
    { name: 'Tofu Veggie Curry',           desc: 'Silken tofu simmered in coconut milk curry with broccoli and basmati rice',tags: ['soy'],                  emoji: '🍛', cal: 440, p: 20, c: 52, f: 16 },
    { name: 'Grilled Tilapia and Veggies', desc: 'Lemon-garlic tilapia with grilled zucchini, squash, and quinoa',          tags: ['fish'],                  emoji: '🐡', cal: 400, p: 40, c: 32, f: 12 },
  ],
  dessert: [
    { name: 'Dark Chocolate Mousse',       desc: 'Light mousse made with 70% dark chocolate and whipped coconut cream',     tags: ['dairy'],                 emoji: '🍫', cal: 220, p: 4,  c: 22, f: 14 },
    { name: 'Mixed Berry Sorbet',          desc: 'Refreshing frozen sorbet from blended strawberries and blueberries',      tags: [],                        emoji: '🍧', cal: 140, p: 1,  c: 34, f: 0  },
    { name: 'Banana Nice Cream',           desc: 'Banana ice cream topped with almond butter and cacao nibs',               tags: ['nuts'],                  emoji: '🍦', cal: 200, p: 4,  c: 40, f: 6  },
    { name: 'Honey and Ricotta Fruit Bowl',desc: 'Fresh seasonal fruits with whipped ricotta and wildflower honey',         tags: ['dairy'],                 emoji: '🍓', cal: 240, p: 10, c: 36, f: 6  },
    { name: 'Chia Seed Pudding Cup',       desc: 'Vanilla chia pudding with coconut milk, passion fruit and kiwi',         tags: [],                        emoji: '🥝', cal: 210, p: 6,  c: 30, f: 8  },
  ]
};

function filterByAllergens(pool, allergens) {
  if (!allergens.length) return pool;
  return pool.filter(function(item) {
    return !item.tags.some(function(tag) { return allergens.indexOf(tag) !== -1; });
  });
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildMealPlan(allergens, includeSweet) {
  var meals = [];

  function safePool(pool) { var f = filterByAllergens(pool, allergens); return f.length ? f : pool; }

  var bfMeal = pickRandom(safePool(MEAL_POOL.breakfast));
  var lMeal  = pickRandom(safePool(MEAL_POOL.lunch));
  var dMeal  = pickRandom(safePool(MEAL_POOL.dinner));

  meals.push(Object.assign({}, bfMeal, { mealType: 'Breakfast' }));
  meals.push(Object.assign({}, lMeal,  { mealType: 'Lunch'     }));
  meals.push(Object.assign({}, dMeal,  { mealType: 'Dinner'    }));

  if (includeSweet) {
    var swPool = safePool(MEAL_POOL.dessert);
    if (swPool.length) {
      meals.push(Object.assign({}, pickRandom(swPool), { mealType: 'Dessert' }));
    }
  }
  return meals;
}

function buildMealCard(meal) {
  var tagBadges = meal.tags.length
    ? '<div class="meal-tags">' + meal.tags.map(function(t) { return '<span class="tag-badge">' + t + '</span>'; }).join('') + '</div>'
    : '';

  return '<div class="meal-card">' +
    '<div class="meal-type-label">' + meal.mealType + '</div>' +
    '<div class="meal-emoji">' + meal.emoji + '</div>' +
    '<div class="meal-name">' + meal.name + '</div>' +
    '<div class="meal-desc">' + meal.desc + '</div>' +
    '<div class="meal-macros-row">' +
      '<span class="mm-chip">' + meal.cal + ' kcal</span>' +
      '<span class="mm-chip">' + meal.p + 'g Protein</span>' +
      '<span class="mm-chip">' + meal.c + 'g Carbs</span>' +
      '<span class="mm-chip">' + meal.f + 'g Fat</span>' +
    '</div>' +
    tagBadges +
    '</div>';
}

// ====================================================================
//  UTILITIES
// ====================================================================

function showToast(msg) {
  var toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#1e293b;color:#f1f5f9;padding:0.9rem 1.6rem;border-radius:0.75rem;font-size:0.95rem;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.4);opacity:0;transition:opacity 0.3s';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function() { toast.style.opacity = '0'; }, 4000);
}

function initNavLinks() {
  document.querySelectorAll('nav a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.querySelector(link.getAttribute('href'));
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      document.querySelectorAll('nav a').forEach(function(l) { l.classList.remove('active'); });
      link.classList.add('active');
    });
  });
}

function initGuideModal() {
  var openBtn  = document.getElementById('open-guide-btn');
  var modal    = document.getElementById('guide-modal');
  var closeBtn = document.getElementById('close-guide-btn');
  if (!openBtn || !modal) return;
  openBtn.addEventListener('click',  function() { modal.classList.remove('hidden'); });
  if (closeBtn) { closeBtn.addEventListener('click', function() { modal.classList.add('hidden'); }); }
  modal.addEventListener('click', function(e) { if (e.target === modal) { modal.classList.add('hidden'); } });
}

// ====================================================================
//  BOOT
// ====================================================================
document.addEventListener('DOMContentLoaded', function() {
  initCalculator();
  initFoodDatabase();
  initAiMealPlan();
  initNavLinks();
  initGuideModal();
});
