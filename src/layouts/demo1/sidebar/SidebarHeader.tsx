import React, { forwardRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useDemo1Layout } from '../';
import { toAbsoluteUrl } from '@/utils';
import { SidebarToggle } from './';

const SidebarHeader = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { layout } = useDemo1Layout();

  const lightLogo = () => (
    <Fragment>
      <Link to="/" className="dark:hidden">
        <img
          src={toAbsoluteUrl('/media/app/arge_logo.png')}
          className="default-logo min-h-[22px] max-h-[70px] max-w-none object-contain"
        />
        <img
          src={toAbsoluteUrl('/media/app/argeassistfavicon.png')}
          className="small-logo min-h-[22px] max-w-none object-contain"
        />
      </Link>
      <Link to="/" className="hidden dark:block">
        <img
          src={toAbsoluteUrl('/media/app/arge_logo.png')}
          className="default-logo min-h-[22px] max-h-[70px] max-w-none"
        />
        <img
          src={toAbsoluteUrl('/media/app/argeassistfavicon.png')}
          className="small-logo min-h-[22px] max-w-none object-contain"
        />
      </Link>
    </Fragment>
  );

  const darkLogo = () => (
    <Link to="/">
      <img
        src={toAbsoluteUrl('/media/app/arge_logo.png')}
        className="default-logo min-h-[22px] max-h-[70px] max-w-none object-contain"
      />
      <img
        src={toAbsoluteUrl('/media/app/argeassistfavicon.png')}
        className="small-logo min-h-[22px] max-w-none  object-contain"
      />
    </Link>
  );

  return (
    <div
      ref={ref}
      className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0"
    >
      {layout.options.sidebar.theme === 'light' ? lightLogo() : darkLogo()}
      <SidebarToggle />
    </div>
  );
});

export { SidebarHeader };
