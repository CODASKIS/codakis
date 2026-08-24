import { Lock } from "lucide-react";
import { Alert, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

type PlatformPaywallBannerProps = {
  onSubscribe?: () => void;
};

export default function PlatformPaywallBanner({ onSubscribe }: PlatformPaywallBannerProps) {
  const { t } = useTranslation();

  return (
    <Alert variant="warning" className="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-4">
      <div className="d-flex align-items-start gap-2 flex-grow-1">
        <Lock size={22} strokeWidth={1.75} aria-hidden className="mt-1 flex-shrink-0" />
        <div>
          <strong>{t("candidat.pedagogy.platformPaywallTitle")}</strong>
          <p className="mb-0 small mt-1">{t("candidat.pedagogy.platformPaywallLead")}</p>
        </div>
      </div>
      {onSubscribe ? (
        <Button variant="primary" size="sm" onClick={onSubscribe}>
          {t("dashboard.userMenu.upgradeCta")}
        </Button>
      ) : null}
    </Alert>
  );
}
