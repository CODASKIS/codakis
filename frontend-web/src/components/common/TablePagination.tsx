import { Pagination } from "react-bootstrap";
import { useTranslation } from "react-i18next";

type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
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

export default function TablePagination({ page, pageSize, total, onPageChange }: TablePaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3 codakis-table-pagination">
      <p className="text-muted small mb-0">
        {t("pagination.summary", { from: firstItem, to: lastItem, total })}
      </p>
      <Pagination size="sm" className="mb-0">
        <Pagination.Prev
          disabled={page <= 1}
          aria-label={t("pagination.prev")}
          onClick={() => onPageChange(page - 1)}
        />
        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <Pagination.Ellipsis key={`ellipsis-${index}`} disabled />
          ) : (
            <Pagination.Item key={item} active={item === page} onClick={() => onPageChange(item)}>
              {item}
            </Pagination.Item>
          ),
        )}
        <Pagination.Next
          disabled={page >= totalPages}
          aria-label={t("pagination.next")}
          onClick={() => onPageChange(page + 1)}
        />
      </Pagination>
    </div>
  );
}
