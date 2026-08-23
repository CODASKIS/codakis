export const TERMS_LAST_UPDATED = "16 janvier 2025";

export const TERMS_INTRO =
  "Les présentes conditions d'utilisation, ainsi que les autres documents juridiques incorporés par référence (collectivement, les « Conditions »), constituent le contrat entre CODAKIS (« nous », « notre » ou « la plateforme ») et chaque utilisateur (« Utilisateur », « vous » ou « votre ») concernant l'accès et l'utilisation de notre site, de nos applications et de nos services en ligne (collectivement, le « Site » ou le « Service »).";

export const TERMS_LEGAL_NOTICE =
  "VEUILLEZ LIRE ATTENTIVEMENT CES CONDITIONS AVANT D'UTILISER LE SERVICE, CAR ELLES AFFECTENT VOS DROITS ET OBLIGATIONS LÉGAUX. SI VOUS N'ACCEPTEZ PAS D'ÊTRE LIÉ PAR CES CONDITIONS, OU SI À TOUT MOMENT LES CONDITIONS NE VOUS CONVIENNENT PLUS, VEUILLEZ CESSER IMMÉDIATEMENT D'UTILISER LE SERVICE. LE SITE EST DESTINÉ AUX PERSONNES ÉTABLIES AU CAMEROUN ET, LE CAS ÉCHÉANT, DANS LES PAYS OÙ LE SERVICE EST LÉGALEMENT ACCESSIBLE.";

export type TermsHighlight = {
  title: string;
  body: string;
  moreLabel?: string;
  moreHref?: string;
};

export const TERMS_HIGHLIGHTS: TermsHighlight[] = [
  {
    title: "Votre acceptation",
    body:
      "Chaque fois que vous accédez au Service et/ou l'utilisez, vous acceptez d'être lié par ces Conditions et par toute condition supplémentaire applicable.",
  },
  {
    title: "Votre vie privée",
    body:
      "Nous collectons certaines informations pour permettre à CODAKIS et, le cas échéant, à des tiers de vous contacter dans le cadre du Service. Vous acceptez que nous utilisions ces informations conformément à notre politique de confidentialité.",
    moreLabel: "Politique de confidentialité",
    moreHref: "/politique-de-confidentialite",
  },
  {
    title: "Paiements, abonnements et annulations",
    body:
      "Vous vous engagez à honorer vos obligations de paiement pour les services achetés sur le Site. Les abonnements peuvent être renouvelés automatiquement selon la formule choisie. Vous pouvez annuler depuis votre espace personnel. CODAKIS ne garantit pas le remboursement des périodes entamées.",
  },
  {
    title: "Notre contenu et propriété intellectuelle",
    body:
      "Vous ne pouvez pas copier, reproduire, revendre, afficher ou distribuer le contenu du Service sans autorisation écrite de CODAKIS.",
  },
  {
    title: "Exclusion de garanties",
    body:
      "Dans la mesure permise par la loi applicable, nous excluons les garanties et fournissons le Service « en l'état ».",
  },
  {
    title: "Limitation de responsabilité",
    body:
      "Dans la mesure permise par la loi applicable, notre responsabilité est limitée conformément à la section correspondante des présentes Conditions.",
  },
  {
    title: "Contact",
    body: "Pour toute question relative à ces Conditions : contact@codakis.cm",
    moreLabel: "Nous contacter",
    moreHref: "/contact",
  },
];

