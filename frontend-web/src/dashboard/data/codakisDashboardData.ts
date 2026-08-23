import type { TFunction } from "i18next";
import type { UserRole } from "../../auth/types";
import { getCandidateEnrollment, isCandidateEnrolled } from "../../auth/candidateEnrollment";

export type FlatMetric = {
  title: string;
  icon: string;
  value: string;
};

export type ProductMetric = {
  title: string;
  primaryText: string;
  icon: string;
  variant?: "primary" | "dark";
};

export type TableRow = {
  name: string;
  status: { badge: string; label: string };
  price: string;
  action: { icon: string; textcls: string; link: string }[];
};

export type FeedItem = {
  icon: string;
  heading: string;
  publishon: string;
  link?: string;
  bgclass?: string;
};

export type FooterStat = { value: string; label: string };

export type RoleDashboardData = {
  flatCards: FlatMetric[];
  supportPrimary: { value: string; label: string; hint: string; footer: FooterStat[] };
  supportSecondary: { value: string; label: string; hint: string; footer: FooterStat[] };
  chartTitle: string;
  chartTotal: string;
  chartAverage: string;
  pieTitle: string;
  pieHint: string;
  productCards: ProductMetric[];
  tableTitle: string;
  tableHeading: string[];
  tableRows: TableRow[];
  feedTitle: string;
  feedItems: FeedItem[];
};

const CONSORT_PIECES = ["id", "birth", "medical", "photos", "address", "stamps"] as const;

const CONSORT_STATUS = [
  { badge: "light-success", labelKey: "validated" },
  { badge: "light-success", labelKey: "validated" },
  { badge: "light-success", labelKey: "validated" },
  { badge: "light-success", labelKey: "validated" },
  { badge: "light-warning", labelKey: "pending" },
  { badge: "light-danger", labelKey: "missing" },
] as const;

function buildConsortTableRows(t: TFunction): TableRow[] {
  return CONSORT_PIECES.map((key, index) => ({
    name: t(`consort.pieces.${key}.title`),
    status: {
      badge: CONSORT_STATUS[index].badge,
      label: t(`dashboard.consort.status.${CONSORT_STATUS[index].labelKey}`),
    },
    price: index < 4 ? "15/03/2026" : index === 4 ? "—" : "—",
    action: [{ icon: "eye", textcls: "primary", link: "/espace/candidat/consort" }],
  }));
}

