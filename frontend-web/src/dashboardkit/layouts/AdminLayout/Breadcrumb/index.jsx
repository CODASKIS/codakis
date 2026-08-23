import { useState, useEffect } from 'react';

// react-bootstrap
import { ListGroup, Row, Col } from 'react-bootstrap';

// third party
import { Link, useLocation } from 'react-router';

// project imports
import { useDashboardMenu } from 'contexts/DashboardMenuContext';
import navigation from 'menu-items';
import { navigationItems } from '../../../menu/runtimeMenu';
import { BASE_TITLE } from 'config/constant';

// -----------------------|| BREADCRUMB ||-----------------------//

function matchPath(pathname, url) {
  return pathname === url;
}

export default function Breadcrumb() {
  const [main, setMain] = useState({});
  const [item, setItem] = useState({});
  const location = useLocation();
  const codakisMenu = useDashboardMenu();
  const menuSource = codakisMenu?.items ?? navigationItems ?? navigation.items;

  useEffect(() => {
    setMain({});
    setItem({});

    function getCollapse(items) {
      if (!items.children) return;
      items.children.forEach((collapse) => {
        if (collapse.type === 'collapse') {
          getCollapse(collapse);
        } else if (collapse.type === 'item' && matchPath(location.pathname, collapse.url)) {
          setMain(items);
          setItem(collapse);
        }
      });
    }

    menuSource.forEach((group) => {
      if (group.type === 'group') {
        getCollapse(group);
      }
    });
  }, [location.pathname, menuSource]);

  let mainContent;
  let itemContent;
  let breadcrumbContent;
  let title = '';

  if (main && main.type === 'collapse') {
    mainContent = (
      <ListGroup.Item as="li" bsPrefix=" " className="breadcrumb-item">
        <Link to="#">{main.title}</Link>
      </ListGroup.Item>
    );
  }

  if (item && item.type === 'item') {
    title = item.title;
    itemContent = (
      <ListGroup.Item as="li" bsPrefix=" " className="breadcrumb-item">
        <Link to="#">{title}</Link>
      </ListGroup.Item>
    );

    if (item.breadcrumbs !== false) {
      breadcrumbContent = (
        <div className="page-header">
          <div className="page-block">
            <Row className="align-items-center">
              <Col md={8}>
                <div className="page-header-title">
                  <h5 className="m-b-10">{title}</h5>
                </div>
                <ListGroup as="ul" bsPrefix=" " className="breadcrumb">
                  <ListGroup.Item as="li" bsPrefix=" " className="breadcrumb-item">
                    <Link to="/">CODAKIS</Link>
                  </ListGroup.Item>
                  {mainContent}
                  {itemContent}
                </ListGroup>
              </Col>
            </Row>
          </div>
        </div>
      );
    }

    document.title = `${title}${BASE_TITLE}`;
  }

  return <>{breadcrumbContent}</>;
}
