import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../core/codakis_button_styles.dart';

class CodakisPrimaryButton extends StatelessWidget {
  const CodakisPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.loading = false,
    this.pill = false,
    this.expand = false,
    this.variant = CodakisButtonVariant.auth,
    this.size = CodakisButtonSize.md,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool loading;
  final bool pill;
  final bool expand;
  final CodakisButtonVariant variant;
  final CodakisButtonSize size;

  @override
  Widget build(BuildContext context) {
    final radius = pill ? CodakisRadii.pill : CodakisRadii.button;
    final child = loading
        ? const SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
          )
        : Row(
            mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(label),
              if (icon != null) ...[
                const SizedBox(width: 8),
                Icon(icon, size: 18),
              ],
            ],
          );

    return FilledButton(
      onPressed: loading ? null : onPressed,
      style: CodakisButtonStyles.primary(
        expand: expand,
        radius: radius,
        variant: variant,
        size: size,
      ),
      child: child,
    );
  }
}
