import type { CSSProperties } from "react";

export type TestimonialItem = {
  quote: string;
  author: string;
  location: string;
};

type TestimonialsSliderProps = {
  items: readonly TestimonialItem[];
  durationSeconds?: number;
};

export default function TestimonialsSlider({ items, durationSeconds = 20 }: TestimonialsSliderProps) {
  if (items.length === 0) return null;

  const slideCount = items.length;
  const trackWidth = slideCount * 100;
  const slideWidth = 100 / slideCount;

  return (
    <section
      className="fj-testimonials-slider"
      aria-label="Témoignages clients"
      style={
        {
          "--fj-slider-count": slideCount,
          "--fj-slider-track-width": `${trackWidth}%`,
          "--fj-slider-slide-width": `${slideWidth}%`,
          "--fj-slider-duration": `${durationSeconds}s`,
        } as CSSProperties
      }
    >
      <div className="fj-testimonials-slider__viewport">
        <figure className="fj-testimonials-slider__track">
          {items.map((item) => (
            <blockquote key={`${item.author}-${item.location}`} className="fj-testimonials-slider__slide">
              <p>{item.quote}</p>
              <footer>
                — <cite>{item.author}</cite>
                <span className="fj-testimonials-slider__location">{item.location}</span>
              </footer>
            </blockquote>
          ))}
        </figure>
      </div>
    </section>
  );
}
