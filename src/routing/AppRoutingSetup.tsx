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
import { TesvikHesaplamaModulPage } from '@/pages/tesvik-hesaplama-modul';
import { DokumanYuklemePage } from '@/pages/dokuman-yukleme-modulu';
import { RotaIzinleriPage } from '@/pages/staticks-pages/rota-izinleri';
import { IzinTuruPage } from '@/pages/staticks-pages/izin-turleri';
import { MuafiyetTipiPage } from '@/pages/staticks-pages/muafiyet-tipleri';
import { CalismaTuruPage } from '@/pages/staticks-pages/calisma-turleri';
import { AbonelikPlanlariPage } from '@/pages/staticks-pages/abonelik-planlari';
import { GiderTipiPage } from '@/pages/staticks-pages/gider-tipleri';
import { DestekTipiPage } from '@/pages/staticks-pages/destek-tipleri';
import { GorevlendirmeTuruPage } from '@/pages/staticks-pages/gorevlendirme-turleri';
import { DonemlerPage } from '@/pages/staticks-pages/donemler';
import { SureclerPage } from '@/pages/staticks-pages/surecler';
import { TeknokentPage } from '@/pages/staticks-pages/teknokentler';
import { SystemSecurityLogsPage } from '@/pages/staticks-pages/systemSecuritylogs';
import { KullanicilarAdminPage } from '@/pages/staticks-pages/kullanicilar';
import { LoginKayitlariPage } from '@/pages/staticks-pages/login-kayitlari';
import { EmailTemplatesPage } from '@/pages/staticks-pages/emailTemplates';
import { EmailTemplateUploadPage } from '@/pages/staticks-pages/emailTemplates/blocks/templates/EmailTemplateUploadPage';
import { ResmiTatillerPage } from '@/pages/staticks-pages/resmiTatiller';
import { BildirimlerPage } from '@/pages/staticks-pages/bildirim-yonetimi';
import { BildirimUploadPage } from '@/pages/staticks-pages/bildirim-yonetimi/blocks/bildirim-sablonlari/BildirimUploadPage';
import { SozlesmelerPage } from '@/pages/staticks-pages/sozlesmeler';
import { SozlesmeUploadPage } from '@/pages/staticks-pages/sozlesmeler/blocks/sozlesmeler/SozlesmeUploadPage';
import { AylikFaaliyetRaporlariPage } from '@/pages/aylik-faaliyet-raporlari';
import { AylikFaaliyetRaporlariAdminPage } from '@/pages/staticks-pages/aylik-faaliyet-raporlari';
import { AylikFaaliyetRaporuDetayPage } from '@/pages/staticks-pages/aylik-faaliyet-raporu-detay';
import { ProjeBasvuruWizardPage } from '@/pages/proje-basvuru-wizard';
import { ProjeBasvuruPage } from '@/pages/proje-basvurulari';
import { ProjeBasvuruAdminPage } from '@/pages/staticks-pages/proje-basvurulari';
import { ProjeBasvuruDetayPage } from '@/pages/staticks-pages/proje-basvuru-detay';
import { ProjelerAdminPage } from '@/pages/staticks-pages/projeler';
import { ProjelerUploadPage } from '@/pages/staticks-pages/projeler-upload';
import { ProjelerPage } from '@/pages/projeler';

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
          <Route path="/tesvik-hesaplama-modul" element={<TesvikHesaplamaModulPage />} />
          <Route path="/aylik-faaliyet-raporlari" element={<AylikFaaliyetRaporlariPage />} />
          <Route path="/aylik-faaliyet-raporlari/edit/:itemId?" element={<DokumanYuklemePage />} />
          <Route path="/proje-basvurulari" element={<ProjeBasvuruPage />} />
          <Route path="/proje-basvurulari/edit/:itemId?" element={<ProjeBasvuruWizardPage />} />
          <Route path="/proje-basvurulari/detay/:itemId?" element={<ProjeBasvuruDetayPage />} />
          <Route path="/projeler" element={<ProjelerPage />} />

          {/* STATİK ROTALARIM */}
          <Route path="/admin-aylik-faaliyet-raporlari" element={<AylikFaaliyetRaporlariAdminPage />} />
          <Route path="/admin-aylik-faaliyet-raporlari/detay/:itemId?" element={<AylikFaaliyetRaporuDetayPage />} />
          <Route path="/admin-projeler" element={<ProjelerAdminPage />} />
          <Route path="/admin-projeler/edit/:itemId?" element={<ProjelerUploadPage />} />
          <Route path="/statick/rota-izinleri" element={<RotaIzinleriPage />} />
          <Route path="/statick/rota-izinleri" element={<RotaIzinleriPage />} />
          <Route path="/statick/izin-turleri" element={<IzinTuruPage />} />
          <Route path="/statick/muafiyet-tipleri" element={<MuafiyetTipiPage />} />
          <Route path="/statick/calisma-turleri" element={<CalismaTuruPage />} />
          <Route path="/statick/abonelik-planlari" element={<AbonelikPlanlariPage />} />
          <Route path="/statick/gider-tipleri" element={<GiderTipiPage />} />
          <Route path="/statick/destek-tipleri" element={<DestekTipiPage />} />
          <Route path="/statick/gorevlendirme-turleri" element={<GorevlendirmeTuruPage />} />
          <Route path="/statick/donemler" element={<DonemlerPage />} />
          <Route path="/statick/surecler" element={<SureclerPage />} />
          <Route path="/statick/teknokentler" element={<TeknokentPage />} />
          <Route path="/statick/logs" element={<SystemSecurityLogsPage />} />
          <Route path="/statick/kullanicilar" element={<KullanicilarAdminPage />} />
          <Route path="/statick/login-kayitlari" element={<LoginKayitlariPage />} />
          <Route path="/statick/email-templates" element={<EmailTemplatesPage />} />
          <Route path="/statick/email-templates-upload/:itemId?" element={<EmailTemplateUploadPage />} />
          <Route path="/statick/resmi-tatiller" element={<ResmiTatillerPage />} />
          <Route path="/statick/bildirimler" element={<BildirimlerPage />} />
          <Route path="/statick/bildirim-upload/:itemId?" element={<BildirimUploadPage />} />
          <Route path="/statick/sozlesmeler" element={<SozlesmelerPage />} />
          <Route path="/statick/sozlesme-upload/:itemAnahtar?" element={<SozlesmeUploadPage />} />
          <Route path="/statick/proje-basvurulari" element={<ProjeBasvuruAdminPage />} />
          {/* <Route path="/statick/odeme-bildirimleri" element={<OdemeBildirimleriPage />} /> */}

        </Route>

      </Route>

      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" replace={false} />} />
    </Routes>
  );
};

export { AppRoutingSetup };
