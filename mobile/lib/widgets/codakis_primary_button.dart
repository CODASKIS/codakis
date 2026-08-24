import 'package:flutter/material.dart';

import '../core/app_theme.dart';

class CodakisPrimaryButton extends StatelessWidget {
  const CodakisPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.loading = false,
    this.pill = false,
    this.expand = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool loading;
  final bool pill;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final radius = pill ? CodakisRadii.pill : CodakisRadii.button;
    final child = loading
        ? const SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(label),
              if (icon != null) ...[
                const SizedBox(width: 8),
                Icon(icon, size: 18),
              ],
            ],
          );

    final button = FilledButton(
      onPressed: loading ? null : onPressed,
      style: FilledButton.styleFrom(
        minimumSize: Size(expand ? double.infinity : 0, 48),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius),
        ),
      ),
      child: child,
    );

    return button;
  }
}
