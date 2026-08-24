class OnboardingSlide {
  const OnboardingSlide({
    required this.title,
    required this.description,
    this.heroAsset,
    this.useLogoHero = false,
  });

  final String title;
  final String description;
  final String? heroAsset;
  final bool useLogoHero;
}

const onboardingSlides = [
  OnboardingSlide(
    title: 'Apprends à ton rythme',
    description:
        'Prends le contrôle de ton apprentissage. Révise les leçons, passe des tests blancs et suis tes progrès où que tu sois.',
    useLogoHero: true,
  ),
  OnboardingSlide(
    title: 'Révise ton code',
    description:
        'Accède à des milliers de questions conformes à l\'examen officiel. Entraîne-toi avec des séries thématiques ou des examens blancs.',
    heroAsset: 'assets/onboarding/illustration_step_2.png',
  ),
  OnboardingSlide(
    title: 'Réussis ton examen',
    description:
        'Suis tes statistiques en temps réel et identifie tes points faibles pour progresser plus vite. Ton permis est à portée de main.',
    heroAsset: 'assets/onboarding/illustration_step_3.png',
  ),
];
