import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Form, ListGroup } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { authFetch } from "@/lib/authApi";

function resultHref(item) {
  if (item.type === "user") return `/admin/utilisateurs/${item.id}`;
  if (item.type === "school") return `/admin/auto-ecoles/${item.id}`;
  return `/admin/paiements?ref=${encodeURIComponent(item.id)}`;
}

function resultIcon(type) {
  if (type === "user") return "user";
  if (type === "school") return "home";
  return "credit-card";
}

export default function AdminGlobalSearch({ onNavigate }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  const runSearch = useCallback(async (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError("");

    try {
      const data = await authFetch(`/api/v1/admin/search?q=${encodeURIComponent(trimmed)}`);
      if (requestIdRef.current !== requestId) return;
      setResults(data.results ?? []);
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setResults([]);
      setError(err instanceof Error ? err.message : t("admin.search.error"));
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runSearch(query);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query, runSearch]);

  const grouped = useMemo(() => {
    const groups = { user: [], school: [], payment: [] };
    results.forEach((item) => {
      if (groups[item.type]) groups[item.type].push(item);
    });
    return groups;
  }, [results]);

  function handleSelect(item) {
    navigate(resultHref(item));
    onNavigate?.();
  }

  const typeLabels = {
    user: t("admin.search.groupUsers"),
    school: t("admin.search.groupSchools"),
    payment: t("admin.search.groupPayments"),
  };

  const hasQuery = query.trim().length >= 2;

  return (
    <div className="codakis-admin-search">
      <Form className="codakis-admin-search__form" onSubmit={(event) => event.preventDefault()}>
        <div className="codakis-admin-search__field">
          <FeatherIcon icon="search" aria-hidden />
          <Form.Control
            type="search"
            className="codakis-admin-search__input"
            placeholder={t("admin.search.placeholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
            aria-label={t("admin.search.placeholder")}
          />
        </div>
      </Form>

      <div className="codakis-admin-search__results">
        {loading ? <p className="codakis-admin-search__hint">{t("admin.search.loading")}</p> : null}
        {error ? <p className="codakis-admin-search__error">{error}</p> : null}
        {!loading && !error && hasQuery && results.length === 0 ? (
          <p className="codakis-admin-search__hint">{t("admin.search.empty")}</p>
        ) : null}

        {["user", "school", "payment"].map((type) =>
          grouped[type].length > 0 ? (
            <section key={type} className="codakis-admin-search__group">
              <h6>{typeLabels[type]}</h6>
              <ListGroup variant="flush">
                {grouped[type].map((item) => (
                  <ListGroup.Item
                    key={`${item.type}-${item.id}`}
                    action
                    as="button"
                    type="button"
                    className="codakis-admin-search__item"
                    onClick={() => handleSelect(item)}
                  >
                    <FeatherIcon icon={resultIcon(item.type)} size={16} />
                    <span className="codakis-admin-search__item-copy">
                      <strong>{item.label}</strong>
                      {item.subtitle ? <small>{item.subtitle}</small> : null}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </section>
          ) : null,
        )}

        {!hasQuery ? (
          <p className="codakis-admin-search__hint">{t("admin.search.hint")}</p>
        ) : null}
      </div>

      <div className="codakis-admin-search__footer">
        <Link to="/admin/utilisateurs" className="codakis-admin-search__link" onClick={onNavigate}>
          {t("admin.search.browseUsers")}
        </Link>
        <Link to="/admin/auto-ecoles" className="codakis-admin-search__link" onClick={onNavigate}>
          {t("admin.search.browseSchools")}
        </Link>
        <Link to="/admin/paiements" className="codakis-admin-search__link" onClick={onNavigate}>
          {t("admin.search.browsePayments")}
        </Link>
      </div>
    </div>
  );
}
