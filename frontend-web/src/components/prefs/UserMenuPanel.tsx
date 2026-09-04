import { Link } from "react-router";
import { LogOut, Settings2, UserRound } from "lucide-react";
import { getUserAvatarUrl } from "../../lib/uiAvatars";
import type { ReactNode } from "react";

type Props = {
  name: string;
  email?: string;
  avatarUrl?: string | null;
  profileTo: string;
  preferencesTo: string;
  onClose: () => void;
  onLogout: () => void;
  extraLinks?: { to: string; label: string; icon?: ReactNode }[];
};

/** Menu avatar : liens vers profil / page paramètres. */
export default function UserMenuPanel({
  name,
  email = "",
  avatarUrl,
  profileTo,
  preferencesTo,
  onClose,
  onLogout,
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
        </div>
      </div>

      <div className="ck-user-menu__links">
        <Link to={profileTo} role="menuitem" className="ck-user-menu__link" onClick={onClose}>
          <UserRound size={16} aria-hidden /> Compte
        </Link>
        <Link to={preferencesTo} role="menuitem" className="ck-user-menu__link" onClick={onClose}>
          <Settings2 size={16} aria-hidden /> Préférences
        </Link>
        <Link to={profileTo} role="menuitem" className="ck-user-menu__link" onClick={onClose}>
          <UserRound size={16} aria-hidden /> Profil
        </Link>
        {extraLinks.map((link) => (
          <Link key={link.to} to={link.to} role="menuitem" className="ck-user-menu__link" onClick={onClose}>
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      <button type="button" className="ck-user-menu__logout" role="menuitem" onClick={onLogout}>
        <LogOut size={16} aria-hidden /> Se déconnecter
      </button>
    </div>
  );
}
