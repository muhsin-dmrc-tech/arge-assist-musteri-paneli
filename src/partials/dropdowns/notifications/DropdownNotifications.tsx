
import { KeenIcon } from '@/components';
import { Menu, MenuItem, MenuSub, MenuToggle } from '@/components/menu';
import { Tab, TabPanel, Tabs, TabsList } from '@/components/tabs';
import { DropdownNotificationsAll } from './DropdownNotificationsAll';
import { useEffect, useState } from 'react';


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
interface IDropdownNotificationProps {
  menuTtemRef: any;
  bildirimler: IBildirimData[];
  allAsReadFunc: ()=>void;
  handleScroll: (e: React.UIEvent<HTMLDivElement, UIEvent>)=>void;
}

const DropdownNotifications = ({ menuTtemRef, bildirimler,allAsReadFunc,handleScroll }: IDropdownNotificationProps) => {
  /* const { isRTL } = useLanguage(); */
  const [tabsContent, setTabsContent] = useState<JSX.Element | null>(null);
  const handleClose = () => {
    if (menuTtemRef.current) {
      menuTtemRef.current.hide(); // Call the closeMenu method to hide the submenu
    }
  };

  const buildHeader = () => {
    return (
      <div className="flex items-center justify-between gap-2.5 text-sm text-gray-900 font-semibold px-5 py-2.5 border-b border-b-gray-200">
        Bildirimler
        <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={handleClose}>
          <KeenIcon icon="cross" />
        </button>
      </div>
    );
  };

  

  useEffect(() => {
    setTabsContent(
      <Tabs defaultValue={1} className="">
        <TabPanel value={1}>
          <DropdownNotificationsAll bildirimler={bildirimler} allAsReadFunc={allAsReadFunc} handleScroll={handleScroll} />
        </TabPanel>
      </Tabs>
    );
  }, [bildirimler]);


  return (
    <MenuSub rootClassName="w-full max-w-[460px]" className="light:border-gray-300">
      {buildHeader()}
      {tabsContent}
    </MenuSub>
  );
};

export { DropdownNotifications };
