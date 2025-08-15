import { useState, useEffect, useRef } from 'react';
import { MiscHelp } from '@/partials/misc';
import Menu from './blocks/menu/Menu';
import Step1 from './blocks/steps/Step1';
import Step3 from './blocks/steps/Step3';
import Step2 from './blocks/steps/Step2';
import { Button } from '@/components/ui/button';
import { WIZARD_STEPS } from './blocks/menu/wizard.config';
import { useNavigate, useParams } from 'react-router';
import { useAuthContext } from '@/auth';
import { stepValidations } from './utils/validation';
import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import axios from 'axios';
import Step4 from './blocks/steps/Step4';
import Step5 from './blocks/steps/Step5';
import Step6 from './blocks/steps/Step6';
import { Link } from 'react-router-dom';

const ProjeBasvuruWizardContent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(WIZARD_STEPS);
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>({});
  const [importFile, setImportFile] = useState<string>('');
  const [itemValue, setitemValue] = useState({
    TeknokentID: 0,
    OnerilenProjeIsmi: '',
    ProjeKonusuVeAmaci: '',
    ProjeyiOrtayaCikaranProblem: '',
    ProjeKapsamindakiCozum: '',
    ProjeninIcerdigiYenilikler: '',
    RakipAnalizi: '',
    TicariBasariPotansiyeli: '',
    DosyaEki: '',
    EkDosyaSil: false
  });
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { auth, currentUser } = useAuthContext();
  const [submitVisible, setSubmitVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  //const [teknokentler, setTeknokentler] = useState([]);
  const [basvuruEki, setBasvuruEki] = useState<File | undefined>();
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const fetchItem = async () => {
    setImportFile('')
    try {
      const response = await axios.get(`${API_URL}/proje-basvuru/get-proje-basvuru-item/${itemId}`);
      if (response.status !== 200) {
        return;
      }
      if (response.data && response.data?.BasvuruID) {
        setItem(response.data)
        setPageError(null)
      } else {
        setPageError('Bu id ile eşleşen proje başvurusu bulunamadı')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
      setPageError(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu')
    }
  };

  const fetchFile = async () => {
    try {
      let response = null;
      if (importFile.length > 0) {
        response = { status: 201, data: importFile };
      } else {
        response = await axios.get(`${API_URL}/proje-basvuru/get-proje-basvuru-file/${itemId}`);
      }
      if (response.status === 200 && response?.data) {
        try {
          // Gelen PDF verisi direkt olarak base64 formatında
          const binaryString = atob(response.data);
          const bytes = new Uint8Array(binaryString.length);

          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Blob oluştur
          const blob = new Blob([bytes], { type: 'application/pdf' });

          // PDF'i indir
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = item.EkDosya || 'basvuru-eki.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // URL'yi temizle
          URL.revokeObjectURL(url);

          // Modal için PDF verisini kaydet
          setImportFile(response.data);
          setError(null);

        } catch (error) {
          console.error('Ek dosya işleme hatası:', error);
          throw new Error('Ek dosya verisi geçerli formatta değil');
        }
      } else {
        throw new Error('Ek dosya verisi alınamadı');
      }
    } catch (error: any) {
      console.error('Dosya indirme hatası:', error);
      toast.error(error?.message || 'Dosya indirilirken bir hata oluştu', {
        duration: 5000
      });
      error(error?.message || 'Dosya indirilirken bir hata oluştu');
    }
  };


  /* const getTeknokentler = async () => {
    try {
      const response = await axios.get(`${API_URL}/teknokentler/get-active-teknokentler`);

      if (response.status === 200) {
        setTeknokentler(response.data);
      } else {
        setTeknokentler([])
      }
    } catch (error) {
      toast.error('data alınırken hata oluştu');
    }
  }; */


  /* useEffect(() => {
    getTeknokentler()
  }, []);
 */
  useEffect(() => {
    if (item.BasvuruID) {
      setitemValue({ ...item, EkDosyaSil: false });
    }
  }, [item.BasvuruID]);

  // Form değerlerindeki değişiklikleri takip eden useEffect
  useEffect(() => {
    if (error || Object.keys(stepErrors).length > 0) {
      const validationKey = `step${currentStep}` as keyof typeof stepValidations;
      const validator = stepValidations[validationKey];

      if (validator) {
        const result = validator(itemValue);
        if (result.isValid) {
          // Eğer validasyon başarılıysa hataları temizle
          setError(null);
          setStepErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[currentStep];
            return newErrors;
          });
        }
      }
    }
  }, [itemValue, currentStep]); // itemValue'daki her değişiklikte kontrol et

  const validateStep = (stepNumber: number): boolean => {
    const validationKey = `step${stepNumber}` as keyof typeof stepValidations;
    const validator = stepValidations[validationKey];

    if (validator) {
      const result = validator(itemValue);
      if (!result.isValid) {
        setError(result.error);
        setStepErrors(prev => ({
          ...prev,
          [stepNumber]: result.error || ''
        }));
        return false;
      }
    }

    // stepErrors'dan ilgili adımı kaldır
    setStepErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[stepNumber];
      return newErrors as Record<number, string>;
    });

    return true;
  };

  const updateStepsState = (currentStepId: number) => {
    const updatedSteps = WIZARD_STEPS.map(step => ({
      ...step,
      state: step.id === currentStepId
        ? 'current'
        : step.id < currentStepId
          ? 'completed'
          : 'pending'
    }));
    setSteps(updatedSteps);
  };

  const handleStepClick = (stepId: number) => {
    // Mevcut adımı kontrol et
    if (!validateStep(currentStep)) {
      return;
    }

    // Önceki adımları da kontrol et
    for (let i = 1; i < stepId; i++) {
      if (!validateStep(i)) {
        return;
      }
    }

    setCurrentStep(stepId);
    updateStepsState(stepId);
  };

  const handleNextClick = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      updateStepsState(currentStep + 1);
    }
  };
  const handleSubmit = async () => {
    // Tüm adımları kontrol et
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) {
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('file', basvuruEki || '');
      formData.append('itemValue', JSON.stringify(itemValue));

      const response = await axios.post(`${API_URL}/proje-basvuru/${item.BasvuruID ? 'update' : 'create'}`,
        formData, {
        headers: {
          Authorization: `Bearer ${auth?.access_token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response) {
        if (response.data) {
          if (response.status === 201) {
            setitemValue({
              TeknokentID: 0,
              OnerilenProjeIsmi: '',
              ProjeKonusuVeAmaci: '',
              ProjeyiOrtayaCikaranProblem: '',
              ProjeKapsamindakiCozum: '',
              ProjeninIcerdigiYenilikler: '',
              RakipAnalizi: '',
              TicariBasariPotansiyeli: '',
              DosyaEki: '',
              EkDosyaSil: false
            });
            if (item.BasvuruID) {
              setSuccessMessage('Proje Başvurusu başarıyla güncellendi')
              setError('');

            } else {
              setSuccessMessage('Proje Başvurusu başarıyla oluşturuldu')
              setError('');
            }
            setTimeout(() => {
              navigate('/proje-basvurulari')
            }, 1000)

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
  };

  useEffect(() => {
    updateStepsState(currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  // Firma kontrolü için özel bir fonksiyon
  const handleWizardStart = () => {
  
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setFileError(null);
      setError(null);
      setSuccessMessage(null);
      if (!file) {
        setFileError('Dosya seçilmedi');
        return;
      }
      // Dosya boyutu kontrolü (örn: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFileError('Dosya boyutu 5MB\'dan küçük olmalıdır');
        e.target.value = '';
        return;
      }
      setBasvuruEki(file)
    };
    const handlePdfUploadClick = () => {
      fileInputRef.current?.click();
    };

    return (
      <div className="grid grid-cols-12 gap-0 min-h-[100%] flex flex-col justify-center">
        <div className="col-span-12 md:col-span-3">
          <Menu
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            stepErrors={stepErrors}
          />
        </div>
        <div className="col-span-12 md:col-span-9 min-h-[100%]">
          <div className='flex flex-col gap-4 p-4 bg-white shadow rounded-lg md:rounded-l-none min-h-[100%] justify-center'>
            {pageError && <div className="error-message text-red-700">{pageError}</div>}
            {error && <div className="error-message text-red-700">{error}</div>}
            {successMessage ? <div className="success-message text-green-700 p-4 flex justify-center align-center min-height-[400px]">
              <KeenIcon icon="check" className="w-30 h-30" />{successMessage}</div> :
              <>
                {
                  currentStep === 1 &&
                  <Step1
                    itemValue={itemValue}
                    setitemValue={setitemValue}
                    //teknokentler={teknokentler}
                  />
                }
                {
                  currentStep === 2 &&
                  <Step2
                    itemValue={itemValue}
                    setitemValue={setitemValue}
                  />
                }
                {
                  currentStep === 3 &&
                  <Step3
                    itemValue={itemValue}
                    setitemValue={setitemValue}
                  />
                }
                {
                  currentStep === 4 &&
                  <Step4
                    itemValue={itemValue}
                    setitemValue={setitemValue}
                  />
                }
                {
                  currentStep === 5 &&
                  <Step5
                    itemValue={itemValue}
                    setitemValue={setitemValue}
                  />
                }
                {
                  currentStep === 6 &&
                  <Step6
                    itemValue={itemValue}
                    setitemValue={setitemValue}
                    handlePdfUploadClick={handlePdfUploadClick}
                    handleFileChange={handleFileChange}
                    fileInputRef={fileInputRef}
                    fileError={fileError}
                    basvuruEki={basvuruEki}
                    item={item}
                    fetchFile={fetchFile}
                  />
                }

                <div className="flex justify-between items-center border-t mt-5 pt-10">
                  <div>
                    <Button
                      color="primary"
                      className="text-sm font-medium px-6 py-2"
                      onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                      disabled={currentStep === 1}
                    >
                      Önceki
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    {currentStep === 6 ? (
                      <Button
                        color="secondary"
                        className="text-sm font-medium px-6 py-2 text-white"
                        onClick={handleSubmit}
                        disabled={Object.keys(stepErrors).length > 0}
                      >
                        Tamamla
                      </Button>
                    ) : (
                      <Button
                        color="primary"
                        className="text-sm font-medium px-6 py-2 text-white"
                        onClick={handleNextClick}
                        disabled={Object.keys(stepErrors).length > 0}
                      >
                        Sonraki
                      </Button>
                    )}
                  </div>
                </div>
              </>
            }
          </div>
        </div>
      </div>
    );
  };

  return handleWizardStart();
};

export { ProjeBasvuruWizardContent };
