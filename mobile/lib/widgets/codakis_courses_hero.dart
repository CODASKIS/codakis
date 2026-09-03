import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';
import '../core/constants/app_colors.dart';

/// En-tête parcours aligné sur `.codakis-courses__hero`.
class CodakisCoursesHero extends StatelessWidget {
  const CodakisCoursesHero({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.lead,
    required this.moduleCount,
    required this.modulesLabel,
  });

  final String eyebrow;
  final String title;
  final String lead;
  final int moduleCount;
  final String modulesLabel;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.textDark.withValues(alpha: 0.09)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: CodakisColors.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(Icons.school_outlined, color: AppColors.primaryDark, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  eyebrow.toUpperCase(),
                  style: GoogleFonts.nunito(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    color: AppColors.primaryDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: GoogleFonts.nunito(fontSize: 22, fontWeight: FontWeight.w800, height: 1.25, color: AppColors.textDark),
                ),
                const SizedBox(height: 6),
                Text(
                  lead,
                  style: GoogleFonts.nunito(fontSize: 14, height: 1.55, color: AppColors.placeholder),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.textDark.withValues(alpha: 0.09)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.layers_outlined, color: CodakisColors.primary, size: 20),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$moduleCount',
                      style: GoogleFonts.nunito(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textDark),
                    ),
                    Text(
                      modulesLabel,
                      style: GoogleFonts.nunito(fontSize: 11, color: const Color(0xFF84909C)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Titre de section aligné sur `.codakis-courses__section-heading`.
class CodakisCoursesSectionHeading extends StatelessWidget {
  const CodakisCoursesSectionHeading({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.hint,
  });

  final String eyebrow;
  final String title;
  final String hint;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                eyebrow.toUpperCase(),
                style: GoogleFonts.nunito(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                  color: AppColors.primaryDark,
                ),
              ),
              const SizedBox(height: 4),
              Text(title, style: GoogleFonts.nunito(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textDark)),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Flexible(
          child: Text(
            hint,
            textAlign: TextAlign.right,
            style: GoogleFonts.nunito(fontSize: 13, color: AppColors.placeholder, height: 1.45),
          ),
        ),
      ],
    );
  }
}

/// Conteneur blanc type `MainCard` du dashboard web.
class CodakisMainCard extends StatelessWidget {
  const CodakisMainCard({super.key, required this.child, this.padding = const EdgeInsets.all(16)});

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(CodakisRadii.card),
        border: Border.all(color: AppColors.gray),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: padding,
      child: child,
    );
  }
}
