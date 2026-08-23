import PropTypes from 'prop-types';
import { createContext, useContext, useMemo } from 'react';

export const DashboardMenuContext = createContext(null);

export function useDashboardMenu() {
  return useContext(DashboardMenuContext);
}

export function DashboardMenuProvider({ menu, children }) {
  const value = useMemo(() => menu, [menu]);
  return <DashboardMenuContext.Provider value={value}>{children}</DashboardMenuContext.Provider>;
}

DashboardMenuProvider.propTypes = {
  menu: PropTypes.shape({
    items: PropTypes.array.isRequired,
    collapseItems: PropTypes.array.isRequired
  }).isRequired,
  children: PropTypes.node
};
