import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (page > 3) pages.push("ellipsis");

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }

  if (page < totalPages - 2) pages.push("ellipsis");

  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const { t } = useTranslation();
  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);
  const pages = getPageNumbers(page, totalPages);
  const showControls = totalPages > 1;

  return (
    <nav
      className={`fj-pagination${className ? ` ${className}` : ""}`}
      aria-label={t("pagination.aria")}
    >
      <p className="fj-pagination__summary">
        {t("pagination.summary", { from: firstItem, to: lastItem, total })}
      </p>

      {showControls ? (
      <div className="fj-pagination__controls">
        <button
          type="button"
          className="fj-pagination__arrow"
          disabled={page <= 1}
          aria-label={t("pagination.prev")}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
        </button>

        <ol className="fj-pagination__pages">
          {pages.map((item, index) =>
            item === "ellipsis" ? (
              <li key={`ellipsis-${index}`} className="fj-pagination__ellipsis" aria-hidden="true">
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  className={`fj-pagination__page${item === page ? " is-active" : ""}`}
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </button>
              </li>
            ),
          )}
        </ol>

        <button
          type="button"
          className="fj-pagination__arrow"
          disabled={page >= totalPages}
          aria-label={t("pagination.next")}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
      ) : null}
    </nav>
  );
}
