import useBodyClasses from '@/hooks/useBodyClasses';
import { toAbsoluteUrl } from '@/utils';
import { Fragment } from 'react/jsx-runtime';

const Error500Page = () => {
  useBodyClasses('dark:bg-coal-500');

  return (
    <Fragment>
      <div className="mb-10">
        <img
          src={toAbsoluteUrl('/media/illustrations/18.svg')}
          className="dark:hidden max-h-[160px]"
          alt="sistem hatası görseli"
        />
        <img
          src={toAbsoluteUrl('/media/illustrations/18-dark.svg')}
          className="light:hidden max-h-[160px]"
          alt="sistem hatası görseli"
        />
      </div>

      <span className="badge badge-primary badge-outline mb-3">500 Sistem Hatası</span>

      <h3 className="text-2.5xl font-semibold text-gray-900 text-center mb-2">
        Sistemde bir hata oluştu
      </h3>

      <div className="text-md text-center text-gray-700 mb-10">
        Lütfen daha sonra tekrar deneyin veya sistem yöneticisiyle iletişime geçin.
      </div>
    </Fragment>
  );
};

export { Error500Page };
