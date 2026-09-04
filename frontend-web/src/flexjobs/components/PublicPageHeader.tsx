import type { ReactNode } from "react";

type PublicPageHeaderProps = {
  title: string;
  lead?: string;
  actions?: ReactNode;
  className?: string;
};

export default function PublicPageHeader({ title, lead, actions, className }: PublicPageHeaderProps) {
  return (
    <header className={`ck-page-header${className ? ` ${className}` : ""}`}>
      <div className="ck-page-header__copy">
        <h1 className="ck-page-title">{title}</h1>
        {lead ? <p className="ck-page-lead">{lead}</p> : null}
      </div>
      {actions ? <div className="ck-page-header__actions">{actions}</div> : null}
    </header>
  );
}
