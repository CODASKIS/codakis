import { useEffect, useMemo, useState } from "react";

export const DEFAULT_TABLE_PAGE_SIZE = 10;

export function useTablePagination<T>(
  items: T[],
  options?: { pageSize?: number; resetKey?: string },
) {
  const pageSize = options?.pageSize ?? DEFAULT_TABLE_PAGE_SIZE;
  const resetKey = options?.resetKey ?? "";
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    setPage,
    pageSize,
    total: items.length,
    totalPages,
    paginatedItems,
  };
}
