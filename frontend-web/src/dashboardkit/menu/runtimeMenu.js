import navigation from '../menu-items';
import navitemcollapse from '../menu-items-collapse';

export let navigationItems = navigation.items;
export let navigationCollapseItems = navitemcollapse.items;

export function setDashboardNavigation(items, collapseItems) {
  navigationItems = items;
  navigationCollapseItems = collapseItems;
}
