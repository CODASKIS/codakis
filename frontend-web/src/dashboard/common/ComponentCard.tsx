import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
  desc?: string;
  action?: ReactNode;
};

export default function ComponentCard({ title, children, className = "", desc = "", action }: Props) {
  return (
    <div className={`ta-card ${className}`.trim()}>
      <div className="ta-card__head">
        <div>
          <h3 className="ta-card__title">{title}</h3>
          {desc ? <p className="ta-card__desc">{desc}</p> : null}
        </div>
        {action}
      </div>
      <div className="ta-card__body">{children}</div>
    </div>
  );
}
