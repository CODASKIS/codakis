import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';

/// Messages inline alignés sur `.codakis-auth-form__error` / `__success`.
class CodakisFormFeedback extends StatelessWidget {
  const CodakisFormFeedback.error({super.key, required this.message}) : success = false;

  const CodakisFormFeedback.success({super.key, required this.message}) : success = true;

  final String message;
  final bool success;

  @override
  Widget build(BuildContext context) {
    if (success) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: CodakisColors.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(CodakisRadii.field),
          border: Border.all(color: CodakisColors.primary.withValues(alpha: 0.35)),
        ),
        child: Text(
          message,
          style: GoogleFonts.nunito(fontSize: 14, color: const Color(0xFF1D2630), height: 1.4),
        ),
      );
    }

    return Text(
      message,
      style: GoogleFonts.nunito(fontSize: 14, color: const Color(0xFFDC2626), height: 1.4),
    );
  }
}

enum CodakisAlertVariant { error, success }

/// Bannière d'alerte dashboard (quiz, consort, etc.).
class CodakisAlertBanner extends StatelessWidget {
  const CodakisAlertBanner.error({super.key, required this.message}) : variant = CodakisAlertVariant.error;

  const CodakisAlertBanner.success({super.key, required this.message}) : variant = CodakisAlertVariant.success;

  final String message;
  final CodakisAlertVariant variant;

  @override
  Widget build(BuildContext context) {
    final isError = variant == CodakisAlertVariant.error;
    final color = isError ? const Color(0xFFDA1E28) : CodakisColors.primary;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: isError ? const Color(0xFFFEF2F2) : CodakisColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(isError ? Icons.error_outline : Icons.check_circle_outline, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: GoogleFonts.nunito(
                fontSize: 14,
                color: isError ? const Color(0xFF991B1B) : const Color(0xFF1D2630),
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
