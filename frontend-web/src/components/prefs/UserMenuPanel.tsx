import type { ReactNode } from "react";
import { Link } from "react-router";
import { LogOut, Settings2, Trophy, UserRound } from "lucide-react";
import { getUserAvatarUrl } from "../../lib/uiAvatars";

type Props = {
  name: string;
  email?: string;
  avatarUrl?: string | null;
  profileTo: string;
  preferencesTo: string;
  onClose: () => void;
  onLogout: () => void;
  niveau?: number;
  points?: number;
  extraLinks?: { to: string; label: string; icon?: ReactNode }[];
};

/** Menu avatar : profil, préférences et actions candidat. */
export default function UserMenuPanel({
  name,
  email = "",
  avatarUrl,
  profileTo,
  preferencesTo,
  onClose,
  onLogout,
  niveau,
  points,
  extraLinks = [],
}: Props) {
  return (
    <div className="ck-user-menu" role="menu">
      <div className="ck-user-menu__head">
        <img
          src={getUserAvatarUrl(name, 52, avatarUrl)}
          alt=""
          width={52}
          height={52}
          className="ck-user-menu__avatar"
        />
        <div className="ck-user-menu__meta">
          <strong title={name}>{name}</strong>
          {email ? <small title={email}>{email}</small> : null}
          {niveau != null ? (
            <span className="ck-user-menu__badge">
              <Trophy size={12} aria-hidden />
              Niveau {niveau}
              {points != null ? ` · ${points} pts` : ""}
            </span>
          ) : null}
        </div>
      </div>

      <div className="ck-user-menu__links">
        <Link to={profileTo} role="menuitem" className="ck-user-menu__link" onClick={onClose}>
          <UserRound size={16} aria-hidden />
          Profil
        </Link>
        <Link to={preferencesTo} role="menuitem" className="ck-user-menu__link" onClick={onClose}>
          <Settings2 size={16} aria-hidden />
          Préférences
        </Link>
        {extraLinks.map((link) => (
          <Link key={link.to} to={link.to} role="menuitem" className="ck-user-menu__link" onClick={onClose}>
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      <button type="button" className="ck-user-menu__logout" role="menuitem" onClick={onLogout}>
        <LogOut size={16} aria-hidden />
        Se déconnecter
      </button>
    </div>
  );
}
