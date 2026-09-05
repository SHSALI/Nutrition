import 'dart:math';

class MacroResult {
  final int bmr;
  final int tdee;
  final int targetCalories;
  final int protein;
  final int carbs;
  final int fat;
  final int maxSugar;
  final int maxSatFat;

  MacroResult({
    required this.bmr,
    required this.tdee,
    required this.targetCalories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.maxSugar,
    required this.maxSatFat,
  });
}

class MacroCalculator {
  static MacroResult calculate({
    required int age,
    required String gender,
    required double weight,
    required double height,
    required double activityLevel,
    required String goal,
    required double rate, // 0.25, 0.5, 1.0
    String preset = 'balanced', // balanced, low-fat, low-carbs, high-protein
  }) {
    // 1. Mifflin-St Jeor BMR
    double bmr;
    if (gender.toLowerCase() == 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // 2. TDEE
    double tdee = bmr * activityLevel;

    // 3. Goal Adjustment
    double calorieAdj = 0;
    if (rate == 0.25) calorieAdj = 275;
    else if (rate == 0.5) calorieAdj = 550;
    else if (rate == 1.0) calorieAdj = 1100;

    double targetCalories = tdee;
    if (goal == 'lose') {
      targetCalories = max(1200.0, tdee - calorieAdj);
    } else if (goal == 'gain') {
      targetCalories = tdee + calorieAdj;
    }

    // 4. Macro Splits
    double pRatio = 0.30;
    double cRatio = 0.40;
    double fRatio = 0.30;

    if (preset == 'low-fat') {
      pRatio = 0.35; cRatio = 0.50; fRatio = 0.15;
    } else if (preset == 'low-carbs') {
      pRatio = 0.40; cRatio = 0.20; fRatio = 0.40;
    } else if (preset == 'high-protein') {
      pRatio = 0.40; cRatio = 0.35; fRatio = 0.25;
    }

    int protein = ((targetCalories * pRatio) / 4).round();
    int carbs = ((targetCalories * cRatio) / 4).round();
    int fat = ((targetCalories * fRatio) / 9).round();

    int maxSugar = ((targetCalories * 0.08) / 4).round();
    int maxSatFat = ((targetCalories * 0.09) / 9).round();

    return MacroResult(
      bmr: bmr.round(),
      tdee: tdee.round(),
      targetCalories: targetCalories.round(),
      protein: protein,
      carbs: carbs,
      fat: fat,
      maxSugar: maxSugar,
      maxSatFat: maxSatFat,
    );
  }
}
