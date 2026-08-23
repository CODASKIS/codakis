import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

// react-bootstrap
import { ListGroup, Dropdown, Form } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// project imports
import { useDashboardMenu } from 'contexts/DashboardMenuContext';
import {
  canUpgradeToPremium,
  clearSession,
  getSession,
  isPremiumUser,
} from '@/auth/authStore';
import { getCandidateEnrollment, isCandidateEnrolled } from '@/auth/candidateEnrollment';
import { getProfilePath, ROLE_CONFIG } from '@/auth/roles';

// assets
import avatar2 from 'assets/images/user/avatar-2.jpg';

const UPGRADE_HREF = '/themes#abonnement';

// -----------------------|| NAV RIGHT ||-----------------------//

export default function NavRight() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = getSession();
  const codakisMenu = useDashboardMenu();
  const roleTitle = codakisMenu?.roleTitle ?? 'CODAKIS';
  const showUpgrade = canUpgradeToPremium();
  const isPremium = isPremiumUser();
  const displayName = session?.name ?? t('dashboard.user');
  const displayEmail = session?.email ?? '';
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
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown>
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0">
            <i className="material-icons-two-tone">search</i>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown drp-search">
            <Form className="px-3">
              <div className="form-group mb-0 d-flex align-items-center">
                <FeatherIcon icon="search" />
                <Form.Control type="search" className="border-0 shadow-none" placeholder="Rechercher…" />
              </div>
            </Form>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown className="drp-user codakis-user-dropdown" align="end">
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0 user-name">
            <img src={avatar2} alt="" className="user-avatar" />
            <span>
              <span className="user-name">{displayName}</span>
              <span className="user-desc">
                {enrolled && enrollment?.schoolName
                  ? enrollment.schoolName
                  : roleTitle}
              </span>
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown codakis-user-menu">
            <Dropdown.Header className="codakis-user-menu__head">
              <div className="codakis-user-menu__profile">
                <img src={avatar2} alt="" className="codakis-user-menu__avatar" />
                <div className="codakis-user-menu__identity">
                  <strong className="codakis-user-menu__name">{displayName}</strong>
                  {displayEmail ? <span className="codakis-user-menu__email">{displayEmail}</span> : null}
                  <div className="codakis-user-menu__badges">
                    <span className={`codakis-user-menu__plan${isPremium ? ' is-premium' : ''}`}>
                      {isPremium ? t('dashboard.userMenu.planPremium') : t('dashboard.userMenu.planFree')}
                    </span>
                    {session?.role === 'candidat' ? (
                      <span className={`codakis-user-menu__school${enrolled ? ' is-enrolled' : ''}`}>
                        {enrolled
                          ? enrollment?.schoolName
                          : t('dashboard.enrollment.notEnrolled')}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </Dropdown.Header>

            {showUpgrade ? (
              <div className="codakis-user-menu__upgrade-wrap">
                <Link to={UPGRADE_HREF} className="codakis-user-menu__upgrade btn btn-primary">
                  <i className="material-icons-two-tone">workspace_premium</i>
                  <span>
                    <strong>{t('dashboard.userMenu.upgradeCta')}</strong>
                    <small>{t('dashboard.userMenu.upgradeSubtitle')}</small>
                  </span>
                </Link>
              </div>
            ) : null}

            {isPremium && session?.role === 'candidat' ? (
              <Link to={UPGRADE_HREF} className="dropdown-item">
                <i className="material-icons-two-tone">workspace_premium</i>
                {t('dashboard.userMenu.managePlan')}
              </Link>
            ) : null}

            {session?.role === 'candidat' && enrolled ? (
              <Link to="/espace/candidat/auto-ecole" className="dropdown-item">
                <i className="material-icons-two-tone">domain</i>
                {t('dashboard.nav.mySchool')}
              </Link>
            ) : null}

            {session?.role === 'candidat' && !enrolled ? (
              <Link to="/auto-ecoles" className="dropdown-item">
                <i className="material-icons-two-tone">shopping_cart</i>
                {t('dashboard.enrollment.browseForfaits')}
              </Link>
            ) : null}

            <Link to={profilePath} className="dropdown-item">
              <i className="material-icons-two-tone">account_circle</i>
              {t('dashboard.profile.title')}
            </Link>

            <Link to="/" className="dropdown-item">
              <i className="material-icons-two-tone">public</i>
              {t('dashboard.backToSite')}
            </Link>

            <div className="codakis-user-menu__footer">
              <Link to="#" className="dropdown-item codakis-user-menu__logout" onClick={handleLogout}>
                <i className="material-icons-two-tone">logout</i>
                {t('dashboard.logout')}
              </Link>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
    </ListGroup>
  );
}
