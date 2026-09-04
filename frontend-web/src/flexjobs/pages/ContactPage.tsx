import { Clock, Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import PublicPageHeader from "../components/PublicPageHeader";

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

      <div className="ck-page">
        <PublicPageHeader
          title={t("contact.title")}
          lead={`${t("contact.introBefore")} ${t("contact.introAfter")}`}
        />

        <div className="ck-home-steps">
          {channels.map(({ Icon, title, lines, meta }) => (
            <article key={title} className="ck-home-step">
              <span className="ck-home-step__num" aria-hidden>
                <Icon size={18} />
              </span>
              <div>
                <h3>{title}</h3>
                {lines.map((line) =>
                  line.href ? (
                    <p key={line.text}>
                      <a href={line.href}>{line.text}</a>
                    </p>
                  ) : (
                    <p key={line.text}>{line.text}</p>
                  ),
                )}
                <p style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "0.6rem" }}>
                  <Clock size={14} aria-hidden /> {meta}
                </p>
              </div>
            </article>
          ))}
        </div>

        <section className="ck-page-section">
          <div className="ck-page-section__head">
            <h2>{t("contact.inquiriesTitle")}</h2>
          </div>
          <div className="ck-pack-grid">
            <article className="ck-pack-card">
              <h3>{t("contact.pressTitle")}</h3>
              <p>
                {t("contact.pressBefore")}{" "}
                <Link to="/a-propos">{t("contact.pressAbout")}</Link> {t("contact.pressAfter")}
              </p>
            </article>
            <article className="ck-pack-card">
              <h3>{t("contact.partnersTitle")}</h3>
              <p>{t("contact.partnersBody")}</p>
            </article>
            <article className="ck-pack-card">
              <h3>{t("contact.addressTitle")}</h3>
              <p>
                {t("contact.addressLine1")}
                <br />
                {t("contact.addressLine2")}
                <br />
                {t("contact.addressLine3")}
              </p>
            </article>
          </div>
        </section>
      </div>
    </>
  );
}
