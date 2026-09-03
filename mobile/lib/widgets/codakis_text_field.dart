import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../core/app_theme.dart';
import '../core/codakis_input_styles.dart';
import '../core/constants/app_icons.dart';

class CodakisTextField extends StatefulWidget {
  const CodakisTextField({
    super.key,
    this.label,
    this.controller,
    this.validator,
    this.keyboardType,
    this.obscureText = false,
    this.textInputAction,
    this.hintText,
    this.onToggleObscure,
    this.showObscureToggle = false,
    this.obscureVisible = false,
    this.prefixIcon,
    this.suffixIcon,
    this.onSubmitted,
    this.readOnly = false,
  });

  final String? label;
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final TextInputType? keyboardType;
  final bool obscureText;
  final TextInputAction? textInputAction;
  final String? hintText;
  final VoidCallback? onToggleObscure;
  final bool showObscureToggle;
  final bool obscureVisible;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final ValueChanged<String>? onSubmitted;
  final bool readOnly;

  @override
  State<CodakisTextField> createState() => _CodakisTextFieldState();
}

class _CodakisTextFieldState extends State<CodakisTextField> {
  final _focusNode = FocusNode();
  bool _focused = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() => setState(() => _focused = _focusNode.hasFocus));
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  Widget? _buildSuffixIcon() {
    if (widget.showObscureToggle) {
      return IconButton(
        onPressed: widget.onToggleObscure,
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        icon: widget.obscureVisible
            ? Icon(Icons.visibility_off_outlined, size: 20, color: const Color(0xFF667085))
            : SvgPicture.asset(AppIcons.eye, width: 20, height: 20),
      );
    }
    return widget.suffixIcon;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (widget.label != null) ...[
          Text(widget.label!, style: CodakisInputStyles.labelStyle),
          const SizedBox(height: 8),
        ],
        AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOut,
          decoration: CodakisInputStyles.boxDecoration(focused: _focused && !widget.readOnly, readOnly: widget.readOnly),
          child: TextFormField(
            controller: widget.controller,
            focusNode: _focusNode,
            readOnly: widget.readOnly,
            validator: widget.validator,
            keyboardType: widget.keyboardType,
            obscureText: widget.obscureText && !widget.obscureVisible,
            textInputAction: widget.textInputAction,
            onFieldSubmitted: widget.onSubmitted,
            style: CodakisInputStyles.textStyle,
            decoration: CodakisInputStyles.innerDecoration(
              hintText: widget.hintText,
              prefixIcon: widget.prefixIcon,
              suffixIcon: _buildSuffixIcon(),
            ),
          ),
        ),
      ],
    );
  }
}

class CodakisSelectField<T> extends StatefulWidget {
  const CodakisSelectField({
    super.key,
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final String label;
  final T value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;

  @override
  State<CodakisSelectField<T>> createState() => _CodakisSelectFieldState<T>();
}

class _CodakisSelectFieldState<T> extends State<CodakisSelectField<T>> {
  final _focusNode = FocusNode();
  bool _focused = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() => setState(() => _focused = _focusNode.hasFocus));
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(widget.label, style: CodakisInputStyles.labelStyle),
        const SizedBox(height: 8),
        AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOut,
          decoration: CodakisInputStyles.boxDecoration(focused: _focused),
          child: DropdownButtonHideUnderline(
            child: DropdownButtonFormField<T>(
              key: ValueKey(widget.value),
              focusNode: _focusNode,
              initialValue: widget.value,
              items: widget.items,
              onChanged: widget.onChanged,
              icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF667085)),
              style: CodakisInputStyles.textStyle,
              dropdownColor: Colors.white,
              borderRadius: BorderRadius.circular(CodakisRadii.field),
              decoration: CodakisInputStyles.innerDecoration(),
            ),
          ),
        ),
      ],
    );
  }
}
