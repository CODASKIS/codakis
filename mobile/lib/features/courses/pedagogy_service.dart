import '../../core/api_client.dart';

class CourseTheme {
  const CourseTheme({
    required this.id,
    required this.code,
    required this.titleFr,
    required this.titleEn,
    required this.leconCount,
    required this.quizCount,
    required this.isPremium,
    required this.locked,
  });

  final String id;
  final String code;
  final String titleFr;
  final String titleEn;
  final int leconCount;
  final int quizCount;
  final bool isPremium;
  final bool locked;

  factory CourseTheme.fromJson(Map<String, dynamic> json) {
    return CourseTheme(
      id: '${json['id']}',
      code: json['code'] as String? ?? '',
      titleFr: json['title_fr'] as String? ?? '',
      titleEn: json['title_en'] as String? ?? '',
      leconCount: json['lecon_count'] as int? ?? 0,
      quizCount: json['quiz_count'] as int? ?? 0,
      isPremium: json['is_premium'] as bool? ?? false,
      locked: json['locked'] as bool? ?? false,
    );
  }
}

class CandidatProgress {
  const CandidatProgress({
    required this.completedCount,
    required this.totalLecons,
    required this.percent,
    required this.completedLeconIds,
    required this.passedQuizIds,
    required this.passedExamenIds,
  });

  final int completedCount;
  final int totalLecons;
  final int percent;
  final List<String> completedLeconIds;
  final List<String> passedQuizIds;
  final List<String> passedExamenIds;

  factory CandidatProgress.fromJson(Map<String, dynamic> json) {
    return CandidatProgress(
      completedCount: json['completed_count'] as int? ?? 0,
      totalLecons: json['total_lecons'] as int? ?? 0,
      percent: json['percent'] as int? ?? 0,
      completedLeconIds: (json['completed_lecon_ids'] as List<dynamic>? ?? [])
          .map((e) => '$e')
          .toList(),
      passedQuizIds: (json['passed_quiz_ids'] as List<dynamic>? ?? []).map((e) => '$e').toList(),
      passedExamenIds: (json['passed_examen_ids'] as List<dynamic>? ?? []).map((e) => '$e').toList(),
    );
  }
}

class CourseLesson {
  const CourseLesson({
    required this.id,
    required this.themeId,
    required this.title,
    required this.excerpt,
    required this.body,
    required this.coverImageUrl,
    required this.sortOrder,
    required this.locked,
  });

  final String id;
  final String themeId;
  final String title;
  final String excerpt;
  final String body;
  final String? coverImageUrl;
  final int sortOrder;
  final bool locked;

  factory CourseLesson.fromJson(Map<String, dynamic> json) {
    return CourseLesson(
      id: '${json['id']}',
      themeId: '${json['theme_id']}',
      title: json['title'] as String? ?? '',
      excerpt: json['excerpt'] as String? ?? '',
      body: json['body'] as String? ?? '',
      coverImageUrl: json['cover_image_url'] as String?,
      sortOrder: json['sort_order'] as int? ?? 0,
      locked: json['locked'] as bool? ?? false,
    );
  }
}

class CoursePathStep {
  const CoursePathStep({
    required this.type,
    required this.id,
    required this.ref,
    required this.title,
    required this.sortOrder,
    required this.status,
  });

  final String type;
  final String id;
  final String ref;
  final String title;
  final int sortOrder;
  final String? status;

  factory CoursePathStep.fromJson(Map<String, dynamic> json) {
    return CoursePathStep(
      type: json['type'] as String? ?? '',
      id: '${json['id']}',
      ref: json['ref'] as String? ?? '',
      title: json['title'] as String? ?? '',
      sortOrder: json['sort_order'] as int? ?? 0,
      status: json['status'] as String?,
    );
  }
}

class CoursePath {
  const CoursePath({
    required this.themeId,
    required this.steps,
    required this.completedLeconIds,
    required this.passedQuizIds,
  });

  final String themeId;
  final List<CoursePathStep> steps;
  final List<String> completedLeconIds;
  final List<String> passedQuizIds;

