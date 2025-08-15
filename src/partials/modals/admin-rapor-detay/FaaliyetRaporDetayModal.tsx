import { forwardRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthContext } from '@/auth/useAuthContext';
import { KeenIcon } from '@/components/keenicons';

interface IModalCreateitemProps {
  open: boolean;
  onOpenChange: (data: any) => void;
  setPdfData: React.Dispatch<React.SetStateAction<Blob | null>>;
  setCurrentFileName: React.Dispatch<React.SetStateAction<string>>;
  RaporID: number;
  setOpenPdfModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const FaaliyetRaporDetayModal = forwardRef<HTMLDivElement, IModalCreateitemProps>(
  ({ open, onOpenChange, RaporID, setPdfData, setCurrentFileName, setOpenPdfModal }, ref) => {
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const [isLoading, setIsLoading] = useState(false);
    const [item, setItem] = useState<any>(null);
    const { auth } = useAuthContext();

    const fetchItem = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/dokumanlar/get-item?raporId=${RaporID}`);
        if (response.status !== 200) {
          return;
        }
        if (response.data) {
          setItem(response.data)
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (open) {
        fetchItem();
      }
    }, [open]);

    const handleFileClick = async (file: any) => {
      const response: any = await fetchFile(file);
      if (response.status === 200) {
        handlePdfResponse(response.data, file);
      }
    };


    const handlePdfResponse = async (blob: Blob, file: any) => {
      try {
        if (blob && blob.size > 0) {
          setPdfData(blob);
          setCurrentFileName(typeof file === 'string' ? file : (file?.fileName || 'Dosya.pdf'));
          setOpenPdfModal(true);
        } else {
          throw new Error('Dosya oluşturulamadı');
        }
      } catch (error) {
        //console.error('Dosya işlenirken hata oluştu:', error);
        toast.error('Dosya görüntülenirken bir hata oluştu');
      }
    };



    const fetchFile = async (file: string) => {
      try {
        const response = await axios.get(`${API_URL}/dokumanlar/get-file?file=${file}`, {
          headers: { Authorization: `Bearer ${auth?.access_token}`, 'Content-Type': 'application/json' },
          responseType: 'blob',
        });
        return response
      } catch (error: any) {
        //console.error('Dosya indirme hatası:', error);
        toast.error(error?.message || 'Dosya indirilirken bir hata oluştu', {
          duration: 5000
        });
        return false
      }
    };









    return (
      <Dialog open={open} onOpenChange={() => onOpenChange('close')}>
        <DialogContent className="max-w-[600px]" ref={ref}>
          <DialogHeader className="flex flex-col gap-2.5">
            <DialogTitle className="text-2xl font-bold">Aylık Faaliyet Raporu Detayı</DialogTitle>
            <DialogDescription>Seçili döneme ait aylık faaliyet raporunu görüntülüyorsunuz.</DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center justify-center w-full h-full">
              <KeenIcon icon="loading" className="w-10 h-10 animate-spin" />
            </div>
          )}
          {!isLoading && (item ? (
            <div className="flex flex-col gap-1 mt-2.5 p-2.5 border border-gray-300 rounded-md">
              <span className='text-md font-semibold text-gray-900'>Rapor ID :{item.ID}</span>
              {/* <div className="flex flex-row">
                <span className='text-xs font-semibold text-gray-900'>Proje Adı :</span>
                <span className='text-xs font-semibold text-gray-700'>{item.Proje.ProjeAdi}</span>
              </div> */}
              <div className="flex flex-row">
                <span className='text-xs font-semibold text-gray-900'>Dönem :</span>
                <span className='text-xs font-semibold text-gray-700'>{item.Donem.DonemAdi}</span>
              </div>
              <div className="flex flex-row">
                <span className='text-xs font-semibold text-gray-900'>Durum :</span>
                <span className='text-xs font-semibold text-gray-700'>{item.Durum}</span>
              </div>
              <div className="flex flex-row">
                <span className='text-xs font-semibold text-gray-900'>Hazırlayan Kullanıcı :</span>
                <span className='text-xs font-semibold text-gray-700'>{item.Kullanici.AdSoyad}</span>
              </div>
              <div className="mt-2">Dosyalar</div>              

              <div className="flex flex-row gap-5 items-center border-b">
                <span className='text-md font-semibold text-gray-900 min-w-[310px]'>Onaysız SGK Hizmet Listesi :</span>
                <KeenIcon icon={item.SGKHizmet ? 'check' : 'cross'} className={item.SGKHizmet ? 'text-green-600' : 'text-red-600'} />
                <span className='text-lg font-semibold text-gray-700'>
                  {item.SGKHizmet ?
                    <div className="flex items-center gap-1 cursor-pointer hover:text-green-600"
                      onClick={() => handleFileClick(item.SGKHizmet)}
                    >
                      <KeenIcon icon='document' />
                      <span className='text-xs'>Görüntüle</span>
                    </div>
                    : <span className='text-xs'>---</span>
                  }</span>
              </div>

              <div className="flex flex-row gap-5 items-center border-b">
                <span className='text-md font-semibold text-gray-900 min-w-[310px]'>Onaysız Muhtasar Ve Prim Hizmet Beyannamesi :</span>
                <KeenIcon icon={item.MuhtasarVePrim ? 'check' : 'cross'} className={item.MuhtasarVePrim ? 'text-green-600' : 'text-red-600'} />
                <span className='text-lg font-semibold text-gray-700'>
                  {item.MuhtasarVePrim ?
                    <div className="flex items-center gap-1 cursor-pointer hover:text-green-600"
                      onClick={() => handleFileClick(item.MuhtasarVePrim)}
                    >
                      <KeenIcon icon='document' />
                      <span className='text-xs'>Görüntüle</span>
                    </div>
                    : <span className='text-xs'>---</span>
                  }</span>
              </div>

              <div className="flex flex-row gap-5 items-center border-b">
                <span className='text-md font-semibold text-gray-900 min-w-[310px]'>Onaylı SGK Hizmet Listesi :</span>
                <KeenIcon icon={item.OnayliSGKHizmet ? 'check' : 'cross'} className={item.OnayliSGKHizmet ? 'text-green-600' : 'text-red-600'} />
                <span className='text-lg font-semibold text-gray-700'>
                  {item.OnayliSGKHizmet ?
                    <div className="flex items-center gap-1 cursor-pointer hover:text-green-600"
                      onClick={() => handleFileClick(item.OnayliSGKHizmet)}
                    >
                      <KeenIcon icon='document' />
                      <span className='text-xs'>Görüntüle</span>
                    </div>
                    : <span className='text-xs'>---</span>
                  }</span>
              </div>

              <div className="flex flex-row gap-5 items-center border-b">
                <span className='text-md font-semibold text-gray-900 min-w-[310px]'>Onaylı Muh. Ve Prim Hizmet Beyannamesi :</span>
                <KeenIcon icon={item.OnayliMuhtasarVePrim ? 'check' : 'cross'} className={item.OnayliMuhtasarVePrim ? 'text-green-600' : 'text-red-600'} />
                <span className='text-lg font-semibold text-gray-700'>
                  {item.OnayliMuhtasarVePrim ?
                    <div className="flex items-center gap-1 cursor-pointer hover:text-green-600"
                      onClick={() => handleFileClick(item.OnayliMuhtasarVePrim)}
                    >
                      <KeenIcon icon='document' />
                      <span className='text-xs'>Görüntüle</span>
                    </div>
                    : <span className='text-xs'>---</span>
                  }</span>
              </div>

              <div className="flex flex-row gap-5 items-center border-b">
                <span className='text-md font-semibold text-gray-900 min-w-[310px]'>SGK Tahakkuk Fişi :</span>
                <KeenIcon icon={item.SGKTahakkuk ? 'check' : 'cross'} className={item.SGKTahakkuk ? 'text-green-600' : 'text-red-600'} />
                <span className='text-lg font-semibold text-gray-700'>
                  {item.SGKTahakkuk ?
                    <div className="flex items-center gap-1 cursor-pointer hover:text-green-600"
                      onClick={() => handleFileClick(item.SGKTahakkuk)}
                    >
                      <KeenIcon icon='document' />
                      <span className='text-xs'>Görüntüle</span>
                    </div>
                    : <span className='text-xs'>---</span>
                  }</span>
              </div>

               <div className="flex flex-row gap-5 items-center border-b">
                <span className='text-md font-semibold text-gray-900 min-w-[310px]'>Ön Onay :</span>
                <KeenIcon icon={item.Onaylimi ? 'check' : 'cross'} className={item.Onaylimi ? 'text-green-600' : 'text-red-600'} />
              </div>

                      

            </div>
          ) : <div className="flex flex-col gap-1 mt-2.5 p-2.5">
            Aylık Faaliyet Raporu bulunamadı.
          </div>)}


        </DialogContent>
      </Dialog>
    );
  }
);

export { FaaliyetRaporDetayModal };
