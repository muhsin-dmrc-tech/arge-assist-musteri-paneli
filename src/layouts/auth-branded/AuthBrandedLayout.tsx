import { Link, Outlet } from 'react-router-dom';
import { Fragment } from 'react';
import { toAbsoluteUrl } from '@/utils';
import useBodyClasses from '@/hooks/useBodyClasses';
import { AuthBrandedLayoutProvider } from './AuthBrandedLayoutProvider';

const Layout = () => {
  // Applying body classes to manage the background color in dark mode
  useBodyClasses('dark:bg-coal-500');

  return (
    <Fragment>
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/app/arge_logo.png')}');
            background-position: center;
            background-repeat: no-repeat;
            background-size: contain;
            background-color: #FDFDFD;
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/app/arge_logo.png')}');
            background-position: center;
            background-repeat: no-repeat;
            background-size: contain;
            background-color: #FDFDFD;
          }
        `}
      </style>

      <div className="grid lg:grid-cols-2 grow">
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          <Outlet />
        </div>

        <div className="lg:rounded-xl lg:border lg:border-gray-200 lg:m-5 order-1 lg:order-2 bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg">
          <div className="flex flex-row p-8 lg:p-16 gap-4 max-[750px]:hidden">
           {/*  <Link to="/">
              <img
                src={toAbsoluteUrl('/media/app/argeassistfavicon.png')}
                className="h-[28px] max-w-none"
                alt=""
              />
            </Link>

            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-semibold text-gray-900">Arge Assist</h3>
              <div className="text-base font-medium text-gray-600">
                A robust authentication gateway ensuring
                <br /> secure&nbsp;
                <span className="text-gray-900 font-semibold">efficient user access</span>
                &nbsp;to the Metronic
                <br /> Dashboard interface.
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

// AuthBrandedLayout component that wraps the Layout component with AuthBrandedLayoutProvider
const AuthBrandedLayout = () => (
  <AuthBrandedLayoutProvider>
    <Layout />
  </AuthBrandedLayoutProvider>
);

export { AuthBrandedLayout };
