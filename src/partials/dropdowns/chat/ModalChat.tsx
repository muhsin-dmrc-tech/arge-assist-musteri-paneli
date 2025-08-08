import { KeenIcon } from '@/components';
import { IDropdownChatProps } from '@/auth/types';
import SohbetMesajlari from './SohbetMesajlari1';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/auth';

const ModalChat = ({ open, setOpen }: IDropdownChatProps) => {
  const { pathname } = useLocation();


  const handleClose = () => {
    setOpen(false);
  };

  const handleOverlayClick = (e: any) => {
    // Sadece overlay'e tıklandığında kapat (drawer içeriğine değil)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };


  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleOverlayClick}
        />
      )}

      {/* Drawer */}
      <div
        className={`drawer drawer-end flex flex-col max-w-[90%] w-[400px] fixed right-0 top-0 h-full max-h-[100vh] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'
          }`}
        data-drawer="true"
        id="drawer_2_2"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          {pathname !== '/sohbetler' ? <Link to='/sohbetler' className='hover:text-green-700'>Tüm sohbetler</Link> : <div></div>}
          <button
            className="btn btn-xs btn-icon btn-icon-xl btn-light hover:bg-gray-100 transition-colors"
            onClick={handleClose}
            type="button"
          >
            <KeenIcon icon='cross' />
          </button>
        </div>

        <SohbetMesajlari/>
      </div>
    </>
  );
};


export default ModalChat;
