import { useContext } from 'react';

// project imports
import NavContent from './NavContent';
import { ConfigContext } from 'contexts/ConfigContext';
import { useDashboardMenu } from 'contexts/DashboardMenuContext';
import useWindowSize from 'hooks/useWindowSize';
import navigation from 'menu-items';
import navitemcollapse from 'menu-items-collapse';
import { navigationItems, navigationCollapseItems } from '../../../menu/runtimeMenu';
import * as actionType from 'store/actions';

// -----------------------|| NAVIGATION ||-----------------------//

export default function Navigation() {
  const configContext = useContext(ConfigContext);
  const codakisMenu = useDashboardMenu();
  const { collapseMenu, collapseLayout } = configContext.state;
  const windowSize = useWindowSize();
  const { dispatch } = configContext;

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  let navClass = 'dark-sidebar';

  const menuItems = codakisMenu?.items ?? navigationItems ?? navigation.items;
  const menuCollapseItems = codakisMenu?.collapseItems ?? navigationCollapseItems ?? navitemcollapse.items;

  let navContent = <NavContent navigation={collapseLayout ? menuCollapseItems : menuItems} />;
  navClass = [...navClass, 'pc-sidebar'];
  if (windowSize.width <= 1024 && collapseMenu) {
    navClass = [...navClass, 'mob-sidebar-active'];
  } else if (collapseMenu) {
    navClass = [...navClass, 'navbar-collapsed'];
  }

  let navBarClass = ['navbar-wrapper'];

  let mobileOverlay = <></>;
  if (windowSize.width <= 1024 && collapseMenu) {
    mobileOverlay = <div className="pc-menu-overlay" onClick={navToggleHandler} aria-hidden="true" />;
  }

  let navContentDOM = <div className={navBarClass.join(' ')}>{navContent}</div>;

  return (
    <nav className={navClass.join(' ')}>
      {navContentDOM}
      {mobileOverlay}
    </nav>
  );
}
