import { useEffect, useRef, useState } from 'react';
import { getHeight } from '@/utils';
import { useViewport } from '@/hooks';
import {DropdownNotificationsItem1} from './items';
import { Link } from 'react-router-dom';

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
  bildirimler: IBildirimData[];
  allAsReadFunc: ()=>void;
  handleScroll: (e: React.UIEvent<HTMLDivElement, UIEvent>)=>void;
}



const DropdownNotificationsAll = ({ bildirimler, allAsReadFunc,handleScroll }: IDropdownNotificationProps) => {
  const footerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState<number>(0);
  const [viewportHeight] = useViewport();
  const [tabsContent, setTabsContent] = useState<JSX.Element | null>(null);
  const offset = 300;

  useEffect(() => {
    if (footerRef.current) {
      const footerHeight = getHeight(footerRef.current);
      const availableHeight = viewportHeight - footerHeight - offset;
      setListHeight(availableHeight);
    }
  }, [viewportHeight]);

  useEffect(() => {
    setTabsContent(
      <div className="flex flex-col gap-1 px-1 pt-3 pb-4 divider-y divider-gray-200">
        {
          bildirimler.length > 0 ?
          <>
          {
          bildirimler.map((item,index) =>
            <div key={index}>
              <DropdownNotificationsItem1
                BildirimID={item.KullaniciBildirimID}
                KullaniciID={item.KullaniciID}
                Baslik={item.Baslik}
                OkunduMu={item.OkunduMu}
                Link={item.Link}
                Icerik={item.Icerik}
              />

              <div className="border-b border-b-gray-200"></div>
            </div>
          )
        }
          </> : 
          <div className="flex text-gray-700 font-medium w-full justify-center">
            Şu anda herhangi bir yeni bildiriminiz yok.
          </div>
        }
      </div>
    );
  }, [bildirimler]);

  const buildFooter = () => {
    return (
      <>
        <div className="border-b border-b-gray-200"></div>
        <div className="flex p-5 gap-2.5">
          <Link to='/bildirim-arsivi' className="btn btn-sm btn-light w-full justify-center">Tüm Bildirimler</Link>
          <button onClick={allAsReadFunc} className="btn btn-sm w-full btn-light justify-center">Hepsini okundu olarak işaretle</button>
        </div>
      </>
    );
  };

  return (
    <div className="grow">
      <div 
        className="scrollable-y-auto" 
        style={{ maxHeight: `${listHeight}px` }} 
        onScroll={handleScroll}  // Scroll event handler
      >
        {tabsContent}
      </div>
      <div ref={footerRef}>{buildFooter()}</div>
    </div>
  );
};


export { DropdownNotificationsAll };
