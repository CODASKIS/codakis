import type { BlogPostDetail, BlogPostListItem, PublicDomainItem, VitrinePlanItem } from "../lib/cms-api";

export const MOCK_BLOG_POSTS: BlogPostListItem[] = [
  {
    slug: "reussir-code-route-cameroun",
    title: "10 conseils pour réussir le code de la route au Cameroun",
    excerpt: "Préparez votre examen théorique avec méthode : révision, examens blancs et gestion du stress.",
    cover_image_url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
    author_name: "Équipe CODAKIS",
    published_at: "2026-03-01T10:00:00Z",
  },
  {
    slug: "choisir-auto-ecole-agreee",
    title: "Comment choisir une auto-école agréée ?",
    excerpt: "Taux de réussite, forfaits, avis candidats : les critères essentiels avant de s'inscrire.",
    cover_image_url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
    author_name: "Équipe CODAKIS",
    published_at: "2026-02-18T09:00:00Z",
  },
  {
    slug: "dossier-consort-pieces",
    title: "Dossier Consort : les 6 pièces à préparer",
    excerpt: "Identité, certificat médical, timbres… Suivez la checklist complète pour ne rien oublier.",
    cover_image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    author_name: "Équipe CODAKIS",
    published_at: "2026-02-05T08:00:00Z",
  },
  {
    slug: "paiement-mobile-money-permis",
    title: "Payer son forfait permis avec Mobile Money",
    excerpt: "Orange Money et MTN MoMo : étapes sécurisées pour acheter un forfait conduite sur CODAKIS.",
    cover_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    author_name: "Équipe CODAKIS",
    published_at: "2026-01-22T11:00:00Z",
  },
  {
    slug: "examen-blanc-strategies",
    title: "Examen blanc : 5 stratégies pour scorer 35/40",
    excerpt: "Chronométrez-vous, identifiez vos thèmes faibles et entraînez-vous comme le jour J.",
    cover_image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    author_name: "Équipe CODAKIS",
    published_at: "2026-01-10T14:00:00Z",
  },
  {
    slug: "signalisation-cemac",
    title: "Signalisation CEMAC : panneaux à connaître par cœur",
    excerpt: "Triangulaires, circulaires, octogonales : révisez les familles de panneaux les plus tombées à l'examen.",
    cover_image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    author_name: "Équipe CODAKIS",
    published_at: "2025-12-28T16:00:00Z",
  },
];

export const MOCK_BLOG_DETAILS: Record<string, BlogPostDetail> = Object.fromEntries(
  MOCK_BLOG_POSTS.map((post) => [
    post.slug,
    {
      ...post,
      body: `## ${post.title}\n\n${post.excerpt}\n\nCODAKIS vous accompagne à chaque étape de votre parcours permis au Cameroun : cours interactifs, quiz, examens blancs, annuaire d'auto-écoles agréées et suivi du dossier Consort.\n\n> Téléchargez l'application mobile pour réviser partout, même hors connexion.`,
    },
  ]),
);

export const MOCK_VITRINE_PLANS: VitrinePlanItem[] = [
  {
    plan_key: "candidatGratuit",
    sticker: "Candidat",
    title: "Gratuit",
    location: "Cameroun",
    price_label: "0 FCFA / mois",
    highlight: "2 premiers thèmes CEMAC + quiz limités",
    description:
      "Découvrez CODAKIS : cours illustrés, quiz thématiques et accès à l'annuaire des auto-écoles agréées. La conduite pratique se souscrit chez une auto-école partenaire.",
    cta_label: "Commencer",
    cta_href: "/themes",
  },
  {
    plan_key: "candidatPremium",
    sticker: "Candidat",
    title: "Premium théorique",
    location: "Cameroun",
    price_label: "2 500 FCFA / mois",
    highlight: "Populaire — 10 thèmes CEMAC + examens blancs illimités",
    description:
      "Révision complète alignée Code Rousseau Cameroun : cahier d'erreurs, indice de réussite (40 questions / 30 min / 5 fautes max.) et mode hors-ligne.",
    cta_label: "S'abonner",
    cta_href: "/contact",
  },
  {
    plan_key: "autoEcolePartenaire",
    sticker: "Auto-école",
    title: "Annuaire partenaire",
    location: "Cameroun — CEMAC",
    price_label: "Gratuit",
    highlight: "Inscription gratuite dans l'annuaire agréé CODAKIS",
    description:
      "Publiez vos forfaits (code seul, conduite seule, complet), recevez des candidats qualifiés et encaissez par Mobile Money. CODAKIS prélève une commission uniquement sur les inscriptions payées.",
    cta_label: "Inscrire mon auto-école",
    cta_href: "/inscription-auto-ecole",
  },
  {
    plan_key: "autoEcolePremium",
    sticker: "Auto-école",
    title: "Espace gérant",
    location: "Cameroun",
    price_label: "Commission sur inscriptions",
    highlight: "Espace moniteur, planning créneaux et statistiques de réussite",
    description:
      "Gestion des inscriptions, affectation moniteurs, calendrier partagé candidat/moniteur et tableau de bord pour auto-écoles multi-moniteurs. Aucun abonnement mensuel : commission sur les ventes uniquement.",
    cta_label: "Devenir partenaire",
    cta_href: "/inscription-auto-ecole",
  },
];

export const MOCK_DOMAINS: PublicDomainItem[] = [
  { id: "1", code: "signalisation", label: "Signalisation routière", technician_count: 0 },
  { id: "2", code: "priorites", label: "Priorités et intersections", technician_count: 0 },
  { id: "3", code: "circulation", label: "Règles de circulation", technician_count: 0 },
  { id: "4", code: "vitesse", label: "Vitesse et distances de sécurité", technician_count: 0 },
  { id: "5", code: "stationnement", label: "Arrêt et stationnement", technician_count: 0 },
  { id: "6", code: "vehicule", label: "Véhicule, éclairage et équipements", technician_count: 0 },
  { id: "7", code: "documents", label: "Documents et contrôles", technician_count: 0 },
  { id: "8", code: "comportement", label: "Comportement, alcool et substances", technician_count: 0 },
  { id: "9", code: "usagers", label: "Usagers vulnérables", technician_count: 0 },
  { id: "10", code: "contexte_local", label: "Particularités camerounaises et CEMAC", technician_count: 0 },
];
