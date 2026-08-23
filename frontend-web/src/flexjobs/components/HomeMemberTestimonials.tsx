import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FJ_IMG } from "../assets/online-images";

export type MemberTestimonial = {
  quote: string;
  highlights: readonly string[];
  author: string;
  role: string;
  photoUrl: string;
};

const TESTIMONIAL_PHOTOS = [
  ...FJ_IMG.checkoutTestimonialAvatars,
  "https://images.unsplash.com/photo-1580489944761-652a1e125124?auto=format&fit=crop&w=160&h=160&q=80",
] as const;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedQuote(quote: string, highlights: readonly string[]) {
  if (highlights.length === 0) return quote;

  const pattern = highlights.map(escapeRegExp).join("|");
  const parts = quote.split(new RegExp(`(${pattern})`, "gi"));

  return parts.map((part, index) => {
    const isHighlight = highlights.some((item) => item.toLowerCase() === part.toLowerCase());
    if (!isHighlight) return part;
    return (
      <mark key={`${part}-${index}`} className="fj-member-testimonials__highlight">
        {part}
      </mark>
    );
  });
}

type HomeMemberTestimonialsProps = {
  items?: readonly MemberTestimonial[];
  autoPlayMs?: number;
};

type TranslatedTestimonial = {
  quote: string;
  highlights: string[];
  author: string;
  role: string;
};

export default function HomeMemberTestimonials({
  items,
  autoPlayMs = 6000,
}: HomeMemberTestimonialsProps) {
  const { t } = useTranslation();

  const translatedItems = useMemo(() => {
    const raw = t("homeMemberTestimonials.items", { returnObjects: true }) as TranslatedTestimonial[];
    return raw.map((item, index) => ({
      ...item,
      highlights: item.highlights ?? [],
      photoUrl: TESTIMONIAL_PHOTOS[index] ?? TESTIMONIAL_PHOTOS[0],
    }));
  }, [t]);

  const testimonials = useMemo(
    () => [...(items ?? translatedItems)],
    [items, translatedItems],
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [slideOffset, setSlideOffset] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 992px)");

    const syncMotion = () => setReduceMotion(motionQuery.matches);
    const syncVisible = () => setVisibleCount(desktopQuery.matches ? 3 : 2);

    syncMotion();
    syncVisible();

    motionQuery.addEventListener("change", syncMotion);
    desktopQuery.addEventListener("change", syncVisible);

    return () => {
      motionQuery.removeEventListener("change", syncMotion);
      desktopQuery.removeEventListener("change", syncVisible);
    };
  }, []);

  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const firstSlide = track.querySelector<HTMLElement>(".fj-member-testimonials__card");
      if (!firstSlide) return;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0");
      setSlideOffset(startIndex * (firstSlide.offsetWidth + gap));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [startIndex, visibleCount, testimonials.length]);

  useEffect(() => {
    if (reduceMotion || autoPlayMs <= 0) return;

    const timer = window.setInterval(() => {
      setStartIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, autoPlayMs);

    return () => window.clearInterval(timer);
  }, [autoPlayMs, maxIndex, reduceMotion]);

  function goPrev() {
    setStartIndex((current) => (current <= 0 ? maxIndex : current - 1));
  }

  function goNext() {
    setStartIndex((current) => (current >= maxIndex ? 0 : current + 1));
  }

  return (
    <section className="fj-member-testimonials" aria-labelledby="member-testimonials-title">
      <span className="fj-member-testimonials__decor fj-member-testimonials__decor--left" aria-hidden="true" />
      <span className="fj-member-testimonials__decor fj-member-testimonials__decor--right" aria-hidden="true" />

      <div className="fj-container fj-member-testimonials__inner">
        <div className="fj-member-testimonials__rating" aria-label={t("homeMemberTestimonials.ratingLabel")}>
          <strong>{t("homeMemberTestimonials.ratingStrong")}</strong>
          <div className="fj-member-testimonials__stars" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={18} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <span>{t("homeMemberTestimonials.ratingCount")}</span>
        </div>

        <h2 id="member-testimonials-title">{t("homeMemberTestimonials.title")}</h2>

        <div className="fj-member-testimonials__carousel">
          <div className="fj-member-testimonials__viewport">
            <div
              ref={trackRef}
              className={`fj-member-testimonials__track${reduceMotion ? " is-reduced-motion" : ""}`}
              style={{ transform: `translate3d(-${slideOffset}px, 0, 0)` }}
            >
              {testimonials.map((item) => (
                <TestimonialCard key={`${item.author}-${item.role}`} item={item} />
              ))}
            </div>
          </div>

          <div className="fj-member-testimonials__nav">
            <button
              type="button"
              className="fj-member-testimonials__nav-btn"
              onClick={goPrev}
              aria-label={t("homeMemberTestimonials.prevAria")}
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="fj-member-testimonials__nav-btn fj-member-testimonials__nav-btn--primary"
              onClick={goNext}
              aria-label={t("homeMemberTestimonials.nextAria")}
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: MemberTestimonial }) {
  return (
    <article className="fj-member-testimonials__card">
      <div className="fj-member-testimonials__card-stars" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} size={16} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <blockquote className="fj-member-testimonials__quote">
        <p>{renderHighlightedQuote(item.quote, item.highlights)}</p>
      </blockquote>
      <footer className="fj-member-testimonials__footer">
        <img
          src={item.photoUrl}
          alt=""
          className="fj-member-testimonials__avatar fj-member-testimonials__avatar--photo"
          width={48}
          height={48}
          loading="lazy"
        />
        <div>
          <strong>{item.author}</strong>
          <span>{item.role}</span>
        </div>
      </footer>
      <span className="fj-member-testimonials__mark" aria-hidden="true">
        &rdquo;
      </span>
    </article>
  );
}
