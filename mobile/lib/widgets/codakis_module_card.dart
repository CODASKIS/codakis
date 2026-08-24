import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';
import '../core/constants/app_colors.dart';

/// Carte module alignée sur `.codakis-courses__module-card` du dashboard web.
class CodakisModuleCard extends StatefulWidget {
  const CodakisModuleCard({
    super.key,
    required this.index,
    required this.themeLabel,
    required this.title,
    required this.lessonCountLabel,
    required this.openLabel,
    this.premiumLabel,
    this.isPremium = false,
    this.locked = false,
    this.onTap,
    this.width,
  });

  final int index;
  final String themeLabel;
  final String title;
  final String lessonCountLabel;
  final String openLabel;
  final String? premiumLabel;
  final bool isPremium;
  final bool locked;
  final VoidCallback? onTap;
  final double? width;

  @override
  State<CodakisModuleCard> createState() => _CodakisModuleCardState();
}

class _CodakisModuleCardState extends State<CodakisModuleCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final opacity = widget.locked ? 0.85 : 1.0;
    final borderColor = _pressed ? CodakisColors.primary : const Color(0xFFE5E7EB);

    return Opacity(
      opacity: opacity,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOut,
        transform: Matrix4.translationValues(0, _pressed ? -2 : 0, 0),
        child: Material(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          child: InkWell(
            onTap: widget.onTap,
            onHighlightChanged: (value) => setState(() => _pressed = value),
            borderRadius: BorderRadius.circular(8),
            child: Ink(
              width: widget.width,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: borderColor),
                boxShadow: _pressed
                    ? [
                        BoxShadow(
                          color: CodakisColors.primary.withValues(alpha: 0.12),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ]
                    : null,
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _ModuleNumber(value: widget.index, locked: widget.locked),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.themeLabel.toUpperCase(),
                                style: GoogleFonts.nunito(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.6,
                                  color: const Color(0xFF84909C),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                widget.title,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.nunito(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  height: 1.35,
                                  color: AppColors.textDark,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  if (widget.isPremium && widget.premiumLabel != null) ...[
                                    _PremiumBadge(label: widget.premiumLabel!, locked: widget.locked),
                                    const SizedBox(width: 10),
                                  ],
                                  Expanded(
                                    child: Text(
                                      widget.lessonCountLabel,
                                      style: GoogleFonts.nunito(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.placeholder,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Text(
                          widget.openLabel,
                          style: GoogleFonts.nunito(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryDark,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(Icons.chevron_right, size: 18, color: AppColors.primaryDark),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ModuleNumber extends StatelessWidget {
  const _ModuleNumber({required this.value, required this.locked});

  final int value;
  final bool locked;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 38,
      height: 38,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: locked
            ? const Color(0xFFF3F4F6)
            : CodakisColors.primary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        value.toString().padLeft(2, '0'),
        style: GoogleFonts.nunito(
          fontSize: 13,
          fontWeight: FontWeight.w800,
          color: locked ? AppColors.placeholder : AppColors.primaryDark,
        ),
      ),
    );
  }
}

class _PremiumBadge extends StatelessWidget {
  const _PremiumBadge({required this.label, required this.locked});

  final String label;
  final bool locked;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.premiumBg,
        borderRadius: BorderRadius.circular(CodakisRadii.field),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            locked ? Icons.lock_outline : Icons.workspace_premium_outlined,
            size: 13,
            color: AppColors.premiumText,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.premiumText),
          ),
        ],
      ),
    );
  }
}
