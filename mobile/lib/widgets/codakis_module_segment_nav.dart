import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';

class CodakisModuleSegment {
  const CodakisModuleSegment({
    required this.id,
    required this.label,
    this.meta,
  });

  final String id;
  final String label;
  final String? meta;
}

/// Navigation segmentée alignée sur `ModuleSegmentNav` / `.codakis-module-nav`.
class CodakisModuleSegmentNav extends StatelessWidget {
  const CodakisModuleSegmentNav({
    super.key,
    required this.segments,
    required this.activeId,
    required this.onSelect,
  });

  final List<CodakisModuleSegment> segments;
  final String activeId;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    if (segments.length <= 1) return const SizedBox.shrink();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: segments.map((segment) {
          final active = segment.id == activeId;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => onSelect(segment.id),
                borderRadius: BorderRadius.circular(CodakisRadii.field),
                child: Ink(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: active ? CodakisColors.primary.withValues(alpha: 0.08) : Colors.white,
                    borderRadius: BorderRadius.circular(CodakisRadii.field),
                    border: Border.all(
                      color: active ? CodakisColors.primary : const Color(0xFFE5E7EB),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        segment.label,
                        style: GoogleFonts.nunito(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: active ? CodakisColors.primary : CodakisColors.textPrimary,
                        ),
                      ),
                      if (segment.meta != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          segment.meta!,
                          style: GoogleFonts.nunito(
                            fontSize: 11,
                            color: CodakisColors.textMuted,
                          ),
                        ),
                      ],
                      if (active) ...[
                        const SizedBox(height: 6),
                        Container(
                          height: 3,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: CodakisColors.primary,
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
