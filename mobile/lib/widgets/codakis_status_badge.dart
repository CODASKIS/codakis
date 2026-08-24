import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';

enum CodakisBadgeTone { primary, success, warning, danger, info, neutral }

class CodakisStatusBadge extends StatelessWidget {
  const CodakisStatusBadge({
    super.key,
    required this.label,
    this.tone = CodakisBadgeTone.primary,
  });

  final String label;
  final CodakisBadgeTone tone;

  Color get _color => switch (tone) {
        CodakisBadgeTone.success || CodakisBadgeTone.primary => CodakisColors.primary,
        CodakisBadgeTone.warning => const Color(0xFFF59E0B),
        CodakisBadgeTone.danger => const Color(0xFFDA1E28),
        CodakisBadgeTone.info => const Color(0xFF0EA5E9),
        CodakisBadgeTone.neutral => CodakisColors.textMuted,
      };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        border: Border.all(color: _color.withValues(alpha: 0.35)),
      ),
      child: Text(
        label,
        style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.w700, color: _color),
      ),
    );
  }

  static CodakisBadgeTone dossierStatus(String status) => switch (status) {
        'pret' => CodakisBadgeTone.success,
        'pieces_incompletes' => CodakisBadgeTone.warning,
        'depose' => CodakisBadgeTone.info,
        _ => CodakisBadgeTone.primary,
      };

  static CodakisBadgeTone pieceStatus(String status) => switch (status) {
        'validated' => CodakisBadgeTone.success,
        'pending' => CodakisBadgeTone.warning,
        _ => CodakisBadgeTone.danger,
      };
}
