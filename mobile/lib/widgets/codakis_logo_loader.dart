import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Loader CODAKIS — logo qui tourne (sans CircularProgressIndicator).
class CodakisLogoLoader extends StatefulWidget {
  const CodakisLogoLoader({super.key, this.size = 48, this.message});

  final double size;
  final String? message;

  @override
  State<CodakisLogoLoader> createState() => _CodakisLogoLoaderState();
}

class _CodakisLogoLoaderState extends State<CodakisLogoLoader> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1100))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        RotationTransition(
          turns: _controller,
          child: SvgPicture.asset(
            'assets/logo/codakis_logo.svg',
            width: widget.size,
            height: widget.size,
          ),
        ),
        if (widget.message != null) ...[
          const SizedBox(height: 16),
          Text(
            widget.message!,
            style: const TextStyle(color: Color(0xFF158A4E), fontWeight: FontWeight.w500),
          ),
        ],
      ],
    );
  }
}
