import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_defaults.dart';
import '../core/constants/app_icons.dart';
import '../core/locale_scope.dart';
import 'codakis_language_picker.dart';
import 'codakis_logo.dart';
import 'codakis_text_field.dart';

typedef CodakisDrawerNav = void Function(int tabIndex);

class CodakisAppDrawer extends StatefulWidget {
  const CodakisAppDrawer({
    super.key,
    required this.currentIndex,
    required this.onNavigate,
    required this.onOpenConsort,
    required this.onLogout,
  });

  final int currentIndex;
  final CodakisDrawerNav onNavigate;
  final VoidCallback onOpenConsort;
  final VoidCallback onLogout;

  @override
  State<CodakisAppDrawer> createState() => _CodakisAppDrawerState();
}

class _CodakisAppDrawerState extends State<CodakisAppDrawer> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _go(int index) {
    Navigator.of(context).pop();
    widget.onNavigate(index);
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);
    final localeService = LocaleScope.serviceOf(context);

    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.all(AppDefaults.padding),
              child: Row(
                children: [
                  const CodakisLogo(height: 36),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppDefaults.padding),
              child: CodakisTextField(
                hintText: s.drawerSearchHint,
                controller: _searchController,
                textInputAction: TextInputAction.search,
                onSubmitted: (_) {
                  Navigator.of(context).pop();
                  widget.onNavigate(1);
                },
                prefixIcon: Padding(
                  padding: const EdgeInsets.only(left: 12, right: 4),
                  child: SvgPicture.asset(AppIcons.search, width: 18, height: 18),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                children: [
                  _DrawerTile(
                    icon: Icons.home_outlined,
                    label: s.navHome,
                    selected: widget.currentIndex == 0,
                    onTap: () => _go(0),
                  ),
                  _DrawerTile(
                    icon: Icons.menu_book_outlined,
                    label: s.navCourses,
                    selected: widget.currentIndex == 1,
                    onTap: () => _go(1),
                  ),
                  _DrawerTile(
                    icon: Icons.quiz_outlined,
                    label: s.navQuizzes,
                    selected: widget.currentIndex == 2,
                    onTap: () => _go(2),
                  ),
                  _DrawerTile(
                    icon: Icons.directions_car_outlined,
                    label: s.navSchool,
                    selected: widget.currentIndex == 3,
                    onTap: () => _go(3),
                  ),
                  _DrawerTile(
                    icon: Icons.folder_open_outlined,
                    label: s.consortNavLabel,
                    onTap: () {
                      Navigator.of(context).pop();
                      widget.onOpenConsort();
                    },
                  ),
                  _DrawerTile(
                    icon: Icons.person_outline,
                    label: s.navProfile,
                    selected: widget.currentIndex == 4,
                    onTap: () => _go(4),
                  ),
                  const Divider(height: 24),
                  _DrawerTile(
                    icon: Icons.language,
                    label: s.fieldLanguage,
                    trailing: Text(
                      localeService.isEnglish ? s.langEn : s.langFr,
                      style: GoogleFonts.nunito(fontWeight: FontWeight.w700, color: CodakisColors.primary),
                    ),
                    onTap: () {
                      CodakisLanguagePickerSheet.show(
                        context,
                        options: codakisLanguageOptions(s),
                        initialCode: localeService.locale,
                        onSaved: localeService.setLocale,
                      );
                    },
                  ),
                  _DrawerTile(
                    icon: Icons.logout,
                    label: s.profileLogout,
                    onTap: () {
                      Navigator.of(context).pop();
                      widget.onLogout();
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DrawerTile extends StatelessWidget {
  const _DrawerTile({
    required this.icon,
    required this.label,
    this.onTap,
    this.selected = false,
    this.trailing,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool selected;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? CodakisColors.surfaceAlt : Colors.transparent,
      borderRadius: AppDefaults.borderRadius,
      child: ListTile(
        leading: Icon(icon, color: selected ? CodakisColors.primary : AppColors.textDark),
        title: Text(
          label,
          style: GoogleFonts.nunito(
            fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
            color: selected ? CodakisColors.primary : CodakisColors.textPrimary,
          ),
        ),
        trailing: trailing ?? (selected ? const Icon(Icons.check, color: CodakisColors.primary, size: 18) : null),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: AppDefaults.borderRadius),
      ),
    );
  }
}
