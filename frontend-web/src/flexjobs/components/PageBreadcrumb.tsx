import { Link } from "react-router";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type PageBreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  return (
    <ol className="fj-breadcrumb">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className={index === items.length - 1 ? "active" : undefined}>
          {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
        </li>
      ))}
    </ol>
  );
}
