import { Children, isValidElement, ReactNode } from 'react';
import { MenuLink } from './MenuLink';

export const getMenuLinkPath = (children: ReactNode): string => {
  let path = '';

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === MenuLink && child.props.path) {
      path = child.props.path; // Assign the path when found
    }
  });

  return path;
};

export const hasMenuActiveChild = (path: string, children: ReactNode): boolean => {
  const childrenArray: ReactNode[] = Children.toArray(children);
  const cleanedPath = path
    .replace(/^\/\d+/, '')
    .replace(/(?:\/edit|\/detay)\/\d+$/, '');

  for (const child of childrenArray) {
    if (isValidElement(child)) {
      const childPath = child.props.path as string;
      if (child.type === MenuLink && childPath) {
        // If the menu item is for the homepage, only match if the path is exactly "/"
        if (childPath === '/') {
          if (cleanedPath === childPath) {
            return true;
          }
        } else {
          // For other menu items, check if the path starts with the menu item's path
          if (cleanedPath.startsWith(childPath)) {
            return true;
          }
        }
      } else if (hasMenuActiveChild(path, child.props.children as ReactNode)) {
        return true;
      }
    }
  }

  return false;
};
