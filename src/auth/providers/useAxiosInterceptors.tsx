import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useState, useEffect } from "react";

const useAxiosInterceptors = (auth: any, saveAuth: any, setCurrentUser: any) => {
  const [blockTime, setBlockTime] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [abonelikBitmis, setAbonelikBitmis] = useState(0);

  useEffect(() => {
    // Request Interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (isBlocked) {
          setMessage("Blok süresi devam ediyor.");
          return Promise.reject(new Error("Blok süresi devam ediyor."));
        }
        if (auth?.access_token) {
          config.headers.Authorization = `Bearer ${auth.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: any) => {
        if (error.response?.status === 401) {
          saveAuth(undefined);
          setCurrentUser(undefined);
        }

        if (error.response?.status === 429) {
          // 429 Hatası - Too Many Requests
          const retryAfter = error.response.headers["retry-after"] || 60;
          if (retryAfter) {
            const blockDuration = parseInt(retryAfter, 10) * 1000; // Saniyeyi milisaniyeye çevir
            setBlockTime(Date.now() + blockDuration);
            setIsBlocked(true);

            // Geri sayım başlat
            const countdown = setInterval(() => {
              setBlockTime((prev) => {
                if (!prev) return null;
                const remaining = prev - Date.now();
                if (remaining <= 0) {
                  clearInterval(countdown);
                  setIsBlocked(false);
                  return null;
                }
                return prev;
              });
            }, 1000);
          }
        }

        if (error.response?.status === 442) {
          // 442 Hatası - Firma Abonelik Hatası
          setMessage("Firma ya ait aktif abonelik bulunamadı.");
          console.log(error.response)
          setAbonelikBitmis(Number(error.response?.data?.FirmaID ?? 0))
        }

        return Promise.reject(error);
      }
    );

    // Cleanup function
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [auth, isBlocked]);

  return { isBlocked, blockTime, message,abonelikBitmis,setAbonelikBitmis };
};

export default useAxiosInterceptors;
