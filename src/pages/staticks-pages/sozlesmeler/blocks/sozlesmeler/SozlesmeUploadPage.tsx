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
import TinyMcEditor from '@/components/tinymceditor/TinyMcEditor';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';


interface ITemplateData {
  SozlesmeID:number;
  Baslik:string;
  Aciklama: string;
  Anahtar: string;
}


const SozlesmeUploadPage = () => {
  const { itemAnahtar } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({} as ITemplateData);
  const { currentLayout } = useLayout();
  const [itemValue, setitemValue] = useState({
    Baslik: '',
    SozlesmeID: 0,
    Anahtar: '',
    Aciklama: ''
  });
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { auth } = useAuthContext();
  const [submitVisible, setSubmitVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`${API_URL}/sozlesmeler/get-sozlesme-item/${itemAnahtar}`);
      if (response.status !== 200) {
        return;
      }
      if (response.data && response.data?.SozlesmeID) {
        setItem(response.data)
        setPageError(null)
      } else {
        setPageError('Bu anahtar ile eşleşen Sozlesme bulunamadı')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
      setPageError(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu')
    }
  };

  useEffect(() => {
    if (itemAnahtar) {
      fetchItem();
    } else {
      resetForm()
    }
  }, [itemAnahtar])

  const resetForm = () => {
    setItem({} as ITemplateData)
    setitemValue({
      Baslik: '',
      SozlesmeID: 0,
      Anahtar: '',
      Aciklama: ''
    });
    setError('');
    setPageError('');
    setSuccessMessage('');
    setSubmitVisible(false)
  }

  useEffect(() => {
    if (item) {
      setitemValue({
        Baslik: item.Baslik,
        SozlesmeID: Number(item.SozlesmeID),
        Anahtar: item.Anahtar,
        Aciklama: item.Aciklama
      })
    }
  }, [item])



  const handleCreateitem = async () => {
    if (submitVisible) {
      scrollTopFunc()
      toast.error('Gerekli alanları doldurun', { duration: 2000 });
      return
    }
    if (!itemValue.Baslik || !itemValue.Anahtar || !itemValue.Aciklama) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Lütfen gerekli alanları doldurun');
      return
    }
    if (itemValue.Baslik.length < 2 || itemValue.Baslik.length > 255) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Baslik en az 2, en fazla 255 karakter olabilir.');
      return
    }
    if (itemValue.Anahtar.length < 2 || itemValue.Anahtar.length > 100) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Anahtar en az 2, en fazla 100 karakter olabilir.');
      return
    }

    if (itemValue.Aciklama.length < 3) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Aciklama en az 3 karakter olabilir.');
      return
    }
    setSubmitVisible(true);
    try {
      const response: any = await axios.post(`${API_URL}/sozlesmeler/${item.SozlesmeID > 0 ? 'update' : 'create'}`, itemValue, {
        headers: {
          Authorization: `Bearer ${auth?.access_token}`
        }
      });
      if (response) {
        if (response.data) {
          if (response.status === 201) {
            scrollTopFunc()
            setSuccessMessage('Sozlesme başarıyla oluşturuldu')
            setError('');
            toast.success('Sozlesme başarıyla oluşturuldu', { duration: 5000 });
            resetForm();
              setTimeout(() => {
                navigate('/statick/sozlesmeler');
              }, 500);
          } else {
            if (response.data?.message) {
              console.log(response.data?.message)
              setSuccessMessage('')
              setError(response.data?.message);
            }
            toast.error('Sozlesme oluşturulurken hata: ' + response.data?.message, { duration: 5000 });
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
      toast.error('Sozlesme oluşturulurken hata', { duration: 5000 });
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
              <ToolbarPageTitle text={itemAnahtar ? 'E-posta Şablonu Düzenle' : 'E-posta Şablonu Oluştur'} />
              {itemAnahtar && <div className="flex flex-wrap items-center gap-2 font-medium">
                <span className="text-sm text-gray-600">Seçili sözleşme üzerinde düzenleme yapılıyor</span>
                <span className="size-0.75 bg-gray-600 rounded-full"></span>
                <Link to='/statick/sozlesme-upload' id="select_ip_btn" className="font-semibold btn btn-link link">Yeni Sözleşme Oluştur</Link>
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
                    <span className='text-xs'>Sözleşmelerin benzersiz kimlikleridir, değiştirmeyiniz.</span>
                  </div></div>
                  <Input className="w-full"
                    value={itemValue.Anahtar ?? ''}
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="kullanici-sozlesmesi"
                    onChange={(e) => setitemValue({ ...itemValue, Anahtar: e.target.value })} />
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
                  <InputLabel required>Sözleşme İçeriği</InputLabel>
                  <TinyMcEditor content={itemValue.Aciklama ?? ''} setContent={(value: string) => setitemValue({ ...itemValue, Aciklama: value })} />
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2.5 p-2.5">
                <Button disabled={submitVisible}
                  className="w-full text-white"
                  variant="contained"
                  onClick={handleCreateitem}>
                  {itemAnahtar ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>

            </div>
          }
        </>

      </Container>
    </Fragment>
  );
};

export { SozlesmeUploadPage };
