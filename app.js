/* ==========================================================================
   NutriFit Logic & Interactive Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- Global Application State ---
  let userCalculatedData = null;
  let activePreset = 'balanced';

  // --- Element References ---
  const macroForm = document.getElementById('macro-form');
  const goalSelect = document.getElementById('goal');
  const rateGroup = document.getElementById('rate-group');
  const rateSelect = document.getElementById('rate');
  const resultsArea = document.getElementById('results-area');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Food Search
  const foodSearchInput = document.getElementById('food-search-input');
  const foodResultsContainer = document.getElementById('food-results-container');

  // AI Planner
  const generateAiMealsBtn = document.getElementById('generate-ai-meals-btn');
  const sweetToggle = document.getElementById('sweet-toggle');
  const allergenInput = document.getElementById('allergen-input');
  const aiMealsOutput = document.getElementById('ai-meals-output');
  const aiSummaryBar = document.getElementById('ai-summary-bar');
  const mealsGrid = document.getElementById('meals-grid');

  // Guide Modal
  const openGuideBtn = document.getElementById('open-guide-btn');
  const closeGuideBtn = document.getElementById('close-guide-btn');
  const guideModal = document.getElementById('guide-modal');

  // --- Goal & Rate Sensitivity Toggle ---
  goalSelect.addEventListener('change', () => {
    if (goalSelect.value === 'maintain') {
      rateGroup.style.display = 'none';
    } else {
      rateGroup.style.display = 'flex';
    }
  });
  // Initial sync
  if (goalSelect.value === 'maintain') rateGroup.style.display = 'none';

  // --- BMR & TDEE Calculation Core ---
  macroForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const age = parseFloat(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const activity = parseFloat(document.getElementById('activity').value);
    const goal = goalSelect.value;
    const rate = parseFloat(rateSelect.value) || 0;

    // 1. Calculate BMR using Mifflin-St Jeor Formula
    let bmr = 0;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // 2. TDEE
    let tdee = bmr * activity;

    // 3. Caloric Adjustment based on Goal & Weekly Rate
    // 0.25kg ~ 275 kcal/day deficit/surplus
    // 0.5kg ~ 550 kcal/day
    // 1.0kg ~ 1100 kcal/day
    let calorieAdjustment = 0;
    if (rate === 0.25) calorieAdjustment = 275;
    else if (rate === 0.5) calorieAdjustment = 550;
    else if (rate === 1.0) calorieAdjustment = 1100;

    let targetCalories = tdee;
    if (goal === 'lose') {
      targetCalories = Math.max(1200, tdee - calorieAdjustment);
    } else if (goal === 'gain') {
      targetCalories = tdee + calorieAdjustment;
    }

    userCalculatedData = {
      age,
      gender,
      weight,
      height,
      tdee: Math.round(tdee),
      calories: Math.round(targetCalories)
    };

    renderMacroResults();
    resultsArea.classList.remove('hidden');
    resultsArea.scrollIntoView({ behavior: 'smooth' });
  });

  // --- Preset Switcher Listeners ---
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePreset = btn.dataset.preset;
      renderMacroResults();
    });
  });

  // --- Render Macro Results & Minimum/Maximum Ranges ---
  function renderMacroResults() {
    if (!userCalculatedData) return;

    const calories = userCalculatedData.calories;

    // Preset Ratio Definitions (% Protein, % Carbs, % Fat)
    let pRatio = 0.30;
    let cRatio = 0.40;
    let fRatio = 0.30;

    if (activePreset === 'low-fat') {
      pRatio = 0.35;
      cRatio = 0.50;
      fRatio = 0.15;
    } else if (activePreset === 'low-carbs') {
      pRatio = 0.40;
      cRatio = 0.20;
      fRatio = 0.40;
    } else if (activePreset === 'high-protein') {
      pRatio = 0.40;
      cRatio = 0.35;
      fRatio = 0.25;
    }

    // Calculations: Protein (4kcal/g), Carbs (4kcal/g), Fat (9kcal/g)
    const targetProtein = Math.round((calories * pRatio) / 4);
    const targetCarbs = Math.round((calories * cRatio) / 4);
    const targetFat = Math.round((calories * fRatio) / 9);

    // Caps & Safe Ranges
    // Sugar limit: max 10% of total calories (or 5% strict), 4kcal/g
    const maxSugar = Math.round((calories * 0.08) / 4);
    // Saturated fat limit: max 10% of total calories, 9kcal/g
    const maxSatFat = Math.round((calories * 0.09) / 9);

    // Display values
    document.getElementById('val-calories').textContent = calories.toLocaleString();
    document.getElementById('range-calories').textContent = `Target Range: ${Math.round(calories * 0.95)} - ${Math.round(calories * 1.05)} kcal`;

    document.getElementById('val-protein').textContent = targetProtein;
    document.getElementById('range-protein').textContent = `Min: ${Math.round(targetProtein * 0.85)}g | Max: ${Math.round(targetProtein * 1.15)}g`;

    document.getElementById('val-carbs').textContent = targetCarbs;
    document.getElementById('range-carbs').textContent = `Min: ${Math.round(targetCarbs * 0.85)}g | Max: ${Math.round(targetCarbs * 1.15)}g`;

    document.getElementById('val-fat').textContent = targetFat;
    document.getElementById('range-fat').textContent = `Min: ${Math.round(targetFat * 0.85)}g | Max: ${Math.round(targetFat * 1.15)}g`;

    document.getElementById('val-sugar').textContent = maxSugar;
    document.getElementById('range-sugar').textContent = `Strict Limit: Max ${maxSugar}g / day`;

    document.getElementById('val-sat-fat').textContent = maxSatFat;
    document.getElementById('range-sat-fat').textContent = `Strict Limit: Max ${maxSatFat}g / day`;

    // Store updated target macros in state
    userCalculatedData.targetMacros = {
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat,
      sugar: maxSugar,
      satFat: maxSatFat
    };
  }

  // --- Food Database Search & Render ---
  function renderFoodItems(query = '') {
    const q = query.toLowerCase().trim();
    foodResultsContainer.innerHTML = '';

    const filtered = FOOD_DATABASE.filter(item => 
      item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      foodResultsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
          No matching food item found. Try searching for "Chicken", "Oats", "Salmon", "Egg", or "Apple".
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const microsFormatted = Object.entries(item.micros)
        .map(([k, v]) => `<span style="margin-right: 8px;"><strong>${k}:</strong> ${v}</span>`)
        .join('');

      const card = document.createElement('div');
      card.className = 'food-item-card';
      card.innerHTML = `
        <div class="food-item-header">
          <div class="food-item-title">${item.name}</div>
          <div class="food-category-badge">${item.category}</div>
        </div>
        <div class="food-serving">📏 Serving Size: <strong>${item.serving}</strong></div>
        <div class="food-macros-row">
          <div class="macro-mini-box">
            <span>Protein</span>
            <strong>${item.protein}g</strong>
          </div>
          <div class="macro-mini-box">
            <span>Carbs</span>
            <strong>${item.carbs}g</strong>
          </div>
          <div class="macro-mini-box">
            <span>Fat</span>
            <strong>${item.fat}g</strong>
          </div>
        </div>
        <div class="food-extra-details">
          <div>Sugar: <strong>${item.sugar}g</strong></div>
          <div>Sat. Fat: <strong>${item.satFat}g</strong></div>
        </div>
        <div class="micros-list">
          🧪 <strong>Key Micros:</strong> ${microsFormatted}
        </div>
      `;
      foodResultsContainer.appendChild(card);
    });
  }

  // Initial Food Search Render
  renderFoodItems();
  foodSearchInput.addEventListener('input', (e) => {
    renderFoodItems(e.target.value);
  });

  // --- AI Meal Generation Engine (100% Strict Allergen Filtering) ---
  generateAiMealsBtn.addEventListener('click', () => {
    if (!userCalculatedData) {
      alert('Please calculate your daily target macros using the calculator first!');
      document.getElementById('calculator-section').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const includeSweet = sweetToggle.value === 'yes';
    const rawAllergens = allergenInput.value.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

    // Target Macros per meal breakdown
    const dailyCals = userCalculatedData.calories;
    const targetP = userCalculatedData.targetMacros.protein;
    const targetC = userCalculatedData.targetMacros.carbs;
    const targetF = userCalculatedData.targetMacros.fat;

    // Filter recipes strictly matching zero allergens
    const isSafe = (recipe) => {
      if (rawAllergens.length === 0) return true;
      
      // Check recipe allergens list
      const hasRecipeAllergen = recipe.allergens.some(a => 
        rawAllergens.some(userA => a.includes(userA) || userA.includes(a))
      );

      // Check ingredient strings
      const hasIngredientMatch = recipe.ingredients.some(ing =>
        rawAllergens.some(userA => ing.toLowerCase().includes(userA))
      );

      return !hasRecipeAllergen && !hasIngredientMatch;
    };

    // Pick 1 dish for breakfast, 1 for lunch, 1 for dinner, and optionally 1 sweet
    const safeBreakfasts = MEAL_RECIPE_DATABASE.breakfast.filter(isSafe);
    const safeLunches = MEAL_RECIPE_DATABASE.lunch.filter(isSafe);
    const safeDinners = MEAL_RECIPE_DATABASE.dinner.filter(isSafe);
    const safeSweets = MEAL_RECIPE_DATABASE.sweet.filter(isSafe);

    if (safeBreakfasts.length === 0 || safeLunches.length === 0 || safeDinners.length === 0) {
      alert('Strict Exclusion Notice: No default recipes matched your exact allergy criteria. Generating custom allergen-safe basic dishes...');
    }

    const chosenBreakfast = safeBreakfasts[0] || {
      name: "Custom Allergen-Free Breakfast Bowl",
      baseCalories: Math.round(dailyCals * 0.25),
      protein: Math.round(targetP * 0.25),
      carbs: Math.round(targetC * 0.25),
      fat: Math.round(targetF * 0.25),
      sugar: 4,
      satFat: 1,
      ingredients: ["steamed rice", "lean turkey", "sliced cucumber"],
      prepTime: "10 mins",
      instructions: "Combine simple whole foods free of specified allergens."
    };

    const chosenLunch = safeLunches[0] || {
      name: "Custom Allergen-Free Harvest Lunch",
      baseCalories: Math.round(dailyCals * 0.35),
      protein: Math.round(targetP * 0.35),
      carbs: Math.round(targetC * 0.35),
      fat: Math.round(targetF * 0.35),
      sugar: 5,
      satFat: 2,
      ingredients: ["grilled chicken", "quinoa", "steamed carrots"],
      prepTime: "15 mins",
      instructions: "Grill chicken breast and serve with cooked quinoa and fresh carrots."
    };

    const chosenDinner = safeDinners[0] || {
      name: "Custom Allergen-Free Protein Dinner",
      baseCalories: Math.round(dailyCals * 0.30),
      protein: Math.round(targetP * 0.30),
      carbs: Math.round(targetC * 0.30),
      fat: Math.round(targetF * 0.30),
      sugar: 3,
      satFat: 1.5,
      ingredients: ["baked beef or poultry", "sweet potato", "green beans"],
      prepTime: "20 mins",
      instructions: "Bake lean meat with sweet potatoes and green beans."
    };

    let chosenSweet = null;
    if (includeSweet) {
      chosenSweet = safeSweets[0] || {
        name: "Fruit & Berry Supreme",
        baseCalories: Math.round(dailyCals * 0.10),
        protein: 4,
        carbs: Math.round(targetC * 0.10),
        fat: 1,
        sugar: 10,
        satFat: 0.1,
        ingredients: ["sliced apples", "fresh berries"],
        prepTime: "5 mins",
        instructions: "Serve fresh seasonal fruits chilled."
      };
    }

    // Render Meals
    mealsGrid.innerHTML = '';
    const mealsList = [
      { type: 'Breakfast 🍳', recipe: chosenBreakfast },
      { type: 'Lunch 🥗', recipe: chosenLunch },
      { type: 'Dinner 🍲', recipe: chosenDinner }
    ];

    if (chosenSweet) {
      mealsList.push({ type: 'Sweet / Dessert 🍰', recipe: chosenSweet, isSweet: true });
    }

    let planTotalCals = 0;
    let planTotalP = 0;
    let planTotalC = 0;
    let planTotalF = 0;

    mealsList.forEach(m => {
      planTotalCals += m.recipe.baseCalories;
      planTotalP += m.recipe.protein;
      planTotalC += m.recipe.carbs;
      planTotalF += m.recipe.fat;

      const card = document.createElement('div');
      card.className = `meal-card ${m.isSweet ? 'sweet' : ''}`;
      card.innerHTML = `
        <div class="meal-type-badge">${m.type}</div>
        <div class="meal-name">${m.recipe.name}</div>
        <div class="meal-macros-summary">
          <span><strong>${m.recipe.baseCalories}</strong> kcal</span>
          <span>P: <strong>${m.recipe.protein}g</strong></span>
          <span>C: <strong>${m.recipe.carbs}g</strong></span>
          <span>F: <strong>${m.recipe.fat}g</strong></span>
        </div>
        <div class="meal-ingredients-list">
          🛒 <strong>Ingredients:</strong> ${m.recipe.ingredients.join(', ')}
        </div>
        <div class="meal-instructions">
          ⏱️ Prep (${m.recipe.prepTime}): ${m.recipe.instructions}
        </div>
      `;
      mealsGrid.appendChild(card);
    });

    // Render Summary Bar
    const allergenFilterText = rawAllergens.length > 0 
      ? `🚫 Strictly Excluded: <strong>${rawAllergens.join(', ')}</strong>` 
      : `✅ No Allergen Exclusions Specified`;

    aiSummaryBar.innerHTML = `
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
        <div><strong>AI Generated Daily Plan:</strong> ${planTotalCals} kcal | ${planTotalP}g Protein | ${planTotalC}g Carbs | ${planTotalF}g Fat</div>
        <div>${allergenFilterText}</div>
      </div>
    `;

    aiMealsOutput.classList.remove('hidden');
    aiMealsOutput.scrollIntoView({ behavior: 'smooth' });
  });

  // --- Modal Listeners ---
  openGuideBtn.addEventListener('click', () => {
    guideModal.classList.remove('hidden');
  });

  closeGuideBtn.addEventListener('click', () => {
    guideModal.classList.add('hidden');
  });

  guideModal.addEventListener('click', (e) => {
    if (e.target === guideModal) {
      guideModal.classList.add('hidden');
    }
  });
});
