import 'package:flutter/material.dart';
import '../../widgets/codakis_logo_loader.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../core/components/title_and_action_button.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_defaults.dart';
import '../../core/constants/app_icons.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_card.dart';
import '../../widgets/codakis_courses_hero.dart';
import '../../widgets/codakis_logo.dart';
import '../../widgets/codakis_module_card.dart';
import '../courses/pedagogy_service.dart';

class HomePage extends StatefulWidget {
  const HomePage({
    super.key,
    required this.pedagogyService,
    required this.onOpenDrawer,
    required this.onOpenCourses,
    required this.onOpenQuizzes,
    required this.onThemeTap,
    this.progress,
  });

  final PedagogyService pedagogyService;
  final VoidCallback onOpenDrawer;
  final VoidCallback onOpenCourses;
  final VoidCallback onOpenQuizzes;
  final void Function(CourseTheme theme, int index) onThemeTap;
  final CandidatProgress? progress;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late Future<List<CourseTheme>> _themesFuture;

  @override
  void initState() {
    super.initState();
    _themesFuture = widget.pedagogyService.fetchThemes();
  }

  Future<void> _reload() async {
    setState(() => _themesFuture = widget.pedagogyService.fetchThemes());
    await _themesFuture;
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);
    final locale = LocaleScope.serviceOf(context);
    final progress = widget.progress;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _reload,
          color: AppColors.primary,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverAppBar(
                floating: true,
                backgroundColor: AppColors.scaffoldBackground,
                leading: Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: ElevatedButton(
                    onPressed: widget.onOpenDrawer,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.iconButtonBg,
                      shape: const CircleBorder(),
                      elevation: 0,
                    ),
                    child: SvgPicture.asset(AppIcons.sidebar),
                  ),
                ),
                title: const CodakisLogo(height: 32),
                actions: [
                  Padding(
                    padding: const EdgeInsets.only(right: 8, top: 4, bottom: 4),
                    child: ElevatedButton(
                      onPressed: widget.onOpenCourses,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.iconButtonBg,
                        shape: const CircleBorder(),
                        elevation: 0,
                      ),
                      child: SvgPicture.asset(AppIcons.search),
                    ),
                  ),
                ],
              ),
              SliverToBoxAdapter(
                child: _ProgressBanner(progress: progress, strings: s),
              ),
              SliverToBoxAdapter(
                child: FutureBuilder<List<CourseTheme>>(
                  future: _themesFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Padding(
                        padding: EdgeInsets.all(32),
                        child: Center(child: CodakisLogoLoader()),
                      );
                    }
                    final themes = snapshot.data ?? [];
                    if (themes.isEmpty) {
                      return Padding(
                        padding: const EdgeInsets.all(AppDefaults.padding),
                        child: Text(s.coursesEmpty),
                      );
                    }

                    return Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: AppDefaults.padding),
                          child: CodakisCoursesHero(
                            eyebrow: s.coursesLearningPath,
                            title: s.coursesTitle,
                            lead: s.coursesLead,
                            moduleCount: themes.length,
                            modulesLabel: s.coursesModules,
                          ),
                        ),
                        const SizedBox(height: 20),
                        TitleAndActionButton(
                          title: s.homePopularThemes,
                          actionLabel: s.homeViewAll,
                          onTap: widget.onOpenCourses,
                        ),
                        SingleChildScrollView(
                          padding: const EdgeInsets.only(left: AppDefaults.padding),
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: themes.take(6).toList().asMap().entries.map((entry) {
                              final theme = entry.value;
                              final idx = entry.key + 1;
                              final title = locale.isEnglish && theme.titleEn.isNotEmpty
                                  ? theme.titleEn
                                  : theme.titleFr;
                              return Padding(
                                padding: const EdgeInsets.only(right: AppDefaults.padding),
                                child: CodakisModuleCard(
                                  index: idx,
                                  width: 300,
                                  themeLabel: s.themeLabel(idx),
                                  title: title,
                                  lessonCountLabel: theme.locked
                                      ? s.themeLocked(theme.leconCount)
                                      : s.themeLessons(theme.leconCount),
                                  openLabel: s.coursesOpenModule,
                                  premiumLabel: s.coursesPremium,
                                  isPremium: theme.isPremium,
                                  locked: theme.locked,
                                  onTap: () => widget.onThemeTap(theme, idx),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.symmetric(vertical: AppDefaults.padding),
                sliver: SliverToBoxAdapter(
                  child: Column(
                    children: [
                      TitleAndActionButton(
                        title: s.homeQuickAccess,
                        actionLabel: s.homeOpenQuizzes,
                        onTap: widget.onOpenQuizzes,
                        isHeadline: true,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: AppDefaults.padding),
                        child: Column(
                          children: [
                            _QuickTile(
                              icon: Icons.menu_book_outlined,
                              title: s.homeCoursesTitle,
                              subtitle: s.homeCoursesSubtitle,
                              onTap: widget.onOpenCourses,
                            ),
                            const SizedBox(height: 12),
                            _QuickTile(
                              icon: Icons.quiz_outlined,
                              title: s.homeQuizzesTitle,
                              subtitle: s.homeQuizzesSubtitle,
                              onTap: widget.onOpenQuizzes,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProgressBanner extends StatelessWidget {
  const _ProgressBanner({required this.progress, required this.strings});

  final CandidatProgress? progress;
  final dynamic strings;

  @override
  Widget build(BuildContext context) {
    final percent = progress?.percent ?? 0;
    final completed = progress?.completedCount ?? 0;
    final total = progress?.totalLecons ?? 0;

    return Padding(
      padding: const EdgeInsets.all(AppDefaults.padding),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, AppColors.primaryDark],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: AppDefaults.borderRadius,
          boxShadow: AppDefaults.boxShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              strings.homeJourneyTitle,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              strings.homeJourneyLead,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white70),
            ),
            if (progress != null) ...[
              const SizedBox(height: 16),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: total > 0 ? percent / 100 : 0,
                  minHeight: 8,
                  backgroundColor: Colors.white24,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                strings.homeProgress(completed, total, percent),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _QuickTile extends StatelessWidget {
  const _QuickTile({
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
    return CodakisCard(
      padding: const EdgeInsets.all(AppDefaults.padding),
      onTap: onTap,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.coloredBackground,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppColors.primary),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Colors.black),
                ),
                Text(subtitle),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.placeholder),
        ],
      ),
    );
  }
}
