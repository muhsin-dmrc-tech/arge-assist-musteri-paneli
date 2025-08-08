import { useAuthContext } from '@/auth';
import { SohbetMessage } from '@/auth/types';
import { KeenIcon } from '@/components';
import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import ImageViewer from 'react-simple-image-viewer';
import { toast } from 'sonner';


interface IDropdownChatMessageOutProps {
  mesaj: SohbetMessage;
  yenidenGonderFunc: (mesaj: SohbetMessage & { hata?: boolean; tempId?: number; Gonderiliyor?: boolean }) => Promise<void>;
  mesajSilFunc: (mesajId: number) => Promise<void>;
}

const DropdownChatMessageOut = ({ mesaj, yenidenGonderFunc, mesajSilFunc }: IDropdownChatMessageOutProps) => {
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { auth } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getFileIcon = (dosyaTipi: string) => {
    if (dosyaTipi.startsWith('image/')) return 'image';
    if (dosyaTipi.includes('pdf')) return 'document';
    if (dosyaTipi.includes('word')) return 'document';
    if (dosyaTipi.includes('excel')) return 'document';
    if (dosyaTipi.includes('zip') || dosyaTipi.includes('rar')) return 'file-down';
    return 'document';
  };

  const handleFileClick = async (dosya: any, index: number) => {
    if (dosya.DosyaTipi.startsWith('image/')) {
      setCurrentImageIndex(index);
      setIsViewerOpen(true);
    } else {
      try {
        // Axios ile isteği gönder (otomatik olarak token eklenecek)
        const response = await axios.get(
          `${API_URL}/sohbetler/get-file?dosyaYolu=${encodeURIComponent(dosya.DosyaURL)}`,
          {
            headers: { Authorization: `Bearer ${auth?.access_token}`, 'Content-Type': 'application/json' },
            responseType: 'blob',
          }
        );

        // Dosyayı indir
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', dosya.DosyaURL.split('/').pop() || 'dosya');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Dosya indirme hatası:', error);
        toast.error('Dosya indirilirken bir hata oluştu');
      }
    }
  };




  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.message-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);



  const menuRender = () => {
    if (!isMenuOpen) return null;

    return (
      <div className="flex flex-col gap-1 p-2 bg-white text-gray-700 shadow-lg rounded-lg absolute right-0 top-[30px] z-10">
        <button onClick={() => mesajSilFunc(mesaj.MesajID)}
          className="text-left px-3 py-1.5 hover:bg-gray-100 rounded text-xs">
          Sil
        </button>
        {/* <button className="text-left px-3 py-1.5 hover:bg-gray-100 rounded text-xs">
          Cevapla
        </button> */}
      </div>
    );
  };



  return (
    <div className="flex items-end justify-end gap-3.5 px-5 relative">
      <div className="flex flex-col gap-1.5 max-w-[80%]">
        {mesaj.SilindiMi ? <div className="flex bg-gray-200 p-1 text-xs rounded-md">Bu mesaj silindi.</div> :
          <div className="card shadow-none flex flex-col gap-1.5 p-3 pt-4 bg-primary text-primary-inverse rounded-be-none relative group">
            <div className="hidden group-hover:block absolute -top-1 right-0 message-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="px-1.5 py-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <KeenIcon
                  icon="down"
                  className={clsx(
                    'cursor-pointer text-gray-500 hover:text-gray-700 transition-colors',
                    isMenuOpen && 'text-primary'
                  )}
                />
              </button>
              {menuRender()}
            </div>




            {mesaj.Dosyalar && mesaj.Dosyalar.length > 0 && (
              <div className={clsx(
                "flex gap-2",
                mesaj.Dosyalar.length === 1 ? "justify-center" : "flex-wrap"
              )}>
                {mesaj.Dosyalar.map((dosya, index) => (
                  <div
                    key={dosya.DosyaID}
                    onClick={() => handleFileClick(dosya, index)}
                    className={clsx(
                      "rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105",
                      mesaj.Dosyalar?.length === 1 ? "w-48 h-48" : "w-10 h-10"
                    )}
                  >
                    {dosya.DosyaTipi.startsWith('image/') ? (
                      <img
                        src={`${API_URL}/${dosya.DosyaURL}`}
                        alt="Dosya önizleme"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white/10 gap-2 relative">
                        <div className="absolute top-0 right-0">
                          <KeenIcon icon='exit-down' />
                        </div>
                        <KeenIcon
                          icon={getFileIcon(dosya.DosyaTipi)}
                          className={clsx(
                            "text-white",
                            mesaj.Dosyalar?.length === 1 ? "text-4xl" : "text-2xl"
                          )}
                        />
                        {/* <span className="text-xs text-white/80 truncate max-w-full px-2">
                        {dosya.DosyaURL.split('/').pop()}
                      </span> */}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {mesaj.MesajIcerigi && <div className="text-2sm font-medium break-words whitespace-pre-wrap">
              {mesaj.MesajIcerigi.replace(/<[^>]+>/g, '')}
            </div>}
          </div>}

        {!mesaj.SilindiMi && <div className="flex items-center justify-end relative">
          {/* {mesaj.OkundumuBilgileri && mesaj.OkundumuBilgileri.length > 0 && <span className="text-2xs font-medium text-gray-600 me-6">Okundu({mesaj.OkundumuBilgileri.length})</span>} */}
          <KeenIcon
            icon={mesaj.hata ? "information-3" : mesaj.Gonderiliyor ? "timer" : "double-check"}
            className={clsx('text-lg absolute', mesaj.hata ? "text-danger" : mesaj.OkunmaBilgileri && mesaj.OkunmaBilgileri.length > 0 ? 'text-success' : 'text-gray-400')}
          />

        </div>}
      </div>



      <div className="relative shrink-0">
        {mesaj.GonderenKullanici?.ProfilResmi ? <img
          src={`${API_URL + mesaj.GonderenKullanici?.ProfilResmi}`}
          className="rounded-full size-9 shrink-0 min-h-9 min-w-9"
          alt={`${mesaj.GonderenKullanici?.AdSoyad}`}
        /> : <span className="flex items-center justify-center size-9 min-h-9 min-w-9 rounded-full border-2 border-success  text-sm font-semibold text-white bg-red-400">
          {mesaj.GonderenKullanici?.AdSoyad?.slice(0, 1).toLocaleUpperCase('tr-TR')}
        </span>}
      </div>


      {isViewerOpen && (
        <div className="image-viewer-container">
          <ImageViewer
            src={mesaj.Dosyalar?.filter(d => d.DosyaTipi.startsWith('image/')).map(d => `${API_URL}/${d.DosyaURL}`) || []}
            currentIndex={currentImageIndex}
            onClose={() => setIsViewerOpen(false)}
            disableScroll={true}
          />
        </div>
      )}
      {mesaj.hata &&
        <button className=' absolute text-green right-10 top-5 rounded-full p-1 px-2 bg-green-100' onClick={() => yenidenGonderFunc(mesaj)}>
          <KeenIcon icon='arrows-circle' />
        </button>
      }
    </div>
  );
};

export { DropdownChatMessageOut, type IDropdownChatMessageOutProps };
