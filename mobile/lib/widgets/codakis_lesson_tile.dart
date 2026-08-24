import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';

/// Ligne leçon alignée sur `.codakis-courses__lesson`.
class CodakisLessonTile extends StatelessWidget {
  const CodakisLessonTile({
    super.key,
    required this.step,
    required this.title,
    required this.subtitle,
    required this.actionLabel,
    this.locked = false,
    this.onTap,
    this.showDivider = true,
  });

  final int step;
  final String title;
  final String subtitle;
  final String actionLabel;
  final bool locked;
  final VoidCallback? onTap;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Material(
          color: Colors.white,
          child: InkWell(
            onTap: locked ? null : onTap,
            child: Ink(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
              child: Row(
                children: [
                  _LessonStep(number: step, locked: locked),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: GoogleFonts.nunito(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: locked ? const Color(0xFF667085) : CodakisColors.textPrimary,
                          ),
                        ),
                        if (subtitle.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            subtitle,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.nunito(fontSize: 13, height: 1.45, color: const Color(0xFF667085)),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        actionLabel,
                        style: GoogleFonts.nunito(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: locked ? const Color(0xFF667085) : const Color(0xFF667085),
                        ),
                      ),
                      Icon(Icons.chevron_right, size: 18, color: locked ? const Color(0xFF667085) : const Color(0xFF667085)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        if (showDivider)
          Divider(height: 1, thickness: 1, color: const Color(0xFF1D2630).withValues(alpha: 0.07)),
      ],
    );
  }
}

class _LessonStep extends StatelessWidget {
  const _LessonStep({required this.number, required this.locked});

  final int number;
  final bool locked;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: locked ? const Color(0xFFF8FAFB) : Colors.white,
        border: Border.all(
          color: locked ? const Color(0xFFE5E7EB) : CodakisColors.primary.withValues(alpha: 0.4),
        ),
      ),
      child: Text(
        '$number',
        style: GoogleFonts.nunito(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: locked ? const Color(0xFF667085) : CodakisColors.primary,
        ),
      ),
    );
  }
}
