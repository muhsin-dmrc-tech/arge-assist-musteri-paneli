import { Link, useLocation } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';
import { useAuthContext } from '@/auth/useAuthContext';
import { useState } from 'react';
import { Alert } from '@/components';

const CheckEmail = () => {
  const location = useLocation();
  const { email } = location?.state || '';
  const { verifyResendEmail } = useAuthContext();
  const [resendEmail, setResendEmail] = useState(false);
  const [resendEmailMessage, setResendEmailMessage] = useState('');
  const [resendEmailStatus, setResendEmailStatus] = useState('success');

  const handleResendEmail = async () => {
    if (resendEmail) {
      return;
    }
    const response = await verifyResendEmail(email);
    if (response.status === 'success') {
      setResendEmail(true);
      setResendEmailStatus('success');
      setResendEmailMessage(response.errorMessage);
    } else {
      setResendEmail(true);
      setResendEmailStatus('error');
      setResendEmailMessage(response.errorMessage);
    }
  }


  return (
    <div className="card max-w-[440px] w-full">
      <div className="card-body p-10">
        <div className="flex justify-center py-10">
          <img
            src={toAbsoluteUrl('/media/illustrations/30.svg')}
            className="dark:hidden max-h-[130px]"
            alt="Email doğrulama görseli"
          />
          <img
            src={toAbsoluteUrl('/media/illustrations/30-dark.svg')}
            className="light:hidden max-h-[130px]"
            alt="Email doğrulama görseli"
          />
        </div>
        {resendEmail && (
          <Alert variant={resendEmailStatus === 'success' ? 'success' : 'danger'}>
            {resendEmailMessage}
          </Alert>
        )}

        <h3 className="text-lg font-medium text-gray-900 text-center mb-3">E-postanızı kontrol edin</h3>
        <div className="text-2sm text-center text-gray-700 mb-7.5">
          Lütfen hesabınızı doğrulamak için&nbsp;
          <a href="#" className="text-2sm text-gray-900 font-medium hover:text-primary-active">
            {email}
          </a>
          <br />
          adresine gönderilen bağlantıya tıklayın. Teşekkürler
        </div>

        <div className="flex justify-center mb-5">
          <Link to="/" className="btn btn-primary flex justify-center">
            Ana Sayfaya Dön
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1">
          <span className="text-xs text-gray-700">E-posta almadınız mı?</span>
          <button onClick={handleResendEmail} className="text-xs font-medium link" disabled={resendEmail}>
            Tekrar Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export { CheckEmail };
