import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { canUpgradeToPremium } from '@/auth/authStore';
import { getProfilePath } from '@/auth/roles';
import { getSession } from '@/auth/authStore';
import { getCandidateEnrollment, isCandidateEnrolled } from '@/auth/candidateEnrollment';

const UPGRADE_HREF = '/themes#abonnement';

export function SidebarUpgrade() {
  const { t } = useTranslation();
  const session = getSession();

  if (!canUpgradeToPremium()) return null;

  return (
    <div className="codakis-sidebar-upgrade">
      <Link to={UPGRADE_HREF} className="codakis-sidebar-upgrade__link">
        <i className="material-icons-two-tone">workspace_premium</i>
        <span>{t('dashboard.userMenu.upgradeCta')}</span>
      </Link>
    </div>
  );
}

export function SidebarProfileLink() {
  const { t } = useTranslation();
  const session = getSession();
  if (!session) return null;

  const profilePath = getProfilePath(session.role);
  const enrollment = session.role === 'candidat' ? getCandidateEnrollment() : null;
  const enrolled = session.role === 'candidat' && isCandidateEnrolled();

  return (
    <div className="codakis-sidebar-profile">
      <Link to={profilePath} className="codakis-sidebar-profile__link">
        <i className="material-icons-two-tone">account_circle</i>
        <span className="codakis-sidebar-profile__text">
          <span className="codakis-sidebar-profile__label">{t('dashboard.profile.title')}</span>
          {enrolled && enrollment?.schoolName ? (
            <small className="codakis-sidebar-profile__school">{enrollment.schoolName}</small>
          ) : null}
        </span>
      </Link>
    </div>
  );
}
