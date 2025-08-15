import { useResponsive, useScrollPosition } from '@/hooks';
import {
  AuthEmail,
  AuthPassword,
  BasicSettings,
} from './blocks';
import { useEffect, useRef, useState } from 'react';
import { useLayout } from '@/providers';
import { toast } from 'sonner';
import axios from 'axios';
import { UserModel } from '@/auth';
import { useAuthContext } from '@/auth';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const stickySidebarClasses: Record<string, string> = {
  'demo1-layout': 'top-[calc(var(--tw-header-height)+1rem)]',
  'demo2-layout': 'top-[calc(var(--tw-header-height)+1rem)]',
  'demo3-layout': 'top-[calc(var(--tw-header-height)+var(--tw-navbar-height)+1rem)]',
  'demo4-layout': 'top-[3rem]',
  'demo5-layout': 'top-[calc(var(--tw-header-height)+1.5rem)]',
  'demo6-layout': 'top-[3rem]',
  'demo7-layout': 'top-[calc(var(--tw-header-height)+1rem)]',
  'demo8-layout': 'top-[3rem]',
  'demo9-layout': 'top-[calc(var(--tw-header-height)+1rem)]',
  'demo10-layout': 'top-[1.5rem]'
};

interface UserUploadType {
  user: UserModel;
}

