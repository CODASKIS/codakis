import 'package:flutter/material.dart';

import '../../config/api_config.dart';
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
      appBar: AppBar(
        title: const Text('CODAKIS'),
        actions: [
          IconButton(
            tooltip: 'Déconnexion',
            onPressed: () => _logout(context),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text(
            'Espace candidat',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Backend : ${ApiConfig.baseUrl}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 24),
          _NavCard(
            icon: Icons.menu_book_outlined,
            title: 'Cours & thèmes',
            subtitle: 'Révision code de la route CEMAC',
            onTap: () {},
          ),
          _NavCard(
            icon: Icons.quiz_outlined,
            title: 'Quiz & examens blancs',
            subtitle: 'Entraînement chronométré',
            onTap: () {},
          ),
          _NavCard(
            icon: Icons.directions_car_outlined,
            title: 'Mon auto-école',
            subtitle: 'Forfait, séances et dossier Consort',
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _NavCard extends StatelessWidget {
  const _NavCard({
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
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF0B6E4F)),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
