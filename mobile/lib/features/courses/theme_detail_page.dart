import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/app_theme.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_defaults.dart';
import '../../core/locale_scope.dart';
import '../../l10n/app_strings.dart';
import '../../widgets/codakis_card.dart';
import '../../widgets/codakis_lesson_tile.dart';
import '../../widgets/codakis_module_segment_nav.dart';
import '../../widgets/codakis_outline_button.dart';
import '../../widgets/codakis_primary_button.dart';
import 'pedagogy_service.dart';
import 'lesson_page.dart';

class ThemeDetailPage extends StatefulWidget {
  const ThemeDetailPage({
    super.key,
    required this.theme,
    required this.pedagogyService,
    required this.themeIndex,
  });

  final CourseTheme theme;
  final PedagogyService pedagogyService;
  final int themeIndex;

  @override
  State<ThemeDetailPage> createState() => _ThemeDetailPageState();
}

class _ThemeDetailPageState extends State<ThemeDetailPage> {
  late Future<(List<CourseTheme>, List<CourseLesson>)> _contentFuture;
  late CourseTheme _activeTheme;

  @override
  void initState() {
    super.initState();
    _activeTheme = widget.theme;
    _reload();
  }

  void _reload() {
    _contentFuture = _loadContent();
  }

  Future<(List<CourseTheme>, List<CourseLesson>)> _loadContent() async {
    final results = await Future.wait([
      widget.pedagogyService.fetchThemes(),
      widget.pedagogyService.fetchLessons(_activeTheme.id),
    ]);
    return (results[0] as List<CourseTheme>, results[1] as List<CourseLesson>);
  }

  String _title(AppStrings s, CourseTheme theme, bool isEnglish) {
    if (isEnglish && theme.titleEn.isNotEmpty) return theme.titleEn;
    return theme.titleFr;
  }

  void _openTheme(CourseTheme theme, int index) {
    if (theme.id == _activeTheme.id) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => ThemeDetailPage(
          theme: theme,
          pedagogyService: widget.pedagogyService,
          themeIndex: index,
        ),
      ),
    );
  }

  void _openFirstLesson(List<CourseLesson> lessons) {
    CourseLesson? first;
    for (final lesson in lessons) {
      if (!lesson.locked) {
        first = lesson;
        break;
      }
    }
    first ??= lessons.isNotEmpty ? lessons.first : null;
    if (first == null) return;
    final lesson = first;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => LessonPage(
          lessonId: lesson.id,
          pedagogyService: widget.pedagogyService,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);
    final isEnglish = LocaleScope.serviceOf(context).isEnglish;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(_title(s, _activeTheme, isEnglish)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textDark,
        elevation: 0.3,
      ),
      body: _activeTheme.locked
          ? _LockedView(theme: _activeTheme, strings: s, isEnglish: isEnglish, themeIndex: widget.themeIndex)
          : RefreshIndicator(
              onRefresh: () async {
                setState(_reload);
                await _contentFuture;
              },
              color: AppColors.primary,
              child: FutureBuilder<(List<CourseTheme>, List<CourseLesson>)>(
                future: _contentFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (snapshot.hasError) {
                    return ListView(
                      padding: const EdgeInsets.all(AppDefaults.padding),
                      children: [
                        CodakisCard(
                          child: Column(
                            children: [
                              Text('${snapshot.error}'),
                              const SizedBox(height: 12),
                              CodakisPrimaryButton(
                                label: s.commonRetry,
                                expand: true,
                                variant: CodakisButtonVariant.site,
                                onPressed: () => setState(_reload),
                              ),
                            ],
                          ),
                        ),
                      ],
                    );
                  }

                  final themes = snapshot.data!.$1;
                  final lessons = snapshot.data!.$2;
                  final segments = themes.asMap().entries.map((entry) {
                    final index = entry.key + 1;
                    final theme = entry.value;
                    return CodakisModuleSegment(
                      id: theme.id,
                      label: '${index.toString().padLeft(2, '0')}. ${_title(s, theme, isEnglish)}',
                      meta: theme.locked ? s.coursesPremium : null,
                    );
                  }).toList();

                  return ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      CodakisModuleSegmentNav(
                        segments: segments,
                        activeId: _activeTheme.id,
                        onSelect: (id) {
                          final index = themes.indexWhere((theme) => theme.id == id);
                          if (index >= 0) _openTheme(themes[index], index + 1);
                        },
                      ),
                      const SizedBox(height: 16),
                      CodakisCard(
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              s.themeLabel(widget.themeIndex).toUpperCase(),
                              style: GoogleFonts.nunito(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.8,
                                color: AppColors.primaryDark,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _title(s, _activeTheme, isEnglish),
                              style: GoogleFonts.nunito(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textDark),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              s.moduleLead,
                              style: GoogleFonts.nunito(fontSize: 14, color: AppColors.placeholder, height: 1.5),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                if (_activeTheme.isPremium)
                                  Container(
                                    margin: const EdgeInsets.only(right: 10),
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.premiumBg,
                                      borderRadius: BorderRadius.circular(CodakisRadii.field),
                                    ),
                                    child: Text(
                                      s.coursesPremium,
                                      style: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.premiumText),
                                    ),
                                  ),
                                Text(
                                  s.themeLessons(lessons.length),
                                  style: GoogleFonts.nunito(fontSize: 13, color: AppColors.placeholder),
                                ),
                                const Spacer(),
                                if (lessons.isNotEmpty)
                                  CodakisPrimaryButton(
                                    label: s.coursesStartModule,
                                    variant: CodakisButtonVariant.site,
                                    size: CodakisButtonSize.sm,
                                    onPressed: () => _openFirstLesson(lessons),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      CodakisCard(
                        padding: EdgeInsets.zero,
                        child: Column(
                          children: lessons.asMap().entries.map((entry) {
                            final lesson = entry.value;
                            final index = entry.key + 1;
                            final isLast = index == lessons.length;
                            return CodakisLessonTile(
                              step: index,
                              title: lesson.title,
                              subtitle: lesson.excerpt.isNotEmpty ? lesson.excerpt : s.lessonTapToOpen,
                              actionLabel: s.lessonRead,
                              locked: lesson.locked,
                              showDivider: !isLast,
                              onTap: () => Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => LessonPage(
                                    lessonId: lesson.id,
                                    pedagogyService: widget.pedagogyService,
                                  ),
                                ),
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
    );
  }
}

class _LockedView extends StatelessWidget {
  const _LockedView({
    required this.theme,
    required this.strings,
    required this.isEnglish,
    required this.themeIndex,
  });

  final CourseTheme theme;
  final AppStrings strings;
  final bool isEnglish;
  final int themeIndex;

  @override
  Widget build(BuildContext context) {
    final title = isEnglish && theme.titleEn.isNotEmpty ? theme.titleEn : theme.titleFr;
    return Padding(
      padding: const EdgeInsets.all(AppDefaults.padding),
      child: CodakisCard(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.lock_outline, size: 64, color: AppColors.placeholder),
            const SizedBox(height: 16),
            Text(
              strings.themeLabel(themeIndex).toUpperCase(),
              style: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.w800, color: CodakisColors.primary),
            ),
            const SizedBox(height: 8),
            Text(title, style: Theme.of(context).textTheme.titleLarge, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(strings.themePremiumLocked, textAlign: TextAlign.center),
            const SizedBox(height: 24),
            CodakisOutlineButton(
              label: strings.commonBack,
              expand: true,
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      ),
    );
  }
}
