import { Clock, Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import Container from "./Container";

export default function HomeUtilityBar() {
  const { t } = useTranslation();

  const items: Array<{
    Icon: typeof Phone;
    value: string;
    hint: string;
    href?: string;
  }> = [
    {
      Icon: Phone,
      value: t("homeUtilityBar.phone"),
      href: "tel:+237600000000",
      hint: t("homeUtilityBar.phoneHint"),
    },
    {
      Icon: Mail,
      value: t("homeUtilityBar.email"),
      href: "mailto:contact@codakis.cm",
      hint: t("homeUtilityBar.emailHint"),
    },
    {
      Icon: Clock,
      value: t("homeUtilityBar.hours"),
      hint: t("homeUtilityBar.hoursHint"),
    },
  ];

  return (
    <section className="fj-home-utility-bar" aria-label={t("homeUtilityBar.ariaLabel")}>
      <Container>
        <ul className="fj-home-utility-bar__list">
          {items.map(({ Icon, value, href, hint }) => (
            <li key={value} className="fj-home-utility-bar__item">
              <span className="fj-home-utility-bar__icon" aria-hidden="true">
                <Icon size={28} strokeWidth={1.5} />
              </span>
              <div className="fj-home-utility-bar__copy">
                {href ? (
                  <a href={href} className="fj-home-utility-bar__value">
                    {value}
                  </a>
                ) : (
                  <p className="fj-home-utility-bar__value">{value}</p>
                )}
                <p className="fj-home-utility-bar__hint">{hint}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
