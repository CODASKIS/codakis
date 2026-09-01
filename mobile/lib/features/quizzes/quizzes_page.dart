import 'package:flutter/material.dart';
import '../../widgets/codakis_logo_loader.dart';

import '../../core/app_theme.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_defaults.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_primary_button.dart';
import '../courses/pedagogy_service.dart';
import 'assessment_take_page.dart';

class QuizzesPage extends StatefulWidget {
  const QuizzesPage({super.key, required this.pedagogyService});

  final PedagogyService pedagogyService;

  @override
  State<QuizzesPage> createState() => _QuizzesPageState();
}

class _QuizzesPageState extends State<QuizzesPage> with SingleTickerProviderStateMixin {
  late TabController _tabs;
  late Future<List<QuizSummary>> _quizzesFuture;
  late Future<List<ExamSummary>> _examensFuture;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _reload();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  void _reload() {
    _quizzesFuture = widget.pedagogyService.fetchQuizzes();
    _examensFuture = widget.pedagogyService.fetchExamens();
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(s.tabQuizzesTitle),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textDark,
        elevation: 0.3,
        bottom: TabBar(
          controller: _tabs,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.placeholder,
          indicatorColor: AppColors.primary,
          tabs: [
            Tab(text: s.quizTabSeries),
            Tab(text: s.quizTabExams),
          ],
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Text(
              s.tabQuizzesLead,
              style: TextStyle(color: AppColors.placeholder, height: 1.45),
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabs,
              children: [
                _QuizList(
                  future: _quizzesFuture,
                  onReload: () => setState(_reload),
                  itemBuilder: (quiz) => _AssessmentTile(
                    title: quiz.title,
                    subtitle: s.quizTileSubtitle(quiz.questionCount, quiz.dureeMinutes),
                    actionLabel: s.quizStart,
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AssessmentTakePage.quiz(
                          quizId: quiz.id,
                          pedagogyService: widget.pedagogyService,
                        ),
                      ),
                    ),
                  ),
                ),
                _QuizList(
                  future: _examensFuture,
                  onReload: () => setState(_reload),
                  itemBuilder: (exam) => _AssessmentTile(
                    title: exam.title,
                    subtitle: s.examTileSubtitle(exam.nbQuestions, exam.dureeMinutes, exam.maxErreurs),
                    actionLabel: s.quizStart,
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AssessmentTakePage.exam(
                          examenId: exam.id,
                          pedagogyService: widget.pedagogyService,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuizList<T> extends StatelessWidget {
  const _QuizList({
    required this.future,
    required this.onReload,
    required this.itemBuilder,
  });

  final Future<List<T>> future;
  final VoidCallback onReload;
  final Widget Function(T item) itemBuilder;

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);
    return RefreshIndicator(
      onRefresh: () async {
        onReload();
        await future;
      },
      color: AppColors.primary,
      child: FutureBuilder<List<T>>(
        future: future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return ListView(children: const [SizedBox(height: 120), Center(child: CodakisLogoLoader())]);
          }
          if (snapshot.hasError) {
            return ListView(
              padding: const EdgeInsets.all(AppDefaults.padding),
              children: [
                Text('${snapshot.error}'),
                const SizedBox(height: 12),
                CodakisPrimaryButton(label: s.commonRetry, expand: true, variant: CodakisButtonVariant.site, onPressed: onReload),
              ],
            );
          }
          final items = snapshot.data ?? [];
          if (items.isEmpty) {
            return ListView(
              padding: const EdgeInsets.all(AppDefaults.padding),
              children: [Text(s.quizEmpty)],
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppDefaults.padding),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) => itemBuilder(items[index]),
          );
        },
      ),
    );
  }
}

class _AssessmentTile extends StatelessWidget {
  const _AssessmentTile({
    required this.title,
    required this.subtitle,
    required this.actionLabel,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final String actionLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: AppDefaults.borderRadius,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppDefaults.borderRadius,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.gray),
            borderRadius: AppDefaults.borderRadius,
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textDark)),
                    const SizedBox(height: 4),
                    Text(subtitle, style: const TextStyle(color: AppColors.placeholder)),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              FilledButton(
                onPressed: onTap,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  minimumSize: const Size(0, 36),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                ),
                child: Text(actionLabel),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
