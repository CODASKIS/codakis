import { Clock, Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import Container from "../components/Container";
import SubNav from "../components/SubNav";

type ContactChannel = {
  Icon: LucideIcon;
  title: string;
  lines: Array<{ text: string; href?: string }>;
  meta: string;
};

export default function ContactPage() {
  const { t } = useTranslation();

  const channels: ContactChannel[] = [
    {
      Icon: MessageCircle,
      title: t("contact.channels.chat.title"),
      lines: [
        { text: t("contact.channels.chat.hoursWeek") },
        { text: t("contact.channels.chat.hoursSat") },
      ],
      meta: t("contact.channels.chat.meta"),
    },
    {
      Icon: Phone,
      title: t("contact.channels.phone.title"),
      lines: [
        { text: t("contact.channels.phone.number"), href: "tel:+237600000000" },
        { text: t("contact.channels.phone.hoursWeek") },
        { text: t("contact.channels.phone.hoursSat") },
      ],
      meta: t("contact.channels.phone.meta"),
    },
    {
      Icon: Mail,
      title: t("contact.channels.email.title"),
      lines: [
        { text: t("contact.channels.email.send"), href: "mailto:contact@codakis.cm" },
        { text: t("contact.channels.email.hint") },
      ],
      meta: t("contact.channels.email.meta"),
    },
  ];

  return (
    <>
      <PageMeta title={t("contact.metaTitle")} description={t("contact.metaDescription")} />
      <SubNav
        activePath="/contact"
        items={[
          { label: t("contact.navHowItWorks"), to: "/comment-ca-marche" },
          { label: t("contact.navAbout"), to: "/a-propos" },
          { label: t("contact.navContact"), to: "/contact" },
        ]}
      />

      <section className="fj-section">
        <Container>
          <div className="fj-contact-intro">
            <h1>{t("contact.title")}</h1>
            <p>
              {t("contact.introBefore")}{" "}
              <Link to="/guide/candidat" className="fj-link">
                {t("contact.introFaqLink")}
              </Link>{" "}
              {t("contact.introAfter")}
            </p>
          </div>

          <div className="fj-contact-cards">
            {channels.map(({ Icon, title, lines, meta }) => (
              <article key={title} className="fj-contact-card">
                <div className="fj-contact-card__body">
                  <div className="fj-contact-card__icon" aria-hidden="true">
                    <Icon size={56} strokeWidth={1.25} />
                  </div>
                  <div className="fj-contact-card__content">
                    <h2>{title}</h2>
                    {lines.map((line) =>
                      line.href ? (
                        <p key={line.text}>
                          <a href={line.href} className="fj-link">
                            {line.text}
                          </a>
                        </p>
                      ) : (
                        <p key={line.text}>{line.text}</p>
                      ),
                    )}
                  </div>
                </div>
                <p className="fj-contact-card__meta">
                  <Clock size={16} strokeWidth={2} aria-hidden="true" />
                  {meta}
                </p>
              </article>
            ))}
          </div>

          <div className="fj-contact-inquiries">
            <h2>{t("contact.inquiriesTitle")}</h2>
            <div className="fj-contact-inquiries__grid">
              <article className="fj-contact-inquiry">
                <h3>{t("contact.pressTitle")}</h3>
                <p className="fj-contact-inquiry__text">
                  {t("contact.pressBefore")}{" "}
                  <Link to="/a-propos" className="fj-link">
                    {t("contact.pressAbout")}
                  </Link>{" "}
                  {t("contact.pressAfter")}
                </p>
              </article>
              <article className="fj-contact-inquiry">
                <h3>{t("contact.partnersTitle")}</h3>
                <p className="fj-contact-inquiry__text">{t("contact.partnersBody")}</p>
              </article>
              <article className="fj-contact-inquiry">
                <h3>{t("contact.addressTitle")}</h3>
                <p className="fj-contact-inquiry__text">
                  {t("contact.addressLine1")}
                  <br />
                  {t("contact.addressLine2")}
                  <br />
                  {t("contact.addressLine3")}
                </p>
              </article>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
