import 'package:flutter/material.dart';

import '../../config/api_config.dart';
import '../../core/app_theme.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_defaults.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_card.dart';
import '../../widgets/codakis_form_feedback.dart';
import '../../widgets/codakis_html_content.dart';
import '../../widgets/codakis_primary_button.dart';
import '../courses/pedagogy_service.dart';

class LessonPage extends StatefulWidget {
  const LessonPage({
    super.key,
    required this.lessonId,
    required this.pedagogyService,
  });

  final String lessonId;
  final PedagogyService pedagogyService;

  @override
  State<LessonPage> createState() => _LessonPageState();
}

class _LessonPageState extends State<LessonPage> {
  late Future<CourseLesson> _future;
  bool _completing = false;
  String? _message;

  @override
  void initState() {
    super.initState();
    _future = widget.pedagogyService.fetchLesson(widget.lessonId);
  }

  Future<void> _complete() async {
    final s = LocaleScope.stringsOf(context);
    setState(() {
      _completing = true;
      _message = null;
    });
    try {
      await widget.pedagogyService.completeLesson(widget.lessonId);
      if (!mounted) return;
      setState(() => _message = s.lessonCompleted);
    } catch (err) {
      setState(() => _message = '$err');
    } finally {
      if (mounted) setState(() => _completing = false);
    }
  }

  String _resolveImage(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return '${ApiConfig.baseUrl}$url';
    return '${ApiConfig.baseUrl}/$url';
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(s.lessonTitle),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textDark,
        elevation: 0.3,
      ),
      body: FutureBuilder<CourseLesson>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: CodakisFormFeedback.error(message: '${snapshot.error}'));
          }
          final lesson = snapshot.data!;
          final cover = _resolveImage(lesson.coverImageUrl);

          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    if (cover.isNotEmpty)
                      Stack(
                        children: [
                          Image.network(
                            cover,
                            height: 220,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              height: 220,
                              color: CodakisColors.surfaceAlt,
                              child: const Icon(Icons.image_not_supported_outlined, size: 48),
                            ),
                          ),
                          Container(
                            height: 220,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [Colors.transparent, Colors.black.withValues(alpha: 0.65)],
                              ),
                            ),
                          ),
                          Positioned(
                            left: AppDefaults.padding,
                            right: AppDefaults.padding,
                            bottom: 16,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  lesson.title,
                                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w800,
                                      ),
                                ),
                                if (lesson.excerpt.isNotEmpty)
                                  Text(
                                    lesson.excerpt,
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white70),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      )
                    else
                      Padding(
                        padding: const EdgeInsets.all(AppDefaults.padding),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(lesson.title, style: Theme.of(context).textTheme.headlineSmall),
                            if (lesson.excerpt.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Text(lesson.excerpt, style: Theme.of(context).textTheme.bodyMedium),
                            ],
                          ],
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: CodakisCard(
                        child: lesson.body.isNotEmpty
                            ? CodakisHtmlContent(html: lesson.body)
                            : Text(
                                s.lessonEmptyBody,
                                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                      color: AppColors.textDark,
                                      height: 1.6,
                                    ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
              if (_message != null)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppDefaults.padding),
                  child: _message == s.lessonCompleted
                      ? CodakisFormFeedback.success(message: _message!)
                      : CodakisFormFeedback.error(message: _message!),
                ),
              SafeArea(
                minimum: const EdgeInsets.all(AppDefaults.padding),
                child: CodakisPrimaryButton(
                  label: _completing ? s.lessonCompleting : s.lessonMarkComplete,
                  expand: true,
                  loading: _completing,
                  variant: CodakisButtonVariant.site,
                  size: CodakisButtonSize.lg,
                  onPressed: _completing ? null : _complete,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
