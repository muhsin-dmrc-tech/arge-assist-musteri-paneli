import { Alert, KeenIcon } from '@/components';
import { useEffect, useState } from 'react';

const AuthEmail = ({ setEmailFunc, userEmail }: any) => {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState(false);
  const [submitVisible, setSubmitVisible] = useState(false);

  useEffect(()=>{setEmailInput(userEmail)},[userEmail])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submitFunc = () => {
    if(submitVisible){
      return
    }
    if (!validateEmail(emailInput)) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (emailInput === userEmail) {
      setError('E-posta adresinizi değiştirmediniz.');
      return;
    }
    setResendEmail(true)
  }

  const approvedSendFunc = async()=>{
    setError('')
    setSubmitVisible(true)
    const response = await setEmailFunc(emailInput)
    if(response.status === 400 || response.status === 429 || response.status === 401 ){
      setError(response.message);
    }
    setResendEmail(false)
    setSubmitVisible(false)
  }


  return (
    <div className="card pb-2.5">

      <div className="card-header" id="auth_email">
        <h3 className="card-title">Email</h3>
      </div>
      {resendEmail ? <Alert variant={'danger'}>
        <div className='w-full p-3 flex flex-col gap-2.5'>
          <div className='text-lg'>
            E-posta adresinizi değiştirirseniz, mevcut oturumunuz sonlandırılacak ve e-posta adresinize bir onay bağlantısı gönderilecektir.
            Bu işleme devam etmek istiyor musunuz?
          </div>
          <div className='flex flex-row justify-between w-full'>
            <button onClick={() => {
              setEmailInput(userEmail)
              setResendEmail(false)
            }} className="btn btn-danger">Vazgeç</button>
            <button disabled={submitVisible} onClick={approvedSendFunc} className="btn btn-success">Devam Et</button>
          </div>
        </div>
      </Alert> :
        <div className="card-body grid gap-5 pt-7.5">
          <div className="w-full">
            <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
              <label className="form-label max-w-56">Email</label>
              <div className="flex flex-col tems-start grow gap-7.5 w-full">
                {error && <div className="text-red-700">  <KeenIcon
                  icon={'information-2'}
                  style="solid"
                  className={`text-lg leading-0 me-2`}
                  aria-label={'information-2'}
                /> <span>{error}</span></div>}
                <input
                  className="input"
                  type="text"
                  value={emailInput}
                  onChange={(e) => {setSubmitVisible(false);setEmailInput(e.target.value)}}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={submitFunc} className="btn btn-primary">Değişiklikleri Kaydet</button>
          </div>
        </div>
      }
    </div>
  );
};

export { AuthEmail };
