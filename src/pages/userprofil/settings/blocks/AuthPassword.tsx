import { KeenIcon } from "@/components/keenicons";
import { useState } from "react";
import clsx from 'clsx';

const AuthPassword = ({ userValues, setPasswordReset }: any) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitVisible, setSubmitVisible] = useState(false);


  const resendPassword = async () => {
    if (submitVisible) {
      return
    }
    setSubmitVisible(true)
    if (oldPassword.length < 6 || oldPassword.length < 6) {
      setError('Mevcut şifre en az 6 karakterden oluşmalıdır')
      setSubmitVisible(false)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Yeni şifre ve tekrar şifresi aynı olmalıdır')
      setSubmitVisible(false)
      return
    }
    if (newPassword.length < 6 || confirmPassword.length < 6) {
      setError('Yeni şifre en az 6 karakterden oluşmalıdır')
      setSubmitVisible(false)
      return
    }
    const response = await setPasswordReset(oldPassword, newPassword, confirmPassword);
    if (response.status === 400 || response.status === 429 || response.status === 401) {
      setError(response.message);
      setSuccessMessage('')
    } else {
      setError('')
      setSuccessMessage(response.message)
    }
    setSubmitVisible(false)
  }




  return (
    <div className="card">
      <div className="card-header" id="auth_password">
        <h3 className="card-title">Şifre</h3>
      </div>

      <div className="card-body grid gap-5">
        {error && <div className="text-red-700">  <KeenIcon
          icon={'information-2'}
          style="solid"
          className={`text-lg leading-0 me-2`}
          aria-label={'information-2'}
        /> <span>{error}</span></div>}
        {successMessage && <div className="text-lime-400">  <KeenIcon
          icon={'information-1'}
          style="solid"
          className={`text-lg leading-0 me-2`}
          aria-label={'information-1'}
        /> <span>{successMessage}</span></div>}
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">

            <label className="form-label max-w-56">Mevcut Şifre</label>
            <label className="input">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mevcut şifrenizi giriniz"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button className="btn btn-icon" onClick={() => setShowPassword(!showPassword)}>
                <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showPassword })} />
                <KeenIcon
                  icon="eye-slash"
                  className={clsx('text-gray-500', { hidden: !showPassword })}
                />
              </button>
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56">Yeni Şifre *</label>
            <label className="input">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Yeni şifrenizi giriniz"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button className="btn btn-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showNewPassword })} />
                <KeenIcon
                  icon="eye-slash"
                  className={clsx('text-gray-500', { hidden: !showNewPassword })}
                />
              </button>
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56">Yeni Şifre Tekrar *</label>
            <label className="input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Yeni şifrenizi tekrar giriniz"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button className="btn btn-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showConfirmPassword })} />
                <KeenIcon
                  icon="eye-slash"
                  className={clsx('text-gray-500', { hidden: !showConfirmPassword })}
                />
              </button>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2.5">
          <button disabled={submitVisible} onClick={resendPassword} className="btn btn-primary">Şifreyi Sıfırla</button>
        </div>
      </div>
    </div>
  );
};

export { AuthPassword };
