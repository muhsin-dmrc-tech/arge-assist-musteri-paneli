import { Fragment, useEffect, useState } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { useLayout } from '@/providers';
import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuthContext } from '@/auth';
import { Button, InputLabel } from '@mui/material';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";
import { tr } from 'date-fns/locale';

interface ITemplateData {
  BildirimID: number;
  Baslik: string;
  Link: string;
  MobilLink: string;
  Anahtar: string;
  Icerik: string;
  Tur: string;
  TumKullanicilar: boolean;
  PlanlananTarih: string;
}


const BildirimUploadPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({} as ITemplateData);
  const { currentLayout } = useLayout();
  const [itemValue, setitemValue] = useState({
    BildirimID: 0,
    Baslik: '',
    Link: '',
    MobilLink: '',
    Anahtar: '',
    Icerik: '',
    Tur: '',
    TumKullanicilar: false,
    HemenGonder: false,
    PlanlananTarih: ''
  });
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { auth } = useAuthContext();
  const [submitVisible, setSubmitVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const fetchItem = async () => {
    try {
      const response = await axios.get(`${API_URL}/bildirimler/get-bildirim-item/${itemId}`);
      if (response.status !== 200) {
        return;
      }
      if (response.data && response.data?.BildirimID) {
        setItem(response.data)
        setPageError(null)
      } else {
        setPageError('Bu id ile eşleşen Bildirim şablonu bulunamadı')
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
      resetForm()
    }
  }, [itemId])

  const resetForm = () => {
    setItem({} as ITemplateData)
    setitemValue({
      BildirimID: 0,
      Baslik: '',
      Link: '',
      MobilLink: '',
      Anahtar: '',
      Icerik: '',
      Tur: '',
      TumKullanicilar: false,
      HemenGonder: false,
      PlanlananTarih: ''
    });
    setError('');
    setPageError('');
    setSuccessMessage('');
    setSubmitVisible(false)
  }

  useEffect(() => {
    if (item) {
      setitemValue({
        BildirimID: Number(item.BildirimID),
        Baslik: item.Baslik,
        Link: item.Link,
        MobilLink: item.MobilLink,
        Anahtar: item.Anahtar ?? '',
        Icerik: item.Icerik ?? '',
        Tur: item.Tur,
        TumKullanicilar: item.TumKullanicilar ?? false,
        HemenGonder: false,
        PlanlananTarih: item.PlanlananTarih ?? ''
      })
    }
  }, [item])



  const handleCreateitem = async () => {
    if (submitVisible) {
      scrollTopFunc()
      toast.error('Gerekli alanları doldurun', { duration: 2000 });
      return
    }
    if (!itemValue.Baslik || !itemValue.Icerik || !itemValue.Tur) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Lütfen gerekli alanları doldurun');
      return
    }
    if (itemValue.Baslik.length < 2 || itemValue.Baslik.length > 255) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Başlık en az 2, en fazla 255 karakter olabilir.');
      return
    }

    if (itemValue.Anahtar.length > 100) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Anahtar en fazla 100 karakter olabilir.');
      return
    }

    if (itemValue.Icerik?.length < 3 || itemValue.Icerik?.length > 2000) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Bildirim içeriği en az 3, en fazla 2000 karakter olabilir.');
      return
    }

    if (itemValue.PlanlananTarih.length > 0) {
      if (itemValue.TumKullanicilar === false) {
        scrollTopFunc()
        setSuccessMessage('')
        setError('Planlanan tarih girildiğinde tüm kullanıcılar seçeneği seçilmiş olmalıdır');
        return
      }

      if (itemValue.HemenGonder === true) {
        scrollTopFunc()
        setSuccessMessage('')
        setError('Planlanan tarih girildiğinde hemen gönder seçeneği seçilemez.');
        return
      }
    }
    if (itemValue.HemenGonder === true) {
      if (itemValue.TumKullanicilar === false) {
        scrollTopFunc()
        setSuccessMessage('')
        setError('Hemen gönder seçildiğinde tüm kullanıcılar seçeneği seçilmiş olmalıdır');
        return
      }

      if (itemValue.PlanlananTarih.length > 0) {
        scrollTopFunc()
        setSuccessMessage('')
        setError('Hemen gönder seçildiğinde Planlanan tarih boş bırakılmalıdır.');
        return
      }
    }
    setSubmitVisible(true);
    try {
      const response: any = await axios.post(`${API_URL}/bildirimler/${itemId ? 'update' : 'create'}`, itemValue, {
        headers: {
          Authorization: `Bearer ${auth?.access_token}`
        }
      });
      if (response) {
        if (response.data) {
          if (response.status === 201) {
            scrollTopFunc()
            setSuccessMessage('Bildirim şablonu başarıyla oluşturuldu')
            toast.success('Bildirim şablonu başarıyla oluşturuldu', { duration: 5000 });
            resetForm();
            setTimeout(() => {
              navigate('/statick/bildirimler');
            }, 500);
          } else {
            if (response.data?.message) {
              console.log(response.data?.message)
              setSuccessMessage('')
              setError(response.data?.message);
            }
            toast.error('Bildirim şablonu oluşturulurken hata: ' + response.data?.message, { duration: 5000 });
            scrollTopFunc()
          }
        }
        setSubmitVisible(false);
        scrollTopFunc()
      }
    } catch (error: any) {
      scrollTopFunc()
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
      toast.error('Bildirim şablonu oluşturulurken hata', { duration: 5000 });
    }
  }

  const scrollTopFunc = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <Fragment>
       

      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text={itemId ? 'Bildirim Şablonu Düzenle' : 'Bildirim Şablonu Oluştur'} />
              {itemId && <div className="flex flex-wrap items-center gap-2 font-medium">
                <span className="text-sm text-gray-600">Bildirim şablonu üzerinde düzenleme yapılıyor</span>
                <span className="size-0.75 bg-gray-600 rounded-full"></span>
                <Link to='/statick/bildirim-upload' id="select_ip_btn" className="font-semibold btn btn-link link">Yeni Şablon Oluştur</Link>
              </div>}
            </ToolbarHeading>
            {/* <ToolbarActions>
              <a href="#" className="btn btn-sm btn-light">
                Security Overview
              </a>
            </ToolbarActions> */}
          </Toolbar>
        </Container>
      )}

      <Container>
        <>
          {pageError ? <div className="text-red-700 w-full bg-red-100 p-1 rounded-lg flex items-center">
            <KeenIcon icon={'information-2'} />
            <span>{typeof error === 'string' ? error : JSON.stringify(pageError)}</span></div>
            :
            <div className="card">
              <div className="flex flex-col gap-2.5 p-2.5">
                {error && <div className="text-red-700">
                  <KeenIcon icon={'information-2'} />
                  <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span></div>}
                {successMessage && <div className="text-lime-400">  <KeenIcon
                  icon={'information-1'}
                  style="solid"
                  className={`text-lg leading-0 me-2`}
                  aria-label={'information-1'}
                /> <span>{successMessage}</span></div>}

                <div className="flex flex-col gap-1">

                  <div className='flex flex-row aligin-center gap-2'><span>Anahtar</span>  <div className="bg-sky-100 text-sky-700 p-1 rounded-lg flex items-center">
                    <KeenIcon
                      icon={'information-1'}
                      style="solid"
                      className="text-s leading-0 me-2"
                      aria-label={'information-1'}
                    />
                    <span className='text-xs'>Hazır bildirim şablonları için gereklidir.</span>
                  </div></div>
                  <Input className="w-full"
                    value={itemValue.Anahtar ?? ''}
                    minLength={2}
                    maxLength={100}
                    placeholder="kullanici-daveti"
                    onChange={(e) => setitemValue({ ...itemValue, Anahtar: e.target.value?.trim() })} />
                </div>

                <div className="flex flex-col gap-1">
                  <InputLabel required>Başlık</InputLabel>
                  <Input className="w-full"
                    value={itemValue.Baslik ?? ''}
                    required
                    minLength={2}
                    maxLength={255}
                    placeholder="Başlık"
                    onChange={(e) => setitemValue({ ...itemValue, Baslik: e.target.value })} />
                </div>

                <div className="flex flex-col gap-1">
                  <InputLabel required>Link</InputLabel>
                  <Input className="w-full"
                    value={itemValue.Link ?? ''}
                    required
                    minLength={2}
                    maxLength={255}
                    placeholder="Link"
                    onChange={(e) => setitemValue({ ...itemValue, Link: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                  <InputLabel >Mobil Link</InputLabel>
                  <Input className="w-full"
                    value={itemValue.MobilLink ?? ''}
                    required
                    minLength={2}
                    maxLength={255}
                    placeholder="Mobil Link"
                    onChange={(e) => setitemValue({ ...itemValue, MobilLink: e.target.value })} />
                </div>

                <div className="flex flex-col gap-1">
                  <InputLabel required>Türü</InputLabel>
                  <Select value={itemValue.Tur} onValueChange={(value) => setitemValue({ ...itemValue, Tur: value })} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tür Seçin" />
                    </SelectTrigger>
                    <SelectContent>

                      {['Bilgi', 'Uyarı', 'Hata']?.map((item: any) => (<SelectItem key={item} value={item}>{item}</SelectItem>))}

                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <InputLabel required>Bildirim İçeriği</InputLabel>
                  {/*  <TinyMcEditor content={itemValue.Icerik} setContent={(value: string) => setitemValue({ ...itemValue, Icerik: value })} /> */}
                  <Textarea
                    value={itemValue.Icerik ?? ''}
                    required
                    minLength={3}
                    maxLength={2000}
                    placeholder="İçerik gir..."
                    onChange={(e) => setitemValue({ ...itemValue, Icerik: e.target.value })} />
                </div>

                <label className="checkbox-group">
                  <input
                    className="checkbox checkbox-sm"
                    type="checkbox"
                    checked={itemValue.TumKullanicilar}
                    onChange={(e) => setitemValue({ ...itemValue, TumKullanicilar: e.target.checked })} />
                  <span className="checkbox-label">Tüm kullanıcılara göderilsin</span>
                </label>

                <div className="bg-sky-100 text-sky-700 p-1 rounded-lg flex items-center">
                  <KeenIcon
                    icon={'information-1'}
                    style="solid"
                    className="text-s leading-0 me-2"
                    aria-label={'information-1'}
                  />
                  <span className='text-xs'>Aşağıdaki alanları seçmek için "Tüm kullanıcılara göderilsin" seçeneğini işaretlemelisiniz.</span>
                </div>
                <div className="flex flex-col gap-1">
                  <InputLabel>Planlanan Tarih</InputLabel>
                  <div className="flex flex-row aligin-center">
                    <DatePicker
                      disabled={itemValue.TumKullanicilar === false || itemValue.HemenGonder === true}
                      className="w-[250px] border p-2 rounded-md"
                      selected={itemValue.PlanlananTarih ? parseISO(itemValue.PlanlananTarih) : undefined}
                      onChange={(date) =>
                        setitemValue({
                          ...itemValue,
                          PlanlananTarih: date ? format(date, "yyyy-MM-dd HH:mm") : "",
                        })
                      }
                      locale={tr}
                      showTimeSelect
                      timeFormat="HH:mm"
                      dateFormat="dd/MM/yyyy HH:mm"
                      placeholderText="GG/AA/YYYY - SS:DD"
                    />
                    <div className="bg-sky-100 text-sky-700 p-1 rounded-lg flex items-center">
                      <KeenIcon
                        icon={'information-1'}
                        style="solid"
                        className="text-s leading-0 me-2"
                        aria-label={'information-1'}
                      />
                      <span className='text-xs'>Sadece ileriki bir tarihte gönderilmesini istdiğinizde doldurun.</span>
                    </div>
                  </div>
                </div>

                <label className="checkbox-group">
                  <input
                    className="checkbox checkbox-sm"
                    disabled={itemValue.TumKullanicilar === false || itemValue.PlanlananTarih?.length > 0}
                    type="checkbox"
                    checked={itemValue.HemenGonder}
                    onChange={(e) => setitemValue({ ...itemValue, HemenGonder: e.target.checked })} />
                  <span className="checkbox-label">Hemen gönder.</span>
                  <div className="bg-sky-100 text-sky-700 p-1 rounded-lg flex items-center">
                    <KeenIcon
                      icon={'information-1'}
                      style="solid"
                      className="text-s leading-0 me-2"
                      aria-label={'information-1'}
                    />
                    <span className='text-xs'>Bu alanı seçerseniz bildirim şanlonu oluşturulur ve bütün kullanıcılara gönderilir.</span>
                  </div>
                </label>

              </div>

              <div className="flex flex-col gap-1 mt-2.5 p-2.5">
                <Button disabled={submitVisible}
                  className="w-full text-white"
                  variant="contained"
                  onClick={handleCreateitem}>
                  {itemId ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>

            </div>
          }
        </>

      </Container>
    </Fragment>
  );
};

export { BildirimUploadPage };
