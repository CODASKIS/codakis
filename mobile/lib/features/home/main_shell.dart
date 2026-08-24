import 'package:flutter/material.dart';

import '../../config/api_config.dart';
import '../../core/app_theme.dart';
import '../../widgets/codakis_shell.dart';
import '../auth/auth_service.dart';
import '../auth/login_page.dart';
import '../courses/courses_page.dart';
import '../courses/pedagogy_service.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key, required this.authService});

  final AuthService authService;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  CodakisTab _tab = CodakisTab.home;
  late final PedagogyService _pedagogyService;

  @override
  void initState() {
    super.initState();
    _pedagogyService = PedagogyService(widget.authService.api);
  }

  Future<void> _logout() async {
    await widget.authService.logout();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => LoginPage(authService: widget.authService)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: CodakisAppBar(
        actions: [
          if (_tab == CodakisTab.profile)
            IconButton(
              tooltip: 'Déconnexion',
              onPressed: _logout,
              icon: const Icon(Icons.logout),
            ),
        ],
      ),
      body: IndexedStack(
        index: _tab.index,
        children: [
          _HomeTab(
            apiUrl: ApiConfig.baseUrl,
            onOpenCourses: () => setState(() => _tab = CodakisTab.courses),
            onOpenQuizzes: () => setState(() => _tab = CodakisTab.quizzes),
          ),
          CoursesPage(pedagogyService: _pedagogyService),
          const _PlaceholderTab(
            title: 'Quiz & examens',
            subtitle: 'Entraînement chronométré — bientôt dans l’app mobile.',
            icon: Icons.quiz_outlined,
          ),
          const _PlaceholderTab(
            title: 'Mon auto-école',
            subtitle: 'Forfait, séances et dossier Consort.',
            icon: Icons.directions_car_outlined,
          ),
          _ProfileTab(onLogout: _logout),
        ],
      ),
      bottomNavigationBar: CodakisBottomNav(
        current: _tab,
        onChanged: (next) => setState(() => _tab = next),
      ),
    );
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab({
    required this.apiUrl,
    required this.onOpenCourses,
    required this.onOpenQuizzes,
  });

  final String apiUrl;
  final VoidCallback onOpenCourses;
  final VoidCallback onOpenQuizzes;

  @override
  Widget build(BuildContext context) {
    return ListView(
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
          subtitle: '10 modules CEMAC connectés au backend',
          onTap: onOpenCourses,
        ),
        CodakisFeatureCard(
          icon: Icons.quiz_outlined,
          title: 'Quiz & examens blancs',
          subtitle: 'Entraînement chronométré',
          onTap: onOpenQuizzes,
        ),
        Text(
          'API : $apiUrl',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 13),
        ),
      ],
    );
  }
}

class _ProfileTab extends StatelessWidget {
  const _ProfileTab({required this.onLogout});

  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Mon profil', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        Text('Compte candidat CODAKIS', style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(onPressed: onLogout, child: const Text('Se déconnecter')),
        ),
      ],
    );
  }
}

class _PlaceholderTab extends StatelessWidget {
  const _PlaceholderTab({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: CodakisColors.primary),
            const SizedBox(height: 16),
            Text(title, style: Theme.of(context).textTheme.titleLarge, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(subtitle, style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
