import { lazy, Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthContext } from '@/auth/useAuthContext';
import { KeenIcon } from '@/components/keenicons';
import { useParams } from 'react-router';
import { Accordion, AccordionItem } from '@/components/accordion';
import { PdfGorunumModal } from '@/partials/modals/admin-rapor-detay/PdfGorunumModal';
import { FarklılarListesiData } from './AylikFaaliyetRaporuDetayData';
import { Box, Skeleton, Typography } from '@mui/material';
import { ProjeRaporuType, SGKTahakkuktype } from '@/pages/dokuman-yukleme-modulu/types';

const GunDetayliRapor = lazy(() => import('./component/GunDetayliRapor'));
const OnaysizSGKHizmet = lazy(() => import('./component/OnaysizSGKHizmet'));
const OnaysizMuhtasarVePrimHizmet = lazy(() => import('./component/OnaysizMuhtasarVePrimHizmet'));
const OnOnay = lazy(() => import('./component/OnOnay'));
const SGKHizmet = lazy(() => import('./component/SGKHizmet'));
const MuhtasarVePrimHizmet = lazy(() => import('./component/MuhtasarVePrimHizmet'));
const SGKTahakkukFisi = lazy(() => import('./component/SGKTahakkukFisi'));

const AylikFaaliyetRaporuDetay = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState<ProjeRaporuType>();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const { currentUser, auth } = useAuthContext();
  const [openPdfModal, setOpenPdfModal] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [pdfData, setPdfData] = useState<Blob | null>(null);
  const [sgkHizmetData, setSgkHizmetData] = useState<FarklılarListesiData[]>([]);
  const [onayliSgkHizmetData, setOnayliSgkHizmetData] = useState<FarklılarListesiData[]>([]);
  const [gunDetayliData, setGunDetayliData] = useState<FarklılarListesiData[]>([]);
  const [muhtasarVePrimData, setMuhtasarVePrimData] = useState<FarklılarListesiData[]>([]);
  const [onayliMuhtasarVePrimData, setOnayliMuhtasarVePrimData] = useState<FarklılarListesiData[]>([]);
  const [muafiyetRaporuData, setMuafiyetRaporuData] = useState<FarklılarListesiData[]>([]);
  const [onayliVergiTutar, setOnayliVergiTutar] = useState('');
  const [onayliTerkinTutar, setOnayliTerkinTutar] = useState('');
  const [onayliProjeKoduTespiti, setOnayliProjeKoduTespiti] = useState('');
  const [vergiTutar, setVergiTutar] = useState('');
  const [terkinTutar, setTerkinTutar] = useState('');
  const [projeKoduTespiti, setProjeKoduTespiti] = useState('');
  const [SGKTahakkuk, setSGKTahakkuk] = useState<SGKTahakkuktype>({} as SGKTahakkuktype);



  /* const sohbeteBasla = async (kullaniciID?: number) => {
    if (!kullaniciID || isNaN(kullaniciID)) return;
    if (!currentUser || currentUser?.id === kullaniciID) return;
    setSohbetKullaniciId(kullaniciID);
    setOpenSohbetModal(true)
  }; */





  const fetchItem = async () => {
    const queryParams = new URLSearchParams();
    if (itemId) {
      queryParams.set('raporId', String(itemId));
    }
    try {
      const response = await axios.get(`${API_URL}/dokumanlar/get-item?${queryParams.toString()}`);
      if (response.status !== 200) {
        return;
      }
      if (response.data && response.data?.ID) {
        setItem(response.data)
        setError(null)
        setPageError(null)
      } else {
        setPageError('Bu id ile eşleşen doküman kaydı bulunamadı')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
      setPageError(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu')
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchItem();
    } else {
      setPageError('item id zorunludur')
    }
  }, [itemId])



  const fetchFile = async (file: string) => {
    const queryParams = new URLSearchParams();

    queryParams.set('file', file);
    try {
      const response = await axios.get(`${API_URL}/dokumanlar/get-file?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${auth?.access_token}`, 'Content-Type': 'application/json' },
          responseType: 'blob',
        });
      return response
    } catch (error: any) {
      console.error('Dosya indirme hatası:', error);
      toast.error(error?.message || 'Dosya indirilirken bir hata oluştu', {
        duration: 5000
      });
      return false
    }
  };

  const fetchFileAnalize = async (file: string) => {
    const queryParams = new URLSearchParams();
    if (!itemId && !item) return
    queryParams.set('file', file);
    queryParams.set('raporId', String(itemId ?? item?.ID));
    try {
      const response = await axios.get(`${API_URL}/dokumanlar/get-file-analize?${queryParams.toString()}`);
      return response
    } catch (error: any) {
      console.error('Dosya indirme hatası:', error);
      toast.error(error?.message || 'Dosya indirilirken bir hata oluştu', {
        duration: 5000
      });
      return false
    }
  };


  const handlePdfResponse = async (blob: Blob | null, file: any) => {
    if (!blob) return;
    try {
      if (blob && blob.size > 0) {
        setPdfData(blob);
        setCurrentFileName(file);
        setOpenPdfModal(true);
      } else {
        throw new Error('Dosya oluşturulamadı');
      }
    } catch (error) {
      //console.error('Dosya işlenirken hata oluştu:', error);
      toast.error('Dosya görüntülenirken bir hata oluştu');
    }
  };

  const handleDownload = (pdfDataSave: Blob | null, filename: string) => {
    if (!pdfDataSave) return;

    try {
      let blob: Blob;
      if (pdfDataSave instanceof Blob) {
        blob = pdfDataSave;
      } else {
        const binaryString = atob(pdfDataSave);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: 'application/pdf' });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
    }
  };



  const handleSubmit = async (durum: string, surecAnahtar: string, aciklama?: string | null) => {
    try {
      const response = await axios.post(`${API_URL}/dokumanlar/onay-uploads`, { RaporID: item?.ID, durum, surecAnahtar, aciklama });
      return response;
    } catch (error: any) {
      console.log(error)
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        let errorMessages: string;
        if (Array.isArray(message)) {
          errorMessages = message
            .map((err: any) =>
              typeof err === "string" ? err : Object.values(err.constraints || {}).join(" ")
            )
            .join(" | ");
        } else if (typeof message === "string") {
          errorMessages = message;
        } else {
          errorMessages = "Bilinmeyen bir hata oluştu.";
        }
        if (errorMessages.length > 0) {
          setError(errorMessages);
          toast.error(errorMessages, { duration: 5000 });
          return { status: 400, error: errorMessages };
        } else {
          setError("Bilinmeyen bir hata oluştu.");
          toast.error("Bilinmeyen bir hata oluştu.", { duration: 5000 });
          return { status: 400, error: "Bilinmeyen bir hata oluştu." };
        }
      } else {
        setError("Bilinmeyen bir hata oluştu.");
        toast.error("Bilinmeyen bir hata oluştu.", { duration: 5000 });
        return { status: 400, error: "Bilinmeyen bir hata oluştu." };
      }

    }
  };

  const tamamlananlar = item && item.Tamamlananlar ? JSON.parse(item.Tamamlananlar) : [] as number[];

  const itemsAccordion = [
    item?.CalismaSureleri && {
      title: 'SGK Çalışan Bildirgesi Gün Detaylı Rapor',
      component: <GunDetayliRapor
        fetchFile={fetchFile}
        fetchFileAnalize={fetchFileAnalize}
        CalismaSureleri={item?.CalismaSureleri}
        SGKHizmet={item?.SGKHizmet ?? null}
        MuhtasarVePrim={item?.MuhtasarVePrim ?? null}
        handlePdfResponse={handlePdfResponse}
        handleDownload={handleDownload}
        gunDetayliData={gunDetayliData}
        setGunDetayliData={setGunDetayliData}
      />
    },
    item?.SGKHizmet && {
      title: 'Onaysız SGK Hizmet Listesi',
      component: <OnaysizSGKHizmet
        fetchFile={fetchFile}
        fetchFileAnalize={fetchFileAnalize}
        SGKHizmet={item.SGKHizmet}
        MuhtasarVePrim={item?.MuhtasarVePrim ?? null}
        handlePdfResponse={handlePdfResponse}
        handleDownload={handleDownload}
        sgkHizmetData={sgkHizmetData}
        setSgkHizmetData={setSgkHizmetData}
        setGunDetayliData={setGunDetayliData}
      />
    },
    item?.MuhtasarVePrim && {
      title: 'Onaysız Muhtasar Ve Prim Hizmet Beyannamesi',
      component: <OnaysizMuhtasarVePrimHizmet
        fetchFile={fetchFile}
        fetchFileAnalize={fetchFileAnalize}
        MuhtasarVePrim={item.MuhtasarVePrim}
        handlePdfResponse={handlePdfResponse}
        handleDownload={handleDownload}
        sgkHizmetData={sgkHizmetData}
        muhtasarVePrimData={muhtasarVePrimData}
        setMuhtasarVePrimData={setMuhtasarVePrimData}
        setSgkHizmetData={setSgkHizmetData}
        vergiTutar={vergiTutar}
        setVergiTutar={setVergiTutar}
        terkinTutar={terkinTutar}
        setTerkinTutar={setTerkinTutar}
        projeKoduTespiti={projeKoduTespiti}
        setProjeKoduTespiti={setProjeKoduTespiti}
        setGunDetayliData={setGunDetayliData}
      />
    },
    item?.OnayliSGKHizmet && {
      title: 'Onaylı SGK Hizmet Listesi',
      component: <SGKHizmet
        fetchFile={fetchFile}
        fetchFileAnalize={fetchFileAnalize}
        OnayliSGKHizmet={item.OnayliSGKHizmet}
        OnayliMuhtasarVePrim={item.OnayliMuhtasarVePrim ?? null}
        handlePdfResponse={handlePdfResponse}
        handleDownload={handleDownload}
        onayliSgkHizmetData={onayliSgkHizmetData}
        setOnayliSgkHizmetData={setOnayliSgkHizmetData}
      />
    },
    item?.OnayliMuhtasarVePrim && {
      title: 'Onaylı Muhtasar Ve Prim Hizmet Beyannamesi',
      component: <MuhtasarVePrimHizmet
        fetchFile={fetchFile}
        fetchFileAnalize={fetchFileAnalize}
        OnayliMuhtasarVePrim={item.OnayliMuhtasarVePrim}
        handlePdfResponse={handlePdfResponse}
        handleDownload={handleDownload}
        setOnayliSgkHizmetData={setOnayliSgkHizmetData}
        onayliSgkHizmetData={onayliSgkHizmetData}
        onayliMuhtasarVePrimData={onayliMuhtasarVePrimData}
        setOnayliMuhtasarVePrimData={setOnayliMuhtasarVePrimData}
        onayliVergiTutar={onayliVergiTutar}
        setOnayliVergiTutar={setOnayliVergiTutar}
        onayliTerkinTutar={onayliTerkinTutar}
        setOnayliTerkinTutar={setOnayliTerkinTutar}
        onayliProjeKoduTespiti={onayliProjeKoduTespiti}
        setOnayliProjeKoduTespiti={setOnayliProjeKoduTespiti}
      />
    },
    item?.SGKTahakkuk && {
      title: 'SGK Tahakkuk Fişi',
      component: <SGKTahakkukFisi
        fetchFile={fetchFile}
        fetchFileAnalize={fetchFileAnalize}
        SGKTahakkuk={item.SGKTahakkuk}
        handlePdfResponse={handlePdfResponse}
        handleDownload={handleDownload}
        sgkTahakkukData={SGKTahakkuk}
        setSGKTahakkukData={setSGKTahakkuk}
      />
    },
    item && item?.SurecSirasi >= 2 && tamamlananlar.find((i:number) => i === 5) && {
      title: 'Uzman Onay',
      component: <OnOnay
        handleSubmit={handleSubmit}
        projeRaporu={item}
      />
    },
  ].filter(Boolean);
  type AccordionItemType = { title: string; component: JSX.Element };
  const filteredAccordionItems = itemsAccordion.filter(Boolean) as AccordionItemType[];
  return (
    <>
      {!currentUser ?
        <div className="flex flex-col gap-4">
          {[...Array(10)].map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={30}
              animation="wave"
              style={{ borderRadius: 5 }}
            />
          ))}
        </div> :
        pageError ? (
          <div className="text-red-700 w-full bg-red-100 p-1 rounded-lg flex items-center">
            <KeenIcon icon={'information-2'} />
            <span>{typeof error === 'string' ? error : JSON.stringify(pageError)}</span>
          </div>
        ) :
          <div className="card ">

            {error &&
              <div className="card-header">
                <div className="text-red-700">
                  <KeenIcon icon={'information-2'} />
                  <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span></div>
              </div>
            }
            {
              item &&
              <Box sx={{ p: 3 }}>
                <div className='flex'><span className='w-[180px]'>Firma :</span> <span>{item.Kullanici?.FirmaAdi}</span></div>
                {/* <div className='flex'><span className='w-[180px]'>Proje :</span> <span>{item.Proje.ProjeAdi}</span></div> */}
                <div className='flex'><span className='w-[180px]'>Dönem :</span> <span>{item.Donem.DonemAdi}</span></div>
                <div className='flex'><span className='w-[180px]'>Hazırlayan Kullanıcı :</span>
                  <span>{item.Kullanici.AdSoyad}</span>
                  <button className='ms-1' onClick={() => {/* sohbeteBasla(item.KullaniciID)*/ }}><KeenIcon icon='sms' className='text-green-500 mr-1' /></button></div>
                {item.Durum === 'Tamamlandı' ?
                  <div className='flex'><span className='w-[180px]'>Durum :</span><KeenIcon icon='check' className='text-green-500 mr-1' /><span>{item.Durum}</span></div> :
                  <div className='flex'><span className='w-[180px]'>Durum :</span><KeenIcon icon='timer' className='text-gray-500 mr-1' /><span>{item.Durum}</span></div>
                }
              </Box>
            }
            {item &&
              <Accordion allowMultiple={false} className="px-3">
                {filteredAccordionItems.map((item, index) => (
                  <AccordionItem
                    key={item.title}
                    title={
                      <div className="flex items-center gap-2">
                        <span>{index + 1} - {item.title}</span>
                      </div>
                    }
                  >
                    <Suspense fallback={<div>Yükleniyor...</div>}>
                      {item.component}
                    </Suspense>
                  </AccordionItem>
                ))}
              </Accordion>}



            <PdfGorunumModal
              open={openPdfModal}
              onOpenChange={() => setOpenPdfModal(false)}
              pdfData={pdfData || ''}
              fileName={currentFileName}
              description='Dosya Görüntüleme'
            />

          </div >
      }
    </>
  )
};

export { AylikFaaliyetRaporuDetay };
