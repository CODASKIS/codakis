type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="ck-empty" style={{ margin: 0 }}>
        {from}–{to} sur {total}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="ck-btn ck-btn--ghost ck-btn--sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Préc.
        </button>
        <button
          type="button"
          className="ck-btn ck-btn--ghost ck-btn--sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Suiv.
        </button>
      </div>
    </div>
  );
}
