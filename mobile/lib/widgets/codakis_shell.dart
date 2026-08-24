import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import 'codakis_logo.dart';

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

class CodakisFeatureCard extends StatelessWidget {
  const CodakisFeatureCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(CodakisRadii.card),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: CodakisColors.surfaceAlt,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: CodakisColors.primary),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 4),
                    Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: CodakisColors.textMuted.withValues(alpha: 0.7)),
            ],
          ),
        ),
      ),
    );
  }
}