const AccountSettingsSidebarContent = () => {
  const desktopMode = useResponsive('up', 'lg');
  const { currentLayout } = useLayout();
  const [sidebarSticky, setSidebarSticky] = useState(false);
  const [hesapSilModal, setHesapSilModal] = useState(false);

  // Initialize ref for parentEl
  const parentRef = useRef<HTMLElement | Document>(document); // Default to document
  const scrollPosition = useScrollPosition({ targetRef: parentRef });
  const { currentUser, setCurrentUser, saveAuth }: any = useAuthContext();
  const navigate = useNavigate();
  const [userValues, setUserValues] = useState<UserUploadType>({
    user: {
      id: 0,
      Email: '',
      AdSoyad: '',
      FirmaAdi: '',
      ProfilResmi:'',
      Telefon: '',
      Sifre: ''
    }
  });

  const API_URL = import.meta.env.VITE_APP_API_URL;

  // Effect to update parentRef after the component mounts
  useEffect(() => {
    const scrollableElement = document.getElementById('scrollable_content');
    if (scrollableElement) {
      parentRef.current = scrollableElement;
    }
  }, []); // Run only once on component mount

  // Handle scroll position and sidebar stickiness
  useEffect(() => {
    setSidebarSticky(scrollPosition > 100);
  }, [scrollPosition, currentLayout?.options]);

  // Get the sticky class based on the current layout, provide a default if not found
  const stickyClass = currentLayout?.name
    ? stickySidebarClasses[currentLayout.name] || 'top-[calc(var(--tw-header-height)+1rem)]'
    : 'top-[calc(var(--tw-header-height)+1rem)]';

  useEffect(() => {
    if (currentUser) {
      setUserValues({ ...userValues, user: currentUser })
    }
  }, [currentUser])

  const setInfoFunc = async () => {
    const response: any = await axios.post(`${API_URL}/auth/user-info-update`, {fullName:userValues?.user?.AdSoyad || '',phoneNumber:userValues?.user?.Telefon || ''});
    if (response) {
      if (response.status === 201) {
        setCurrentUser(response.data)
        toast.success('Güncelleme başarılı', { duration: 2000 });
      } else {
        toast.error(response?.response?.data ? response?.response?.data?.message : `Bilgi güncelleme başarısız`, { duration: 2000 });
      }
    }
  }

  const setEmailFunc = async (email: string) => {
    if (!email) {
      return
    }
    try {
      const response: any = await axios.post(`${API_URL}/auth/email-update`, { email });
      if (response) {
        if (response.status === 201) {
          saveAuth(undefined);
          setCurrentUser(undefined);
          toast.success('Güncelleme başarılı', { duration: 2000 });
          navigate('/auth/check-email', { replace: true, state: { email: email } });
          return {
            status: response?.status,
            message: response?.data?.message
          }
        } else {
          toast.error(response?.response?.data ? response?.response?.data?.message : `Email güncelleme başarısız`, { duration: 2000 });
        }
      }
    } catch (error: any) {
      return {
        status: error.response?.status,
        message: error.response?.data?.message
      }
    }
  }



  const setPasswordReset = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      const response: any = await axios.post(`${API_URL}/auth/update-password`, { oldPassword, newPassword, confirmPassword });
      if (response) {
        if (response.status === 201) {
          toast.success('Güncelleme başarılı', { duration: 2000 });
          return {
            status: response?.status,
            message: response?.data?.message
          }
        } else {
          toast.error(response?.response?.data ? response?.response?.data?.message : `Şifre güncelleme başarısız`, { duration: 2000 });
        }
      }
    } catch (error: any) {
      return {
        status: error.response?.status,
        message: error.response?.data?.message
      }
    }
  }


  const hesapSilFunc = async () => {
    try {
      const response: any = await axios.post(`${API_URL}/auth/account-delete`, {});
      if (response) {
        if (response.status === 201) {
          toast.success('Hesabınız silindi', { duration: 2000 });
          saveAuth(undefined);
          setCurrentUser(undefined);
        } else {
          toast.error(response?.response?.data ? response?.response?.data?.message : `Hesap silme işlemi başarısız`, { duration: 2000 });
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data ? error?.response?.data?.message : `Hesap silme işlemi başarısız`, { duration: 2000 });
    } finally {
      setHesapSilModal(false)
    }
  }







  return (
    <div className="flex grow gap-5 lg:gap-7.5">
      {/* {desktopMode && (
        <div className="w-[230px] shrink-0">
          <div
            className={clsx('w-[230px]', sidebarSticky && `fixed z-10 start-auto ${stickyClass}`)}
          >
            <Scrollspy offset={100} targetRef={parentRef}>
              <AccountSettingsSidebar />
            </Scrollspy>
          </div>
        </div>
      )} */}

      

      <div className="flex flex-col items-stretch grow gap-5 lg:gap-7.5">
        <BasicSettings
          userValues={userValues}
          setUserValues={setUserValues}
          setInfoFunc={setInfoFunc}
        />

        <AuthEmail
          setEmailFunc={setEmailFunc}
          userEmail={userValues?.user?.Email}
        />

        <AuthPassword
          setPasswordReset={setPasswordReset}
          userValues={userValues}
        />

        <div className="w-full">
          <button onClick={() => setHesapSilModal(true)} className='btn btn-danger w-full flex justify-center'>Hesabını Sil</button>
        </div>

        <Dialog open={hesapSilModal} onOpenChange={() => setHesapSilModal(false)}>
          <DialogContent className="max-w-[400px]">
            <DialogHeader className="flex flex-col gap-2.5">
              <DialogTitle className="text-2xl font-bold">Hesabınızı silmekmi istiyorsunuz ?</DialogTitle>
              <DialogDescription>
                Bu işlemi onaylamanız halinde, hesabınız silinmek üzere işleme alınacaktır. Hesabınız ve tüm verileriniz, 3 ay içerisinde tamamen sistemden kaldırılacaktır.<br/>
                Bu süre zarfında fikrinizi değiştirirseniz, destek merkezimizle iletişime geçerek hesabınızı tekrar aktif hale getirebilirsiniz.
              </DialogDescription>

            </DialogHeader>
            <DialogFooter>
              <button onClick={hesapSilFunc} className='btn btn-danger'>Hesabımı Sil</button>
              <button onClick={()=>setHesapSilModal(false)} className='btn btn-success'>Vazgeç</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/*  <AuthSocialSignIn />

        <AuthSingleSingOn />

        <AuthTwoFactor />

        <AdvancedSettingsPreferences />

        <AdvancedSettingsAppearance title={''} />

        <AdvancedSettingsNotifications />

        <AdvancedSettingsAddress />

        <ExternalServicesManageApi title={''} switch={false} />

        <ExternalServicesIntegrations />

        <DeleteAccount /> */}
      </div>
    </div>
  );
};

export { AccountSettingsSidebarContent };
