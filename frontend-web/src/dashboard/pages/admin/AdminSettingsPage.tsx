import RoleSettingsPage from "../../components/RoleSettingsPage";

const ADMIN_SECTIONS = [
  { titleKey: "dashboard.settings.sections.platform.title", descKey: "dashboard.settings.sections.platform.desc", badgeKey: "dashboard.settings.comingSoon" },
  { titleKey: "dashboard.settings.sections.email.title", descKey: "dashboard.settings.sections.email.desc", badgeKey: "dashboard.settings.comingSoon" },
  { titleKey: "dashboard.settings.sections.payments.title", descKey: "dashboard.settings.sections.payments.desc", badgeKey: "dashboard.settings.comingSoon" },
  { titleKey: "dashboard.settings.sections.security.title", descKey: "dashboard.settings.sections.security.desc", badgeKey: "dashboard.settings.comingSoon" },
];

export default function AdminSettingsPage() {
  return (
    <RoleSettingsPage
      titleKey="dashboard.settings.adminTitle"
      subtitleKey="dashboard.settings.adminSubtitle"
      sections={ADMIN_SECTIONS}
    />
  );
}
