import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ListGroup } from 'react-bootstrap';
import {
  canUpgradeToPremium,
  clearSession,
  getSession,
  isPremiumUser,
} from '@/auth/authStore';
import { getCandidateEnrollment, isCandidateEnrolled } from '@/auth/candidateEnrollment';
import { getProfilePath, ROLE_CONFIG } from '@/auth/roles';

const UPGRADE_HREF = '/themes#abonnement';

/** Menu mobile header — mêmes entrées que le menu profil (i18n CODAKIS). */
export default function NavLeft() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = getSession();
  const showUpgrade = canUpgradeToPremium();
  const isPremium = isPremiumUser();
  const profilePath = session ? getProfilePath(session.role) : '/';
  const enrollment = session?.role === 'candidat' ? getCandidateEnrollment() : null;
  const enrolled = session?.role === 'candidat' && isCandidateEnrolled();

  function handleLogout(event) {
    event.preventDefault();
    const role = session?.role;
    clearSession();
    navigate(role ? ROLE_CONFIG[role].loginPath : '/connexion', { replace: true });
  }

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled codakis-mob-nav">
      {session ? (
        <>
          <ListGroup.Item as="li" bsPrefix=" " className="codakis-mob-nav__head">
            <strong>{session.name}</strong>
            <span>{session.email}</span>
          </ListGroup.Item>

          {showUpgrade ? (
            <ListGroup.Item as="li" bsPrefix=" ">
              <Link to={UPGRADE_HREF} className="codakis-mob-nav__link codakis-mob-nav__link--primary">
                <i className="material-icons-two-tone">workspace_premium</i>
                <span>{t('dashboard.userMenu.upgradeCta')}</span>
              </Link>
            </ListGroup.Item>
          ) : null}

          {isPremium && session.role === 'candidat' ? (
            <ListGroup.Item as="li" bsPrefix=" ">
              <Link to={UPGRADE_HREF} className="codakis-mob-nav__link">
                <i className="material-icons-two-tone">workspace_premium</i>
                <span>{t('dashboard.userMenu.managePlan')}</span>
              </Link>
            </ListGroup.Item>
          ) : null}

          {session.role === 'candidat' && enrolled ? (
            <ListGroup.Item as="li" bsPrefix=" ">
              <Link to="/espace/candidat/auto-ecole" className="codakis-mob-nav__link">
                <i className="material-icons-two-tone">domain</i>
                <span>{enrollment?.schoolName ?? t('dashboard.nav.mySchool')}</span>
              </Link>
            </ListGroup.Item>
          ) : null}

          {session.role === 'candidat' && !enrolled ? (
            <ListGroup.Item as="li" bsPrefix=" ">
              <Link to="/auto-ecoles" className="codakis-mob-nav__link">
                <i className="material-icons-two-tone">shopping_cart</i>
                <span>{t('dashboard.enrollment.browseForfaits')}</span>
              </Link>
            </ListGroup.Item>
          ) : null}

          <ListGroup.Item as="li" bsPrefix=" ">
            <Link to={profilePath} className="codakis-mob-nav__link">
              <i className="material-icons-two-tone">account_circle</i>
              <span>{t('dashboard.profile.title')}</span>
            </Link>
          </ListGroup.Item>

          <ListGroup.Item as="li" bsPrefix=" ">
            <Link to="/" className="codakis-mob-nav__link">
              <i className="material-icons-two-tone">public</i>
              <span>{t('dashboard.backToSite')}</span>
            </Link>
          </ListGroup.Item>

          <ListGroup.Item as="li" bsPrefix=" ">
            <Link to="#" className="codakis-mob-nav__link codakis-mob-nav__link--muted" onClick={handleLogout}>
              <i className="material-icons-two-tone">logout</i>
              <span>{t('dashboard.logout')}</span>
            </Link>
          </ListGroup.Item>
        </>
      ) : null}
    </ListGroup>
  );
}
