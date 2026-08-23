import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

// react-bootstrap
import { ListGroup, Dropdown, Form } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// project imports
import { useDashboardMenu } from 'contexts/DashboardMenuContext';
import {
  clearSession,
  getSession,
  isPremiumUser,
} from '@/auth/authStore';
import { getCandidateEnrollment, isCandidateEnrolled } from '@/auth/candidateEnrollment';
import { getProfilePath, ROLE_CONFIG } from '@/auth/roles';

// assets
import avatar2 from 'assets/images/user/avatar-2.jpg';

const UPGRADE_HREF = '/themes#abonnement';

function MenuLink({ to, icon, children, onClick, muted }) {
  return (
    <Link
      to={to}
      className={`dropdown-item codakis-user-menu__item${muted ? ' codakis-user-menu__item--muted' : ''}`}
      onClick={onClick}
    >
      <FeatherIcon icon={icon} size={18} />
      <span>{children}</span>
    </Link>
  );
}

// -----------------------|| NAV RIGHT ||-----------------------//

export default function NavRight() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = getSession();
  const codakisMenu = useDashboardMenu();
  const roleTitle = codakisMenu?.roleTitle ?? 'CODAKIS';
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
                {enrolled && enrollment?.schoolName ? enrollment.schoolName : roleTitle}
              </span>
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown codakis-user-menu">
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
                      {enrolled ? enrollment?.schoolName : t('dashboard.enrollment.notEnrolled')}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <Dropdown.Divider className="codakis-user-menu__divider" />

            {isPremium && session?.role === 'candidat' ? (
              <MenuLink to={UPGRADE_HREF} icon="star">
                {t('dashboard.userMenu.managePlan')}
              </MenuLink>
            ) : null}

            {session?.role === 'candidat' && enrolled ? (
              <MenuLink to="/espace/candidat/auto-ecole" icon="home">
                {t('dashboard.nav.mySchool')}
              </MenuLink>
            ) : null}

            {session?.role === 'candidat' && !enrolled ? (
              <MenuLink to="/auto-ecoles" icon="shopping-cart">
                {t('dashboard.enrollment.browseForfaits')}
              </MenuLink>
            ) : null}

            <MenuLink to={profilePath} icon="user">
              {t('dashboard.profile.title')}
            </MenuLink>

            <MenuLink to="/" icon="globe">
              {t('dashboard.backToSite')}
            </MenuLink>

            <Dropdown.Divider className="codakis-user-menu__divider" />

            <MenuLink to="#" icon="log-out" onClick={handleLogout} muted>
              {t('dashboard.logout')}
            </MenuLink>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
    </ListGroup>
  );
}
