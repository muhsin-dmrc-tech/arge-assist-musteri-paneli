/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthContext } from '@/auth/useAuthContext';
import { KeenIcon } from '@/components/keenicons';
import { useNavigate, useParams } from 'react-router';
import { TooltipProvider } from '@/components/ui/tooltip';
import DatePicker from 'react-datepicker';
import { tr } from 'date-fns/locale';
import { format } from 'date-fns';

interface Teknokent {
  TeknokentID: number;
  TeknokentAdi: string;
}
interface KullaniciType {
  AdSoyad:string;
  FirmaAdi:string
}

interface FirmaOption {
  value: number;
  label: string;
}

const ProjelerUpload = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>({});
  const [itemValue, setitemValue] = useState({
    ProjeID: 0,
    ProjeAdi: '',
    ProjeKodu: '',
    STBProjeKodu: '',
    BaslangicTarihi: '',
    BitisTarihi: '',
    TeknokentID: 0
  });
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { auth, currentUser } = useAuthContext();
  const [submitVisible, setSubmitVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);


  // Select stilleri için ortak config
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '40px',
      borderRadius: '6px',
      borderColor: '#e2e8f0'
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999
    })
  };


  const fetchItem = async () => {
    try {
      const response = await axios.get(`${API_URL}/projeler/get-proje/${itemId}`);
      if (response.status !== 200) {
        return;
      }
      if (response.data && response.data?.ProjeID) {
        setItem(response.data)
        setError(null)
      } else {
        setError('Bu id ile eşleşen Proje bulunamadı')
      }
    } catch (error: any) {
      toast.error('Veriler çekilirken bir hata oluştu', { duration: 5000 });
    }
  };


  useEffect(() => {
    if (itemId && currentUser?.KullaniciTipi === 2) {
      fetchItem();
    } 
  }, [itemId, currentUser?.KullaniciTipi])




  useEffect(() => {
    if (item && item.ProjeAdi) {
      setitemValue({
        ProjeAdi: item.ProjeAdi,
        ProjeID: Number(item.ProjeID),
        TeknokentID: Number(item.TeknokentID ?? 0),
        ProjeKodu: item.ProjeKodu ?? '',
        STBProjeKodu: item.STBProjeKodu ?? '',
        BaslangicTarihi: item.BaslangicTarihi ?? '',
        BitisTarihi: item.BitisTarihi ?? ''
      })
    }
  }, [item])

  const handleUpdateitem = async () => {
    if (!itemValue.ProjeAdi) {
      setSuccessMessage('')
      setError('Proje adı, Teknokent ve Firma zorunludur');
      return
    }
     if (!itemValue.ProjeKodu || !itemValue.STBProjeKodu || !itemValue.BaslangicTarihi) {
      setSuccessMessage('')
      setError('Lütfen zorunlu alanları doldurun');
      return
    }
    if (submitVisible) {
      toast.error('Gerekli alanları doldurun', { duration: 2000 });
      return
    }
    if (itemValue.ProjeAdi.length < 2 || itemValue.ProjeAdi.length > 255) {
      setSuccessMessage('')
      setError('Proje Adı en az 2 en fazla 255 karakterden oluşabilir ');
      return
    }
    if (itemId) {
      if (itemValue.ProjeID == 0) {
        setSuccessMessage('')
        setError('Proje bulunamadı lütfen teknokentinize ait bir proje üzerinde işlem yapmayı deneyin.');
        return
      }
    }
    if (submitVisible) {
      toast.error('Gerekli alanları doldurun', { duration: 2000 });
      return
    }

    setSubmitVisible(true);
    try {

      const response: any = await axios.post(`${API_URL}/projeler/${item?.ProjeID > 0 ? 'update' : 'create'}`, itemValue, {
        headers: {
          Authorization: `Bearer ${auth?.access_token}`
        }
      });
      if (response) {
        if (response.data) {
          if (response.status === 201) {
            setitemValue({
              ProjeID: 0,
              ProjeAdi: '',
              ProjeKodu: '',
              STBProjeKodu: '',
              BaslangicTarihi: '',
              BitisTarihi: '',
              TeknokentID: 0
            });
            setSuccessMessage('Öğe başarıyla oluşturuldu')
            setError('');
            setTimeout(() => {
              navigate(`/admin-projeler`)
            }, 500)

          } else {
            if (response.data?.message) {
              setSuccessMessage('')
              setError(response.data?.message);
            }
            toast.error('Öğe Oluşturma Hatası' + response.data?.message, { duration: 5000 });
          }
        }
        setSubmitVisible(false);
      }
    } catch (error: any) {
      setSubmitVisible(false);
      setSuccessMessage('');
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

        setError(errorMessages);
      } else {
        setError("Bilinmeyen bir hata oluştu.");
      }
      toast.error('Öğe güncelleme hatası', { duration: 5000 });
    }

  }

  return (
    <>
      {pageError ? (
        <div className="text-red-700 w-full bg-red-100 p-1 rounded-lg flex items-center">
          <KeenIcon icon={'information-2'} />
          <span>{typeof error === 'string' ? error : JSON.stringify(pageError)}</span>
        </div>
      ) :
        (<div className="card bg-gray-50">
          <div className="card-header"><h5>Proje Hakkında Bilgiler</h5>
            {error && <div className="text-red-700">
              <KeenIcon icon={'information-2'} />
              <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span></div>}
            {successMessage && <div className="text-lime-400">  <KeenIcon
              icon={'information-1'}
              style="solid"
              className={`text-lg leading-0 me-2`}
              aria-label={'information-1'}
            /> <span>{successMessage}</span></div>}
          </div>
          <div className="card-body flex flex-col gap-4">
            
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-3">Proje Adı :</div>
              <div className="col-span-12 md:col-span-9">
                <Input className="w-full"
                  value={itemValue.ProjeAdi}
                  required
                  minLength={2}
                  maxLength={255}
                  placeholder="Proje Adı"
                  onChange={(e) => setitemValue({ ...itemValue, ProjeAdi: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-3">Proje Kodu :</div>
              <div className="col-span-12 md:col-span-9">
                <Input className="w-full"
                  value={itemValue.ProjeKodu}
                  required
                  minLength={2}
                  maxLength={255}
                  placeholder="Proje Kodu"
                  onChange={(e) => setitemValue({ ...itemValue, ProjeKodu: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-3">STB Proje Kodu :</div>
              <div className="col-span-12 md:col-span-9">
                <Input className="w-full"
                  value={itemValue.STBProjeKodu}
                  required
                  minLength={2}
                  maxLength={255}
                  placeholder="STB Proje Kodu"
                  onChange={(e) => setitemValue({ ...itemValue, STBProjeKodu: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-3">Başlangıç Tarihi :</div>
              <div className="col-span-12 md:col-span-9">
                <TooltipProvider>
                  <DatePicker
                    selected={itemValue.BaslangicTarihi ? new Date(itemValue.BaslangicTarihi) : null}
                    onChange={(date) => {
                      if (date) {
                        const dateStr = format(date, "yyyy-MM-dd");
                        setitemValue({ ...itemValue, BaslangicTarihi: dateStr })
                      }
                    }}
                    locale={tr}
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Başlangıç Tarihi Seç"
                    className="w-full p-2 border rounded-md text-sm placeholder:text-sm"
                  />
                </TooltipProvider>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-3">Bitiş Tarihi :</div>
              <div className="col-span-12 md:col-span-9">
                <TooltipProvider>
                  <DatePicker
                    selected={itemValue.BitisTarihi ? new Date(itemValue.BitisTarihi) : null}
                    onChange={(date) => {
                      if (date) {
                        const dateStr = format(date, "yyyy-MM-dd");
                        setitemValue({ ...itemValue, BitisTarihi: dateStr })
                      }
                    }}
                    locale={tr}
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Bitiş Tarihi Seç"
                    className="w-full p-2 border rounded-md text-sm placeholder:text-sm"
                  />
                </TooltipProvider>
              </div>
            </div>





          </div>
          <div className="flex flex-col gap-1 mt-2.5 p-2.5">
            <Button disabled={submitVisible}
              className="w-full text-white"
              variant="contained"
              onClick={handleUpdateitem}
            >
              Kaydet
            </Button>
          </div>

        </div>
        )}
    </>
  )

};

export { ProjelerUpload };
