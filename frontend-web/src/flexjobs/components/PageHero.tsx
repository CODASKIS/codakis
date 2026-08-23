import { Link } from "react-router";
import { FJ_IMG } from "../assets/online-images";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  parent?: string;
  parentHref?: string;
  image?: string;
  children?: React.ReactNode;
};

export default function PageHero({
  title,
  subtitle,
  parent,
  parentHref = "/",
  image = FJ_IMG.pageCover,
  children,
}: PageHeroProps) {
  return (
    <section
      className="fj-hero"
      style={{ backgroundImage: `url('${image}')` }}
    >
      <div className="fj-hero__overlay" />
      <div className="fj-hero__content">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          {parent ? (
            <p className="text-sm text-white/80 mb-2">
              <Link to={parentHref} className="text-white/90 hover:text-white">
                {parent}
              </Link>
              <span className="mx-2">/</span>
              <span>{title}</span>
            </p>
          ) : null}
          <h1 className="fj-hero__title">{title}</h1>
          {subtitle ? <p className="fj-hero__subtitle">{subtitle}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
