import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Mini logo tournant pour les boutons (remplace CircularProgressIndicator).
class CodakisButtonLoader extends StatefulWidget {
  const CodakisButtonLoader({super.key, this.size = 20});

  final double size;

  @override
  State<CodakisButtonLoader> createState() => _CodakisButtonLoaderState();
}

class _CodakisButtonLoaderState extends State<CodakisButtonLoader> with SingleTickerProviderStateMixin {
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
    return RotationTransition(
      turns: _controller,
      child: SvgPicture.asset(
        'assets/logo/codakis_logo.svg',
        width: widget.size,
        height: widget.size,
      ),
    );
  }
}
