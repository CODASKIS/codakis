import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AuthApiError,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "../../lib/schedulingApi";

function notificationTitle(item: NotificationItem, lang: string): string {
  return lang.startsWith("en") ? item.title_en : item.title_fr;
}

function notificationBody(item: NotificationItem, lang: string): string {
  return lang.startsWith("en") ? item.body_en : item.body_fr;
}

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((item) => !item.lu).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchNotifications());
    } catch (err) {
      if (!(err instanceof AuthApiError)) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) await load();
  }

  async function readOne(item: NotificationItem) {
    if (item.lu) return;
    try {
      await markNotificationRead(item.id);
      setItems((current) => current.map((n) => (n.id === item.id ? { ...n, lu: true } : n)));
    } catch {
      /* ignore */
    }
  }

  async function readAll() {
    try {
      await markAllNotificationsRead();
      setItems((current) => current.map((n) => ({ ...n, lu: true })));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="codakis-notif-bell" ref={rootRef}>
      <button
        type="button"
        className="codakis-notif-bell__trigger"
        aria-label={t("notifications.title")}
        aria-expanded={open}
        onClick={() => void toggleOpen()}
      >
        <Bell size={22} strokeWidth={1.75} aria-hidden />
        {unreadCount > 0 ? (
          <span className="codakis-notif-bell__badge" aria-hidden>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="codakis-notif-bell__menu" role="menu">
          <div className="codakis-notif-bell__menu-head">
            <strong>{t("notifications.title")}</strong>
            {unreadCount > 0 ? (
              <button type="button" className="codakis-notif-bell__mark-all" onClick={() => void readAll()}>
                {t("notifications.markAllRead")}
              </button>
            ) : null}
          </div>

          {loading && items.length === 0 ? (
            <p className="codakis-notif-bell__empty">{t("notifications.loading")}</p>
          ) : items.length === 0 ? (
            <p className="codakis-notif-bell__empty">{t("notifications.empty")}</p>
          ) : (
            <ul className="codakis-notif-bell__list">
              {items.slice(0, 20).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`codakis-notif-bell__item${item.lu ? "" : " is-unread"}`}
                    onClick={() => void readOne(item)}
                  >
                    <span className="codakis-notif-bell__item-title">{notificationTitle(item, i18n.language)}</span>
                    <span className="codakis-notif-bell__item-body">{notificationBody(item, i18n.language)}</span>
                    <span className="codakis-notif-bell__item-date">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
