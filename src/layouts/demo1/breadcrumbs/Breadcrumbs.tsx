import clsx from 'clsx';
import { Fragment } from 'react';
import { useLocation } from 'react-router';

import { KeenIcon } from '@/components';
import { TMenuBreadcrumbs, TMenuConfig, useMenuBreadcrumbs } from '@/components/menu';
import { useMenus } from '@/providers';
import { Link } from 'react-router-dom';

interface Pageprops {
  manuelItems?: IMenuBreadcrumb[]
}
interface IMenuBreadcrumb {
  title?: string;
  path?: string;
  active?: boolean;
}

const Breadcrumbs = ({ manuelItems }: Pageprops) => {
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('primary');
  const items = useMenuBreadcrumbs(pathname, menuConfig);

  const getModifiedPath = (path: string) => {
    // Path boşsa veya seçili firma yoksa orijinal path'i döndür
    if (!path) return path;
    type PathConfig = {
      excludedPaths: readonly string[];
      teknokentPaths: TMenuConfig; // string[] yerine TMenuConfig olarak değiştirildi
      dynamicIdentifier: string;
    };
 
    return path;
  };
  const renderItems = (items: TMenuBreadcrumbs) => {
    return items.map((item, index) => {
      const last = index === items.length - 1;

      return (
        <Fragment key={`root-${index}`}>
          {
            item.path ?
              <Link to={getModifiedPath(item.path)}
                className={clsx(item.active ? 'text-[#41C1BA]' : 'text-gray-700 hover:text-[#41C1BA]')}
                key={`item-${index}`}
              >
                {item.title}
              </Link> :
              <span
                className={clsx(item.active ? 'text-[#41C1BA]' : 'text-gray-700')}
                key={`item-${index}`}
              >
                {item.title}
              </span>
          }
          {!last && (
            <KeenIcon icon="right" className="text-gray-500 text-3xs" key={`separator-${index}`} />
          )}
        </Fragment>
      );
    });
  };

  const render = () => {
    return (
      <div className="flex [.header_&]:below-lg:hidden items-center gap-1.25 text-xs lg:text-sm font-medium mb-2.5 lg:mb-0">
        {manuelItems ? renderItems(manuelItems) : items ? renderItems(items) : ''}
      </div>
    );
  };

  return render();
};

export { Breadcrumbs };
