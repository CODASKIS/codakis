import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import { clearSession, getSession } from "../../auth/authStore";
import UserMenuPanel from "../../components/prefs/UserMenuPanel";
import { getUserAvatarUrl } from "../../lib/uiAvatars";
import { Dropdown } from "../ui/Dropdown";

type Props = {
  profileTo: string;
  preferencesTo: string;
};

/** Même dropdown pill que l’espace candidat (.ck-topbar__avatar-btn). */
export default function UserDropdown({ profileTo, preferencesTo }: Props) {
  const navigate = useNavigate();
  const session = getSession();
  const [isOpen, setIsOpen] = useState(false);
  const name = session?.name || "Utilisateur";
  const email = session?.email || "";

  function close() {
    setIsOpen(false);
  }

  function logout() {
    close();
    clearSession();
    navigate("/connexion");
  }

  return (
    <div className="ck-topbar__profile">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="dropdown-toggle ck-topbar__avatar-btn"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <img
          src={getUserAvatarUrl(name, 40, session?.avatarUrl)}
          alt=""
          width={40}
          height={40}
          style={{ borderRadius: "999px", display: "block" }}
        />
        <span className="ck-topbar__user-name">{name}</span>
        <ChevronDown size={16} aria-hidden className={isOpen ? "rotate-180" : undefined} />
      </button>

      <Dropdown isOpen={isOpen} onClose={close} className="ck-topbar__menu">
        <UserMenuPanel
          name={name}
          email={email}
          avatarUrl={session?.avatarUrl}
          profileTo={profileTo}
          preferencesTo={preferencesTo}
          onClose={close}
          onLogout={logout}
        />
      </Dropdown>
    </div>
  );
}
