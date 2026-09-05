class MealRecipe {
  final String name;
  final String mealType; // breakfast, lunch, dinner, sweet
  final int baseCalories;
  final int protein;
  final int carbs;
  final int fat;
  final int sugar;
  final double satFat;
  final List<String> ingredients;
  final List<String> allergens;
  final String prepTime;
  final String instructions;

  const MealRecipe({
    required this.name,
    required this.mealType,
    required this.baseCalories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.sugar,
    required this.satFat,
    required this.ingredients,
    required this.allergens,
    required this.prepTime,
    required this.instructions,
  });
}

const List<MealRecipe> mealRecipeDatabase = [
  // Breakfast
  MealRecipe(
    name: 'High Protein Oatmeal & Fruit Bowl',
    mealType: 'breakfast',
    baseCalories: 400,
    protein: 28,
    carbs: 52,
    fat: 9,
    sugar: 12,
    satFat: 1.5,
    ingredients: ['rolled oats', 'egg whites or whey protein', 'berries', 'chia seeds', 'cinnamon'],
    allergens: ['gluten', 'dairy', 'egg'],
    prepTime: '10 mins',
    instructions: 'Cook rolled oats in water or milk. Stir in protein source, top with fresh berries and chia seeds.',
  ),
  MealRecipe(
    name: 'Avocado & Egg White Veggie Toast',
    mealType: 'breakfast',
    baseCalories: 380,
    protein: 24,
    carbs: 35,
    fat: 14,
    sugar: 4,
    satFat: 2.5,
    ingredients: ['whole grain bread', 'egg whites', 'fresh avocado', 'spinach', 'cherry tomatoes'],
    allergens: ['gluten', 'egg'],
    prepTime: '12 mins',
    instructions: 'Toast whole grain bread, scramble egg whites with spinach, spread mashed avocado and top with tomatoes.',
  ),
  MealRecipe(
    name: 'Greek Yogurt Berry Parfait',
    mealType: 'breakfast',
    baseCalories: 320,
    protein: 26,
    carbs: 40,
    fat: 4,
    sugar: 15,
    satFat: 1.0,
    ingredients: ['non-fat greek yogurt', 'strawberries', 'blueberries', 'honey', 'pumpkin seeds'],
    allergens: ['dairy', 'milk'],
    prepTime: '5 mins',
    instructions: 'Layer Greek yogurt with fresh berries and top with a drizzle of honey and pumpkin seeds.',
  ),

  // Lunch
  MealRecipe(
    name: 'Mediterranean Grilled Chicken & Quinoa Salad',
    mealType: 'lunch',
    baseCalories: 520,
    protein: 42,
    carbs: 48,
    fat: 16,
    sugar: 5,
    satFat: 2.8,
    ingredients: ['grilled chicken breast', 'cooked quinoa', 'cucumber', 'extra virgin olive oil', 'lemon juice', 'feta cheese'],
    allergens: ['dairy'],
    prepTime: '20 mins',
    instructions: 'Toss diced grilled chicken, cooked quinoa, sliced cucumbers, and lemon-olive oil dressing.',
  ),
  MealRecipe(
    name: 'Seared Salmon with Sweet Potato & Asparagus',
    mealType: 'lunch',
    baseCalories: 560,
    protein: 38,
    carbs: 42,
    fat: 22,
    sugar: 8,
    satFat: 4.0,
    ingredients: ['wild salmon fillet', 'baked sweet potato', 'steamed asparagus', 'olive oil'],
    allergens: ['fish'],
    prepTime: '25 mins',
    instructions: 'Pan-sear salmon in olive oil, serve alongside baked sweet potato wedges and steamed asparagus.',
  ),

  // Dinner
  MealRecipe(
    name: 'Herb Baked Turkey Breast with Roasted Vegetables',
    mealType: 'dinner',
    baseCalories: 460,
    protein: 44,
    carbs: 32,
    fat: 12,
    sugar: 6,
    satFat: 2.0,
    ingredients: ['turkey breast', 'roasted cauliflower', 'carrots', 'olive oil', 'rosemary'],
    allergens: [],
    prepTime: '30 mins',
    instructions: 'Season turkey breast with herbs and olive oil, roast with carrots and cauliflower.',
  ),
  MealRecipe(
    name: 'Pan-Seared White Fish with Quinoa & Steamed Broccoli',
    mealType: 'dinner',
    baseCalories: 420,
    protein: 38,
    carbs: 44,
    fat: 9,
    sugar: 3,
    satFat: 1.5,
    ingredients: ['cod fillet', 'quinoa', 'steamed broccoli', 'lemon', 'parsley'],
    allergens: ['fish'],
    prepTime: '20 mins',
    instructions: 'Pan-fry cod with lemon juice and herbs. Serve over fluffy cooked quinoa and broccoli.',
  ),

  // Sweet
  MealRecipe(
    name: 'Protein Chocolate Chia Pudding',
    mealType: 'sweet',
    baseCalories: 220,
    protein: 14,
    carbs: 22,
    fat: 8,
    sugar: 5,
    satFat: 1.2,
    ingredients: ['chia seeds', 'unsweetened almond milk', 'cocoa powder', 'whey protein', 'stevia'],
    allergens: ['dairy', 'milk', 'nuts', 'almond'],
    prepTime: '5 mins (Chill 2 hrs)',
    instructions: 'Whisk chia seeds, cocoa powder, protein powder, and almond milk. Chill until set.',
  ),
  MealRecipe(
    name: 'Fresh Berry & Greek Yogurt Whip',
    mealType: 'sweet',
    baseCalories: 180,
    protein: 16,
    carbs: 20,
    fat: 2,
    sugar: 12,
    satFat: 0.5,
    ingredients: ['greek yogurt', 'raspberries', 'blueberries', 'vanilla extract'],
    allergens: ['dairy', 'milk'],
    prepTime: '5 mins',
    instructions: 'Whip Greek yogurt with vanilla extract. Top with fresh vibrant berries.',
  ),
];
