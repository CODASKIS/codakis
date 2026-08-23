import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  sticker?: string;
  className?: string;
};

export default function Card({ children, sticker, className }: CardProps) {
  return (
    <article className={["fj-card", className].filter(Boolean).join(" ")}>
      <div className="fj-card__body">
        {sticker ? <span className="fj-card__sticker">{sticker}</span> : null}
        {children}
      </div>
    </article>
  );
}
