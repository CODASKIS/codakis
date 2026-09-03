import 'package:flutter/material.dart';

class AppDefaults {
  static const double radius = 15;
  static const double margin = 15;
  static const double padding = 15;

  static BorderRadius borderRadius = BorderRadius.circular(radius);

  static BorderRadius bottomSheetRadius = const BorderRadius.only(
    topLeft: Radius.circular(radius),
    topRight: Radius.circular(radius),
  );

  static List<BoxShadow> boxShadow = [
    BoxShadow(
      blurRadius: 10,
      spreadRadius: 0,
      offset: const Offset(0, 2),
      color: Colors.black.withValues(alpha: 0.04),
    ),
  ];

  static Duration duration = const Duration(milliseconds: 300);
}
