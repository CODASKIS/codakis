import { Link, NavLink, Outlet } from "react-router";
import { CodakisWordmark } from "../../flexjobs/components/BrandLogo";

type NavItem = { to: string; label: string; end?: boolean };

type Props = {
  title: string;
  homeTo: string;
  links: NavItem[];
};

export default function WorkspaceShell({ title, homeTo, links }: Props) {
  return (
    <div className="ck-learn">
      <div className="ck-learn__mobile-bar">
        <Link to={homeTo} className="ck-learn__mobile-brand">
          <CodakisWordmark />
        </Link>
        <strong style={{ fontSize: "1.4rem", textTransform: "uppercase" }}>{title}</strong>
      </div>

      <aside className="ck-learn__sidebar" aria-label={title}>
        <Link to={homeTo} className="ck-learn__brand" aria-label={`CODAKIS — ${title}`}>
          <CodakisWordmark />
        </Link>
        <nav className="ck-learn__side-nav">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ck-learn__side-footer">
          <Link to="/" className="ck-btn ck-btn--ghost ck-btn--block">
            Vitrine
          </Link>
        </div>
      </aside>

      <main className="ck-learn__main">
        <Outlet />
      </main>
    </div>
  );
}
