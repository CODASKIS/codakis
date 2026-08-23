export const PRIVACY_LAST_UPDATED = "13 janvier 2026";

export const PRIVACY_INTRO =
  "Merci de visiter CODAKIS (ci-après « nous », « notre » ou « la plateforme »). Cette politique explique nos pratiques en matière de collecte, d'utilisation et de protection des données personnelles (les « Données » ou « Informations personnelles ») lorsque vous utilisez notre site, nos applications et nos services (collectivement, le « Site »). CODAKIS est le responsable du traitement de vos Données dans le cadre du Site. En utilisant le Site, vous acceptez que vos Informations soient traitées conformément à la présente politique, ainsi qu'à nos conditions d'utilisation.";

export type PrivacyHighlight = {
  title: string;
  body: string;
  moreLabel?: string;
  moreHref?: string;
};

export const PRIVACY_HIGHLIGHTS: PrivacyHighlight[] = [
  {
    title: "Données personnelles que nous collectons",
    body:
      "Lorsque vous créez un compte, utilisez nos services, consultez l'annuaire, souscrivez à un abonnement ou nous contactez, vous nous communiquez volontairement certaines informations : nom, adresse e-mail, numéro de téléphone, localisation professionnelle, domaine d'activité, documents de certification, etc. Voir la section 2 pour plus de détails.",
  },
  {
    title: "Technologies de suivi",
    body:
      "Nous pouvons utiliser des cookies et technologies similaires pour mesurer l'audience, sécuriser le Site et améliorer votre expérience. Vous pouvez accepter ou refuser les cookies non essentiels via le bandeau affiché lors de votre première visite.",
    moreLabel: "En savoir plus",
    moreHref: "#cookies",
  },
  {
    title: "Utilisation, conservation et stockage",
    body:
      "Nous conservons vos Données le temps nécessaire à la fourniture du service, au respect de nos obligations légales et à la résolution d'éventuels litiges.",
  },
  {
    title: "Communication des informations",
    body:
      "Dans les limites permises par la loi, nous pouvons partager vos Informations avec nos prestataires techniques, les clients ou techniciens dans le cadre d'une mise en relation, les autorités compétentes ou en cas de restructuration de l'entreprise.",
  },
  {
    title: "Vos choix",
    body:
      "Vous pouvez gérer vos préférences de communication, vous opposer à certains traitements, demander l'accès, la rectification ou la suppression de vos Données, et retirer votre consentement marketing à tout moment.",
  },
  {
    title: "Accès et modification",
    body:
      "Les utilisateurs inscrits peuvent modifier leurs informations depuis leur espace client ou technicien, ou en nous contactant.",
  },
  {
    title: "Mises à jour de la politique",
    body:
      "Nous pouvons mettre à jour cette politique en publiant une nouvelle version sur le Site. En cas de changement important, nous pourrons vous en informer par e-mail lorsque la loi l'exige.",
  },
  {
    title: "Résidents de l'EEE / RGPD",
    body:
      "CODAKIS respecte le Règlement général sur la protection des données (RGPD). Les personnes concernées peuvent exercer leurs droits dans la mesure où ils leur sont applicables.",
  },
  {
    title: "Contact",
    body: "Pour toute question relative à cette politique : contact@codakis.cm ou via notre page Contact.",
    moreLabel: "Nous contacter",
    moreHref: "/contact",
  },
];

