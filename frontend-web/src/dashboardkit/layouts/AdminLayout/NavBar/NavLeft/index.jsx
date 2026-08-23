import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ListGroup } from 'react-bootstrap';
import {
  clearSession,
  getSession,
} from '@/auth/authStore';
import { getCandidateEnrollment, isCandidateEnrolled } from '@/auth/candidateEnrollment';
import { getProfilePath, ROLE_CONFIG } from '@/auth/roles';
import useWindowSize from 'hooks/useWindowSize';

const MOBILE_MAX_WIDTH = 1024;

/** Menu mobile header — tiroir latéral (< 1025px). Sur desktop, utiliser NavRight. */
export default function NavLeft() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const session = getSession();
  const profilePath = session ? getProfilePath(session.role) : '/';
  const enrollment = session?.role === 'candidat' ? getCandidateEnrollment() : null;
  const enrolled = session?.role === 'candidat' && isCandidateEnrolled();

  function handleLogout(event) {
    event.preventDefault();
    const role = session?.role;
    clearSession();
    navigate(role ? ROLE_CONFIG[role].loginPath : '/connexion', { replace: true });
  }

  if (width > MOBILE_MAX_WIDTH) {
    return null;
  }

  if (!session) {
    return null;
  }

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled codakis-mob-nav">
      <ListGroup.Item as="li" bsPrefix=" " className="codakis-mob-nav__head">
        <strong>{session.name}</strong>
        <span>{session.email}</span>
      </ListGroup.Item>

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
    </ListGroup>
  );
}
