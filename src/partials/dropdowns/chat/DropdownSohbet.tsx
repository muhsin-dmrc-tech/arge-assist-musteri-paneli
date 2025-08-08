import { useRef } from 'react';
import { DefaultTooltip, KeenIcon } from '@/components';
import { IDropdownSohbetProps } from '@/auth/types';
import SohbetItem from './SohbetItem';
import { useAuthContext } from '@/auth';
import { useSocketData } from '@/auth/SocketDataContext';
import { Skeleton } from '@mui/material';
import { Flipper, Flipped } from 'react-flip-toolkit';
import { Link, useLocation } from 'react-router-dom';

const DropdownSohbet = ({ menuTtemRef, itemChatRef }: IDropdownSohbetProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { setOpenSohbetModal } = useAuthContext();
  const { pathname } = useLocation();
  const {
    sohbetler,
    sohbetlerIsLoading,
    setPageSohbet,
    pageSohbet,
    totalPageSohbet,
    setSeciliSohbetId,
    setSeciliEkran
  } = useSocketData();


  const handleScrollSohbet = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (pageSohbet >= totalPageSohbet) {
      return;
    }

    const bottom = e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.clientHeight;
    if (bottom && !sohbetlerIsLoading) {
      setPageSohbet(prevPageSohbet => prevPageSohbet + 1);
    }
  };



  const handleClose = () => {
    if (menuTtemRef && menuTtemRef.current) {
      menuTtemRef.current.hide(); // Call the closeMenu method to hide the submenu
    }
    if (itemChatRef && itemChatRef.current) {
      itemChatRef.current.classList.add('-translate-x-full');
      itemChatRef.current.classList.remove('translate-x-0');
    };
  }

  const handleOpenModal = () => {
    if (menuTtemRef && menuTtemRef.current) {
      menuTtemRef.current.hide(); // Call the closeMenu method to hide the submenu
    }
    if (itemChatRef && itemChatRef.current) {
      itemChatRef.current.classList.add('-translate-x-full');
      itemChatRef.current.classList.remove('translate-x-0');
    };
    if (pathname !== '/sohbetler') {
      setOpenSohbetModal(true)
    }
    setSeciliEkran('sohbet')
  };

  const buildHeader = () => {
    return (
      <>
        <div className="flex items-center justify-between gap-2.5 text-sm text-gray-900 font-semibold px-5 py-2.5">
          {pathname !== '/sohbetler' ? <Link to='/sohbetler' className='hover:text-green-700'>Tüm sohbetler</Link> : <div>Tüm sohbetler</div>}
          <div className="flex items-center">
            <DefaultTooltip title='Yeni sohbet'>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear shrink-0"
                onClick={() => { handleOpenModal(), setSeciliSohbetId(0), setSeciliEkran('kisiler') }}
              >
                <KeenIcon icon="message-add" />
              </button>
            </DefaultTooltip>
            <DefaultTooltip title='Kapat' className='md:hidden'>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear shrink-0 md:hidden"
                onClick={handleClose}
              >
                <KeenIcon icon="cross" />
              </button>
            </DefaultTooltip>
          </div>
        </div>
        <div className="border-b border-b-gray-200"></div>
      </>
    );
  };




  const buildSohbetler = () => {
    return (
      <div className="flex flex-col gap-1 py-5 relative overflow-hidden">
        {sohbetlerIsLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton
              variant="rectangular"
              height={80}
              animation="wave"
              style={{ borderRadius: 8 }}
            />
          </div>
        )}

        {sohbetler.length > 0 ? (
          // Flipper component with unique `flipKey`
          <Flipper flipKey={sohbetler.map(i => i.SohbetID).join('-')}>
            <div className="space-y-2">
              {sohbetler.map((sohbet, index) => (
                <Flipped key={sohbet.SohbetID} flipId={sohbet.SohbetID}>
                  <div>
                    <SohbetItem
                      Sohbet={sohbet}
                      handleOpenModal={handleOpenModal}
                    />
                  </div>
                </Flipped>
              ))}
            </div>
          </Flipper>
        ) : !sohbetlerIsLoading && (
          <div className="text-bold w-full flex justify-center text-gray-500">
            Hiç Sohbet Bulunamadı...
          </div>
        )}
      </div>
    );
  };


  const buildFoter = () => {
    return (
      <div className="p-4 bg-white flex justify-center items-center">
        <div className="border-b border-gary-700 w-[50px]"></div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[450px] h-full">
      <div ref={headerRef}>
        {buildHeader()}
        {/* {buildTopbar(Sohbet)} */}
      </div>

      <div
        ref={messagesRef}
        className="scrollable-y-auto max-h-full h-full px-2 max-md:px-0"
        onScroll={handleScrollSohbet}
      >
        {buildSohbetler()}
      </div>

      <div>
        {/*  {buildInviteNotification()} */}
        {buildFoter()}
      </div>
    </div>
  );
};

export { DropdownSohbet };
