import { useContext } from 'react';

// third party
import { Link } from 'react-router';
import FeatherIcon from 'feather-icons-react';

// project imports
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';
import { getSession } from '@/auth/authStore';
import { getRoleDashboardPath } from '@/auth/roles';

// assets — logo CODAKIS (barre mobile, fond sombre)
const logo = '/images/logo/logo-white.svg';

// -----------------------|| MOBILE HEADER ||-----------------------//

export default function MobileHeader() {
  const configContext = useContext(ConfigContext);
  const { collapseHeaderMenu } = configContext.state;
  const { dispatch } = configContext;
  const session = getSession();
  const homePath = session ? getRoleDashboardPath(session.role) : '/';

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  const headerToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_HEADERMENU, collapseHeaderMenu: !collapseHeaderMenu });
  };

  return (
    <div className="pc-mob-header">
      <div className="pcm-toolbar pcm-toolbar--start">
        <Link to="#" className="pc-head-link" id="mobile-collapse" onClick={navToggleHandler}>
          <div className="hamburger hamburger--arrowturn">
            <div className="hamburger-box">
              <div className="hamburger-inner" />
            </div>
          </div>
        </Link>
      </div>
      <div className="pcm-logo">
        <Link to={homePath}>
          <img src={logo} alt="CODAKIS" className="codakis-mob-logo" width={140} height={36} />
        </Link>
      </div>
      <div className="pcm-toolbar pcm-toolbar--end">
        <Link to="#" className="pc-head-link" id="header-collapse" onClick={headerToggleHandler}>
          <FeatherIcon icon="more-vertical" title="more" />
        </Link>
      </div>
    </div>
  );
}
