import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, KeenIcon } from '@/components';
import { useAuthContext } from '@/auth';
import { useState } from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '@/providers';
import { AxiosError } from 'axios';
import axios from 'axios';

const passwordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Yeni şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Şifreler eşleşmiyor')
    .required('Lütfen yeni şifrenizi onaylayın')
});

const ResetPasswordChange = () => {
  const { currentLayout } = useLayout();
  const { changePassword } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirmation, setShowNewPasswordConfirmation] = useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setHasErrors(undefined);

      const token = new URLSearchParams(window.location.search).get('token');
      const email = new URLSearchParams(window.location.search).get('email');

      if (!token || !email) {
        setHasErrors(true);
        setStatus('Token ve E-posta bilgileri gereklidir');
        setLoading(false);
        setSubmitting(false);
        return;
      }

      try {
        const response = await changePassword(
          email!,
          token!,
          values.newPassword,
          values.confirmPassword
        );
        
        if (response.status === 200 || response.status === 201) {
          setHasErrors(false);
          navigate(
            currentLayout?.name === 'auth-branded'
              ? '/auth/reset-password/changed'
              : '/auth/classic/reset-password/changed'
          );
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Backend'den gelen hata mesajını göster
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error ||
                              'Şifre sıfırlama başarısız oldu';
          setStatus(errorMessage);
        } else {
          setStatus('Beklenmedik bir hata oluştu');
        }
        setHasErrors(true);
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Şifre Sıfırlama</h3>
          <span className="text-2sm text-gray-700">Yeni şifrenizi girin</span>
        </div>

        {hasErrors && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Yeni Şifre</label>
          <label className="input">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Yeni şifrenizi giriniz"
              autoComplete="off"
              {...formik.getFieldProps('newPassword')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.newPassword && formik.errors.newPassword },
                { 'is-valid': formik.touched.newPassword && !formik.errors.newPassword }
              )}
            />
            <button
              className="btn btn-icon"
              onClick={(e) => {
                e.preventDefault();
                setShowNewPassword(!showNewPassword);
              }}
            >
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showNewPassword })} />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showNewPassword })}
              />
            </button>
          </label>
          {formik.touched.newPassword && formik.errors.newPassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.newPassword}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label font-normal text-gray-900">Yeni Şifre Tekrar</label>
          <label className="input">
            <input
              type={showNewPasswordConfirmation ? 'text' : 'password'}
              placeholder="Yeni şifrenizi tekrar giriniz"
              autoComplete="off"
              {...formik.getFieldProps('confirmPassword')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.confirmPassword && formik.errors.confirmPassword },
                { 'is-valid': formik.touched.confirmPassword && !formik.errors.confirmPassword }
              )}
            />
            <button
              className="btn btn-icon"
              onClick={(e) => {
                e.preventDefault();
                setShowNewPasswordConfirmation(!showNewPasswordConfirmation);
              }}
            >
              <KeenIcon
                icon="eye"
                className={clsx('text-gray-500', { hidden: showNewPasswordConfirmation })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showNewPasswordConfirmation })}
              />
            </button>
          </label>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.confirmPassword}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading}
        >
          {loading ? 'Lütfen bekleyin...' : 'Gönder'}
        </button>
      </form>
    </div>
  );
};

export { ResetPasswordChange };
