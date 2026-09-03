import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';
import '../core/locale_scope.dart';
import '../l10n/app_strings.dart';
import 'codakis_primary_button.dart';

class CodakisLanguageOption {
  const CodakisLanguageOption({required this.code, required this.label});

  final String code;
  final String label;
}

/// Sélecteur langue type roue (Get Started / paramètres).
class CodakisLanguagePickerSheet extends StatefulWidget {
  const CodakisLanguagePickerSheet({
    super.key,
    required this.options,
    required this.initialCode,
    required this.onSaved,
  });

  final List<CodakisLanguageOption> options;
  final String initialCode;
  final ValueChanged<String> onSaved;

  static Future<void> show(
    BuildContext context, {
    required List<CodakisLanguageOption> options,
    required String initialCode,
    required ValueChanged<String> onSaved,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => CodakisLanguagePickerSheet(
        options: options,
        initialCode: initialCode,
        onSaved: onSaved,
      ),
    );
  }

  @override
  State<CodakisLanguagePickerSheet> createState() => _CodakisLanguagePickerSheetState();
}

class _CodakisLanguagePickerSheetState extends State<CodakisLanguagePickerSheet> {
  late FixedExtentScrollController _controller;
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.options.indexWhere((o) => o.code == widget.initialCode);
    if (_selectedIndex < 0) _selectedIndex = 0;
    _controller = FixedExtentScrollController(initialItem: _selectedIndex);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _save() {
    final code = widget.options[_selectedIndex].code;
    widget.onSaved(code);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE5E7EB),
                borderRadius: BorderRadius.circular(99),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                s.languagePickerTitle,
                textAlign: TextAlign.center,
                style: GoogleFonts.nunito(fontSize: 18, fontWeight: FontWeight.w700),
              ),
            ),
            SizedBox(
              height: 220,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Positioned(
                    left: 24,
                    right: 24,
                    child: Container(
                      height: 44,
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(color: CodakisColors.primary.withValues(alpha: 0.55), width: 2),
                          bottom: BorderSide(color: CodakisColors.primary.withValues(alpha: 0.55), width: 2),
                        ),
                      ),
                    ),
                  ),
                  CupertinoPicker(
                    scrollController: _controller,
                    itemExtent: 44,
                    diameterRatio: 1.4,
                    magnification: 1.08,
                    squeeze: 1.05,
                    onSelectedItemChanged: (index) => setState(() => _selectedIndex = index),
                    children: widget.options
                        .map(
                          (option) => Center(
                            child: Text(
                              option.label,
                              style: GoogleFonts.nunito(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: CodakisColors.textPrimary,
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
              child: CodakisPrimaryButton(
                label: s.languagePickerSave,
                expand: true,
                variant: CodakisButtonVariant.site,
                size: CodakisButtonSize.lg,
                onPressed: _save,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

List<CodakisLanguageOption> codakisLanguageOptions(AppStrings strings) => [
      CodakisLanguageOption(code: 'fr', label: strings.authLanguageFr),
      CodakisLanguageOption(code: 'en', label: strings.authLanguageEn),
    ];
