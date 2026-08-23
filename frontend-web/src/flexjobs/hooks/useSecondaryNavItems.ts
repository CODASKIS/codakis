import { useTranslation } from "react-i18next";

export function useSecondaryNavItems() {
  const { t } = useTranslation();
  return [
    { label: t("nav.themes"), to: "/themes" },
    { label: t("nav.drivingSchools"), to: "/auto-ecoles" },
    { label: t("nav.consort"), to: "/consort" },
    { label: t("nav.blog"), to: "/blog" },
  ] as const;
}
