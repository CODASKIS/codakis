import 'dart:async';
import '../../widgets/codakis_logo_loader.dart';

import 'package:flutter/material.dart';

import '../../config/api_config.dart';
import '../../core/app_theme.dart';
import '../../core/constants/app_defaults.dart';
import '../../core/locale_scope.dart';
import '../../widgets/codakis_form_feedback.dart';
import '../../widgets/codakis_primary_button.dart';
import '../../widgets/codakis_quiz_panel.dart';
import '../courses/pedagogy_service.dart';

enum AssessmentKind { quiz, exam }

class AssessmentTakePage extends StatefulWidget {
  const AssessmentTakePage._({
    required this.kind,
    required this.id,
    required this.pedagogyService,
  });

  final AssessmentKind kind;
  final String id;
  final PedagogyService pedagogyService;

  factory AssessmentTakePage.quiz({
    required String quizId,
    required PedagogyService pedagogyService,
  }) =>
      AssessmentTakePage._(kind: AssessmentKind.quiz, id: quizId, pedagogyService: pedagogyService);

  factory AssessmentTakePage.exam({
    required String examenId,
    required PedagogyService pedagogyService,
  }) =>
      AssessmentTakePage._(kind: AssessmentKind.exam, id: examenId, pedagogyService: pedagogyService);

  @override
  State<AssessmentTakePage> createState() => _AssessmentTakePageState();
}

class _AssessmentTakePageState extends State<AssessmentTakePage> {
  late Future<QuizTake> _future;
  final _answers = <String, String>{};
  int _index = 0;
  bool _submitting = false;
  AssessmentResult? _result;
  String? _error;
  Timer? _timer;
  int _secondsLeft = 0;
  late final DateTime _startedAt;

