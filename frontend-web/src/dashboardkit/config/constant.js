// imports from project
export const BASE_TITLE = ' | CODAKIS';

// -----------------------|| Application default Configuration ||-----------------------//

export const CONFIG = {
  collapseMenu: false,
  collapseLayout: typeof window !== 'undefined' && localStorage.getItem('codakis-sidebar-collapsed') === '1'
};
