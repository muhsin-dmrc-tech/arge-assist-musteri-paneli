import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSettings } from '@/providers/SettingsProvider';
import { AppRouting } from '@/routing';
import { PathnameProvider } from '@/providers';
import { Toaster } from '@/components/ui/sonner';
import { useAuthContext } from './auth';
import useAxiosInterceptors from './auth/providers/useAxiosInterceptors';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { useSocketListener } from './hooks/useSocketListener';
import { SocketDataProvider } from './auth/SocketDataContext';
import { UserStatusProvider } from './auth/UserStatusContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Dinamik import (Lazy load)
const FirmaAbonelikYenileModal = lazy(() => import('./partials/modals/firma-abonelik-yenile-modal/FirmaAbonelikYenileModal'));
const IstekKotaAlertModal = lazy(() => import('./partials/modals/istek-kota-alert-modal/IstekKotaAlertModal'));

const { BASE_URL } = import.meta.env;



const AppInner = () => {
  useSocketListener();
  return <div></div>;
};


const App = () => {
  const { settings } = useSettings();
  const { auth, saveAuth, setCurrentUser, currentUser} = useAuthContext();
  const { isBlocked, blockTime, message, abonelikBitmis, setAbonelikBitmis } = useAxiosInterceptors(auth, saveAuth, setCurrentUser);
  const [open, setOpen] = useState(false);
  const [openAbonelikYenile, setOpenAbonelikYenile] = useState(false);
  const [firmaAbonelikYenileID, setFirmaAbonelikYenileID] = useState(0);

 



  useEffect(() => {
    if (isBlocked && blockTime) {
      setOpen(true);
    }
    if (abonelikBitmis > 0) {
      setOpenAbonelikYenile(true)
      setFirmaAbonelikYenileID(abonelikBitmis)
      setTimeout(() => {
        setAbonelikBitmis(0)
      }, 500)
    }
  }, [isBlocked, blockTime, message, abonelikBitmis]);



  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add(settings.themeMode);
  }, [settings]);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter
        basename={BASE_URL}
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
        <SocketDataProvider>
          <UserStatusProvider>
            <AppInner />
            <PathnameProvider>
              <Suspense fallback={<div>Yükleniyor...</div>}>
                {open && IstekKotaAlertModal && <IstekKotaAlertModal open={open} setOpen={setOpen} />}
                {openAbonelikYenile && FirmaAbonelikYenileModal && <FirmaAbonelikYenileModal open={openAbonelikYenile} setOpen={setOpenAbonelikYenile} firmaID={firmaAbonelikYenileID} />}
              </Suspense>

              <AppRouting />
            </PathnameProvider>
          </UserStatusProvider>
        </SocketDataProvider>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export { App };