export type PrivacySubsection = {
  title?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type PrivacySection = {
  id?: string;
  title: string;
  paragraphs?: string[];
  subsections?: PrivacySubsection[];
};

export const PRIVACY_FULL_SECTIONS: PrivacySection[] = [
  {
    title: "1. Périmètre",
    paragraphs: [
      "CODAKIS est une plateforme en ligne qui met en relation des clients avec des auto-écoles agréées et géolocalisés au Cameroun. Nous proposons des services liés à la recherche de professionnels, à la certification, aux abonnements et à la gestion de comptes clients et techniciens. Nous ne garantissons pas l'obtention d'un contrat ou d'une mission pour tout utilisateur du Site.",
    ],
  },
  {
    id: "collecte",
    title: "2. Données que nous collectons",
    paragraphs: ["Les Données collectées dépendent de la façon dont vous utilisez le Site."],
    subsections: [
      {
        title: "Inscription, services et compte",
        paragraphs: [
          "Vous pouvez parcourir certaines pages sans créer de compte. Dans ce cas, nous pouvons collecter des données techniques (adresse IP, type de navigateur, pages consultées, données de géolocalisation approximative).",
          "Lorsque vous créez un compte client ou technicien, vous devez fournir certaines informations (e-mail valide, identité, coordonnées, domaine d'activité, zone d'intervention, etc.). Pour les achats ou abonnements, des informations de facturation peuvent être demandées ; les paiements sont traités par des prestataires externes et nous ne stockons pas les données complètes de carte bancaire.",
        ],
      },
      {
        title: "Réponses à vos demandes",
        paragraphs: [
          "Si vous nous contactez (formulaire, e-mail, chat), nous utilisons les coordonnées fournies pour répondre à vos questions et, le cas échéant, vous envoyer des communications liées au service.",
        ],
      },
      {
        title: "Connexion via des tiers",
        paragraphs: [
          "Si vous accédez au Site via un service d'authentification tiers, nous pouvons recevoir des informations de base (nom, e-mail, identifiant).",
        ],
      },
      {
        title: "Interactions avec le Site",
        paragraphs: [
          "Nous recevons des informations sur votre utilisation du Site (contenus consultés, recherches effectuées, clics). Ces données nous aident à améliorer nos services et, avec votre consentement, à personnaliser votre expérience.",
        ],
      },
      {
        title: "Appareils mobiles",
        paragraphs: [
          "Si vous accédez au Site depuis un appareil mobile, nous pouvons collecter des identifiants techniques, le système d'exploitation, l'opérateur et, le cas échéant, des données de localisation selon vos paramètres.",
        ],
      },
    ],
  },
  {
    title: "3. Utilisation, conservation et stockage",
    paragraphs: ["Nous traitons vos Données pour les finalités suivantes :"],
    subsections: [
      {
        title: "Exploitation du Site et fourniture des services",
        bullets: [
          "Répondre à vos demandes et assurer le support client.",
          "Gérer votre compte, vos abonnements et vos certifications.",
          "Afficher et géolocaliser les profils techniciens dans l'annuaire.",
          "Mettre en relation clients et auto-écoles agréées.",
          "Personnaliser le contenu et améliorer la sécurité du Site.",
        ],
      },
      {
        title: "Analyses agrégées",
        paragraphs: [
          "Nous utilisons des données agrégées ou anonymisées pour analyser l'utilisation du Site et produire des statistiques.",
        ],
      },
      {
        title: "Prévention de la fraude et conformité légale",
        paragraphs: [
          "Nous pouvons utiliser vos Données pour détecter les activités frauduleuses, faire respecter nos conditions d'utilisation et répondre aux demandes des autorités compétentes.",
        ],
      },
      {
        title: "Marketing et communications",
        paragraphs: [
          "Avec votre consentement, nous pouvons vous envoyer des informations sur nos services, offres ou actualités. Vous pouvez vous désinscrire à tout moment.",
        ],
      },
    ],
  },
  {
    title: "4. Communication et divulgation",
    paragraphs: ["Les Données collectées peuvent être partagées avec :"],
    subsections: [
      {
        bullets: [
          "Nos prestataires techniques (hébergement, paiement, analytique, e-mail) sous contrat de confidentialité.",
          "Les autres utilisateurs du Site, dans le cadre d'une mise en relation (profil technicien visible dans l'annuaire selon votre formule).",
          "Les autorités judiciaires ou administratives lorsque la loi l'exige.",
          "Un successeur en cas de fusion, acquisition ou cession d'actifs, sous réserve du respect de la présente politique.",
        ],
      },
    ],
  },
  {
    title: "5. Accès, consultation et modification de vos Données",
    paragraphs: [
      "Les utilisateurs inscrits peuvent consulter et modifier une partie de leurs informations depuis leur espace personnel. Pour toute demande complémentaire (copie, rectification, suppression), contactez-nous à contact@codakis.cm.",
    ],
  },
  {
    title: "6. Vos choix",
    subsections: [
      {
        title: "Désinscription des messages promotionnels",
        paragraphs: [
          "Vous pouvez vous désabonner des newsletters via le lien présent dans chaque e-mail ou depuis les paramètres de votre compte.",
        ],
      },
      {
        title: "Suppression de compte",
        paragraphs: [
          "Vous pouvez demander la suppression de votre compte et de vos Données identifiables. Certaines informations peuvent être conservées pour des obligations légales ou la prévention de la fraude.",
        ],
      },
      {
        title: "Messages administratifs",
        paragraphs: [
          "Les e-mails transactionnels liés à votre compte (confirmation, sécurité, facturation) ne peuvent pas toujours être désactivés tant que votre compte est actif.",
        ],
      },
    ],
  },
  {
    title: "7. Informations que vous partagez sur le Site",
    paragraphs: [
      "Les profils techniciens publiés dans l'annuaire peuvent être visibles par les clients selon le niveau d'abonnement. Les contenus que vous publiez volontairement (avis, témoignages) peuvent être accessibles à d'autres utilisateurs. Pensez à ne pas divulguer d'informations sensibles que vous ne souhaitez pas rendre publiques.",
    ],
  },
  {
    id: "cookies",
    title: "8. Technologies de suivi (cookies)",
    paragraphs: [
      "Lors de votre visite, nous collectons des informations d'usage envoyées par votre appareil (pages vues, clics, durée de session). Nous utilisons des cookies et technologies similaires pour :",
    ],
    subsections: [
      {
        bullets: [
          "Essentiels : administration du Site, sécurité, session utilisateur et panier d'abonnement.",
          "Analytiques : mesure de performance et amélioration du contenu.",
          "Personnalisation : mémorisation de vos préférences et adaptation de l'expérience.",
          "Publicitaires : le cas échéant, contenus pertinents selon vos centres d'intérêt, sous réserve de votre consentement.",
        ],
      },
      {
        title: "Gestion des cookies",
        paragraphs: [
          "Vous pouvez refuser les cookies non essentiels via le bandeau affiché à votre première visite. Vous pouvez également configurer votre navigateur pour bloquer ou supprimer les cookies, ce qui peut limiter certaines fonctionnalités du Site.",
        ],
      },
    ],
  },
  {
    title: "9. Résidents de l'Espace économique européen (RGPD)",
    paragraphs: [
      "Conformément au RGPD, vous disposez notamment des droits d'accès, de rectification, d'effacement, de limitation du traitement, de portabilité, d'opposition et de retrait du consentement. Pour exercer ces droits : contact@codakis.cm. Vous pouvez également introduire une réclamation auprès de l'autorité de protection des données compétente.",
    ],
  },
  {
    title: "10. Tiers",
    paragraphs: [
      "Le Site peut contenir des liens vers des sites tiers. Nous ne sommes pas responsables de leurs pratiques de confidentialité. Consultez leurs politiques avant de leur transmettre vos Données.",
    ],
  },
  {
    title: "11. Sécurité des informations",
    paragraphs: [
      "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos Données contre la perte, l'accès non autorisé ou la divulgation. Aucune transmission sur Internet n'est toutefois totalement sécurisée.",
    ],
  },
  {
    title: "12. Protection des mineurs",
    paragraphs: [
      "Le Site s'adresse aux personnes de 18 ans et plus. Nous ne collectons pas sciemment de Données auprès de mineurs. Si vous pensez qu'un mineur nous a transmis des informations, contactez-nous pour suppression.",
    ],
  },
  {
    title: "13. Stockage et transferts internationaux",
    paragraphs: [
      "Vos Données peuvent être stockées et traitées au Cameroun ou dans d'autres pays où nos prestataires opèrent. Lorsque des transferts hors de votre juridiction sont nécessaires, nous mettons en place des garanties appropriées conformément à la réglementation applicable.",
    ],
  },
  {
    title: "14. Révision et mises à jour",
    paragraphs: [
      "Nous révisons cette politique au moins une fois par an et publions la version en vigueur sur le Site. La date de dernière mise à jour figure en haut de cette page. En cas de divergence entre un résumé et la politique complète, la politique complète prévaut.",
    ],
  },
  {
    title: "15. Nous contacter",
    paragraphs: [
      "CODAKIS — Douala & Yaoundé, Cameroun.",
      "E-mail : contact@codakis.cm",
    ],
  },
];
