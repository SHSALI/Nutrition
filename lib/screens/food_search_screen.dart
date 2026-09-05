import 'package:flutter/material.dart';
import '../models/food_item.dart';

class FoodSearchScreen extends StatefulWidget {
  const FoodSearchScreen({super.key});

  @override
  State<FoodSearchScreen> createState() => _FoodSearchScreenState();
}

class _FoodSearchScreenState extends State<FoodSearchScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final filteredFoods = foodDatabase.where((food) {
      final q = _searchQuery.toLowerCase();
      return food.name.toLowerCase().contains(q) || food.category.toLowerCase().contains(q);
    }).toList();

    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAlignment.start,
        children: [
          const Text(
            '2. Food Micronutrient & Macronutrient Database',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          TextField(
            decoration: InputDecoration(
              hintText: '🔍 Search food (e.g. Chicken, Oats, Salmon, Apple)...',
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              prefixIcon: const Icon(Icons.search),
            ),
            onChanged: (val) {
              setState(() {
                _searchQuery = val;
              });
            },
          ),
          const SizedBox(height: 16),

          Expanded(
            child: filteredFoods.isEmpty
                ? const Center(child: Text('No food items found.'))
                : ListView.builder(
                    itemCount: filteredFoods.length,
                    itemBuilder: (context, index) {
                      final food = filteredFoods[index];
                      return Card(
                        color: const Color(0xFF1E293B),
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainState.between,
                                children: [
                                  Text(food.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  Chip(
                                    label: Text(food.category, style: const TextStyle(fontSize: 10, color: Colors.white)),
                                    backgroundColor: const Color(0xFF6366F1).withOpacity(0.3),
                                  )
                                ],
                              ),
                              Text('📏 Serving Size: ${food.serving}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                              const SizedBox(height: 10),

                              Row(
                                mainAxisAlignment: MainState.spaceAround,
                                children: [
                                  _buildMiniMacro('Protein', '${food.protein}g'),
                                  _buildMiniMacro('Carbs', '${food.carbs}g'),
                                  _buildMiniMacro('Fat', '${food.fat}g'),
                                  _buildMiniMacro('Sugar', '${food.sugar}g'),
                                  _buildMiniMacro('Sat.Fat', '${food.satFat}g'),
                                ],
                              ),
                              const SizedBox(height: 10),

                              Wrap(
                                spacing: 8,
                                children: food.micros.entries.map((e) {
                                  return Chip(
                                    avatar: const Icon(Icons.science, size: 14, color: Color(0xFF10B981)),
                                    label: Text('${e.key}: ${e.value}', style: const TextStyle(fontSize: 11)),
                                    backgroundColor: Colors.black26,
                                  );
                                }).toList(),
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }

  Widget _buildMiniMacro(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }
}
