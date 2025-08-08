import { Link } from 'react-router-dom';

import { toAbsoluteUrl } from '@/utils';
import { useLayout } from '@/providers';
import { useEffect, useState } from 'react';

const ResetPasswordCheckEmail = () => {
  const { currentLayout } = useLayout();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get('email'));
  }, []);

  return (
    <div className="card max-w-[440px] w-full">
      <div className="card-body p-10">
        <div className="flex justify-center py-10">
          <img
            src={toAbsoluteUrl('/media/illustrations/30.svg')}
            className="dark:hidden max-h-[130px]"
            alt="Email kontrol görseli"
          />
          <img
            src={toAbsoluteUrl('/media/illustrations/30-dark.svg')}
            className="light:hidden max-h-[130px]"
            alt="Email kontrol görseli"
          />
        </div>

        <h3 className="text-lg font-medium text-gray-900 text-center mb-3">E-postanızı kontrol edin</h3>
        <div className="text-2sm text-center text-gray-700 mb-7.5">
          Lütfen şifrenizi sıfırlamak için{' '}
          <a href="#" className="text-2sm text-gray-800 font-medium hover:text-primary-active">
            {email}
          </a>
          <br />
          adresine gönderilen bağlantıya tıklayın. Teşekkürler
        </div>

       

        <div className="flex items-center justify-center gap-1">
          <span className="text-xs text-gray-600">E-posta almadınız mı?</span>
          <Link
            to={
              currentLayout?.name === 'auth-branded'
                ? '/auth/reset-password'
                : '/auth/classic/reset-password'
            }
            className="text-xs font-medium link"
          >
            Tekrar Gönder
          </Link>
        </div>
      </div>
    </div>
  );
};

export { ResetPasswordCheckEmail };
