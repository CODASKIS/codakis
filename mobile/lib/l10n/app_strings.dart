class AppStrings {
  AppStrings(this.locale);

  final String locale;
  bool get isEnglish => locale.startsWith('en');

  String get langFr => 'FR';
  String get langEn => 'EN';
  String get langSwitch => isEnglish ? 'Change language' : 'Changer de langue';
  String get authLanguageFr => isEnglish ? 'French' : 'Français';
  String get authLanguageEn => isEnglish ? 'English' : 'English';

  String get commonLoading => isEnglish ? 'Loading…' : 'Chargement…';
  String get commonRetry => isEnglish ? 'Try again' : 'Réessayer';
  String get commonBack => isEnglish ? 'Back' : 'Retour';
  String get commonNext => isEnglish ? 'Next' : 'Suivant';
  String get commonPrevious => isEnglish ? 'Previous' : 'Précédent';

  String get loginAppTitle => isEnglish ? 'Candidate app' : 'Application candidat';
  String get loginWelcomePrefix => isEnglish ? 'Welcome to' : 'Bienvenue sur';
  String get loginTagline => isEnglish ? 'Highway code · Cameroon / CEMAC' : 'Code de la route · Cameroun / CEMAC';
  String get loginSubmit => isEnglish ? 'Sign in' : 'Se connecter';
  String get loginSubmitting => isEnglish ? 'Signing in…' : 'Connexion…';
  String get loginForgot => isEnglish ? 'Forgot password?' : 'Mot de passe oublié ?';
  String get loginRegister => isEnglish ? 'Create a candidate account' : 'Créer un compte candidat';
  String get loginError =>
      isEnglish ? 'Unable to sign in. Check the backend and API URL.' : 'Connexion impossible. Vérifiez le backend et l\'URL API.';

  String get registerTitle => isEnglish ? 'Create an account' : 'Créer un compte';
  String get registerSubmit => isEnglish ? 'Create my account' : 'Créer mon compte';
  String get registerSubmitting => isEnglish ? 'Creating…' : 'Création…';
  String get registerLogin => isEnglish ? 'Already registered? Sign in' : 'Déjà inscrit ? Se connecter';

  String get forgotTitle => isEnglish ? 'Forgot password' : 'Mot de passe oublié';
  String get forgotLead => isEnglish
      ? 'Receive a code by email to reset your password.'
      : 'Recevez un code par e-mail pour réinitialiser votre mot de passe.';
  String get forgotSubmit => isEnglish ? 'Send code' : 'Envoyer le code';
  String get forgotSubmitting => isEnglish ? 'Sending…' : 'Envoi…';

  String get resetTitle => isEnglish ? 'New password' : 'Nouveau mot de passe';
  String get resetLeadPrefix => isEnglish ? 'Code sent to' : 'Code envoyé à';
  String get resetSubmit => isEnglish ? 'Reset password' : 'Réinitialiser';
  String get resetSubmitting => isEnglish ? 'Updating…' : 'Mise à jour…';
  String get verificationTitle => isEnglish ? 'Verification' : 'Vérification';
  String get verificationLead =>
      isEnglish ? 'A verification code has been sent to your email.' : 'Un code de vérification a été envoyé par e-mail.';
  String get verificationNext => isEnglish ? 'Continue' : 'Continuer';
  String get fieldCountry => isEnglish ? 'Country' : 'Pays';
  String get registerHasAccount => isEnglish ? 'Already have an account? ' : 'Déjà un compte ? ';
  String get registerSignIn => isEnglish ? 'Sign in' : 'Se connecter';

  String get fieldEmail => isEnglish ? 'Email' : 'E-mail';
  String get fieldPassword => isEnglish ? 'Password' : 'Mot de passe';
  String get fieldFullName => isEnglish ? 'Full name' : 'Nom complet';
  String get fieldFirstName => isEnglish ? 'First name' : 'Prénom';
  String get fieldLastName => isEnglish ? 'Last name' : 'Nom';
  String get fieldCity => isEnglish ? 'City' : 'Ville';
  String get fieldPhone => isEnglish ? 'Phone (optional)' : 'Téléphone (optionnel)';
  String get fieldLanguage => isEnglish ? 'Language' : 'Langue';
  String get languagePickerTitle => isEnglish ? 'Select your language' : 'Choisissez votre langue';
  String get languagePickerSave => isEnglish ? 'Save' : 'Enregistrer';
  String get drawerSearchHint => isEnglish ? 'Search courses, schools…' : 'Rechercher cours, auto-écoles…';
  String get fieldOtp => isEnglish ? 'OTP code' : 'Code OTP';
  String get fieldNewPassword => isEnglish ? 'New password' : 'Nouveau mot de passe';

  String get validationEmailRequired => isEnglish ? 'Email required' : 'E-mail requis';
  String get validationEmailInvalid => isEnglish ? 'Invalid email' : 'E-mail invalide';
  String get validationPasswordInvalid => isEnglish ? 'Invalid password' : 'Mot de passe invalide';
  String get validationPasswordMin => isEnglish ? 'At least 8 characters' : '8 caractères minimum';
  String get validationNameRequired => isEnglish ? 'Name required' : 'Nom requis';
  String get validationOtpRequired => isEnglish ? 'Code required' : 'Code requis';

  String get onboardingSkip => isEnglish ? 'Skip' : 'Passer';
  String get onboardingNext => isEnglish ? 'Next' : 'Suivant';
  String get onboardingStart => isEnglish ? 'Get started' : 'Commencer';
  String get onboardingSlide1Title => isEnglish ? 'Learn at your pace' : 'Apprends à ton rythme';
  String get onboardingSlide1Desc => isEnglish
      ? 'Take control of your learning. Review lessons, take mock exams and track your progress anywhere.'
      : 'Prends le contrôle de ton apprentissage. Révise les leçons, passe des tests blancs et suis tes progrès où que tu sois.';
  String get onboardingSlide2Title => isEnglish ? 'Revise your theory' : 'Révise ton code';
  String get onboardingSlide2Desc => isEnglish
      ? 'Access thousands of questions aligned with the official exam. Train with themed series or full mock exams.'
      : 'Accède à des milliers de questions conformes à l\'examen officiel. Entraîne-toi avec des séries thématiques ou des examens blancs.';
  String get onboardingSlide3Title => isEnglish ? 'Pass your exam' : 'Réussis ton examen';
  String get onboardingSlide3Desc => isEnglish
      ? 'Track your stats in real time and focus on weak areas to progress faster. Your licence is within reach.'
      : 'Suis tes statistiques en temps réel et identifie tes points faibles pour progresser plus vite. Ton permis est à portée de main.';

  String get navHome => isEnglish ? 'Home' : 'Accueil';
  String get navCourses => isEnglish ? 'Courses' : 'Cours';
  String get navQuizzes => isEnglish ? 'Quizzes' : 'Quiz';
  String get navSchool => isEnglish ? 'Driving school' : 'Auto-école';
  String get navProfile => isEnglish ? 'Profile' : 'Profil';

  String get homeJourneyTitle => isEnglish ? 'My licence journey' : 'Mon parcours permis';
  String get homeJourneyLead => isEnglish
      ? 'CEMAC revision, timed quizzes and driving school tracking on CODAKIS.'
      : 'Révision CEMAC, quiz chronométrés et suivi auto-école sur CODAKIS.';
  String get homeQuickAccess => isEnglish ? 'Quick access' : 'Accès rapide';
  String get homeCoursesTitle => isEnglish ? 'Courses & themes' : 'Cours & thèmes';
  String get homeCoursesSubtitle => isEnglish ? '10 CEMAC modules connected to the backend' : '10 modules CEMAC connectés au backend';
  String get homeQuizzesTitle => isEnglish ? 'Quizzes & mock exams' : 'Quiz & examens blancs';
  String get homeQuizzesSubtitle => isEnglish ? 'Timed training' : 'Entraînement chronométré';
  String get homePopularThemes => isEnglish ? 'Popular modules' : 'Modules populaires';
  String get homeViewAll => isEnglish ? 'View all' : 'Tout voir';
  String get homeOpenQuizzes => isEnglish ? 'Open' : 'Ouvrir';
  String homeProgress(int completed, int total, int percent) => isEnglish
      ? '$completed / $total lessons completed · $percent%'
      : '$completed / $total leçons terminées · $percent %';

  String get tabQuizzesTitle => isEnglish ? 'Quizzes & exams' : 'Quiz & examens';
  String get tabQuizzesLead =>
      isEnglish ? 'Timed training — coming soon in the mobile app.' : 'Entraînement chronométré — bientôt dans l’app mobile.';
  String get tabSchoolTitle => isEnglish ? 'My driving school' : 'Mon auto-école';
  String get tabSchoolLead =>
      isEnglish ? 'Package, sessions and Consort file.' : 'Forfait, séances et dossier Consort.';
  String get profileTitle => isEnglish ? 'My profile' : 'Mon profil';
  String get profileLead => isEnglish ? 'CODAKIS candidate account' : 'Compte candidat CODAKIS';
  String get profileLogout => isEnglish ? 'Sign out' : 'Se déconnecter';
  String get profileLogoutTooltip => isEnglish ? 'Sign out' : 'Déconnexion';

  String get coursesTitle => isEnglish ? 'My CEMAC modules' : 'Mes modules CEMAC';
  String coursesSubtitle(int count) =>
      isEnglish ? '$count themes — highway code revision' : '$count thèmes — révision code de la route';
  String get coursesLoadError => isEnglish ? 'Unable to load courses.' : 'Impossible de charger les cours.';
  String get coursesEmpty => isEnglish ? 'No modules available.' : 'Aucun module disponible.';
  String get coursesLearningPath => isEnglish ? 'Learning path' : 'Parcours pédagogique';
  String get coursesLead => isEnglish
      ? 'Progress through CEMAC modules, lessons and checkpoints to prepare for your exam.'
      : 'Progressez dans les modules CEMAC, les leçons et les points de contrôle pour préparer votre examen.';
  String get coursesCurriculum => isEnglish ? 'Curriculum' : 'Programme';
  String get coursesAllThemes => isEnglish ? 'All modules' : 'Tous les modules';
  String get coursesOpenModuleHint =>
      isEnglish ? 'Open a module to follow its lessons.' : 'Ouvrez un module pour suivre ses leçons.';
  String get coursesOpenModule => isEnglish ? 'Open module' : 'Ouvrir le module';
  String get moduleLead => isEnglish
      ? 'Work through each lesson in order, then take the theme quiz.'
      : 'Suivez chaque leçon dans l\'ordre, puis passez le quiz du thème.';
  String get coursesPremium => isEnglish ? 'Premium' : 'Premium';
  String get coursesModules => isEnglish ? 'Modules' : 'Modules';
  String themeLabel(int number) => isEnglish ? 'Theme $number' : 'Thème $number';
  String get lessonOpen => isEnglish ? 'Open' : 'Ouvrir';
  String get lessonRead => isEnglish ? 'Read lesson' : 'Lire la leçon';
  String get coursesStartModule => isEnglish ? 'Start module' : 'Commencer le module';
  String themeLocked(int count) =>
      isEnglish ? 'Premium — $count lessons' : 'Premium — $count leçons';
  String themeLessons(int count) => isEnglish ? '$count lessons' : '$count leçons';
  String get themePremiumLocked =>
      isEnglish ? 'Premium subscription required to access this module.' : 'Abonnement premium requis pour accéder à ce module.';

  String get lessonTitle => isEnglish ? 'Lesson' : 'Leçon';
  String get lessonTapToOpen => isEnglish ? 'Tap to open' : 'Appuyer pour ouvrir';
  String get pathQuizStep => isEnglish ? 'Checkpoint quiz' : 'Quiz checkpoint';
  String pathStepsCount(int count) =>
      isEnglish ? '$count steps in this module' : '$count étapes dans ce module';
  String get pathLearningRoute => isEnglish ? 'Your learning route' : 'Votre parcours';
  String get lessonEmptyBody => isEnglish ? 'Content coming soon.' : 'Contenu bientôt disponible.';
  String get lessonMarkComplete => isEnglish ? 'Mark as completed' : 'Marquer comme terminée';
  String get lessonCompleting => isEnglish ? 'Saving…' : 'Enregistrement…';
  String get lessonCompleted => isEnglish ? 'Lesson completed!' : 'Leçon terminée !';

  String get quizTabSeries => isEnglish ? 'Themed quizzes' : 'Quiz thématiques';
  String get quizTabExams => isEnglish ? 'Mock exams' : 'Examens blancs';
  String get quizEmpty => isEnglish ? 'No quiz available yet.' : 'Aucun quiz disponible pour le moment.';
  String get quizStart => isEnglish ? 'Start' : 'Commencer';
  String get quizTakeTitle => isEnglish ? 'Take quiz' : 'Passer le quiz';
  String get examTakeTitle => isEnglish ? 'Mock exam' : 'Examen blanc';
  String get quizSubmit => isEnglish ? 'Submit' : 'Valider';
  String get quizSubmitting => isEnglish ? 'Submitting…' : 'Envoi…';
  String get quizAnswerAll => isEnglish ? 'Please answer all questions.' : 'Répondez à toutes les questions.';
  String get quizPassed => isEnglish ? 'Congratulations, you passed!' : 'Félicitations, vous avez réussi !';
  String get quizFailed => isEnglish ? 'Keep training, you can do it!' : 'Continue à t\'entraîner, tu peux y arriver !';
  String quizTileSubtitle(int questions, int minutes) =>
      isEnglish ? '$questions questions · $minutes min' : '$questions questions · $minutes min';
  String examTileSubtitle(int questions, int minutes, int maxErrors) => isEnglish
      ? '$questions questions · $minutes min · max $maxErrors errors'
      : '$questions questions · $minutes min · max $maxErrors erreurs';
  String quizQuestionProgress(int current, int total) =>
      isEnglish ? 'Question $current of $total' : 'Question $current sur $total';
  String quizResult(int score, int correct, int total) =>
      isEnglish ? 'Score $score% · $correct/$total correct' : 'Score $score % · $correct/$total bonnes réponses';
  String examResult(int score, int errors, int total) =>
      isEnglish ? 'Score $score% · $errors errors on $total' : 'Score $score % · $errors erreurs sur $total';

  String get schoolSearchHint => isEnglish ? 'Search a driving school…' : 'Rechercher une auto-école…';
  String get schoolMyEnrollments => isEnglish ? 'My enrollments' : 'Mes inscriptions';
  String get schoolNoEnrollment => isEnglish ? 'No enrollment yet.' : 'Aucune inscription pour le moment.';
  String get schoolBrowseTitle => isEnglish ? 'Browse driving schools' : 'Parcourir les auto-écoles';
  String get schoolEmpty => isEnglish ? 'No driving school found.' : 'Aucune auto-école trouvée.';
  String schoolFromPrice(int price) => isEnglish ? 'From $price FCFA' : 'À partir de $price FCFA';
  String schoolHoursLeft(int left, int total) => isEnglish ? '$left h / $total h' : '$left h / $total h';
  String get schoolForfaitsTitle => isEnglish ? 'Packages' : 'Forfaits';
  String schoolForfaitPrice(int price) => isEnglish ? '$price FCFA' : '$price FCFA';
  String get schoolEnrollCta => isEnglish ? 'Enroll' : 'S\'inscrire';
  String get schoolEnrolling => isEnglish ? 'Enrolling…' : 'Inscription…';
  String get schoolEnrolled => isEnglish ? 'Enrollment request sent!' : 'Demande d\'inscription envoyée !';

  String get profileEditTitle => isEnglish ? 'Edit profile' : 'Modifier le profil';
  String get profileSave => isEnglish ? 'Save changes' : 'Enregistrer';
  String get profileSaving => isEnglish ? 'Saving…' : 'Enregistrement…';
  String get profileSaved => isEnglish ? 'Profile updated.' : 'Profil mis à jour.';
  String get profileLoadError => isEnglish ? 'Unable to load profile.' : 'Impossible de charger le profil.';
  String profilePlan(String plan) => isEnglish ? 'Plan: $plan' : 'Forfait : $plan';

  String get consortNavLabel => isEnglish ? 'Consort file' : 'Dossier Consort';
  String get consortPageTitle => isEnglish ? 'My Consort file' : 'Mon dossier Consort';
  String get consortPageLead => isEnglish
      ? 'Track and complete the 6 mandatory licence administrative documents.'
      : 'Suivez et complétez les 6 pièces obligatoires de votre dossier administratif permis.';
  String get consortPathTitle => isEnglish ? 'Document path' : 'Parcours des pièces';
  String get consortPathLead =>
      isEnglish ? 'Tap a step to view requirements and submit.' : 'Appuyez sur une étape pour voir les exigences et déposer la pièce.';
  String get consortValidatedShort => isEnglish ? 'Validated' : 'Validées';
  String get consortPendingShort => isEnglish ? 'Pending' : 'En cours';
  String get consortProgressLabel => isEnglish ? 'Progress' : 'Progression';
  String get consortPendingReview => isEnglish ? 'Pending school review' : 'En attente de validation';
  String get consortActionAdd => isEnglish ? 'Add document' : 'Ajouter la pièce';
  String get consortFooterText => isEnglish
      ? 'Complete all 6 documents with your driving school before prefecture submission.'
      : 'Complétez les 6 pièces avec votre auto-école avant le dépôt en préfecture.';
  String get consortDossierInfoTitle => isEnglish ? 'File information' : 'Informations dossier';
  String get consortDossierUpdated => isEnglish ? 'Last update' : 'Dernière mise à jour';
  String get consortDossierDepot => isEnglish ? 'Prefecture submission' : 'Dépôt préfecture';
  String get consortRequirementsLabel => isEnglish ? 'Requirements' : 'Exigences';
  String get consortSubmitCta => isEnglish ? 'Submit document' : 'Déposer la pièce';
  String get consortSubmitting => isEnglish ? 'Submitting…' : 'Dépôt en cours…';
  String get consortSubmitSuccess =>
      isEnglish ? 'Document submitted — pending school validation.' : 'Pièce déposée — en attente de validation par votre auto-école.';
  String get consortLoadError => isEnglish ? 'Unable to load your Consort file.' : 'Impossible de charger votre dossier Consort.';
  String get consortStepsTitle => isEnglish ? 'Process steps' : 'Étapes du parcours';
  String get consortStep1 => isEnglish ? 'Gather the 6 mandatory documents.' : 'Rassembler les 6 pièces obligatoires.';
  String get consortStep2 => isEnglish ? 'Submit each document on CODAKIS.' : 'Déposer chaque pièce sur CODAKIS.';
  String get consortStep3 => isEnglish ? 'Your driving school validates each document.' : 'Votre auto-école vérifie et valide chaque document.';
  String get consortStep4 => isEnglish ? 'Complete file → prefecture submission.' : 'Dossier complet → dépôt en préfecture.';
  String get consortSchoolValidationHint => isEnglish
      ? 'Your partner driving school validates documents submitted on CODAKIS.'
      : 'Votre auto-école partenaire valide les pièces déposées sur CODAKIS.';
  String consortProgressHint(int validated, int pending, int missing) => isEnglish
      ? '$validated validated, $pending pending and $missing missing out of 6.'
      : '$validated pièces validées, $pending en cours et $missing manquante(s) sur 6.';
  String consortValidatedOn(String date) => isEnglish ? 'Validated on $date' : 'Validée le $date';

  String consortStatus(String status) => switch (status) {
        'validated' => isEnglish ? 'Validated' : 'Validée',
        'pending' => isEnglish ? 'Pending' : 'En cours',
        _ => isEnglish ? 'Missing' : 'Manquante',
      };

  String consortDossierStatus(String status) => switch (status) {
        'en_cours' => isEnglish ? 'In progress' : 'En cours',
        'pieces_incompletes' => isEnglish ? 'Missing documents' : 'Pièces manquantes',
        'pret' => isEnglish ? 'Complete file' : 'Dossier complet',
        'depose' => isEnglish ? 'Submitted to prefecture' : 'Déposé en préfecture',
        _ => status,
      };

  String consortPieceTitle(String key) => switch (key) {
        'id' => isEnglish ? 'ID document' : 'Pièce d\'identité',
        'birth' => isEnglish ? 'Birth certificate' : 'Certificat de naissance',
        'medical' => isEnglish ? 'Medical certificate' : 'Certificat médical',
        'photos' => isEnglish ? 'ID photos' : 'Photos d\'identité',
        'address' => isEnglish ? 'Proof of address' : 'Justificatif de domicile',
        'stamps' => isEnglish ? 'Stamp duty' : 'Droits de timbres',
        _ => key,
      };

  String consortPieceDesc(String key) => switch (key) {
        'id' => isEnglish ? 'Valid national ID or passport.' : 'CNI ou passeport en cours de validité.',
        'birth' => isEnglish ? 'Legalized copy or original as required.' : 'Copie légalisée ou original selon les exigences locales.',
        'medical' => isEnglish ? 'From an approved medical center, valid 3 months.' : 'Délivré par un centre médical agréé, valide 3 mois.',
        'photos' => isEnglish ? 'Regulatory format, light background.' : 'Format réglementaire, fond clair, conformes aux normes.',
        'address' => isEnglish ? 'Recent bill or residence certificate.' : 'Facture récente ou attestation de résidence.',
        'stamps' => isEnglish ? 'Tax stamps required for the Consort file.' : 'Timbres fiscaux requis pour le dossier Consort.',
        _ => '',
      };

  String consortPieceRequirement(String key) => switch (key) {
        'id' => isEnglish ? 'Original or certified copy, valid.' : 'Original ou copie certifiée conforme, en cours de validité.',
        'birth' => isEnglish ? 'Legalized copy per local prefecture rules.' : 'Copie légalisée ou original selon la préfecture de votre ville.',
        'medical' => isEnglish ? 'Approved center certificate, less than 3 months old.' : 'Certificat médical délivré par un centre agréé, daté de moins de 3 mois.',
        'photos' => isEnglish ? '4 regulatory photos, light background.' : '4 photos d\'identité fond clair, format réglementaire permis.',
        'address' => isEnglish ? 'Recent utility bill or residence certificate.' : 'Facture d\'eau/électricité récente (< 3 mois) ou attestation de résidence.',
        'stamps' => isEnglish ? 'Required tax stamps for Cameroon Consort file.' : 'Timbres fiscaux au montant exigé pour le dossier Consort camerounais.',
        _ => '',
      };

  String get quizThemeLabel => isEnglish ? 'Theme quiz' : 'Quiz thème';
  String get examThemeLabel => isEnglish ? 'Mock exam' : 'Examen blanc';
  String get quizLoadError => isEnglish ? 'Unable to load the quiz.' : 'Impossible de charger le quiz.';
  String get quizRetry => isEnglish ? 'Try again' : 'Réessayer';
  String get quizTimeUp => isEnglish ? 'Time is up' : 'Temps écoulé';
  String get quizPassedBadge => isEnglish ? 'Passed' : 'Réussi';
  String get quizFailedBadge => isEnglish ? 'Failed' : 'Échoué';
}
