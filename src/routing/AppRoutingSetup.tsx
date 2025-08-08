import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { DefaultPage, Demo1DarkSidebarPage } from '@/pages/dashboards';
import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { Demo1Layout } from '@/layouts/demo1';
import { ErrorsRouting } from '@/errors';
import { AccountSettingsSidebarPage } from '@/pages/userprofil/settings';
import { SozlesmeSayfasi } from '@/errors/SozlesmeSayfasi';
import { BildirimArsiviPage } from '@/pages/bildirimler';

const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<Demo1Layout />}>
        <Route path="/sozlesme/:anahtar" element={<SozlesmeSayfasi />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/:itemId?" element={<DefaultPage />} />
          <Route path="/dark-sidebar" element={<Demo1DarkSidebarPage />} />

          <Route path="/account/profil/settings" element={<AccountSettingsSidebarPage />} />
          <Route path="/bildirim-arsivi" element={<BildirimArsiviPage />} />



        </Route>

      </Route>

      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" replace={false} />} />
    </Routes>
  );
};

export { AppRoutingSetup };
