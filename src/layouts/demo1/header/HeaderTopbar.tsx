import { useEffect, useRef, useState } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { Menu, MenuItem, MenuSub, MenuToggle } from '@/components';
import { DropdownUser } from '@/partials/dropdowns/user';
import { DropdownNotifications } from '@/partials/dropdowns/notifications';
import { useLanguage } from '@/i18n';
import { useAuthContext } from '@/auth';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSocketData } from '@/auth/SocketDataContext';


interface IBildirimData {
  KullaniciBildirimID: number;
  BildirimID: number;
  KullaniciID: number;
  Baslik: string;
  Link: string;
  Icerik: string;
  Durum: string;
  OkunduMu: boolean;
}

const HeaderTopbarim = () => {
  const { isRTL } = useLanguage();
  const itemChatRef = useRef<any>(null);
  const itemAppsRef = useRef<any>(null);
  const itemUserRef = useRef<any>(null);
  const itemNotificationsRef = useRef<any>(null);
  const { currentUser} = useAuthContext();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const {
    bildirimler,
    setBildirimler,
    bildirimSayisi,
    setBildirimSayisi,
    bildirimPage,
    setBildirimPage,
    totalPageBildirim,
    setTotalPageBildirim
  } = useSocketData();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { getfirmaId } = useParams();
  const navigate = useNavigate();
  const {pathname} = useLocation();

  const handleShow = () => {
    window.dispatchEvent(new Event('resize'));
  };

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const handleOpen = () => setSearchModalOpen(true);
  const handleClose = () => {
    setSearchModalOpen(false);
  };

  /* useEffect(() => {
    const handleBildirimOkundu = (data: any) => {
      if (data.BildirimID && data.KullaniciID) {
        if (data.KullaniciID === currentUser?.id) {
          setBildirimler((prevBildirimler) =>
            prevBildirimler.map((bildirim) =>
              bildirim.KullaniciBildirimID === data.BildirimID
                ? { ...bildirim, OkunduMu: true } // Yeni obje oluşturuluyor
                : bildirim
            )
          );
          setBildirimSayisi((prev) => Math.max(prev - 1, 0)); // Bildirim sayısını düşür
        }
      }
    };

    socket.on("BildirimOkundu", handleBildirimOkundu);

    return () => {
      socket.off("BildirimOkundu", handleBildirimOkundu); // Cleanup function
    };
  }, [currentUser?.id]); */

  /* useEffect(() => {
    const handleBildirimGeldi = (data: any) => {
      if (data.KullaniciBildirimID && data.KullaniciID) {
        if (data.KullaniciID === currentUser?.id) {
          setBildirimler(prev => {
            const existingBildirimIndex = prev.findIndex(
              (prevBildirim) => prevBildirim.KullaniciBildirimID === data.KullaniciBildirimID
            );

            // Eğer eşleşen bir bildirim varsa, hiçbir şey yapma
            if (existingBildirimIndex !== -1) {
              return prev; // Önceki listeyi olduğu gibi döndür
            }

            // Eşleşmeyen bildirimse, başa ekle
            setBildirimSayisi((prev) => Math.max(prev + 1, 0));
            return [data, ...prev]; // Yeni bildirimi listenin başına ekle
          });
          // Bildirim sayısını düşür
        }
      }
    };

    socket.on("newNotification", handleBildirimGeldi);

    return () => {
      socket.off("newNotification", handleBildirimGeldi); // Cleanup function
    };
  }, [currentUser?.id]);

  useEffect(() => {
    const handleMessage = (data: any) => {
      console.log("Yeni mesaj:", data);
    };

    socket.off("newMessage", handleMessage); // önce eski dinleyici varsa kaldır
    socket.on("newMessage", handleMessage);  // sonra ekle

    return () => {
      socket.off("newMessage", handleMessage); // unmount olunca temizle
    };
  }, [currentUser?.id]); */



  const allAsReadFunc = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/kullanici-bildirimleri/all-as-read`, {})
      if (data && data.status && data.status === 201) {
        setBildirimler((prevBildirimler) =>
          prevBildirimler.map((bildirim) =>
            bildirim.OkunduMu === false
              ? { ...bildirim, OkunduMu: true }
              : bildirim
          )
        );
        setBildirimSayisi(0);
      }
    } catch (error) {
      console.log(error)
    }
  }



  const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (bildirimPage >= totalPageBildirim) {
      return;
    }

    const bottom = e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.clientHeight;
    if (bottom && !isLoading) {
      setBildirimPage(prevPage => prevPage + 1);
    }
  };





 










  return (
    <div className="flex items-center gap-2 max-md:gap-0 lg:gap-3.5">
      {/*  <button
        onClick={handleOpen}
        className="btn btn-icon btn-icon-lg size-9 rounded-full hover:bg-primary-light hover:text-primary text-gray-500"
      >
        <KeenIcon icon="magnifier" />
      </button> */}
      {/* <ModalSearch open={searchModalOpen} onOpenChange={handleClose} /> */}
      {/* 
     

      <Menu>
        <MenuItem
          ref={itemAppsRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [-10, 10] : [10, 10]
                }
              }
            ]
          }}
        >
          <MenuToggle className="btn btn-icon btn-icon-lg size-9 rounded-full hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500">
            <KeenIcon icon="element-11" />
          </MenuToggle>

          {DropdownApps()}
        </MenuItem>
      </Menu> */}



     
      <Menu>
        <MenuItem
          ref={itemNotificationsRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [-70, 10] : [70, 10] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuToggle className="btn btn-icon btn-icon-lg relative cursor-pointer size-9 rounded-full hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500">
            <KeenIcon icon="notification-status" />
            {bildirimSayisi > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                {bildirimSayisi}
              </span>
            )}
          </MenuToggle>

          {DropdownNotifications({ menuTtemRef: itemNotificationsRef, bildirimler: bildirimler, allAsReadFunc: allAsReadFunc, handleScroll: handleScroll })}
        </MenuItem>
      </Menu>

      <Menu>
        <MenuItem
          ref={itemUserRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [-20, 10] : [20, 10] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuToggle className="btn btn-icon rounded-full">
            {currentUser?.ProfilResmi ? <img
              src={`${API_URL + currentUser?.ProfilResmi}`}
              className="rounded-full size-9 shrink-0"
              alt={`${currentUser?.AdSoyad}`}
            /> : <span className="flex items-center justify-center size-9 rounded-full border-2 border-success  text-sm font-semibold text-white bg-red-400">
              {currentUser?.AdSoyad?.slice(0, 1).toUpperCase()}
            </span>}
          </MenuToggle>
          {DropdownUser({ menuItemRef: itemUserRef })}
        </MenuItem>
      </Menu>
    </div>
  );
};

export { HeaderTopbarim };
