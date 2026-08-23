import { NavLink } from "react-router";

type SubNavItem = {
  label: string;
  to: string;
};

type SubNavProps = {
  items: SubNavItem[];
  activePath?: string;
};

export default function SubNav({ items, activePath }: SubNavProps) {
  return (
    <nav className="fj-subnav" aria-label="Navigation secondaire">
      <div className="fj-container">
        <ul>
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  isActive || activePath === item.to ? "active" : undefined
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