export type TermsSubsection = {
  title?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type TermsSection = {
  id?: string;
  title: string;
  paragraphs?: string[];
  subsections?: TermsSubsection[];
};

export const TERMS_FULL_SECTIONS: TermsSection[] = [
  {
    title: "1. Qu'est-ce que CODAKIS ?",
    paragraphs: [
      "CODAKIS est une plateforme de mise en relation entre clients et auto-écoles agréées au Cameroun. En vous inscrivant, vous accédez à l'annuaire géolocalisé, aux outils de certification, aux abonnements et aux ressources associées. Nous ne garantissons pas l'obtention d'un contrat, d'une mission ou d'un revenu pour tout utilisateur.",
    ],
  },
  {
    title: "2. Votre acceptation et relation contractuelle",
    paragraphs: [
      "Vous déclarez être majeur(e) selon la loi camerounaise et capable de contracter. Si vous n'avez pas la capacité juridique de contracter, vous ne pouvez pas utiliser le Service.",
    ],
  },
  {
    id: "confidentialite",
    title: "3. Confidentialité",
    paragraphs: [
      "Votre vie privée est importante pour nous. Consultez notre politique de confidentialité, qui explique comment nous utilisons les informations que vous soumettez. Cette politique est incorporée par référence aux présentes Conditions.",
    ],
  },
  {
    title: "4. Modifications des Conditions ou du Service",
    subsections: [
      {
        title: "Conditions",
        paragraphs: [
          "CODAKIS peut modifier, mettre à jour, ajouter ou supprimer des dispositions des présentes Conditions à tout moment en publiant la version mise à jour sur le Site. En cas de changement important, nous vous en informerons conformément à la loi. Si vous n'acceptez pas les Conditions mises à jour, vous devez cesser d'utiliser le Service.",
        ],
      },
      {
        title: "Service",
        paragraphs: [
          "Nous pouvons modifier le Service à tout moment. Si vous vous opposez à un changement, votre seul recours est d'arrêter de l'utiliser. Nous nous réservons le droit d'interrompre le Service ou toute partie de celui-ci, à tout moment et sans préavis, sans responsabilité envers vous ou un tiers.",
        ],
      },
      {
        title: "Abonnements payants",
        paragraphs: [
          "Si vous êtes abonné à un service payant et que nous modifions substantiellement le prix ou les prestations, nous vous en informerons par e-mail. Les changements prendront effet à la prochaine échéance de facturation, sauf disposition contraire.",
        ],
      },
    ],
  },
  {
    title: "5. Utilisation du Service et comptes",
    paragraphs: [
      "Tant que vous respectez ces Conditions, vous pouvez utiliser le Service. Elles s'appliquent à tous les utilisateurs, y compris les visiteurs et les comptes inscrits.",
    ],
    subsections: [
      {
        title: "Clients",
        paragraphs: [
          "Les clients utilisent le Site pour rechercher des auto-écoles agréées, consulter des profils et souscrire à des formules d'accès. L'usage est strictement personnel et non commercial, sauf accord écrit.",
        ],
      },
      {
        title: "Techniciens",
        paragraphs: [
          "Les techniciens créent un profil professionnel, soumettent des documents de certification et peuvent être référencés dans l'annuaire selon les règles de la plateforme. Les profils frauduleux, incomplets ou non conformes peuvent être suspendus ou supprimés.",
        ],
      },
      {
        title: "Données d'inscription",
        paragraphs: [
          "Vous vous engagez à fournir des informations exactes, complètes et à jour. Vous êtes responsable de toute activité effectuée via votre compte. Ne partagez pas votre mot de passe. Signalez immédiatement toute utilisation non autorisée à contact@codakis.cm.",
        ],
      },
    ],
  },
  {
    title: "6. Votre contenu et licence accordée",
    paragraphs: [
      "En publiant du contenu sur le Site (profil, photos, avis, documents), vous restez propriétaire de vos contenus. Vous accordez toutefois à CODAKIS une licence mondiale, non exclusive et gratuite pour héberger, afficher, adapter et utiliser ce contenu afin de fournir et promouvoir le Service, conformément à notre politique de confidentialité.",
      "Vous garantissez disposer des droits nécessaires sur les contenus publiés et que ceux-ci ne portent pas atteinte aux droits de tiers.",
    ],
  },
  {
    title: "7. Politique d'utilisation acceptable",
    paragraphs: ["Vous vous engagez à ne pas utiliser le Service pour :"],
    subsections: [
      {
        bullets: [
          "Publier du contenu illégal, diffamatoire, trompeur, harassant ou contraire à l'ordre public.",
          "Usurper l'identité d'une autre personne ou entité.",
          "Collecter des données personnelles d'autres utilisateurs sans autorisation.",
          "Transmettre des virus, scripts malveillants ou tenter d'accéder sans autorisation à nos systèmes.",
          "Utiliser des robots, scrapers ou outils automatisés non autorisés.",
          "Contourner les mesures de sécurité ou les limitations d'accès aux profils.",
        ],
      },
      {
        paragraphs: [
          "CODAKIS se réserve le droit de supprimer tout contenu ou suspendre tout compte en violation de cette politique, sans préavis.",
        ],
      },
    ],
  },
  {
    id: "paiements",
    title: "8. Paiements et abonnements",
    paragraphs: [
      "Les tarifs en vigueur sont affichés sur la page Forfaits et peuvent être modifiés conformément à la section 4. Les paiements sont traités par des prestataires tiers sécurisés (Mobile Money, etc.). Vous acceptez de payer les montants dus, taxes incluses le cas échéant.",
      "Les abonnements récurrents se renouvellent automatiquement selon la période choisie (mensuelle ou annuelle), sauf annulation préalable.",
    ],
  },
  {
    title: "9. Annulations",
    paragraphs: [
      "Vous pouvez annuler votre abonnement depuis votre espace client ou technicien, ou en contactant le support. L'annulation prend effet à la fin de la période en cours, sauf disposition légale contraire. Aucun remboursement au prorata n'est garanti pour une période entamée.",
    ],
  },
  {
    title: "10. Propriété intellectuelle",
    paragraphs: [
      "Le Site, sa charte graphique, ses logos, textes, logiciels et bases de données appartiennent à CODAKIS ou à ses concédants. Toute reproduction non autorisée est interdite.",
    ],
  },
  {
    title: "11. Exclusion de garanties",
    paragraphs: [
      "VOTRE UTILISATION DU SERVICE SE FAIT À VOS RISQUES. LE SERVICE EST FOURNI « EN L'ÉTAT » ET « SELON DISPONIBILITÉ », SANS GARANTIE D'AUCUNE SORTE, DANS LA MESURE PERMISE PAR LA LOI. NOUS NE GARANTISSONS PAS QUE LE SERVICE SERA ININTERROMPU, EXEMPT D'ERREURS OU QU'IL RÉPONDRA À VOS ATTENTES SPÉCIFIQUES.",
      "CODAKIS ne garantit pas l'identité, la compétence ou la conduite des techniciens ou clients référencés sur la plateforme.",
    ],
  },
  {
    title: "12. Limitation de responsabilité",
    paragraphs: [
      "DANS LA MESURE PERMISE PAR LA LOI APPLICABLE, BANQUE DE SERVICES NE SAURAIT ÊTRE TENUE RESPONSABLE DES DOMMAGES INDIRECTS, ACCESSOIRES, SPÉCIAUX OU CONSÉCUTIFS RÉSULTANT DE L'UTILISATION OU DE L'IMPOSSIBILITÉ D'UTILISER LE SERVICE.",
      "Notre responsabilité totale, pour toute réclamation liée au Service, est limitée au montant que vous nous avez payé au cours des douze (12) mois précédant l'événement à l'origine de la réclamation, sauf disposition légale impérative contraire.",
    ],
  },
  {
    title: "13. Indemnisation",
    paragraphs: [
      "Vous acceptez d'indemniser CODAKIS contre toute réclamation résultant de votre violation des présentes Conditions, de vos contenus ou de votre utilisation du Service.",
    ],
  },
  {
    title: "14. Sites et services tiers",
    paragraphs: [
      "Le Site peut contenir des liens vers des sites tiers. Nous ne contrôlons pas ces sites et déclinons toute responsabilité quant à leur contenu ou leurs pratiques. Leur utilisation est soumise à leurs propres conditions.",
    ],
  },
  {
    title: "15. Droit applicable et litiges",
    paragraphs: [
      "Les présentes Conditions sont régies par le droit camerounais. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents de Douala ou Yaoundé seront seuls compétents, sauf disposition légale impérative contraire protégeant le consommateur.",
    ],
  },
  {
    title: "16. Communications électroniques",
    paragraphs: [
      "Vous acceptez de recevoir nos communications par voie électronique (e-mail, notifications sur le Site). Ces communications satisfont aux exigences légales d'écrit, lorsque la loi le permet.",
    ],
  },
  {
    title: "17. Dispositions générales",
    paragraphs: [
      "Si une disposition des présentes Conditions est jugée invalide, les autres dispositions restent en vigueur. Les présentes Conditions constituent l'intégralité de l'accord entre vous et CODAKIS concernant le Site.",
    ],
  },
  {
    title: "18. Nous contacter",
    paragraphs: [
      "CODAKIS — Douala & Yaoundé, Cameroun.",
      "E-mail : contact@codakis.cm",
    ],
  },
];
