import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';

/// Saisie OTP 6 chiffres — style underline, couleurs CODAKIS.
class CodakisOtpForm extends StatefulWidget {
  const CodakisOtpForm({
    super.key,
    required this.onCompleted,
    this.length = 6,
  });

  final ValueChanged<String> onCompleted;
  final int length;

  @override
  State<CodakisOtpForm> createState() => CodakisOtpFormState();
}

class CodakisOtpFormState extends State<CodakisOtpForm> {
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _nodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _nodes = List.generate(widget.length, (_) => FocusNode());
  }

  String get value => _controllers.map((c) => c.text).join();

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final n in _nodes) {
      n.dispose();
    }
    super.dispose();
  }

  void _onChanged(int index, String char) {
    if (char.length == 1 && index < widget.length - 1) {
      _nodes[index + 1].requestFocus();
    }
    if (char.isEmpty && index > 0) {
      _nodes[index - 1].requestFocus();
    }
    if (value.length == widget.length) {
      widget.onCompleted(value);
    }
  }

  bool validate() => value.length == widget.length;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(widget.length, (index) {
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: index == widget.length - 1 ? 0 : 12),
            child: _OtpBox(
              controller: _controllers[index],
              focusNode: _nodes[index],
              autofocus: index == 0,
              onChanged: (v) => _onChanged(index, v),
            ),
          ),
        );
      }),
    );
  }
}

class _OtpBox extends StatelessWidget {
  const _OtpBox({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
    this.autofocus = false,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      focusNode: focusNode,
      autofocus: autofocus,
      textAlign: TextAlign.center,
      keyboardType: TextInputType.number,
      obscureText: true,
      obscuringCharacter: '•',
      style: GoogleFonts.nunito(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: CodakisColors.textPrimary,
      ),
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(1),
      ],
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: '0',
        hintStyle: GoogleFonts.nunito(color: CodakisColors.dotInactive, fontSize: 22),
        filled: false,
        contentPadding: const EdgeInsets.symmetric(vertical: 12),
        border: const UnderlineInputBorder(
          borderSide: BorderSide(color: CodakisColors.border, width: 1.5),
        ),
        enabledBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: CodakisColors.border, width: 1.5),
        ),
        focusedBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: CodakisColors.primary, width: 2),
        ),
      ),
    );
  }
}
