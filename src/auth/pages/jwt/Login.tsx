import { type MouseEvent, useState } from 'react';
import { Link, To, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { KeenIcon } from '@/components';
import { useAuthContext } from '@/auth';
import { useLayout } from '@/providers';
import { Alert } from '@/components';
import { useSocketData } from '@/auth/SocketDataContext';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .min(3, 'En az 3 karakter')
    .max(50, 'En fazla 50 karakter')
    .required('E-posta alanı zorunludur'),
  password: Yup.string()
    .min(6, 'En az 6 karakter')
    .max(50, 'En fazla 50 karakter')
    .required('Şifre alanı zorunludur'),
  remember: Yup.boolean()
});

const initialValues = {
  email: '',
  password: '',
  remember: false
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [showPassword, setShowPassword] = useState(false);
  const { currentLayout } = useLayout();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');



  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);

      try {
        if (!login) {
          throw new Error('Bu form için jwtprovider gereklidir.');
        }
        const response: any = await login(
          values.email,
          values.password
        );
        /*   if (values.remember) {
            localStorage.setItem('email', values.email);
          } else {
            localStorage.removeItem('email');
          } */
        if (response && response.status === 'error') {
          let rawError = response.errorMessage;
          let errorMessage = 'Bir hata oluştu';

          try {
            // Eğer string olarak gelen JSON dizisiyse parse etmeyi dene
            const parsed = JSON.parse(rawError);
            if (Array.isArray(parsed)) {
              errorMessage = parsed.join('\n');
            } else if (typeof parsed === 'string') {
              errorMessage = parsed;
            } else {
              errorMessage = String(parsed);
            }
          } catch (e) {
            // JSON.parse başarısızsa zaten stringmiş
            if (Array.isArray(rawError)) {
              errorMessage = rawError.join('\n');
            } else if (typeof rawError === 'string') {
              errorMessage = rawError;
            }
          }

          setErrorMessage(errorMessage);

          setSuccessMessage('');
        } else if (response && response.status === 'email-verification') {
          setSuccessMessage('E-posta adresinizi doğrulayın.');
          setErrorMessage('');
          setTimeout(() => {
            navigate('/auth/check-email', { replace: true, state: { email: values.email } });
          }, 500);
        } else if (response && response.status === '2fa') {
          navigate('/auth/2fa', { replace: true, state: { email: response?.email, phone: response?.phone, type: response?.type } });
        } else {
          setSuccessMessage(response?.errorMessage);
          setErrorMessage('');
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 500);
        }
      } catch {
        setStatus('Giriş bilgileri hatalı');
        setSubmitting(false);
      }
      setLoading(false);
    }
  });

  const togglePassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const linkTo = (link: string) => {
    navigate(link, { replace: true, state: { email: formik.values.email }  });
  };

  return (
    <div className="card max-w-[390px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">Giriş Yap</h3>
          <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">Hesabınız yok mu?</span>
            <Link
              to={currentLayout?.name === 'auth-branded' ? '/auth/signup' : '/auth/classic/signup'}
              className="text-2sm link"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="border-t border-gray-200 w-full"></span>
          <span className="text-2xs text-gray-500 font-medium uppercase">Veya</span>
          <span className="border-t border-gray-200 w-full"></span>
        </div>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">E-posta</label>
          <label className="input">
            <input
              placeholder="E-posta adresinizi girin"
              autoComplete="off"
              {...formik.getFieldProps('email')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.email && formik.errors.email
              })}
            />
          </label>
          {formik.touched.email && formik.errors.email && typeof formik.errors.email === 'string' && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1">
            <label className="form-label text-gray-900">Şifre</label>
            <a
              onClick={() => linkTo(currentLayout?.name === 'auth-branded'
                ? '/auth/reset-password'
                : '/auth/classic/reset-password')}
              className="text-2sm link shrink-0"
            >
              Şifremi Unuttum?
            </a>
          </div>
          <label className="input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifrenizi giriniz"
              autoComplete="off"
              {...formik.getFieldProps('password')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.password && formik.errors.password
              })}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showPassword })} />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showPassword })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && typeof formik.errors.password === 'string' && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>

        <label className="checkbox-group">
          <input
            className="checkbox checkbox-sm"
            type="checkbox"
            {...formik.getFieldProps('remember')}
          />
          <span className="checkbox-label">Beni Hatırla</span>
        </label>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Lütfen bekleyin...' : 'Giriş Yap'}
        </button>
      </form >

    </div >
  );
};

export { Login };
