import 'package:flutter/material.dart';

class HealthGuideDialog extends StatelessWidget {
  const HealthGuideDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF1E293B),
      title: const Row(
        children: [
          Icon(Icons.menu_book, color: Color(0xFF10B981)),
          SizedBox(width: 8),
          Text('Health & Sugar Guide'),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.2),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'Ministry of Health Guidelines & Science-Backed Advice',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
              ),
            ),
            const SizedBox(height: 12),

            const Text('1. Reaching Your Goal', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF6366F1))),
            const Text('• Aim for 0.25kg - 1.0kg weekly weight change for sustainable health.\n• Eat 1.6g - 2.2g protein per kg bodyweight to protect muscle mass.\n• Drink 2.5L - 3.5L water daily.', style: TextStyle(fontSize: 12, color: Colors.grey)),

            const SizedBox(height: 12),
            const Text('2. Sugar & Saturated Fat Control', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF6366F1))),
            const Text('• Keep added sugars strictly under 10% (ideally <5%) of daily calories (approx 25g - 36g max).\n• Limit saturated fats to under 10% of daily calories for cardiovascular wellness.', style: TextStyle(fontSize: 12, color: Colors.grey)),

            const SizedBox(height: 12),
            const Text('3. Macronutrient Roles', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF6366F1))),
            const Text('• Protein: 4 kcal/g (Muscle repair & satiety)\n• Carbs: 4 kcal/g (Primary brain & exercise fuel)\n• Fats: 9 kcal/g (Hormone synthesis & vit A, D, E, K absorption)', style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        )
      ],
    );
  }
}
