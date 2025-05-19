import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TopNav: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((segment) => segment);

  const generateCrumbs = () => {
    const crumbs = [
      {
        name: 'Home',
        path: '/'
      }
    ];

    pathnames.forEach((segment, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const decoded = decodeURIComponent(segment).replace(/-/g, ' ');
      const name = decoded.charAt(0).toUpperCase() + decoded.slice(1);
      crumbs.push({ name, path });
    });

    return crumbs;
  };

  const crumbs = generateCrumbs();

  return (
    <nav aria-label="breadcrumb" style={{ padding: '16px 24px', backgroundColor: '#f5f5f5' }}>
      <ol style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path} style={{ display: 'flex', alignItems: 'center' }}>
              {!isLast ? (
                <Link to={crumb.path} style={{ textDecoration: 'none', color: '#3f51b5' }}>
                  {crumb.name}
                </Link>
              ) : (
                <span style={{ color: '#000' }}>{crumb.name}</span>
              )}
              {!isLast && <span style={{ margin: '0 8px', color: '#757575' }}>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default TopNav;
