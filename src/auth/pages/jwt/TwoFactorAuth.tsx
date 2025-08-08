import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';
import { Alert, KeenIcon } from '@/components';
import { useAuthContext } from '@/auth';

const TwoFactorAuth = () => {
  const location = useLocation(); // location hook'u
  const navigate = useNavigate();
  const { email, phone,type } = location.state || {};
  const [codeInputs, setCodeInputs] = useState(Array(6).fill(''));
  const [resendEmail, setResendEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState('success');
  const [resendMessage, setResendMessage] = useState('');
  const { twoFactorResend,twoFactorSendCode } = useAuthContext();
  const [seconds, setSeconds] = useState(50);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000); // Her 1000 ms'de bir (1 saniye) sayacı azalt

      return () => clearInterval(timer);
    }
  }, [seconds]);


  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const updatedInputs = [...codeInputs];
    updatedInputs[index] = value;

    if (value.length === 1 && index < codeInputs.length - 1) {
      inputRefs.current[index + 1]?.focus(); // Sonraki inputa odaklan
    }

    if (value.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus(); // Önceki inputa odaklan
    }


    setCodeInputs(updatedInputs);
  };
  useEffect(() => {
    // İlk inputa odaklan
    inputRefs.current[0]?.focus();
  }, []);

  const handleResendEmail = async () => {
    if (resendEmail) {
      return;
    }
    const response = await twoFactorResend(type === 'sms' ? phone : email,email);
    if (response.status === 'success') {
      setSeconds(50);
      setResendEmail(true);
      setResendStatus('success');
      setResendMessage(response.errorMessage);
    } else {
      setResendEmail(true);
      setResendStatus('error');
      setResendMessage(response.errorMessage);
    }
  }


  const handleSendCode = async () => {
    if (resendEmail) {
      return;
    }
    const code = codeInputs.join('');
    const response = await twoFactorSendCode(code,email);
    if (response.status === 'success') {
      setResendEmail(true);
      setResendStatus('success');
      setResendMessage(response.errorMessage);
      navigate('/');
    } else {
      setResendEmail(true);
      setResendStatus('error');
      setResendMessage(response.errorMessage);
    }
  }

  return (
    <div className="card max-w-[380px] w-full">
      <div className="card-body flex flex-col gap-5 p-10">
        <img
          src={toAbsoluteUrl('/media/illustrations/34.svg')}
          className="dark:hidden h-20 mb-2"
          alt=""
        />
        <img
          src={toAbsoluteUrl('/media/illustrations/34-dark.svg')}
          className="light:hidden h-20 mb-2"
          alt=""
        />

        {resendEmail && (
          <Alert variant={resendStatus === 'success' ? 'success' : 'danger'}>
            {resendMessage}
          </Alert>
        )}

        <div className="text-center mb-2">
          <h3 className="text-lg font-medium text-gray-900 mb-5">
            {type === 'sms' ? 'Telefonunuzu' : 'E-postanızı'} doğrulayın
          </h3>
          <div className="flex flex-col">
            <span className="text-2sm text-gray-700 mb-1.5">
              Size gönderdiğimiz doğrulama kodunu girin
            </span>
            <a href="#" className="text-sm font-medium text-gray-900">
              ****** {type === 'sms' ? phone?.slice(-4) : email?.slice(-4)}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {codeInputs.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="input focus:border-primary-clarity focus:ring focus:ring-primary-clarity size-10 shrink-0 px-0 text-center"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              ref={(el) => (inputRefs.current[index] = el)}
            />
          ))}
        </div>

        <div className="flex items-center justify-center mb-2">
          <span className="text-xs text-gray-700 me-1.5">Kod almadınız mı? ({seconds}s)</span>
          <button onClick={handleResendEmail} className="text-xs font-medium link" disabled={resendEmail}>
            Tekrar Gönder
          </button>
        </div>

        <button className="btn btn-primary flex justify-center grow" onClick={handleSendCode} disabled={resendEmail}>
          Devam Et
        </button>

        <Link
          to="/auth/login"
          className="flex items-center justify-center text-sm gap-2 text-gray-700 hover:text-primary"
        >
          <KeenIcon icon="black-left" />
          Girişe Dön
        </Link>
      </div>
    </div>
  );
};

export { TwoFactorAuth };
