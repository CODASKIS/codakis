import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../constants/app_colors.dart';
import '../constants/app_defaults.dart';
import '../constants/app_icons.dart';

class PgLabeledField extends StatelessWidget {
  const PgLabeledField({
    super.key,
    required this.label,
    required this.child,
  });

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.black)),
        const SizedBox(height: 8),
        child,
      ],
    );
  }
}

class PgTextField extends StatelessWidget {
  const PgTextField({
    super.key,
    this.controller,
    this.validator,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.showToggle = false,
    this.obscureVisible = false,
    this.onToggleObscure,
    this.onFieldSubmitted,
  });

  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool obscureText;
  final bool showToggle;
  final bool obscureVisible;
  final VoidCallback? onToggleObscure;
  final ValueChanged<String>? onFieldSubmitted;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      obscureText: obscureText && !obscureVisible,
      onFieldSubmitted: onFieldSubmitted,
      decoration: InputDecoration(
        filled: true,
        fillColor: AppColors.textInputBackground,
        border: OutlineInputBorder(
          borderRadius: AppDefaults.borderRadius,
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppDefaults.borderRadius,
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppDefaults.borderRadius,
          borderSide: const BorderSide(color: AppColors.primary, width: 1),
        ),
        suffixIcon: showToggle
            ? IconButton(
                onPressed: onToggleObscure,
                icon: SvgPicture.asset(AppIcons.eye, width: 24),
              )
            : null,
      ),
    );
  }
}
