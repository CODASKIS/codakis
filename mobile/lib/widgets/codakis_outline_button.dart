import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../core/codakis_button_styles.dart';

class CodakisOutlineButton extends StatelessWidget {
  const CodakisOutlineButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.expand = false,
    this.pill = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool expand;
  final bool pill;

  @override
  Widget build(BuildContext context) {
    final radius = pill ? CodakisRadii.pill : CodakisRadii.button;
    return OutlinedButton(
      onPressed: onPressed,
      style: CodakisButtonStyles.outline(expand: expand, radius: radius),
      child: Row(
        mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label),
          if (icon != null) ...[
            const SizedBox(width: 8),
            Icon(icon, size: 18),
          ],
        ],
      ),
    );
  }
}
