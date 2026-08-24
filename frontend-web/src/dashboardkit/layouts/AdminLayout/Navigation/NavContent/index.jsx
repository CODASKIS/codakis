import PropTypes from 'prop-types';
import { useContext } from 'react';
import { Link } from 'react-router';

// react-bootstrap
import { ListGroup } from 'react-bootstrap';

// project imports
import NavGroup from './NavGroup';
import { SidebarAccountFoot } from './SidebarFooter';
import { ConfigContext } from 'contexts/ConfigContext';
import useWindowSize from 'hooks/useWindowSize';

// third party
import SimpleBar from 'simplebar-react';

// assets — logo CODAKIS (sidebar sombre)
const logoFull = "/images/logo.png";
const logoIcon = "/images/logo-simple.png";

// -----------------------|| NAV CONTENT ||-----------------------//

export default function NavContent({ navigation, activeNav }) {
  const configContext = useContext(ConfigContext);
  const windowSize = useWindowSize();

  const { collapseLayout } = configContext.state;
  const showIconLogo = collapseLayout && windowSize.width > 992;

  const navItems = navigation.map((item) => {
    let navItem = <></>;
    switch (item.type) {
      case 'group':
        if (activeNav) {
          navItem = (
            <div key={`nav-group-${item.id}`}>
              <NavGroup group={item} />
            </div>
          );
        } else {
          navItem = <NavGroup group={item} key={`nav-group-${item.id}`} />;
        }
        return navItem;
      default:
        return false;
    }
  });

  const navList = (
    <ListGroup variant="flush" as="ul" bsPrefix=" " className="pc-navbar">
      {navItems}
    </ListGroup>
  );

  let navContentNode = collapseLayout ? (
    navList
  ) : (
    <SimpleBar className="codakis-navbar-scroll__bar">{navList}</SimpleBar>
  );

  const mHeader = (
    <div className="m-header">
      <Link to="/" className="b-brand" title="CODAKIS">
        {!showIconLogo ? (
          <img src={logoFull} alt="CODAKIS" className="logo logo-lg codakis-sidebar-logo" />
        ) : (
          <img src={logoIcon} alt="CODAKIS" className="logo logo-sm codakis-sidebar-logo codakis-sidebar-logo--icon" />
        )}
      </Link>
    </div>
  );

  let mainContent;

  mainContent = (
    <>
      {mHeader}

      <div className="navbar-content next-scroll codakis-navbar-content">
        <div className="codakis-navbar-scroll">{navContentNode}</div>
        <div className="codakis-sidebar-foot">
          <SidebarAccountFoot />
        </div>
      </div>
    </>
  );

  return <>{mainContent}</>;
}

NavContent.propTypes = { navigation: PropTypes.any, activeNav: PropTypes.any };
