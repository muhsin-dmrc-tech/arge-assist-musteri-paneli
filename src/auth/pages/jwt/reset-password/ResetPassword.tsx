import clsx from 'clsx';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/auth/useAuthContext';
import { Alert, KeenIcon } from '@/components';
import { useLayout } from '@/providers';
import { AxiosError } from 'axios';

const initialValues = {
  email: ''
};

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Geçersiz E-posta formatı')
    .min(3, 'En az 3 karakter')
    .max(50, 'En fazla 50 karakter')
    .required('E-posta alanı zorunludur')
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const state = location.state as { email?: string };
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
  const { requestPasswordResetLink } = useAuthContext();
  const { currentLayout } = useLayout();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

 
  const formik = useFormik({
     initialValues: {
      email: state?.email || '', // gelen state varsa kullan
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setHasErrors(undefined);
      try {
        if (!requestPasswordResetLink) {
          throw new Error('Bu form için jwtprovider gereklidir.');
        }
        const response:any = await requestPasswordResetLink(values.email);

        if (response && response.status === 'error') {
          const errorMessage = response.errorMessage || 'Bir hata oluştu';
          setErrorMessage(errorMessage);
          setSuccessMessage('');
        } else {
          setSuccessMessage(response?.errorMessage);
          setErrorMessage('');
        }
        setHasErrors(false);
        setLoading(false);
        const params = new URLSearchParams();
        params.append('email', values.email);
        navigate({
          pathname:
            currentLayout?.name === 'auth-branded'
              ? '/auth/reset-password/check-email'
              : '/auth/classic/reset-password/check-email',
          search: params.toString()
        });
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          setStatus(error.response.data.message);
        } else {
          setStatus('Parola sıfırlama başarısız oldu. Lütfen tekrar deneyin.');
        }
        setHasErrors(true);
        setLoading(false);
        setSubmitting(false);
      }
    }
  });
  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">E-posta Adresiniz</h3>
          <span className="text-2sm text-gray-600 font-medium">
            Şifrenizi sıfırlamak için E-posta adresinizi girin
          </span>
        </div>

        {hasErrors && <Alert variant="danger">{formik.status}</Alert>}

        {hasErrors === false && (
          <Alert variant="success">
            Şifre sıfırlama bağlantısı gönderildi. Lütfen devam etmek için e-postalarınızı kontrol edin
          </Alert>
        )}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}


        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">E-posta</label>
          <label className="input">
            <input
              type="email"
              placeholder="email@email.com"
              autoComplete="off"
              {...formik.getFieldProps('email')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.email && formik.errors.email },
                {
                  'is-valid': formik.touched.email && !formik.errors.email
                }
              )}
            />
          </label>
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-5 items-stretch">
          <button
            type="submit"
            className="btn btn-primary flex justify-center grow"
            disabled={loading || formik.isSubmitting}
          >
            {loading ? 'Lütfen bekleyin...' : 'Devam Et'}
          </button>

          <Link
            to={currentLayout?.name === 'auth-branded' ? '/auth/login' : '/auth/classic/login'}
            className="flex items-center justify-center text-sm gap-2 text-gray-700 hover:text-primary"
          >
            <KeenIcon icon="black-left" />
            Girişe Dön
          </Link>
        </div>
      </form>
    </div>
  );
};

export { ResetPassword };
