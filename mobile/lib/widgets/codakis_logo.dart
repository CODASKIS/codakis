import 'package:flutter/material.dart';

import '../core/app_assets.dart';

enum CodakisLogoVariant { wordmark, icon }

class CodakisLogo extends StatelessWidget {
  const CodakisLogo({
    super.key,
    this.variant = CodakisLogoVariant.wordmark,
    this.height = 48,
  });

  final CodakisLogoVariant variant;
  final double height;

  @override
  Widget build(BuildContext context) {
    final asset = variant == CodakisLogoVariant.wordmark
        ? AppAssets.logoWordmark
        : AppAssets.logoIcon;

    return Image.asset(
      asset,
      height: height,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
    );
  }
}
