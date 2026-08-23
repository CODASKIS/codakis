import RoleSettingsPage from "../../components/RoleSettingsPage";

const GERANT_SECTIONS = [
  { titleKey: "dashboard.settings.sections.notifications.title", descKey: "dashboard.settings.sections.notifications.desc", badgeKey: "dashboard.settings.comingSoon" },
  { titleKey: "dashboard.settings.sections.enrollments.title", descKey: "dashboard.settings.sections.enrollments.desc", badgeKey: "dashboard.settings.comingSoon" },
  { titleKey: "dashboard.settings.sections.payments.title", descKey: "dashboard.settings.sections.payments.desc", badgeKey: "dashboard.settings.comingSoon" },
];

export default function GerantSettingsPage() {
  return (
    <RoleSettingsPage
      titleKey="dashboard.settings.gerantTitle"
      subtitleKey="dashboard.settings.gerantSubtitle"
      sections={GERANT_SECTIONS}
    />
  );
}
