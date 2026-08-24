import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import 'codakis_logo.dart';

export 'codakis_feature_card.dart';
export 'codakis_logo.dart';
export 'codakis_auth_shell.dart';
export 'codakis_auth_form.dart';
export 'codakis_otp_form.dart';
export 'codakis_locale_switcher.dart';
export 'codakis_outline_button.dart';
export 'codakis_primary_button.dart';
export 'codakis_text_field.dart';
export 'codakis_bottom_nav.dart';

class CodakisAppBar extends StatelessWidget implements PreferredSizeWidget {
  const CodakisAppBar({
    super.key,
    this.actions,
    this.showLogo = true,
  });

  final List<Widget>? actions;
  final bool showLogo;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: CodakisColors.navBg,
      automaticallyImplyLeading: false,
      title: showLogo ? const CodakisLogo(height: 40) : null,
      actions: actions,
    );
  }
}
