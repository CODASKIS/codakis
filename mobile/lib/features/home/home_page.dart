import 'package:flutter/material.dart';

import '../../config/api_config.dart';
import '../../core/app_theme.dart';
import '../../widgets/codakis_shell.dart';
import '../auth/auth_service.dart';
import '../auth/login_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key, required this.authService});

  final AuthService authService;

  Future<void> _logout(BuildContext context) async {
    await authService.logout();
    if (!context.mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => LoginPage(authService: authService)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: CodakisAppBar(
        actions: [
          IconButton(
            tooltip: 'Déconnexion',
            onPressed: () => _logout(context),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: CodakisColors.surfaceAlt,
              borderRadius: BorderRadius.circular(CodakisRadii.card),
              border: Border.all(color: CodakisColors.primary.withValues(alpha: 0.15)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Mon parcours permis', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                Text(
                  'Révision CEMAC, quiz chronométrés et suivi auto-école sur CODAKIS.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text('Accès rapide', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          CodakisFeatureCard(
            icon: Icons.menu_book_outlined,
            title: 'Cours & thèmes',
            subtitle: 'Révision code de la route CEMAC',
            onTap: () {},
          ),
          CodakisFeatureCard(
            icon: Icons.quiz_outlined,
            title: 'Quiz & examens blancs',
            subtitle: 'Entraînement chronométré',
            onTap: () {},
          ),
          CodakisFeatureCard(
            icon: Icons.directions_car_outlined,
            title: 'Mon auto-école',
            subtitle: 'Forfait, séances et dossier Consort',
            onTap: () {},
          ),
          const SizedBox(height: 8),
          Text(
            'API : ${ApiConfig.baseUrl}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 13),
          ),
        ],
      ),
    );
  }
}
