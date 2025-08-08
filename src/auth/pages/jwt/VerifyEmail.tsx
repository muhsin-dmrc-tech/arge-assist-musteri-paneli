import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, KeenIcon } from '@/components';
import { useAuthContext } from '@/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '@/providers';
import axios from 'axios';
import clsx from 'clsx';

const VerifyEmail = () => {
    const { verifyEmail } = useAuthContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
    const [showPassword, setShowPassword] = useState(false);


    const token = new URLSearchParams(window.location.search).get('token') || '';

    const formik = useFormik({
        initialValues: { token, password: '' },
        validationSchema: Yup.object().shape({
            token: Yup.string().required('Token gereklidir'),
            password: Yup.string()
                .min(6, 'Şifre en az 6 karakter olmalıdır')
                .required('Şifre zorunludur'),
        }),
        onSubmit: async (values, { setStatus, setSubmitting }) => {
            setLoading(true);
            setHasErrors(undefined);
            if (!token || !values.password) {
                setHasErrors(true);
                setStatus('Token ve şifre bilgileri gereklidir');
                setLoading(false);
                setSubmitting(false);
                return;
              }
            try {
                const response = await verifyEmail(token, values.password);
                if (response.status === 'success') {
                    setHasErrors(false);
                    setStatus(response.errorMessage);
                    setTimeout(() => {
                        navigate('/');
                    }, 1000);
                }else{
                    setHasErrors(true);
                    setStatus(response.errorMessage);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const errorMessage =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'E-posta doğrulama başarısız';
                    setStatus(errorMessage);
                } else {
                    setStatus('Beklenmeyen bir hata oluştu');
                }
                setHasErrors(true);
            } finally {
                setLoading(false);
                setSubmitting(false);
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
                    <h3 className="text-lg font-medium text-gray-900">E-posta Doğrulama</h3>
                    <span className="text-2sm text-gray-700">
                        {hasErrors === false ? 'E-posta başarıyla doğrulandı' : 'E-postanızı doğrulayın'}
                    </span>
                </div>

                {formik.status && (
                    <Alert variant={hasErrors ? 'danger' : 'success'}>
                        {formik.status}
                    </Alert>
                )}

                <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900">Şifre</label>
                    <label className="input">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Şifrenizi giriniz"
                            autoComplete="off"
                            {...formik.getFieldProps('password')}
                            className={clsx(
                                'form-control bg-transparent',
                                { 'is-invalid': formik.touched.password && formik.errors.password },
                                { 'is-valid': formik.touched.password && !formik.errors.password }
                            )}
                        />
                        <button
                            className="btn btn-icon"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowPassword(!showPassword);
                            }}
                        >
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
                </div>

                <button
                    type="submit"
                    className="btn btn-primary flex justify-center grow"
                    disabled={loading}
                >
                    {loading ? <span className="spinner-border spinner-border-sm" /> : 'Doğrula'}
                </button>
            </form>
        </div>
    );
};

export { VerifyEmail };