  @override
  void initState() {
    super.initState();
    _startedAt = DateTime.now();
    _future = _load();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<QuizTake> _load() async {
    final take = widget.kind == AssessmentKind.quiz
        ? await widget.pedagogyService.fetchQuiz(widget.id)
        : await widget.pedagogyService.fetchExamen(widget.id);
    _startTimer(take.dureeMinutes);
    return take;
  }

  void _startTimer(int minutes) {
    _timer?.cancel();
    _secondsLeft = minutes * 60;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_secondsLeft <= 0) {
        timer.cancel();
        _submit(auto: true);
        return;
      }
      setState(() => _secondsLeft--);
    });
  }

  String _formatTimer() {
    final m = (_secondsLeft ~/ 60).toString().padLeft(2, '0');
    final s = (_secondsLeft % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  Future<void> _submit({bool auto = false}) async {
    final s = LocaleScope.stringsOf(context);
    if (_submitting || _result != null) return;

    QuizTake? take;
    try {
      take = await _future;
    } catch (_) {
      return;
    }

    if (!auto && _answers.length < take.questions.length) {
      setState(() => _error = s.quizAnswerAll);
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final dureeSec = DateTime.now().difference(_startedAt).inSeconds;
      final result = widget.kind == AssessmentKind.quiz
          ? await widget.pedagogyService.submitQuiz(widget.id, _answers)
          : await widget.pedagogyService.submitExamen(widget.id, _answers, dureeSec: dureeSec);
      _timer?.cancel();
      if (!mounted) return;
      setState(() => _result = result);
    } catch (err) {
      setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _retry() {
    setState(() {
      _result = null;
      _answers.clear();
      _index = 0;
      _error = null;
      _startedAt = DateTime.now();
      _future = _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);
    final label = widget.kind == AssessmentKind.quiz ? s.quizThemeLabel : s.examThemeLabel;

    return Scaffold(
      appBar: AppBar(title: Text(widget.kind == AssessmentKind.quiz ? s.quizTakeTitle : s.examTakeTitle)),
      body: FutureBuilder<QuizTake>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CodakisLogoLoader());
          }
          if (snapshot.hasError) {
            return Padding(
              padding: const EdgeInsets.all(AppDefaults.padding),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CodakisAlertBanner.error(message: s.quizLoadError),
                  Text('${snapshot.error}'),
                  const SizedBox(height: 16),
                  CodakisPrimaryButton(
                    label: s.commonRetry,
                    expand: true,
                    variant: CodakisButtonVariant.site,
                    onPressed: () => setState(() => _future = _load()),
                  ),
                ],
              ),
            );
          }

          final take = snapshot.data!;
          if (take.questions.isEmpty) {
            return Padding(
              padding: const EdgeInsets.all(AppDefaults.padding),
              child: CodakisQuizPanel(
                label: label,
                title: take.title,
                child: Column(
                  children: [
                    CodakisAlertBanner.error(message: s.quizLoadError),
                    const SizedBox(height: 12),
                    CodakisPrimaryButton(
                      label: s.commonRetry,
                      expand: true,
                      variant: CodakisButtonVariant.site,
                      onPressed: () => setState(() => _future = _load()),
                    ),
                  ],
                ),
              ),
            );
          }

          if (_result != null) {
            return ListView(
              padding: const EdgeInsets.all(AppDefaults.padding),
              children: [
                CodakisQuizPanel(
                label: label,
                title: take.title,
                child: Column(
                  children: [
                    CodakisQuizScore(
                      score: _result!.score,
                      passed: _result!.reussi,
                      passLabel: s.quizPassedBadge,
                      failLabel: s.quizFailedBadge,
                    ),
                    const SizedBox(height: 20),
                    ..._result!.details.map((detail) {
                      final prompt = take.questions.firstWhere((q) => q.id == detail.questionId).prompt;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: detail.estCorrecte ? CodakisColors.surfaceAlt : const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(CodakisRadii.field),
                          border: Border.all(
                            color: detail.estCorrecte ? CodakisColors.primary : const Color(0xFFDA1E28),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  detail.estCorrecte ? Icons.check_circle_outline : Icons.cancel_outlined,
                                  color: detail.estCorrecte ? CodakisColors.primary : const Color(0xFFDA1E28),
                                  size: 18,
                                ),
                                const SizedBox(width: 8),
                                Expanded(child: Text(prompt, style: const TextStyle(fontWeight: FontWeight.w700))),
                              ],
                            ),
                            if (detail.explanation != null) ...[
                              const SizedBox(height: 6),
                              Text(detail.explanation!),
                            ],
                          ],
                        ),
                      );
                    }),
                    if (!_result!.reussi) ...[
                      const SizedBox(height: 16),
                      CodakisPrimaryButton(
                        label: s.quizRetry,
                        expand: true,
                        variant: CodakisButtonVariant.site,
                        size: CodakisButtonSize.lg,
                        onPressed: _retry,
                      ),
                    ],
                  ],
                ),
              ),
              ],
            );
          }

          final question = take.questions[_index];
          final progress = (_index + 1) / take.questions.length;
          final isLast = _index == take.questions.length - 1;

          return ListView(
            padding: const EdgeInsets.all(AppDefaults.padding),
            children: [
              CodakisQuizPanel(
                label: label,
                title: take.title,
                timerText: take.dureeMinutes > 0 ? (_secondsLeft <= 0 ? s.quizTimeUp : _formatTimer()) : null,
                timerLow: _secondsLeft > 0 && _secondsLeft <= 60,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CodakisQuizProgress(value: progress),
                    const SizedBox(height: 8),
                    Text(s.quizQuestionProgress(_index + 1, take.questions.length)),
                    if (_error != null) CodakisAlertBanner.error(message: _error!),
                    const SizedBox(height: 16),
                    Text(question.prompt, style: Theme.of(context).textTheme.titleMedium),
                    if (question.imageUrl != null && question.imageUrl!.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(CodakisRadii.field),
                        child: Image.network(
                          question.imageUrl!.startsWith('http')
                              ? question.imageUrl!
                              : '${ApiConfig.baseUrl}${question.imageUrl!.startsWith('/') ? '' : '/'}${question.imageUrl}',
                          width: double.infinity,
                          height: 200,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            height: 160,
                            color: CodakisColors.surfaceAlt,
                            alignment: Alignment.center,
                            child: const Icon(Icons.broken_image_outlined),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    ...question.answers.asMap().entries.map((entry) {
                      final answer = entry.value;
                      return CodakisQuizOption(
                        index: entry.key + 1,
                        label: answer.label,
                        text: answer.texte,
                        selected: _answers[question.id] == answer.id,
                        onTap: _submitting || _secondsLeft <= 0
                            ? null
                            : () => setState(() => _answers[question.id] = answer.id),
                      );
                    }),
                    const SizedBox(height: 16),
                    CodakisQuizNav(
                      canPrev: _index > 0,
                      isLast: isLast,
                      prevLabel: s.commonPrevious,
                      nextLabel: s.commonNext,
                      submitLabel: _submitting ? s.quizSubmitting : s.quizSubmit,
                      submitting: _submitting,
                      onPrev: () => setState(() => _index--),
                      onNext: () => setState(() => _index++),
                      onSubmit: () => _submit(),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
