import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';
import 'codakis_primary_button.dart';

/// Panneau quiz aligné sur `.codakis-player-quiz` du dashboard web.
class CodakisQuizPanel extends StatelessWidget {
  const CodakisQuizPanel({
    super.key,
    required this.label,
    required this.title,
    required this.child,
    this.timerText,
    this.timerLow = false,
  });

  final String label;
  final String title;
  final Widget child;
  final String? timerText;
  final bool timerLow;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: GoogleFonts.nunito(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.6,
              color: CodakisColors.primary,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.nunito(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.black),
                ),
              ),
              if (timerText != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: timerLow ? const Color(0xFFFEF2F2) : CodakisColors.surfaceAlt,
                    borderRadius: BorderRadius.circular(CodakisRadii.field),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.schedule, size: 15, color: timerLow ? const Color(0xFFDA1E28) : CodakisColors.primary),
                      const SizedBox(width: 4),
                      Text(
                        timerText!,
                        style: GoogleFonts.nunito(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: timerLow ? const Color(0xFFDA1E28) : CodakisColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class CodakisQuizProgress extends StatelessWidget {
  const CodakisQuizProgress({super.key, required this.value});

  final double value;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(4),
      child: LinearProgressIndicator(
        value: value,
        minHeight: 6,
        backgroundColor: const Color(0xFFE5E7EB),
        color: CodakisColors.primary,
      ),
    );
  }
}

class CodakisQuizOption extends StatelessWidget {
  const CodakisQuizOption({
    super.key,
    required this.index,
    required this.label,
    required this.text,
    required this.selected,
    required this.onTap,
    this.correct,
  });

  final int index;
  final String label;
  final String text;
  final bool selected;
  final VoidCallback? onTap;
  final bool? correct;

  @override
  Widget build(BuildContext context) {
    Color border = const Color(0xFFE5E7EB);
    Color bg = Colors.white;
    Color accent = CodakisColors.primary;

    if (correct == true) {
      border = CodakisColors.primary;
      bg = CodakisColors.surfaceAlt;
    } else if (correct == false) {
      border = const Color(0xFFDA1E28);
      bg = const Color(0xFFFEF2F2);
      accent = const Color(0xFFDA1E28);
    } else if (selected) {
      border = CodakisColors.primary;
      bg = CodakisColors.primary.withValues(alpha: 0.06);
      accent = CodakisColors.primary;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: bg,
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(CodakisRadii.field),
          child: Container(
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(CodakisRadii.field),
              border: Border.all(color: border, width: 1.5),
            ),
            padding: const EdgeInsets.all(15),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  index.toString().padLeft(2, '0'),
                  style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w700, color: accent),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: GoogleFonts.nunito(fontSize: 15, color: CodakisColors.textPrimary, height: 1.45),
                      children: [
                        TextSpan(text: '$label. ', style: const TextStyle(fontWeight: FontWeight.w700)),
                        TextSpan(text: text),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class CodakisQuizScore extends StatelessWidget {
  const CodakisQuizScore({
    super.key,
    required this.score,
    required this.passed,
    required this.passLabel,
    required this.failLabel,
  });

  final int score;
  final bool passed;
  final String passLabel;
  final String failLabel;

  @override
  Widget build(BuildContext context) {
    final color = passed ? const Color(0xFF1DB96A) : const Color(0xFFDA1E28);
    return Column(
      children: [
        Text(
          '$score%',
          style: GoogleFonts.nunito(fontSize: 48, fontWeight: FontWeight.w800, color: color, height: 1),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(CodakisRadii.field),
          ),
          child: Text(
            passed ? passLabel : failLabel,
            style: GoogleFonts.nunito(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
          ),
        ),
      ],
    );
  }
}

class CodakisQuizNav extends StatelessWidget {
  const CodakisQuizNav({
    super.key,
    required this.canPrev,
    required this.isLast,
    required this.prevLabel,
    required this.nextLabel,
    required this.submitLabel,
    required this.onPrev,
    required this.onNext,
    required this.onSubmit,
    this.submitting = false,
  });

  final bool canPrev;
  final bool isLast;
  final String prevLabel;
  final String nextLabel;
  final String submitLabel;
  final VoidCallback? onPrev;
  final VoidCallback? onNext;
  final VoidCallback? onSubmit;
  final bool submitting;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: CodakisPrimaryButton(
            label: prevLabel,
            variant: CodakisButtonVariant.site,
            onPressed: canPrev ? onPrev : null,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          flex: 2,
          child: CodakisPrimaryButton(
            label: isLast ? submitLabel : nextLabel,
            expand: true,
            loading: isLast && submitting,
            variant: CodakisButtonVariant.site,
            size: CodakisButtonSize.lg,
            onPressed: isLast ? (submitting ? null : onSubmit) : onNext,
          ),
        ),
      ],
    );
  }
}
