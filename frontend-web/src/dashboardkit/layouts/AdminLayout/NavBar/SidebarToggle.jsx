import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';

export default function SidebarToggle({ className = '' }) {
  const { t } = useTranslation();
  const configContext = useContext(ConfigContext);
  const { collapseLayout } = configContext.state;
  const { dispatch } = configContext;

  return (
    <button
      type="button"
      className={`pc-head-link arrow-none codakis-sidebar-toggle ${className}`.trim()}
      onClick={() => dispatch({ type: actionType.COLLAPSE_LAYOUT })}
      aria-pressed={collapseLayout}
      aria-label={collapseLayout ? t('dashboard.sidebarExpand') : t('dashboard.sidebarCollapse')}
      title={collapseLayout ? t('dashboard.sidebarExpand') : t('dashboard.sidebarCollapse')}
    >
      <i className="material-icons-two-tone">{collapseLayout ? 'menu_open' : 'menu'}</i>
    </button>
  );
}
