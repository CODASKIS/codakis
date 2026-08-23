import type { ReactNode } from "react";
import { Link } from "react-router";

export type FaqItem = {
  question: string;
  answer: ReactNode;
};

type FaqAccordionProps = {
  items: FaqItem[];
  defaultOpenIndex?: number;
  className?: string;
};

export function FaqAccordion({
  items,
  defaultOpenIndex = 0,
  className,
}: FaqAccordionProps) {
  const classes = ["fj-faq-accordion", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {items.map((item, index) => (
        <details key={item.question} open={index === defaultOpenIndex}>
          <summary>{item.question}</summary>
          <div className="fj-faq-accordion__answer">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

type FaqAccordionSectionProps = {
  title: string;
  intro?: string;
  items: FaqItem[];
  defaultOpenIndex?: number;
  id?: string;
};

export default function FaqAccordionSection({
  title,
  intro,
  items,
  defaultOpenIndex = 0,
  id,
}: FaqAccordionSectionProps) {
  return (
    <section className="fj-faq-panel" id={id}>
      <div className="fj-faq-panel__header">
        <h2 className="fj-faq-panel__title">{title}</h2>
        <span className="fj-faq-panel__stars" aria-hidden="true">
          <span className="fj-faq-panel__star fj-faq-panel__star--navy">✦</span>
          <span className="fj-faq-panel__star fj-faq-panel__star--accent">✦</span>
        </span>
      </div>

      {intro ? <p className="fj-faq-panel__intro">{intro}</p> : null}

      <FaqAccordion items={items} defaultOpenIndex={defaultOpenIndex} />
    </section>
  );
}

export function FaqAnswerText({
  children,
  linkLabel,
  linkHref,
}: {
  children: ReactNode;
  linkLabel?: string;
  linkHref?: string;
}) {
  return (
    <p className="mb-0">
      {children}
      {linkLabel && linkHref ? (
        <>
          {" "}
          <Link to={linkHref} className="fj-link">
            {linkLabel}
          </Link>
        </>
      ) : null}
    </p>
  );
}

export function faqSectionId(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