  factory CoursePath.fromJson(Map<String, dynamic> json) {
    return CoursePath(
      themeId: '${json['theme_id']}',
      steps: (json['steps'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(CoursePathStep.fromJson)
          .toList(),
      completedLeconIds: (json['completed_lecon_ids'] as List<dynamic>? ?? [])
          .map((e) => '$e')
          .toList(),
      passedQuizIds: (json['passed_quiz_ids'] as List<dynamic>? ?? []).map((e) => '$e').toList(),
    );
  }
}

class QuizSummary {
  const QuizSummary({
    required this.id,
    required this.themeId,
    required this.themeCode,
    required this.title,
    required this.description,
    required this.questionCount,
    required this.dureeMinutes,
    required this.linkedCount,
  });

  final String id;
  final String themeId;
  final String themeCode;
  final String title;
  final String description;
  final int questionCount;
  final int dureeMinutes;
  final int linkedCount;

  factory QuizSummary.fromJson(Map<String, dynamic> json) {
    return QuizSummary(
      id: '${json['id']}',
      themeId: '${json['theme_id']}',
      themeCode: json['theme_code'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      questionCount: json['question_count'] as int? ?? 0,
      dureeMinutes: json['duree_minutes'] as int? ?? 0,
      linkedCount: json['linked_count'] as int? ?? 0,
    );
  }
}

class ExamSummary {
  const ExamSummary({
    required this.id,
    required this.title,
    required this.description,
    required this.dureeMinutes,
    required this.nbQuestions,
    required this.maxErreurs,
    required this.linkedCount,
  });

  final String id;
  final String title;
  final String description;
  final int dureeMinutes;
  final int nbQuestions;
  final int maxErreurs;
  final int linkedCount;

  factory ExamSummary.fromJson(Map<String, dynamic> json) {
    return ExamSummary(
      id: '${json['id']}',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      dureeMinutes: json['duree_minutes'] as int? ?? 0,
      nbQuestions: json['nb_questions'] as int? ?? 0,
      maxErreurs: json['max_erreurs'] as int? ?? 0,
      linkedCount: json['linked_count'] as int? ?? 0,
    );
  }
}

class QuizAnswer {
  const QuizAnswer({required this.id, required this.label, required this.texte});

  final String id;
  final String label;
  final String texte;

  factory QuizAnswer.fromJson(Map<String, dynamic> json) {
    return QuizAnswer(
      id: '${json['id']}',
      label: json['label'] as String? ?? '',
      texte: json['texte'] as String? ?? '',
    );
  }
}

class QuizQuestion {
  const QuizQuestion({
    required this.id,
    required this.prompt,
    required this.imageUrl,
    required this.answers,
  });

  final String id;
  final String prompt;
  final String? imageUrl;
  final List<QuizAnswer> answers;

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      id: '${json['id']}',
      prompt: json['prompt'] as String? ?? '',
      imageUrl: json['image_url'] as String?,
      answers: (json['reponses'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(QuizAnswer.fromJson)
          .toList(),
    );
  }
}

class QuizTake {
  const QuizTake({
    required this.id,
    required this.title,
    required this.themeCode,
    required this.dureeMinutes,
    required this.questions,
    this.maxErreurs,
  });

  final String id;
  final String title;
  final String themeCode;
  final int dureeMinutes;
  final int? maxErreurs;
  final List<QuizQuestion> questions;

  factory QuizTake.fromJson(Map<String, dynamic> json, {bool isExam = false}) {
    return QuizTake(
      id: '${json['id']}',
      title: json['title'] as String? ?? '',
      themeCode: json['theme_code'] as String? ?? '',
      dureeMinutes: json['duree_minutes'] as int? ?? 0,
      maxErreurs: isExam ? json['max_erreurs'] as int? : null,
      questions: (json['questions'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(QuizQuestion.fromJson)
          .toList(),
    );
  }
}

class SubmitResultDetail {
  const SubmitResultDetail({
    required this.questionId,
    required this.estCorrecte,
    required this.explanation,
  });

  final String questionId;
  final bool estCorrecte;
  final String? explanation;

  factory SubmitResultDetail.fromJson(Map<String, dynamic> json) {
    return SubmitResultDetail(
      questionId: '${json['question_id']}',
      estCorrecte: json['est_correcte'] as bool? ?? false,
      explanation: json['explanation'] as String?,
    );
  }
}

class AssessmentResult {
  const AssessmentResult({
    required this.score,
    required this.nbCorrectes,
    required this.nbTotal,
    required this.reussi,
    required this.details,
    required this.nbErreurs,
  });

  final int score;
  final int nbCorrectes;
  final int nbTotal;
  final bool reussi;
  final List<SubmitResultDetail> details;
  final int? nbErreurs;

  factory AssessmentResult.fromJson(Map<String, dynamic> json, {bool isExam = false}) {
    return AssessmentResult(
      score: json['score'] as int? ?? 0,
      nbCorrectes: json['nb_correctes'] as int? ?? 0,
      nbTotal: json['nb_total'] as int? ?? 0,
      reussi: json['reussi'] as bool? ?? false,
      nbErreurs: isExam ? json['nb_erreurs'] as int? : null,
      details: (json['details'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(SubmitResultDetail.fromJson)
          .toList(),
    );
  }
}

class PedagogyService {
  PedagogyService(this._api);

  final ApiClient _api;

  Future<List<CourseTheme>> fetchThemes() async {
    final rows = await _api.getList('/candidat/pedagogy/themes', auth: true);
    return rows.whereType<Map<String, dynamic>>().map(CourseTheme.fromJson).toList();
  }

  Future<CandidatProgress> fetchProgress() async {
    final data = await _api.get('/candidat/pedagogy/progress', auth: true);
    return CandidatProgress.fromJson(data);
  }

  Future<List<CourseLesson>> fetchLessons(String themeId) async {
    final rows = await _api.getList('/candidat/pedagogy/themes/$themeId/lecons', auth: true);
    return rows.whereType<Map<String, dynamic>>().map(CourseLesson.fromJson).toList();
  }

  Future<CoursePath> fetchPath(String themeId) async {
    final data = await _api.get('/candidat/pedagogy/themes/$themeId/path', auth: true);
    return CoursePath.fromJson(data);
  }

  Future<CourseLesson> fetchLesson(String leconId) async {
    final data = await _api.get('/candidat/pedagogy/lecons/$leconId', auth: true);
    return CourseLesson.fromJson(data);
  }

  Future<CandidatProgress> completeLesson(String leconId) async {
    final data = await _api.post('/candidat/pedagogy/lecons/$leconId/complete', auth: true);
    return CandidatProgress.fromJson(data);
  }

  Future<List<QuizSummary>> fetchQuizzes() async {
    final rows = await _api.getList('/candidat/pedagogy/quiz', auth: true);
    return rows.whereType<Map<String, dynamic>>().map(QuizSummary.fromJson).toList();
  }

  Future<List<ExamSummary>> fetchExamens() async {
    final rows = await _api.getList('/candidat/pedagogy/examens', auth: true);
    return rows.whereType<Map<String, dynamic>>().map(ExamSummary.fromJson).toList();
  }

  Future<QuizTake> fetchQuiz(String quizId) async {
    final data = await _api.get('/candidat/pedagogy/quiz/$quizId', auth: true);
    return QuizTake.fromJson(data);
  }

  Future<QuizTake> fetchExamen(String examenId) async {
    final data = await _api.get('/candidat/pedagogy/examens/$examenId', auth: true);
    return QuizTake.fromJson(data, isExam: true);
  }

  Future<AssessmentResult> submitQuiz(String quizId, Map<String, String> answers) async {
    final data = await _api.post(
      '/candidat/pedagogy/quiz/$quizId/submit',
      auth: true,
      body: {
        'answers': answers.entries
            .map((e) => {'question_id': e.key, 'reponse_id': e.value})
            .toList(),
      },
    );
    return AssessmentResult.fromJson(data);
  }

  Future<AssessmentResult> submitExamen(String examenId, Map<String, String> answers, {int? dureeSec}) async {
    final data = await _api.post(
      '/candidat/pedagogy/examens/$examenId/submit',
      auth: true,
      body: {
        'answers': answers.entries
            .map((e) => {'question_id': e.key, 'reponse_id': e.value})
            .toList(),
        if (dureeSec != null) 'duree_sec': dureeSec,
      },
    );
    return AssessmentResult.fromJson(data, isExam: true);
  }
}
