import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import FeatherIcon from 'feather-icons-react';
import { canUpgradeToPremium, getSession, isPremiumUser } from '@/auth/authStore';
import { getProfilePath } from '@/auth/roles';
import { getUserAvatarUrl } from '@/lib/uiAvatars';

const UPGRADE_HREF = '/themes#abonnement';

export function SidebarAccountFoot() {
  const { t } = useTranslation();
  const session = getSession();

  if (!session) return null;

  const profilePath = getProfilePath(session.role);
  const isPremium = isPremiumUser();
  const showOffer = canUpgradeToPremium();
  const showPlan = session.role === 'candidat';
  const avatarSrc = getUserAvatarUrl(session.name, 32, session.avatarUrl);
  const planLabel = isPremium ? t('dashboard.userMenu.planPremium') : t('dashboard.userMenu.planFree');

  return (
    <div className="codakis-sidebar-account">
      <Link
        to={profilePath}
        className="codakis-sidebar-account__profile"
        title={session.name}
        aria-label={session.name}
      >
        <span className="codakis-sidebar-account__avatar" aria-hidden>
          <img src={avatarSrc} alt="" width={32} height={32} />
        </span>
        <span className="codakis-sidebar-account__meta">
          <strong className="codakis-sidebar-account__name">{session.name}</strong>
          {showPlan ? (
            <span className="codakis-sidebar-account__plan">{planLabel}</span>
          ) : null}
        </span>
      </Link>

      {showOffer ? (
        <Link
          to={UPGRADE_HREF}
          className="codakis-sidebar-account__offer"
          title={t('dashboard.userMenu.claimOffer')}
        >
          <FeatherIcon icon="gift" size={16} />
          <span>{t('dashboard.userMenu.claimOffer')}</span>
        </Link>
      ) : null}

      {!showOffer && isPremium && session.role === 'candidat' ? (
        <Link
          to={UPGRADE_HREF}
          className="codakis-sidebar-account__offer codakis-sidebar-account__offer--muted"
          title={t('dashboard.userMenu.managePlan')}
        >
          <FeatherIcon icon="star" size={16} />
          <span>{t('dashboard.userMenu.managePlan')}</span>
        </Link>
      ) : null}
    </div>
  );
}
