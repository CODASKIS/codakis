import type { ReactNode } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type DashboardPageShellProps = {
  title: string;
  description?: string;
  metaTitle?: string;
  homeHref?: string;
  homeLabel?: string;
  breadcrumbItems?: BreadcrumbItem[];
  hideHeading?: boolean;
  beforeBreadcrumb?: ReactNode;
  children: ReactNode;
};

export default function DashboardPageShell({
  title,
  description,
  metaTitle,
  homeHref = "/",
  homeLabel = "Accueil",
  breadcrumbItems,
  hideHeading = false,
  beforeBreadcrumb,
  children,
}: DashboardPageShellProps) {
  const crumbs =
    breadcrumbItems ??
    ([
      { label: homeLabel, to: homeHref },
      { label: title },
    ] satisfies BreadcrumbItem[]);

  return (
    <>
      <PageMeta
        title={`${metaTitle ?? title} | CODAKIS`}
        description={description ?? title}
      />
      {beforeBreadcrumb}
      <nav className="fj-breadcrumb" aria-label="Fil d'Ariane">
        <ol>
          {crumbs.map((item, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={`${item.label}-${index}`} className={isLast ? "active" : undefined} aria-current={isLast ? "page" : undefined}>
                {item.to && !isLast ? <Link to={item.to}>{item.label}</Link> : item.label}
              </li>
            );
          })}
        </ol>
      </nav>
      {hideHeading ? null : (
        <>
          <h1 className="fj-account-title">{title}</h1>
          {description ? <p className="fj-page-desc">{description}</p> : null}
        </>
      )}
      {children}
    </>
  );
}
