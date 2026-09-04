import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { clearSession, getSession } from "../../auth/authStore";
import { getUserAvatarUrl } from "../../lib/uiAvatars";
import { Dropdown } from "../ui/Dropdown";
import { DropdownItem } from "../ui/DropdownItem";

type Props = {
  profileTo: string;
};

export default function UserDropdown({ profileTo }: Props) {
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
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="dropdown-toggle flex items-center gap-2 rounded-full py-1 pr-2 pl-1 text-gray-700 transition hover:bg-brand-50"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-brand-100">
          <img
            src={getUserAvatarUrl(name, 44, session?.avatarUrl)}
            alt=""
            className="h-full w-full object-cover"
          />
        </span>
        <span className="hidden max-w-[12rem] truncate text-[1.4rem] font-extrabold text-gray-800 sm:block">
          {name}
        </span>
        <ChevronDown
          size={18}
          className={`hidden text-gray-500 transition-transform sm:block ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={close}
        className="ta-user-dropdown flex w-[26rem] flex-col p-3"
      >
        <div className="border-b border-gray-100 px-3 pb-3">
          <p className="truncate text-[1.5rem] font-extrabold text-gray-800">{name}</p>
          <p className="mt-0.5 truncate text-[1.25rem] font-semibold text-gray-500">{email}</p>
        </div>

        <ul className="flex flex-col gap-1 py-2">
          <li>
            <DropdownItem tag="a" to={profileTo} onItemClick={close} className="text-[1.35rem]">
              <UserRound size={20} className="text-brand-600" />
              Mon profil
            </DropdownItem>
          </li>
        </ul>

        <DropdownItem onClick={logout} className="mt-1 border-t border-gray-100 pt-2 text-[1.35rem] text-error-600 hover:bg-error-50 hover:text-error-700">
          <LogOut size={20} />
          Déconnexion
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
