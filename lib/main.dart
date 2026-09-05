import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'services/macro_calculator.dart';
import 'screens/calculator_screen.dart';
import 'screens/food_search_screen.dart';
import 'screens/ai_planner_screen.dart';

void main() {
  runApp(const NutriFitApp());
}

class NutriFitApp extends StatelessWidget {
  const NutriFitApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NutriFit - Multi-Platform Nutrition & AI Meal Planner',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6366F1),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF1E293B),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme),
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _selectedIndex = 0;
  MacroResult? _userMacroResult;

  @override
  Widget build(BuildContext context) {
    final screens = [
      CalculatorScreen(
        onCalculated: (result) {
          setState(() {
            _userMacroResult = result;
          });
        },
      ),
      const FoodSearchScreen(),
      AiPlannerScreen(userMacro: _userMacroResult),
    ];

    final isDesktop = MediaQuery.of(context).size.width >= 800;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(8)),
              child: const Text('🥗', style: TextStyle(fontSize: 20)),
            ),
            const SizedBox(width: 10),
            RichText(
              text: TextSpan(
                style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                children: const [
                  TextSpan(text: 'Nutri'),
                  TextSpan(text: 'Fit', style: TextStyle(color: Color(0xFF10B981))),
                ],
              ),
            ),
          ],
        ),
      ),
      body: Row(
        children: [
          if (isDesktop)
            NavigationRail(
              backgroundColor: const Color(0xFF0F172A),
              selectedIndex: _selectedIndex,
              onDestinationSelected: (index) => setState(() => _selectedIndex = index),
              labelType: NavigationRailLabelType.all,
              selectedIconTheme: const IconThemeData(color: Color(0xFF10B981)),
              destinations: const [
                NavigationRailDestination(icon: Icon(Icons.calculate), label: Text('Calculator')),
                NavigationRailDestination(icon: Icon(Icons.search), label: Text('Food Search')),
                NavigationRailDestination(icon: Icon(Icons.auto_awesome), label: Text('AI Planner')),
              ],
            ),
          Expanded(child: screens[_selectedIndex]),
        ],
      ),
      bottomNavigationBar: isDesktop
          ? null
          : BottomNavigationBar(
              backgroundColor: const Color(0xFF1E293B),
              currentIndex: _selectedIndex,
              selectedItemColor: const Color(0xFF10B981),
              unselectedItemColor: Colors.grey,
              onTap: (index) => setState(() => _selectedIndex = index),
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.calculate), label: 'Calculator'),
                BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Food Search'),
                BottomNavigationBarItem(icon: Icon(Icons.auto_awesome), label: 'AI Planner'),
              ],
            ),
    );
  }
}
