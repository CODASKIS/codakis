import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import FeatherIcon from 'feather-icons-react';
import { canUpgradeToPremium, getSession, isPremiumUser } from '@/auth/authStore';
import { getProfilePath } from '@/auth/roles';

const UPGRADE_HREF = '/themes#abonnement';

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function SidebarAccountFoot() {
  const { t } = useTranslation();
  const session = getSession();

  if (!session) return null;

  const profilePath = getProfilePath(session.role);
  const isPremium = isPremiumUser();
  const showOffer = canUpgradeToPremium();
  const initials = getInitials(session.name);

  return (
    <div className="codakis-sidebar-account">
      <Link to={profilePath} className="codakis-sidebar-account__profile">
        <span className="codakis-sidebar-account__avatar" aria-hidden>
          {initials}
        </span>
        <span className="codakis-sidebar-account__meta">
          <strong className="codakis-sidebar-account__name">{session.name}</strong>
          <span className="codakis-sidebar-account__plan">
            {isPremium ? t('dashboard.userMenu.planPremium') : t('dashboard.userMenu.planFree')}
          </span>
        </span>
      </Link>

      {showOffer ? (
        <Link to={UPGRADE_HREF} className="codakis-sidebar-account__offer">
          <FeatherIcon icon="gift" size={16} />
          <span>{t('dashboard.userMenu.claimOffer')}</span>
        </Link>
      ) : null}

      {!showOffer && isPremium && session.role === 'candidat' ? (
        <Link to={UPGRADE_HREF} className="codakis-sidebar-account__offer codakis-sidebar-account__offer--muted">
          <FeatherIcon icon="star" size={16} />
          <span>{t('dashboard.userMenu.managePlan')}</span>
        </Link>
      ) : null}
    </div>
  );
}
