import 'package:flutter/material.dart';
import '../models/meal_recipe.dart';
import '../services/macro_calculator.dart';

class AiPlannerScreen extends StatefulWidget {
  final MacroResult? userMacro;

  const AiPlannerScreen({super.key, required this.userMacro});

  @override
  State<AiPlannerScreen> createState() => _AiPlannerScreenState();
}

class _AiPlannerScreenState extends State<AiPlannerScreen> {
  bool _includeSweet = true;
  final TextEditingController _allergenController = TextEditingController();

  List<MealRecipe>? _generatedMeals;
  List<String> _appliedAllergens = [];

  void _generateMealPlan() {
    if (widget.userMacro == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please calculate your target macros in Tab 1 first!')),
      );
      return;
    }

    final rawAllergens = _allergenController.text
        .toLowerCase()
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();

    _appliedAllergens = rawAllergens;

    bool isSafe(MealRecipe recipe) {
      if (rawAllergens.isEmpty) return true;

      // Check recipe allergen tags
      final hasRecipeAllergen = recipe.allergens.any((a) =>
          rawAllergens.any((userA) => a.contains(userA) || userA.contains(a)));

      // Check ingredients
      final hasIngredientAllergen = recipe.ingredients.any((ing) =>
          rawAllergens.any((userA) => ing.toLowerCase().contains(userA)));

      return !hasRecipeAllergen && !hasIngredientAllergen;
    }

    final breakfasts = mealRecipeDatabase.where((m) => m.mealType == 'breakfast' && isSafe(m)).toList();
    final lunches = mealRecipeDatabase.where((m) => m.mealType == 'lunch' && isSafe(m)).toList();
    final dinners = mealRecipeDatabase.where((m) => m.mealType == 'dinner' && isSafe(m)).toList();
    final sweets = mealRecipeDatabase.where((m) => m.mealType == 'sweet' && isSafe(m)).toList();

    final cals = widget.userMacro!.targetCalories;
    final p = widget.userMacro!.protein;
    final c = widget.userMacro!.carbs;
    final f = widget.userMacro!.fat;

    final chosenBreakfast = breakfasts.isNotEmpty
        ? breakfasts.first
        : MealRecipe(
            name: 'Custom Allergen-Free Breakfast',
            mealType: 'breakfast',
            baseCalories: (cals * 0.25).round(),
            protein: (p * 0.25).round(),
            carbs: (c * 0.25).round(),
            fat: (f * 0.25).round(),
            sugar: 4,
            satFat: 1.0,
            ingredients: ['steamed rice', 'lean turkey breast', 'cucumber'],
            allergens: [],
            prepTime: '10 mins',
            instructions: 'Combine allergen-safe whole foods.',
          );

    final chosenLunch = lunches.isNotEmpty
        ? lunches.first
        : MealRecipe(
            name: 'Custom Allergen-Free Lunch',
            mealType: 'lunch',
            baseCalories: (cals * 0.35).round(),
            protein: (p * 0.35).round(),
            carbs: (c * 0.35).round(),
            fat: (f * 0.35).round(),
            sugar: 5,
            satFat: 2.0,
            ingredients: ['grilled chicken breast', 'quinoa', 'carrots'],
            allergens: [],
            prepTime: '15 mins',
            instructions: 'Grill chicken and serve over warm quinoa.',
          );

    final chosenDinner = dinners.isNotEmpty
        ? dinners.first
        : MealRecipe(
            name: 'Custom Allergen-Free Dinner',
            mealType: 'dinner',
            baseCalories: (cals * 0.30).round(),
            protein: (p * 0.30).round(),
            carbs: (c * 0.30).round(),
            fat: (f * 0.30).round(),
            sugar: 3,
            satFat: 1.5,
            ingredients: ['baked white fish or poultry', 'sweet potato'],
            allergens: [],
            prepTime: '20 mins',
            instructions: 'Bake lean meat with sweet potatoes.',
          );

    final List<MealRecipe> plan = [chosenBreakfast, chosenLunch, chosenDinner];

    if (_includeSweet) {
      final chosenSweet = sweets.isNotEmpty
          ? sweets.first
          : MealRecipe(
              name: 'Fruit & Berry Bowl',
              mealType: 'sweet',
              baseCalories: (cals * 0.10).round(),
              protein: 4,
              carbs: (c * 0.10).round(),
              fat: 1,
              sugar: 10,
              satFat: 0.1,
              ingredients: ['fresh berries', 'sliced apple'],
              allergens: [],
              prepTime: '5 mins',
              instructions: 'Serve fresh berries chilled.',
            );
      plan.add(chosenSweet);
    }

    setState(() {
      _generatedMeals = plan;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAlignment.start,
        children: [
          const Text(
            '3. Smart AI Meal Recommendation Engine',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Include Sweet / Dessert? 🍰'),
                    value: _includeSweet,
                    onChanged: (val) => setState(() => _includeSweet = val),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _allergenController,
                    decoration: const InputDecoration(
                      labelText: 'Allergies & Disliked Foods (Comma Separated)',
                      hintText: 'e.g. Dairy, Nuts, Fish, Egg, Soy, Gluten...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _generateMealPlan,
                      icon: const Icon(Icons.auto_awesome, color: Colors.white),
                      label: const Text('Generate AI Custom Meal Plan', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          if (_generatedMeals != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.15),
                border: Border.all(color: const Color(0xFF10B981)),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                _appliedAllergens.isNotEmpty
                    ? '🚫 Strictly Excluded: ${_appliedAllergens.join(', ')}'
                    : '✅ No Allergen Exclusions Specified',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10B981)),
              ),
            ),
            const SizedBox(height: 12),

            Expanded(
              child: ListView.builder(
                itemCount: _generatedMeals!.length,
                itemBuilder: (context, index) {
                  final meal = _generatedMeals![index];
                  return Card(
                    color: const Color(0xFF1E293B),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainState.between,
                            children: [
                              Chip(
                                label: Text(meal.mealType.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                                backgroundColor: meal.mealType == 'sweet' ? Colors.pinkAccent : const Color(0xFF6366F1),
                              ),
                              Text('${meal.baseCalories} kcal', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.orangeAccent)),
                            ],
                          ),
                          Text(meal.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          Text('P: ${meal.protein}g  |  C: ${meal.carbs}g  |  F: ${meal.fat}g', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                          const SizedBox(height: 8),
                          Text('🛒 Ingredients: ${meal.ingredients.join(', ')}', style: const TextStyle(fontSize: 12)),
                          const SizedBox(height: 4),
                          Text('⏱️ Prep (${meal.prepTime}): ${meal.instructions}', style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Colors.grey)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            )
          ]
        ],
      ),
    );
  }
}
