import clsx from 'clsx';
import { useFormik } from 'formik';
import { lazy, Suspense, useState, useRef } from 'react';
import PasswordStrength from './PasswordStrength';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { useAuthContext } from '../../useAuthContext';
import { toAbsoluteUrl } from '@/utils';
import { Alert, KeenIcon } from '@/components';
import { useLayout } from '@/providers';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
const SozlesmelerModal = lazy(() => import('@/partials/modals/sozlesmeler-modal/SozlesmelerModal'));

const initialValues = {
  fullName: '',
  firmaAdi: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
};

const signupSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'En az 3 karakter')
    .max(50, 'En fazla 50 karakter')
    .required('Ad Soyad zorunludur'),
  firmaAdi: Yup.string()
    .min(3, 'En az 3 karakter')
    .max(50, 'En fazla 50 karakter')
    .required('Ad Soyad zorunludur'),
  email: Yup.string()
    .email('Geçersiz E-posta formatı')
    .min(3, 'En az 3 karakter')
    .max(50, 'En fazla 50 karakter')
    .required('E-posta zorunludur'),
  password: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .matches(/\d/, 'Şifre en az bir rakam içermelidir')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Şifre en az bir özel karakter içermelidir')
    .required('Şifre zorunludur'),
  confirmPassword: Yup.string()
    .min(3, 'En az 3 karakter')
    .max(50, 'En fazla 50 karakter')
    .required('Şifre tekrarı zorunludur')
    .oneOf([Yup.ref('password')], "Şifreler eşleşmiyor"),
  acceptTerms: Yup.bool().required('Kullanım koşullarını kabul etmelisiniz')
});

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const { currentLayout } = useLayout();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [sozlesmeModalOpen, setSozlesmeModalOpen] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: signupSchema,
    onSubmit: async (values, { setStatus, setSubmitting, }) => {
      setLoading(true);
      setErrorMessage('');
      try {
        if (!register) {
          throw new Error('JWTProvider gereklidir.');
        }
        if (!values.acceptTerms) {
          throw new Error('Kullanım koşullarını kabul etmelisiniz.');
        }
        const response: any = await register(values.fullName,values.firmaAdi, values.email, values.password, values.confirmPassword);
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
          setLoading(false);
          setSubmitting(false);
          return;
        } else if (response && response.status === 'email-verification') {
          setSuccessMessage('E-posta adresinizi doğrulayın.');
          setTimeout(() => {
            navigate('/auth/check-email', { replace: true, state: { email: values.email } });
          }, 2000);
        } else {
          setSuccessMessage(response?.errorMessage);
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 2000);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ message: string }>;
          setErrorMessage(
            axiosError.response?.data?.message ||
            'Kayıt sırasında bir hata oluştu'
          );
        } else {
          setErrorMessage(`Beklenmeyen bir hata oluştu: ${error}`);
        }
        setSubmitting(false);
        setLoading(false);

      }
    }
  });


  const togglePassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="card max-w-[370px] w-full">
      <Suspense fallback={<div>Yükleniyor...</div>}>
        {sozlesmeModalOpen && <SozlesmelerModal open={sozlesmeModalOpen} setOpen={setSozlesmeModalOpen} anahtar='kullanici-sozlesmesi' />}
      </Suspense>
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">Kayıt Ol</h3>
          <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">Zaten hesabınız var mı?</span>
            <Link
              to={currentLayout?.name === 'auth-branded' ? '/auth/login' : '/auth/classic/login'}
              className="text-2sm link"
            >
              Giriş Yap
            </Link>
          </div>
        </div>



        {errorMessage && (
          <Alert variant="danger" className="mb-4">
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert variant="success" className="mb-4">
            {successMessage}
          </Alert>
        )}
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Firma Adı</label>
          <label className="input">
            <input
              placeholder="Firma Adı"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('firmaAdi')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.firmaAdi && formik.errors.firmaAdi },
                {
                  'is-valid': formik.touched.firmaAdi && !formik.errors.firmaAdi
                }
              )}
            />
          </label>
          {formik.touched.firmaAdi && formik.errors.firmaAdi && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.firmaAdi}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Yetkili Ad Soyad</label>
          <label className="input">
            <input
              placeholder="Yetkili Ad Soyad"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('fullName')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.fullName && formik.errors.fullName },
                {
                  'is-valid': formik.touched.fullName && !formik.errors.fullName
                }
              )}
            />
          </label>
          {formik.touched.fullName && formik.errors.fullName && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.fullName}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">E-posta</label>
          <label className="input">
            <input
              placeholder="email@email.com"
              type="email"
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

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Şifre</label>
          <label className="input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifrenizi giriniz"
              autoComplete="off"
              {...formik.getFieldProps('password')}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              onChange={(e) => {
                formik.handleChange(e);
                setPassword(e.target.value);
              }}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.password && formik.errors.password
                },
                {
                  'is-valid': formik.touched.password && !formik.errors.password
                }
              )}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showPassword })} />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showPassword })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
          {isPasswordFocused && (
            <PasswordStrength
              password={password}
              onValid={() => {
                confirmPasswordRef.current?.focus();
              }}
            />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Şifre Tekrar</label>
          <label className="input">
            <input
              ref={confirmPasswordRef}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Şifrenizi tekrar giriniz"
              autoComplete="off"
              {...formik.getFieldProps('confirmPassword')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.confirmPassword && formik.errors.confirmPassword
                },
                {
                  'is-valid': formik.touched.confirmPassword && !formik.errors.confirmPassword
                }
              )}
            />
            <button className="btn btn-icon" onClick={toggleConfirmPassword}>
              <KeenIcon
                icon="eye"
                className={clsx('text-gray-500', { hidden: showConfirmPassword })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showConfirmPassword })}
              />
            </button>
          </label>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.confirmPassword}
            </span>
          )}
        </div>

        <label className="checkbox-group">
          <input
            className="checkbox checkbox-sm"
            type="checkbox"
            {...formik.getFieldProps('acceptTerms')}
          />
          <span className="checkbox-label">
            <button onClick={() => setSozlesmeModalOpen(true)} className="text-2sm link">
              Kullancı Sözleşmesini
            </button>{' '}
            kabul ediyorum
          </span>
        </label>

        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <span role="alert" className="text-danger text-xs mt-1">
            {formik.errors.acceptTerms}
          </span>
        )}

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Lütfen bekleyin...' : 'Kayıt Ol'}
        </button>
      </form>
    </div>
  );
};

export { Signup };
