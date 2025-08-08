/* eslint-disable no-unused-vars */
import axios, { AxiosResponse } from 'axios';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useState
} from 'react';

import * as authHelper from '../_helpers';
import { type AuthModel, type UserModel } from '@/auth';

const API_URL = import.meta.env.VITE_APP_API_URL;
export const LOGIN_URL = `${API_URL}/mp-auth/login`;
export const REGISTER_URL = `${API_URL}/mp-auth/register`;
export const FORGOT_PASSWORD_URL = `${API_URL}/mp-auth/forgot-password`;
export const RESET_PASSWORD_URL = `${API_URL}/mp-auth/reset-password`;
export const GET_USER_URL = `${API_URL}/mp-auth/user`;
export const VERIFY_EMAIL_URL = `${API_URL}/mp-auth/verify-email`;
export const VERIFY_RESEND_EMAIL_URL = `${API_URL}/mp-auth/verify-resend-email`;
export const TWO_FACTOR_RESEND_URL = `${API_URL}/mp-auth/two-factor-resend`;
export const TWO_FACTOR_SEND_CODE_URL = `${API_URL}/mp-auth/two-factor-login`;
export const LOGOUT_URL = `${API_URL}/mp-auth/logout`;


interface AuthContextProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  login: (email: string, password: string) => Promise<{ errorMessage: string; status: string }>;
  register: (
    email: string,
    yetkiliFullName: string,
    firmaAdi: string,
    password: string,
    confirmPassword: string
  ) => Promise<{ errorMessage: string; status: string }>;
  requestPasswordResetLink: (email: string) => Promise<{ errorMessage: string; status: string }>;
  changePassword: (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => Promise<AxiosResponse>;
  verifyEmail: (
    token: string,
    password: string
  ) => Promise<{ errorMessage: string, status: string }>;
  verifyResendEmail: (email: string) => Promise<{ errorMessage: string, status: string }>;
  twoFactorResend: (payload: string, email: string) => Promise<{ errorMessage: string, status: string }>;
  twoFactorSendCode: (code: string, email: string) => Promise<{ errorMessage: string, status: string }>;
  getUser: () => Promise<AxiosResponse<any>>;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();
  const [openSohbetModal, setOpenSohbetModal] = useState(false);
  const [sohbetKullaniciId, setSohbetKullaniciId] = useState<number | undefined>();




  const verify = async () => {
    if (auth) {
      let usersave: UserModel;
      try {
        const { data: user } = await getUser();
        usersave = user

        setCurrentUser(usersave);
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const saveAuth = async (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };


  const login = async (email: string, password: string) => {


    try {
      localStorage.clear();
      sessionStorage.clear();
      const { data }: any = await axios.post<AuthModel>(LOGIN_URL, {
        email,
        password
      });
      if (data?.user?.access_token === '2fa') {
        return { errorMessage: data?.user?.message, status: '2fa', email: data?.user?.email, phone: data?.user?.phoneNumber, type: data?.user?.type };
      } else if (data?.user?.access_token === 'email-verification') {
        return { errorMessage: data?.user?.message, status: 'email-verification' };
      } else {
        await saveAuth(data?.user);
        const { data: user } = await getUser();
        setCurrentUser(user);
        const errorMessage = 'İşlem başarılı';
        return { errorMessage: errorMessage, status: 'success' };
      }
    } catch (error) {
      saveAuth(undefined);
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          const message = error.response.data.message;
          let errorMessages: string;
          if (Array.isArray(message)) {
            errorMessages = message
              .map((err: any) =>
                typeof err === "string" ? err : Object.values(err.constraints || {}).join(" ")
              )
              .join(" | ");
          } else if (typeof message === "string") {
            errorMessages = message;
          } else {
            errorMessages = "Bilinmeyen bir hata oluştu.";
          }

          return { errorMessage: errorMessages, status: 'error' };
        } else {
          return { errorMessage: "Bilinmeyen bir hata oluştu.", status: 'error' };
        }
      }
      throw new Error('Beklenmedik bir hata oluştu');
    }
  };

  const register = async (
    yetkiliFullName: string,
    firmaAdi: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      const { data } = await axios.post(REGISTER_URL, {
        yetkiliFullName,
        firmaAdi,
        email,
        password,
        confirmPassword
      });
      if (data?.user?.access_token === 'email-verification') {
        return { errorMessage: 'email-verification', status: 'email-verification' };
      } else if (data?.status) {
        return { errorMessage: data.message, status: 'error' };
      } else {
        await saveAuth(data.user);
        const { data: user } = await getUser();
        setCurrentUser(user);
        const errorMessage = data?.message || 'İşlem başarılı';
        return { errorMessage: errorMessage, status: 'success' };
      }

    } catch (error) {
      saveAuth(undefined);
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          const message = error.response.data.message;
          let errorMessages: string;
          if (Array.isArray(message)) {
            errorMessages = message
              .map((err: any) =>
                typeof err === "string" ? err : Object.values(err.constraints || {}).join(" ")
              )
              .join(" | ");
          } else if (typeof message === "string") {
            errorMessages = message;
          } else {
            errorMessages = "Bilinmeyen bir hata oluştu.";
          }

          return { errorMessage: errorMessages, status: 'error' };
        } else {
          return { errorMessage: "Bilinmeyen bir hata oluştu.", status: 'error' };
        }
      }
      throw new Error('Beklenmedik bir hata oluştu');
    }
  };

  const requestPasswordResetLink = async (email: string): Promise<{ errorMessage: string; status: string }> => {
    try {
      const response: any = await axios.post(FORGOT_PASSWORD_URL, { email });

      if (response?.data?.success) {
        return { errorMessage: 'İşlem başarılı', status: 'success' };
      } else {
        return { errorMessage: "Beklenmedik bir hata oluştu.", status: 'error' };
      }



    } catch (error) {
      saveAuth(undefined);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        let errorMessages: string;

        if (Array.isArray(message)) {
          errorMessages = message
            .map((err: any) =>
              typeof err === "string" ? err : Object.values(err.constraints || {}).join(" ")
            )
            .join(" | ");
        } else if (typeof message === "string") {
          errorMessages = message;
        } else {
          errorMessages = "Bilinmeyen bir hata oluştu.";
        }

        return { errorMessage: errorMessages, status: 'error' };
      }

      return { errorMessage: "Beklenmedik bir hata oluştu.", status: 'error' };
    }
  };


  const changePassword = async (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ): Promise<AxiosResponse> => {
    try {
      const response = await axios.post(
        RESET_PASSWORD_URL,
        { email, password, token, password_confirmation });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyResendEmail = async (email: string): Promise<{ errorMessage: string, status: string }> => {
    try {
      const response = await axios.post(VERIFY_RESEND_EMAIL_URL, { email });
      if (response.status === 200 || response.data.status === 201) {
        return { errorMessage: 'E-posta başarıyla gönderildi', status: 'success' };
      } else {
        return { errorMessage: response.data.message, status: 'error' };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          const message = error.response.data.message;
          let errorMessages: string;
          if (Array.isArray(message)) {
            errorMessages = message
              .map((err: any) =>
                typeof err === "string" ? err : Object.values(err.constraints || {}).join(" ")
              )
              .join(" | ");
          } else if (typeof message === "string") {
            errorMessages = message;
          } else {
            errorMessages = "Bilinmeyen bir hata oluştu.";
          }

          return { errorMessage: errorMessages, status: 'error' };
        } else {
          return { errorMessage: "Bilinmeyen bir hata oluştu.", status: 'error' };
        }
      }
      throw new Error('Beklenmedik bir hata oluştu');
    }
  };


  const twoFactorResend = async (payload: string, email: string): Promise<{ errorMessage: string, status: string }> => {
    try {
      const response = await axios.post(TWO_FACTOR_RESEND_URL, { payload: payload, email: email });
      if (response.status === 200 || response.data.status === 201) {
        return { errorMessage: 'E-posta başarıyla gönderildi', status: 'success' };
      } else {
        return { errorMessage: response.data.message, status: 'error' };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          const message = error.response.data.message;
          let errorMessages: string;
          if (Array.isArray(message)) {
            errorMessages = message
              .map((err: any) =>
                typeof err === "string" ? err : Object.values(err.constraints || {}).join(" ")
              )
              .join(" | ");
          } else if (typeof message === "string") {
            errorMessages = message;
          } else {
            errorMessages = "Bilinmeyen bir hata oluştu.";
          }

          return { errorMessage: errorMessages, status: 'error' };
        } else {
          return { errorMessage: "Bilinmeyen bir hata oluştu.", status: 'error' };
        }
      }
      throw new Error('Beklenmedik bir hata oluştu');
    }
  };


  const twoFactorSendCode = async (code: string, email: string): Promise<{ errorMessage: string, status: string }> => {
    try {
      const response = await axios.post(TWO_FACTOR_SEND_CODE_URL, { code: code, email: email });

      if (response.status === 200 || response.status === 201) {
        await saveAuth(response.data);
        const { data: user } = await getUser();
        setCurrentUser(user);
        return { errorMessage: 'Kod başarıyla gönderildi', status: 'success' };
      } else {
        return { errorMessage: response.data.message, status: 'error' };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          const message = error.response.data.message;
          let errorMessages: string;
          if (Array.isArray(message)) {
            errorMessages = message
              .map((err: any) =>
                typeof err === "string" ? err : Object.values(err.constraints || {}).join(" ")
              )
              .join(" | ");
          } else if (typeof message === "string") {
            errorMessages = message;
          } else {
            errorMessages = "Bilinmeyen bir hata oluştu.";
          }

          return { errorMessage: errorMessages, status: 'error' };
        } else {
          return { errorMessage: "Bilinmeyen bir hata oluştu.", status: 'error' };
        }
      }
      throw new Error('Beklenmedik bir hata oluştu');
    }
  };



  const verifyEmail = async (
    token: string,
    password: string
  ): Promise<{ errorMessage: string, status: string }> => {
    try {
      const response = await axios.post(
        VERIFY_EMAIL_URL,
        { token, password });
      if (response?.data?.access_token) {
        await saveAuth(response?.data);
        const { data: user } = await getUser();
        setCurrentUser(user);
        const errorMessage = response?.data?.message || 'İşlem başarılı';
        return { errorMessage: errorMessage, status: 'success' };
      } else {
        return { errorMessage: response?.data?.message, status: 'error' };
      }
    } catch (error) {
      throw error;
    }
  };

  const getUser = async () => {
    return await axios.get<UserModel>(GET_USER_URL);
  };

  const logout = async () => {
    await axios.get(LOGOUT_URL, {
      headers: {
        Platform: 'web',
      }
    });
    saveAuth(undefined);
    setCurrentUser(undefined);
    localStorage.clear();
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        register,
        requestPasswordResetLink,
        changePassword,
        getUser,
        logout,
        verify,
        verifyEmail,
        verifyResendEmail,
        twoFactorResend,
        twoFactorSendCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
