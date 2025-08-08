import { matchPath, useLocation } from 'react-router-dom';

interface IUseMatchPath {
  match: boolean;
  isExternal: boolean;
}

const useMatchPath = (path: string, mode = 'default'): IUseMatchPath => {
  const { pathname } = useLocation();
  const isExternal = path.startsWith('http') || path.startsWith('//');

  if (isExternal) {
    return {
      match: false,
      isExternal: true
    };
  }

  // 1. Remove leading numeric ID (e.g., /7/personel -> /personel)
  // 2. Remove trailing /edit/:id or /detay/:id
  const cleanedPathname = pathname
    .replace(/^\/\d+/, '')
    .replace(/(?:\/edit|\/detay)\/\d+$/, '');

  let match = false;
  if (mode === 'default') {
    match = matchPath({ path, end: true }, cleanedPathname) !== null;
  } else if (mode === 'full') {
    match = matchPath({ path, end: false }, cleanedPathname) !== null;
  }

  return {
    match,
    isExternal: false
  };
};

export { useMatchPath };
