export const HOW_IT_WORKS_INTRO = [
  "CODAKIS est la plateforme d'apprentissage du code de la route et de mise en relation avec les auto-écoles agréées au Cameroun. Notre objectif est de vous accompagner de la théorie à l'examen, en passant par le choix de votre auto-école et la réservation de vos créneaux de conduite.",
  "Que vous soyez candidat souhaitant réviser le code, passer des examens blancs ou acheter un forfait conduite, ou gérant d'auto-école partenaire, le parcours est conçu pour être simple, transparent et adapté au contexte CEMAC.",
];

export const HOW_IT_WORKS_NOTICE =
  "VOTRE MEILLEURE GARANTIE EST DE PASSER PAR CODAKIS : NE PAYEZ JAMAIS UN FORFAIT HORS PLATEFORME AVANT D'AVOIR VÉRIFIÉ L'AUTO-ÉCOLE AGRÉÉE.";

export const HOW_IT_WORKS_STEPS = [
  {
    num: "1",
    title: "Créez votre compte",
    text: "Inscrivez-vous gratuitement en tant que candidat ou connectez-vous avec Google en quelques minutes.",
  },
  {
    num: "2",
    title: "Apprenez & progressez",
    text: "Suivez les cours par thème, entraînez-vous avec des quiz et simulez l'examen blanc officiel.",
  },
  {
    num: "3",
    title: "Choisissez votre auto-école",
    text: "Parcourez l'annuaire des auto-écoles agréées, comparez les forfaits et payez en Mobile Money.",
  },
  {
    num: "4",
    title: "Passez votre permis",
    text: "Réservez vos créneaux de conduite, suivez votre progression et préparez l'examen en confiance.",
  },
] as const;

export type HowItWorksHighlight = {
  title: string;
  body: string;
  moreLabel?: string;
  moreHref?: string;
};

export const HOW_IT_WORKS_HIGHLIGHTS: HowItWorksHighlight[] = [
  {
    title: "Apprentissage gamifié du code",
    body:
      "10 thèmes alignés sur le référentiel CEMAC, quiz interactifs, examens blancs chronométrés et suivi de progression visible à chaque étape.",
    moreLabel: "Voir les thèmes",
    moreHref: "/themes",
  },
  {
    title: "Annuaire d'auto-écoles agréées",
    body:
      "Seules les auto-écoles validées par CODAKIS apparaissent dans l'annuaire. Consultez les taux de réussite, les forfaits et les avis avant de vous inscrire.",
    moreLabel: "Voir l'annuaire",
    moreHref: "/auto-ecoles",
  },
  {
    title: "Support & accompagnement",
    body:
      "Une équipe dédiée répond à vos questions sur l'inscription, les forfaits, les créneaux de conduite et l'utilisation de la plateforme.",
    moreLabel: "Nous contacter",
    moreHref: "/contact",
  },
];

export type HowItWorksFaqItem = {
  question: string;
  answer: string;
  linkLabel?: string;
  linkHref?: string;
};

export const HOW_IT_WORKS_CLIENT_FAQ: HowItWorksFaqItem[] = [
  {
    question: "Comment trouver une auto-école agréée près de chez moi ?",
    answer:
      "Créez un compte candidat, puis parcourez l'annuaire CODAKIS filtré par ville ou proximité. Chaque auto-école affiche ses forfaits, son taux de réussite et les avis des candidats.",
    linkLabel: "Explorer l'annuaire",
    linkHref: "/auto-ecoles",
  },
  {
    question: "L'inscription candidat est-elle gratuite ?",
    answer:
      "Oui. Vous pouvez créer un compte, accéder aux cours de base et passer des quiz gratuitement. Les forfaits conduite et complets sont proposés par les auto-écoles partenaires.",
    linkLabel: "Voir les tarifs",
    linkHref: "/tarifs#abonnement",
  },
  {
    question: "Puis-je réviser le code sans m'inscrire à une auto-école ?",
    answer:
      "Absolument. CODAKIS propose un parcours d'apprentissage autonome du code de la route. L'inscription à une auto-école est nécessaire uniquement pour la formation pratique et l'examen.",
    linkLabel: "Commencer à apprendre",
    linkHref: "/inscription/candidat",
  },
];

export const HOW_IT_WORKS_TECHNICIAN_FAQ: HowItWorksFaqItem[] = [
  {
    question: "Comment devenir auto-école partenaire CODAKIS ?",
    answer:
      "Contactez notre équipe via le formulaire de contact ou créez un compte gérant. Nous vérifions votre agrément MINT avant de publier votre établissement dans l'annuaire.",
    linkLabel: "Guide auto-école",
    linkHref: "/guide/auto-ecole",
  },
  {
    question: "Comment sont gérés les paiements Mobile Money ?",
    answer:
      "Les candidats paient via MTN MoMo ou Orange Money. CODAKIS sécurise la transaction et notifie votre auto-école dès confirmation du paiement.",
    linkLabel: "Nous contacter",
    linkHref: "/contact",
  },
];

export const HOW_IT_WORKS_TECH_FAQ = HOW_IT_WORKS_TECHNICIAN_FAQ;

export const HOW_IT_WORKS_INCLUDES = [
  {
    title: "Apprentissage structuré",
    text: "10 thèmes du code alignés sur le référentiel CEMAC.",
  },
  {
    title: "Auto-écoles vérifiées",
    text: "Un annuaire transparent avec forfaits et avis candidats.",
  },
  {
    title: "Support dédié",
    text: "Une équipe à votre écoute tout au long du parcours permis.",
  },
] as const;
