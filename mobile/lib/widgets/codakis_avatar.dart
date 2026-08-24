import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';

class CodakisAvatarInitials extends StatelessWidget {
  const CodakisAvatarInitials({
    super.key,
    required this.initials,
    this.size = 80,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.borderWidth = 2,
  });

  final String initials;
  final double size;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? borderColor;
  final double borderWidth;

  factory CodakisAvatarInitials.fromName({
    required String firstName,
    required String lastName,
    double size = 80,
    Color? backgroundColor,
    Color? foregroundColor,
    Color? borderColor,
    double borderWidth = 2,
  }) {
    return CodakisAvatarInitials(
      initials: profileInitials(firstName, lastName),
      size: size,
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor,
      borderColor: borderColor,
      borderWidth: borderWidth,
    );
  }

  static String profileInitials(String firstName, String lastName) {
    final first = firstName.trim();
    final last = lastName.trim();
    if (first.isEmpty && last.isEmpty) return '?';
    if (first.isNotEmpty && last.isNotEmpty) {
      return '${first[0]}${last[0]}'.toUpperCase();
    }
    final single = first.isNotEmpty ? first : last;
    return single.length >= 2 ? single.substring(0, 2).toUpperCase() : single[0].toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final bg = backgroundColor ?? CodakisColors.primary.withValues(alpha: 0.15);
    final fg = foregroundColor ?? CodakisColors.primary;
    final border = borderColor ?? Colors.white;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: bg,
        border: Border.all(color: border, width: borderWidth),
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: GoogleFonts.nunito(
          fontSize: size * 0.34,
          fontWeight: FontWeight.w800,
          color: fg,
          height: 1,
        ),
      ),
    );
  }
}
