import 'package:flutter/material.dart';
import '../../widgets/codakis_logo_loader.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/app_theme.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_defaults.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_courses_hero.dart';
import '../../widgets/codakis_module_card.dart';
import '../../widgets/codakis_primary_button.dart';
import 'pedagogy_service.dart';

class CoursesPage extends StatefulWidget {
  const CoursesPage({
    super.key,
    required this.pedagogyService,
    required this.onThemeTap,
    this.refreshToken = 0,
  });

  final PedagogyService pedagogyService;
  final void Function(CourseTheme theme, int index) onThemeTap;
  final int refreshToken;

  @override
  State<CoursesPage> createState() => _CoursesPageState();
}

class _CoursesPageState extends State<CoursesPage> with AutomaticKeepAliveClientMixin {
  late Future<List<CourseTheme>> _future;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _future = widget.pedagogyService.fetchThemes();
  }

  @override
  void didUpdateWidget(CoursesPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.refreshToken != widget.refreshToken) _reload();
  }

  Future<void> _reload() async {
    setState(() => _future = widget.pedagogyService.fetchThemes());
    await _future;
  }

  String _themeTitle(CourseTheme theme, bool isEnglish) {
    if (isEnglish && theme.titleEn.isNotEmpty) return theme.titleEn;
    return theme.titleFr;
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final s = LocaleScope.stringsOf(context);
    final isEnglish = LocaleScope.serviceOf(context).isEnglish;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(s.navCourses),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textDark,
        elevation: 0.3,
        actions: [
          IconButton(onPressed: _reload, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _reload,
        color: AppColors.primary,
        child: FutureBuilder<List<CourseTheme>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 120),
                  Center(child: CodakisLogoLoader()),
                ],
              );
            }

            if (snapshot.hasError) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                children: [
                  CodakisMainCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s.coursesLoadError, style: GoogleFonts.nunito(fontWeight: FontWeight.w700, fontSize: 16)),
                        const SizedBox(height: 8),
                        Text('${snapshot.error}'),
                        const SizedBox(height: 16),
                        CodakisPrimaryButton(
                          label: s.commonRetry,
                          expand: true,
                          variant: CodakisButtonVariant.site,
                          onPressed: _reload,
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }

            final themes = snapshot.data ?? [];
            if (themes.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                children: [
                  CodakisMainCard(
                    child: Column(
                      children: [
                        Text(s.coursesEmpty),
                        const SizedBox(height: 16),
                        CodakisPrimaryButton(
                          label: s.commonRetry,
                          expand: true,
                          variant: CodakisButtonVariant.site,
                          onPressed: _reload,
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              children: [
                CodakisMainCard(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      CodakisCoursesHero(
                        eyebrow: s.coursesLearningPath,
                        title: s.coursesTitle,
                        lead: s.coursesLead,
                        moduleCount: themes.length,
                        modulesLabel: s.coursesModules,
                      ),
                      const SizedBox(height: 24),
                      CodakisCoursesSectionHeading(
                        eyebrow: s.coursesCurriculum,
                        title: s.coursesAllThemes,
                        hint: s.coursesOpenModuleHint,
                      ),
                      const SizedBox(height: 16),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final cardWidth = constraints.maxWidth >= 620 ? (constraints.maxWidth - 12) / 2 : constraints.maxWidth;
                          return Wrap(
                            spacing: 12,
                            runSpacing: 12,
                            children: themes.asMap().entries.map((entry) {
                              final theme = entry.value;
                              final index = entry.key + 1;
                              return SizedBox(
                                width: cardWidth,
                                child: CodakisModuleCard(
                                  index: index,
                                  themeLabel: s.themeLabel(index),
                                  title: _themeTitle(theme, isEnglish),
                                  lessonCountLabel: theme.locked
                                      ? s.themeLocked(theme.leconCount)
                                      : s.themeLessons(theme.leconCount),
                                  openLabel: s.coursesOpenModule,
                                  premiumLabel: s.coursesPremium,
                                  isPremium: theme.isPremium,
                                  locked: theme.locked,
                                  onTap: () => widget.onThemeTap(theme, index),
                                ),
                              );
                            }).toList(),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
