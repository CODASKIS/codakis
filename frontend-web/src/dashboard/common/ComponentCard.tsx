import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
  desc?: string;
  action?: ReactNode;
};

/** Panneau = structure exacte .ck-schools-panel du site. */
export default function ComponentCard({ title, children, className = "", desc = "", action }: Props) {
  return (
    <section className={`ck-schools-panel ${className}`.trim()}>
      <div className="ck-schools-panel__head" style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h2>{title}</h2>
          {desc ? <p>{desc}</p> : null}
        </div>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}
