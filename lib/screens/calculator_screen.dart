import 'package:flutter/material.dart';
import '../services/macro_calculator.dart';
import '../widgets/health_guide_dialog.dart';

class CalculatorScreen extends StatefulWidget {
  final Function(MacroResult) onCalculated;

  const CalculatorScreen({super.key, required this.onCalculated});

  @override
  State<CalculatorScreen> createState() => _CalculatorScreenState();
}

class _CalculatorScreenState extends State<CalculatorScreen> {
  final _formKey = GlobalKey<FormState>();

  int _age = 25;
  String _gender = 'male';
  double _weight = 70.0;
  double _height = 175.0;
  double _activity = 1.375;
  String _goal = 'maintain';
  double _rate = 0.5;
  String _activePreset = 'balanced';

  MacroResult? _result;

  void _recalculate() {
    final res = MacroCalculator.calculate(
      age: _age,
      gender: _gender,
      weight: _weight,
      height: _height,
      activityLevel: _activity,
      goal: _goal,
      rate: _rate,
      preset: _activePreset,
    );
    setState(() {
      _result = res;
    });
    widget.onCalculated(res);
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAlignment.start,
        children: [
          // Header Row with Health Guide button
          Row(
            mainAxisAlignment: MainState.between,
            children: [
              const Expanded(
                child: Text(
                  '1. Personal Macro & Calorie Calculator',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
              OutlinedButton.icon(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) => const HealthGuideDialog(),
                  );
                },
                icon: const Icon(Icons.menu_book, color: Color(0xFF10B981)),
                label: const Text('Guide', style: TextStyle(color: Colors.white)),
              )
            ],
          ),
          const SizedBox(height: 16),

          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            initialValue: _age.toString(),
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Age (years)', border: OutlineInputBorder()),
                            onChanged: (val) => _age = int.tryParse(val) ?? 25,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _gender,
                            decoration: const InputDecoration(labelText: 'Gender', border: OutlineInputBorder()),
                            items: const [
                              DropdownMenuItem(value: 'male', child: Text('Male')),
                              DropdownMenuItem(value: 'female', child: Text('Female')),
                            ],
                            onChanged: (val) => setState(() => _gender = val!),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            initialValue: _weight.toString(),
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Weight (kg)', border: OutlineInputBorder()),
                            onChanged: (val) => _weight = double.tryParse(val) ?? 70.0,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            initialValue: _height.toString(),
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Height (cm)', border: OutlineInputBorder()),
                            onChanged: (val) => _height = double.tryParse(val) ?? 175.0,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    DropdownButtonFormField<double>(
                      value: _activity,
                      decoration: const InputDecoration(labelText: 'Activity Level', border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: 1.2, child: Text('Sedentary (Little/no exercise)')),
                        DropdownMenuItem(value: 1.375, child: Text('Lightly Active (1-3 days/wk)')),
                        DropdownMenuItem(value: 1.55, child: Text('Moderately Active (3-5 days/wk)')),
                        DropdownMenuItem(value: 1.725, child: Text('Very Active (6-7 days/wk)')),
                        DropdownMenuItem(value: 1.9, child: Text('Extra Active (Hard physical job)')),
                      ],
                      onChanged: (val) => setState(() => _activity = val!),
                    ),
                    const SizedBox(height: 12),

                    DropdownButtonFormField<String>(
                      value: _goal,
                      decoration: const InputDecoration(labelText: 'Fitness Goal', border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: 'maintain', child: Text('Weight Maintenance')),
                        DropdownMenuItem(value: 'lose', child: Text('Lose Weight')),
                        DropdownMenuItem(value: 'gain', child: Text('Gain Weight')),
                      ],
                      onChanged: (val) => setState(() => _goal = val!),
                    ),
                    const SizedBox(height: 12),

                    if (_goal != 'maintain')
                      DropdownButtonFormField<double>(
                        value: _rate,
                        decoration: const InputDecoration(labelText: 'Weekly Rate', border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 0.25, child: Text('0.25 kg (0.5 lb) / week')),
                          DropdownMenuItem(value: 0.5, child: Text('0.5 kg (1.0 lb) / week')),
                          DropdownMenuItem(value: 1.0, child: Text('1.0 kg (2.0 lb) / week')),
                        ],
                        onChanged: (val) => setState(() => _rate = val!),
                      ),
                    const SizedBox(height: 20),

                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6366F1),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: _recalculate,
                        child: const Text('Calculate Target Macros', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          if (_result != null) ...[
            const SizedBox(height: 24),
            const Text('Presets Ratio Switcher:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildPresetChip('balanced', '⚖️ Balanced'),
                  _buildPresetChip('low-fat', '🥑 Low Fat'),
                  _buildPresetChip('low-carbs', '🌾 Low Carbs'),
                  _buildPresetChip('high-protein', '🍗 High Protein'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Macro Display Grid
            GridView.count(
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 3 : 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.3,
              children: [
                _buildMacroCard('🔥 Calories', '${_result!.targetCalories}', 'kcal/day', 'Target: ${(_result!.targetCalories * 0.95).round()} - ${(_result!.targetCalories * 1.05).round()}', const Color(0xFFEC4899)),
                _buildMacroCard('🥩 Protein', '${_result!.protein}g', 'grams/day', 'Range: ${(_result!.protein * 0.85).round()}g - ${(_result!.protein * 1.15).round()}g', const Color(0xFF6366F1)),
                _buildMacroCard('🥖 Carbs', '${_result!.carbs}g', 'grams/day', 'Range: ${(_result!.carbs * 0.85).round()}g - ${(_result!.carbs * 1.15).round()}g', const Color(0xFFF59E0B)),
                _buildMacroCard('🫒 Total Fat', '${_result!.fat}g', 'grams/day', 'Range: ${(_result!.fat * 0.85).round()}g - ${(_result!.fat * 1.15).round()}g', const Color(0xFF10B981)),
                _buildMacroCard('🍯 Sugar Cap', '${_result!.maxSugar}g', 'max grams/day', 'Strict Cap: Max ${_result!.maxSugar}g', Colors.orangeAccent),
                _buildMacroCard('🧈 Sat. Fat Cap', '${_result!.maxSatFat}g', 'max grams/day', 'Strict Cap: Max ${_result!.maxSatFat}g', Colors.redAccent),
              ],
            ),
          ]
        ],
      ),
    );
  }

  Widget _buildPresetChip(String key, String label) {
    final isSelected = _activePreset == key;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: FilterChip(
        selected: isSelected,
        label: Text(label),
        selectedColor: const Color(0xFF6366F1),
        onSelected: (bool selected) {
          if (selected) {
            setState(() {
              _activePreset = key;
            });
            _recalculate();
          }
        },
      ),
    );
  }

  Widget _buildMacroCard(String title, String value, String unit, String range, Color color) {
    return Card(
      color: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: color.withOpacity(0.5), width: 1.5),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.extrabold, color: Colors.white)),
            Text(unit, style: const TextStyle(fontSize: 11, color: Colors.grey)),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(4)),
              child: Text(range, style: const TextStyle(fontSize: 10, color: Colors.white70)),
            ),
          ],
        ),
      ),
    );
  }
}
