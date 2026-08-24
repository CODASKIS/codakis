import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../widgets/codakis_feature_card.dart';
import 'pedagogy_service.dart';

class CoursesPage extends StatefulWidget {
  const CoursesPage({super.key, required this.pedagogyService});

  final PedagogyService pedagogyService;

  @override
  State<CoursesPage> createState() => _CoursesPageState();
}

class _CoursesPageState extends State<CoursesPage> {
  late Future<List<CourseTheme>> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.pedagogyService.fetchThemes();
  }

  Future<void> _reload() async {
    setState(() {
      _future = widget.pedagogyService.fetchThemes();
    });
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _reload,
      color: CodakisColors.primary,
      child: FutureBuilder<List<CourseTheme>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(24),
              children: [
                Text('Impossible de charger les cours.', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                Text(snapshot.error.toString(), style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 16),
                FilledButton(onPressed: _reload, child: const Text('Réessayer')),
              ],
            );
          }

          final themes = snapshot.data ?? [];
          if (themes.isEmpty) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(24),
              children: [
                Text('Aucun module disponible.', style: Theme.of(context).textTheme.bodyMedium),
              ],
            );
          }

          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(20),
            children: [
              Text('Mes modules CEMAC', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text(
                '${themes.length} thèmes — révision code de la route',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              ...themes.asMap().entries.map((entry) {
                final theme = entry.value;
                final index = entry.key + 1;
                return CodakisFeatureCard(
                  icon: theme.locked ? Icons.lock_outline : Icons.menu_book_outlined,
                  title: '${index.toString().padLeft(2, '0')}. ${theme.titleFr}',
                  subtitle: theme.locked
                      ? 'Premium — ${theme.leconCount} leçons'
                      : '${theme.leconCount} leçons',
                  onTap: () {},
                );
              }),
            ],
          );
        },
      ),
    );
  }
}