export function getRoleDashboardData(role: UserRole, t: TFunction): RoleDashboardData {
  if (role === "admin") {
    return {
      flatCards: [
        { title: t("dashboard.admin.stats.schools"), icon: "school", value: "24" },
        { title: t("dashboard.admin.stats.candidates"), icon: "group", value: "1 842" },
        { title: t("dashboard.widgets.newEnrollments"), icon: "person_add", value: "+127" },
        { title: t("dashboard.admin.stats.payments"), icon: "payments", value: "12,4 M" },
        { title: t("dashboard.widgets.pendingMint"), icon: "verified", value: "3" },
        { title: t("dashboard.admin.stats.success"), icon: "trending_up", value: "78 %" },
      ],
      supportPrimary: {
        value: "78 %",
        label: t("dashboard.widgets.avgSuccess"),
        hint: t("dashboard.widgets.avgSuccessHint"),
        footer: [
          { value: "74 %", label: "2024" },
          { value: "76 %", label: "2025" },
          { value: "78 %", label: "2026" },
        ],
      },
      supportSecondary: {
        value: "312",
        label: t("dashboard.widgets.monthlyEnrollments"),
        hint: t("dashboard.widgets.monthlyEnrollmentsHint"),
        footer: [
          { value: "98", label: "Jan" },
          { value: "104", label: "Fév" },
          { value: "110", label: "Mar" },
        ],
      },
      chartTitle: t("dashboard.widgets.paymentsChart"),
      chartTotal: "12,4 M FCFA",
      chartAverage: "1,03 M",
      pieTitle: t("dashboard.widgets.schoolDistribution"),
      pieHint: t("dashboard.widgets.schoolDistributionHint"),
      productCards: [
        { title: t("dashboard.admin.stats.schools"), primaryText: "24", icon: "domain" },
        { variant: "dark", title: t("dashboard.admin.stats.candidates"), primaryText: "1 842", icon: "groups" },
        { variant: "primary", title: t("dashboard.admin.stats.payments"), primaryText: "12,4 M", icon: "account_balance_wallet" },
        { title: t("dashboard.admin.stats.success"), primaryText: "78 %", icon: "emoji_events" },
      ],
      tableTitle: t("dashboard.widgets.recentSchools"),
      tableHeading: [
        t("dashboard.widgets.colSchool"),
        t("dashboard.widgets.colStatus"),
        t("dashboard.widgets.colCandidates"),
        t("dashboard.widgets.colAction"),
      ],
      tableRows: [
        { name: "Auto-École Horizon", status: { badge: "light-success", label: "Agréée" }, price: "142", action: [{ icon: "eye", textcls: "primary", link: "#" }] },
        { name: "Permis Plus Yaoundé", status: { badge: "light-success", label: "Agréée" }, price: "98", action: [{ icon: "eye", textcls: "primary", link: "#" }] },
        { name: "Conduite Express", status: { badge: "light-warning", label: "En attente MINT" }, price: "—", action: [{ icon: "eye", textcls: "primary", link: "#" }] },
      ],
      feedTitle: t("dashboard.admin.recentTitle"),
      feedItems: [
        { icon: "check-circle", heading: "Agrément MINT validé — Auto-École Horizon", publishon: t("dashboard.widgets.timeToday"), bgclass: "light-success" },
        { icon: "credit-card", heading: "Paiement Mobile Money 45 000 FCFA", publishon: t("dashboard.widgets.time2h"), bgclass: "light-primary" },
        { icon: "user-plus", heading: "12 nouvelles inscriptions candidats", publishon: t("dashboard.widgets.timeYesterday") },
      ],
    };
  }

  if (role === "moniteur") {
    return {
      flatCards: [
        { title: t("dashboard.moniteur.stats.students"), icon: "group", value: "12" },
        { title: t("dashboard.moniteur.stats.slots"), icon: "event", value: "8" },
        { title: t("dashboard.moniteur.stats.week"), icon: "schedule", value: "18 h" },
        { title: t("dashboard.moniteur.stats.rate"), icon: "thumb_up", value: "85 %" },
        { title: t("dashboard.widgets.lessonsToday"), icon: "directions_car", value: "3" },
        { title: t("dashboard.widgets.evaluations"), icon: "star", value: "4,8/5" },
      ],
      supportPrimary: {
        value: "85 %",
        label: t("dashboard.widgets.attendanceRate"),
        hint: t("dashboard.widgets.attendanceRateHint"),
        footer: [
          { value: "82 %", label: "Lun" },
          { value: "88 %", label: "Mar" },
          { value: "85 %", label: "Mer" },
        ],
      },
      supportSecondary: {
        value: "18 h",
        label: t("dashboard.moniteur.stats.week"),
        hint: t("dashboard.widgets.plannedHoursHint"),
        footer: [
          { value: "6 h", label: "S1" },
          { value: "6 h", label: "S2" },
          { value: "6 h", label: "S3" },
        ],
      },
      chartTitle: t("dashboard.widgets.lessonsChart"),
      chartTotal: "18 h",
      chartAverage: "6 h/sem.",
      pieTitle: t("dashboard.widgets.studentLevels"),
      pieHint: t("dashboard.widgets.studentLevelsHint"),
      productCards: [
        { title: t("dashboard.moniteur.stats.students"), primaryText: "12", icon: "groups" },
        { variant: "dark", title: t("dashboard.moniteur.stats.slots"), primaryText: "8", icon: "event_available" },
        { variant: "primary", title: t("dashboard.moniteur.stats.week"), primaryText: "18 h", icon: "timer" },
        { title: t("dashboard.moniteur.stats.rate"), primaryText: "85 %", icon: "verified" },
      ],
      tableTitle: t("dashboard.widgets.upcomingLessons"),
      tableHeading: [t("dashboard.widgets.colStudent"), t("dashboard.widgets.colDate"), t("dashboard.widgets.colStatus"), t("dashboard.widgets.colDuration"), t("dashboard.widgets.colAction")],
      tableRows: [
        { name: "Marie N.", status: { badge: "light-success", label: t("dashboard.widgets.statusConfirmed") }, price: "Lun 14h", action: [{ icon: "eye", textcls: "primary", link: "#" }] },
        { name: "Paul K.", status: { badge: "light-warning", label: t("dashboard.widgets.statusPending") }, price: "Mar 10h", action: [{ icon: "eye", textcls: "primary", link: "#" }] },
        { name: "Sarah M.", status: { badge: "light-success", label: t("dashboard.widgets.statusConfirmed") }, price: "Mer 16h", action: [{ icon: "eye", textcls: "primary", link: "#" }] },
      ],
      feedTitle: t("dashboard.moniteur.scheduleTitle"),
      feedItems: [
        { icon: "calendar", heading: "Créneau confirmé — Marie N., lundi 14h", publishon: t("dashboard.widgets.timeToday"), bgclass: "light-success" },
        { icon: "bell", heading: "Rappel : évaluation fin de séance Paul K.", publishon: t("dashboard.widgets.time2h") },
        { icon: "message-circle", heading: "Message auto-école : planning mis à jour", publishon: t("dashboard.widgets.timeYesterday") },
      ],
    };
  }

  if (role === "gerant") {
    return {
      flatCards: [
        { title: t("dashboard.gerant.stats.enrollments"), icon: "person_add", value: "37" },
        { title: t("dashboard.gerant.stats.revenue"), icon: "payments", value: "2,8 M" },
        { title: t("dashboard.gerant.stats.instructors"), icon: "badge", value: "4" },
        { title: t("dashboard.gerant.stats.success"), icon: "emoji_events", value: "80 %" },
        { title: t("dashboard.widgets.activePacks"), icon: "local_offer", value: "6" },
        { title: t("dashboard.widgets.openSlots"), icon: "event", value: "24" },
      ],
      supportPrimary: {
        value: "80 %",
        label: t("dashboard.gerant.stats.success"),
        hint: t("dashboard.widgets.schoolSuccessHint"),
        footer: [
          { value: "75 %", label: "2024" },
          { value: "78 %", label: "2025" },
          { value: "80 %", label: "2026" },
        ],
      },
      supportSecondary: {
        value: "2,8 M",
        label: t("dashboard.gerant.stats.revenue"),
        hint: t("dashboard.widgets.revenueHint"),
        footer: [
          { value: "820 K", label: "Jan" },
          { value: "960 K", label: "Fév" },
          { value: "1,02 M", label: "Mar" },
        ],
      },
      chartTitle: t("dashboard.widgets.enrollmentsChart"),
      chartTotal: "37",
      chartAverage: "+5",
      pieTitle: t("dashboard.widgets.packDistribution"),
      pieHint: t("dashboard.widgets.packDistributionHint"),
      productCards: [
        { title: t("dashboard.gerant.stats.enrollments"), primaryText: "37", icon: "groups" },
        { variant: "dark", title: t("dashboard.gerant.stats.revenue"), primaryText: "2,8 M", icon: "account_balance_wallet" },
        { variant: "primary", title: t("dashboard.gerant.stats.instructors"), primaryText: "4", icon: "supervisor_account" },
        { title: t("dashboard.gerant.stats.success"), primaryText: "80 %", icon: "trending_up" },
      ],
      tableTitle: t("dashboard.gerant.inboxTitle"),
      tableHeading: [t("dashboard.widgets.colCandidate"), t("dashboard.widgets.colPack"), t("dashboard.widgets.colStatus"), t("dashboard.widgets.colAmount"), t("dashboard.widgets.colAction")],
      tableRows: [
        { name: "Jean B.", status: { badge: "light-success", label: t("dashboard.widgets.statusPaid") }, price: "Complet", action: [{ icon: "eye", textcls: "primary", link: "#" }] },
        { name: "Aïcha D.", status: { badge: "light-warning", label: t("dashboard.widgets.statusPending") }, price: "Code seul", action: [{ icon: "eye", textcls: "primary", link: "#" }] },
        { name: "Eric F.", status: { badge: "light-success", label: t("dashboard.widgets.statusPaid") }, price: "Conduite", action: [{ icon: "eye", textcls: "primary", link: "#" }] },
      ],
      feedTitle: t("dashboard.gerant.inboxTitle"),
      feedItems: [
        { icon: "user-plus", heading: "Nouvelle inscription — Jean B., forfait Complet", publishon: t("dashboard.widgets.timeToday"), bgclass: "light-success" },
        { icon: "credit-card", heading: "Paiement Mobile Money reçu — 185 000 FCFA", publishon: t("dashboard.widgets.time2h"), bgclass: "light-primary" },
        { icon: "file-text", heading: "Dossier Consort incomplet — Aïcha D.", publishon: t("dashboard.widgets.timeYesterday") },
      ],
    };
  }

  // candidat (default)
  const enrollment = getCandidateEnrollment();
  const enrolled = isCandidateEnrolled();
  const schoolShort =
    enrolled && enrollment?.schoolName
      ? enrollment.schoolName.length > 22
        ? `${enrollment.schoolName.slice(0, 20)}…`
        : enrollment.schoolName
      : t("dashboard.enrollment.notEnrolled");

  return {
    flatCards: [
      { title: t("dashboard.candidat.stats.progress"), icon: "menu_book", value: "42 %" },
      { title: t("dashboard.widgets.themesDone"), icon: "check_circle", value: "6/10" },
      { title: t("dashboard.nav.mySchool"), icon: "domain", value: schoolShort },
      { title: t("dashboard.widgets.drivingHours"), icon: "directions_car", value: enrolled ? "8 h" : "—" },
      { title: t("dashboard.candidat.stats.exams"), icon: "quiz", value: "34/40" },
      { title: t("dashboard.candidat.stats.consort"), icon: "folder", value: "4/6" },
    ],
    supportPrimary: {
      value: "42 %",
      label: t("dashboard.candidat.stats.progress"),
      hint: t("dashboard.widgets.progressHint"),
      footer: [
        { value: "28 %", label: t("dashboard.widgets.themeSignal") },
        { value: "35 %", label: t("dashboard.widgets.themePriority") },
        { value: "42 %", label: t("dashboard.widgets.themeCirculation") },
      ],
    },
    supportSecondary: {
      value: "4/6",
      label: t("dashboard.candidat.stats.consort"),
      hint: t("dashboard.widgets.consortHint"),
      footer: [
        { value: "4", label: t("dashboard.consort.status.validated") },
        { value: "1", label: t("dashboard.consort.status.pending") },
        { value: "1", label: t("dashboard.consort.status.missing") },
      ],
    },
    chartTitle: t("dashboard.widgets.monthlyProgress"),
    chartTotal: "6/10",
    chartAverage: "72 %",
    pieTitle: t("dashboard.widgets.consortProgress"),
    pieHint: t("dashboard.widgets.consortProgressHint"),
    productCards: [
      { title: t("dashboard.candidat.stats.progress"), primaryText: "42 %", icon: "school" },
      { variant: "dark", title: t("dashboard.candidat.stats.exams"), primaryText: "34/40", icon: "assignment" },
      { variant: "primary", title: t("dashboard.widgets.drivingHours"), primaryText: "8 h", icon: "directions_car" },
      { title: t("dashboard.candidat.stats.consort"), primaryText: "4/6", icon: "folder_shared" },
    ],
    tableTitle: t("dashboard.consort.tableTitle"),
    tableHeading: [
      t("dashboard.consort.colPiece"),
      t("dashboard.widgets.colStatus"),
      t("dashboard.consort.colDate"),
      t("dashboard.widgets.colAction"),
    ],
    tableRows: buildConsortTableRows(t),
    feedTitle: t("dashboard.widgets.recentActivity"),
    feedItems: [
      ...(enrolled && enrollment?.schoolName
        ? [
            {
              icon: "domain",
              heading: t("dashboard.widgets.feedSchool", { school: enrollment.schoolName }),
              publishon: t("dashboard.widgets.timeToday"),
              bgclass: "light-success",
            },
          ]
        : []),
      { icon: "check-circle", heading: t("dashboard.widgets.feedQuiz"), publishon: t("dashboard.widgets.timeToday"), bgclass: "light-success" },
      { icon: "file-text", heading: t("dashboard.widgets.feedConsort"), publishon: t("dashboard.widgets.time2h"), bgclass: "light-primary" },
      { icon: "directions-car", heading: t("dashboard.widgets.feedLesson"), publishon: t("dashboard.widgets.timeYesterday") },
      { icon: "bell", heading: t("dashboard.widgets.feedExam"), publishon: t("dashboard.widgets.time3d") },
    ],
  };
}

export const CONSORT_PIECE_KEYS = CONSORT_PIECES;

export const CONSORT_MOCK_STATUS: Record<(typeof CONSORT_PIECES)[number], "validated" | "pending" | "missing"> = {
  id: "validated",
  birth: "validated",
  medical: "validated",
  photos: "validated",
  address: "pending",
  stamps: "missing",
};
