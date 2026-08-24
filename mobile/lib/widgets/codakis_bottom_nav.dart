import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../core/locale_scope.dart';

enum CodakisTab { home, courses, quizzes, school, profile }

class CodakisBottomNav extends StatelessWidget {
  const CodakisBottomNav({
    super.key,
    required this.current,
    required this.onChanged,
  });

  final CodakisTab current;
  final ValueChanged<CodakisTab> onChanged;

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: CodakisColors.border.withValues(alpha: 0.55))),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: Row(
            children: [
              _NavItem(
                icon: Icons.home_outlined,
                activeIcon: Icons.home,
                label: s.navHome,
                selected: current == CodakisTab.home,
                onTap: () => onChanged(CodakisTab.home),
              ),
              _NavItem(
                icon: Icons.menu_book_outlined,
                activeIcon: Icons.menu_book,
                label: s.navCourses,
                selected: current == CodakisTab.courses,
                onTap: () => onChanged(CodakisTab.courses),
              ),
              _NavItem(
                icon: Icons.quiz_outlined,
                activeIcon: Icons.quiz,
                label: s.navQuizzes,
                selected: current == CodakisTab.quizzes,
                onTap: () => onChanged(CodakisTab.quizzes),
              ),
              _NavItem(
                icon: Icons.directions_car_outlined,
                activeIcon: Icons.directions_car,
                label: s.navSchool,
                selected: current == CodakisTab.school,
                onTap: () => onChanged(CodakisTab.school),
              ),
              _NavItem(
                icon: Icons.person_outline,
                activeIcon: Icons.person,
                label: s.navProfile,
                selected: current == CodakisTab.profile,
                onTap: () => onChanged(CodakisTab.profile),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? CodakisColors.primary : CodakisColors.textMuted;
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(selected ? activeIcon : icon, size: 22, color: color),
              const SizedBox(height: 4),
              Text(
                label,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontSize: 11,
                      fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                      color: color,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
