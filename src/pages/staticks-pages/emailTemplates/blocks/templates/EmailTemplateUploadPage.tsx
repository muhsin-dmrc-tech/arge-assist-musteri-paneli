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
  emailTemplateId:number;
  templateName:string;
  body: string;
  subject: string;
}


const EmailTemplateUploadPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({} as ITemplateData);
  const { currentLayout } = useLayout();
  const [itemValue, setitemValue] = useState({
    templateName: '',
    emailTemplateId: 0,
    subject: '',
    body: ''
  });
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { auth } = useAuthContext();
  const [submitVisible, setSubmitVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`${API_URL}/email-templates/get-email-template-item/${itemId}`);
      if (response.status !== 200) {
        return;
      }
      if (response.data && response.data?.emailTemplateId) {
        setItem(response.data)
        setPageError(null)
      } else {
        setPageError('Bu id ile eşleşen E-posta şablonu bulunamadı')
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
      templateName: '',
      emailTemplateId: 0,
      subject: '',
      body: ''
    });
    setError('');
    setPageError('');
    setSuccessMessage('');
    setSubmitVisible(false)
  }

  useEffect(() => {
    if (item) {
      setitemValue({
        templateName: item.templateName,
        emailTemplateId: Number(item.emailTemplateId),
        subject: item.subject,
        body: item.body
      })
    }
  }, [item])



  const handleCreateitem = async () => {
    if (submitVisible) {
      scrollTopFunc()
      toast.error('Gerekli alanları doldurun', { duration: 2000 });
      return
    }
    if (!itemValue.templateName || !itemValue.subject || !itemValue.body) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Lütfen gerekli alanları doldurun');
      return
    }
    if (itemValue.templateName.length < 2 || itemValue.templateName.length > 255) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Şablon adı en az 2, en fazla 255 karakter olabilir.');
      return
    }
    if (itemValue.subject.length < 2 || itemValue.subject.length > 255) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Şablon konusu en az 2, en fazla 255 karakter olabilir.');
      return
    }

    if (itemValue.body.length < 3) {
      scrollTopFunc()
      setSuccessMessage('')
      setError('Şablon içeriği en az 3 karakter olabilir.');
      return
    }
    setSubmitVisible(true);
    try {
      const response: any = await axios.post(`${API_URL}/email-templates/${itemId ? 'update' : 'create'}`, itemValue, {
        headers: {
          Authorization: `Bearer ${auth?.access_token}`
        }
      });
      if (response) {
        if (response.data) {
          if (response.status === 201) {
            scrollTopFunc()
            setSuccessMessage('Şablon başarıyla oluşturuldu')
            setError('');
            toast.success('Şablon başarıyla oluşturuldu', { duration: 5000 });
            resetForm();
              setTimeout(() => {
                navigate('/statick/email-templates');
              }, 500);
          } else {
            if (response.data?.message) {
              console.log(response.data?.message)
              setSuccessMessage('')
              setError(response.data?.message);
            }
            toast.error('Şablon oluşturulurken hata: ' + response.data?.message, { duration: 5000 });
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
      toast.error('Şablon oluşturulurken hata', { duration: 5000 });
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
              <ToolbarPageTitle text={itemId ? 'E-posta Şablonu Düzenle' : 'E-posta Şablonu Oluştur'} />
              {itemId && <div className="flex flex-wrap items-center gap-2 font-medium">
                <span className="text-sm text-gray-600">Seçili şablon üzerinde düzenleme yapılıyor</span>
                <span className="size-0.75 bg-gray-600 rounded-full"></span>
                <Link to='/statick/email-templates-upload' id="select_ip_btn" className="font-semibold btn btn-link link">Yeni Şablon Oluştur</Link>
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
                    <span className='text-xs'>Şablonların benzersiz kimlikleridir otomatik gönderimlerde kullanılır değiştirmeyiniz.</span>
                  </div></div>
                  <Input className="w-full"
                    value={itemValue.templateName ?? ''}
                    required
                    minLength={2}
                    maxLength={255}
                    placeholder="onayla-email"
                    onChange={(e) => setitemValue({ ...itemValue, templateName: e.target.value })} />
                </div>

                <div className="flex flex-col gap-1">
                  <InputLabel required>Şablon Konusu</InputLabel>
                  <Input className="w-full"
                    value={itemValue.subject ?? ''}
                    required
                    minLength={2}
                    maxLength={255}
                    placeholder="konu"
                    onChange={(e) => setitemValue({ ...itemValue, subject: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                  <InputLabel required>Şablon İçeriği</InputLabel>
                  <TinyMcEditor content={itemValue.body ?? ''} setContent={(value: string) => setitemValue({ ...itemValue, body: value })} />
                </div>
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

export { EmailTemplateUploadPage };
