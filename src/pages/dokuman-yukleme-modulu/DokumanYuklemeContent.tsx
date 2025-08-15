import { useState, useEffect, lazy, Suspense } from 'react';
import Menu from './blocks/menu/Menu';
import { Button } from '@/components/ui/button';
import { WIZARD_STEPS } from './blocks/menu/wizard.config';
import { useAuthContext } from '@/auth';
import { stepValidations } from './utils/validation';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { toast } from 'sonner';
import { useRapor } from './DokumanYuklemeContextType';
import { DonemType, handleSubmitPropsType, ProjeRaporuType } from './types';
import { useParams } from 'react-router';


const Step1 = lazy(() => import('./blocks/steps/Step1'));
const Step2 = lazy(() => import('./blocks/steps/Step2'));
const Step3 = lazy(() => import('./blocks/steps/Step3'));


const DokumanYuklemeContent = () => {
  const [steps, setSteps] = useState(WIZARD_STEPS);
  const { itemId } = useParams();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { auth, currentUser } = useAuthContext();
  const {
    projeRaporu, setFile, file, submitVisible, setSubmitVisible,
    setSuccessMessage, successMessage, setPersoneller, itemValue, setProjeRaporu, pageError, setSGKTahakkuk, setOnayliMuhtasarTableData, setOnayliSgkHizmetListesi,
    setitemValue, setRaporHatalar, setSgkHizmetListesi, setMuhtasarTableData, error, stepErrors, tamamlananAdimlar,
    setError, setStepErrors, currentStep, sgkHizmetListesi, muhtasarTableData, setTamamlananAdimlar,
    muafiyetTableData, setCurrentStep, onayliMuhtasarTableData, onayliSgkHizmetListesi, setSeciliDonem, seciliDonem,
  } = useRapor()

  const [donemler, setDonemler] = useState<DonemType[]>([]);


  const getDonemler = async () => {
    try {
      const response = await axios.get(`${API_URL}/donem/get-active-donemler`);
      if (response.status === 200) {
        setDonemler(response.data);
        if (response.data[0]?.DonemID) {
          setitemValue({ ...itemValue, DonemID: response.data[0].DonemID })
        }
      } else {
        setDonemler([])
      }
    } catch (error) {
      toast.error('data alınırken hata oluştu');
    }
  };

  useEffect(() => {
    getDonemler();
  }, [])

  const fetchItemRapor = async () => {
    const queryParams = new URLSearchParams();
    if (itemValue.DonemID) {
      queryParams.set('donemId', String(itemValue.DonemID));
    }
    if (itemId) {
      queryParams.set('raporId', String(itemId));
    }

    try {
      const response = await axios.get(`${API_URL}/dokumanlar/get-item?${queryParams.toString()}`);
      if (response.status !== 200) {
        return;
      }
      if (response.data) {
        const projerapor = response.data;
        setProjeRaporu(projerapor)
        if ((projerapor.SurecSirasi > 1 && (projerapor.SGKHizmet && projerapor.MuhtasarVePrim)) || (projerapor.SurecSirasi > 2 && (projerapor.OnayliSGKHizmet && projerapor.OnayliMuhtasarVePrim && projerapor.SGKTahakkuk))) {
          setStepFunc((projerapor.SurecSirasi + 1) > 3 ? 3 : projerapor.SurecSirasi + 1);
        } else {
          setStepFunc(projerapor.SurecSirasi);
        }


      } else {
        setProjeRaporu({} as ProjeRaporuType)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
    }
  };


  useEffect(() => {
    if (itemId) {
      resetFunc();
      fetchItemRapor();
    }
  }, [itemId])

  useEffect(() => {
    if (itemValue.DonemID > 0 && !itemId) {
      resetFunc();
      fetchItemRapor();
    }
  }, [itemValue.DonemID, itemId])


  useEffect(() => {
    if (projeRaporu && projeRaporu.ID) {
      setitemValue({
        ...itemValue,
        ID: projeRaporu.ID,
        DonemID: projeRaporu.DonemID
      })
    } else {
      resetFunc()
    }
  }, [projeRaporu])

  const resetFunc = () => {
    setitemValue({
      ...itemValue,
      ID: 0,
    })
    setSgkHizmetListesi([])
    setMuhtasarTableData([])
    setOnayliSgkHizmetListesi([])
    setOnayliMuhtasarTableData([])
    setSGKTahakkuk({} as any);
    setStepFunc(1);
  }


  const fetchFile = async (file: string) => {
    const queryParams = new URLSearchParams();

    queryParams.set('file', file);
    queryParams.set('raporId', String(itemId ?? itemValue.ID));
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



  const validateStep = (stepNumber: number, isBackward: boolean = false): boolean => {
    // Geriye gidişlerde validation yapmadan true döndür ve hataları temizle
    if (isBackward) {
      setError(null);
      setStepErrors({});
      return true;
    }

    const validationKey = `step${stepNumber}` as keyof typeof stepValidations;
    const validator = stepValidations[validationKey];

    if (validator) {
      const result = validator({ itemValue, projeRaporu });
      if (!result.isValid) {
        setError(result.error);
        setStepErrors((prev: any) => ({
          ...prev,
          [stepNumber]: result.error || ''
        }));
        scrollTopFunc();
        return false;
      }
    }

    scrollTopFunc()
    // Validasyon başarılıysa tüm hataları temizle
    setError(null);
    setStepErrors({});
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
    // Geriye gitme durumu
    if (stepId < currentStep) {
      validateStep(stepId, true); // isBackward true
      setCurrentStep(stepId);
      updateStepsState(stepId);
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    // Önceki adımları da kontrol et
    for (let i = 1; i < stepId; i++) {
      if (!validateStep(i)) {
        return;
      }
    }
    setStepFunc(stepId)

  };


  const setStepFunc = (stepId: number) => {
    setCurrentStep(stepId);
    updateStepsState(stepId);
  }

  const handleNextClick = () => {

    scrollTopFunc();
    if (currentStep > 1) {
      if (!file && validateStep(currentStep)) {
        setStepFunc(currentStep + 1);
      }
    } else if (validateStep(currentStep)) {
      setStepFunc(currentStep + 1);
    }
  };



  const scrollTopFunc = () => {
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    document.documentElement.scrollTop = 0;
  }




  const handleSubmit = async ({ stepId, file, belgeAdi, checkedList, adim }: handleSubmitPropsType) => {
    if (submitVisible) return { success: false, error: 'İşlem devam ediyor' };


    setSubmitVisible(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }

      if (checkedList) {
        formData.append('isOrtagiList', JSON.stringify(checkedList));
      }


      formData.append('itemValue', JSON.stringify({ ...itemValue, belgeAdi: belgeAdi, SiraNo: currentStep, KullaniciID: currentUser?.id }));
      const response = await axios.post(`${API_URL}/dokumanlar/upload-api`,
        formData, {
        headers: {
          Authorization: `Bearer ${auth?.access_token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 201 || response.status === 200) {
        if (response.data) {
          if (response.data.dokuman && response.data.dokuman.ID) {
            setProjeRaporu({ ...response.data.dokuman })
            const stepErrors = response.data.dokuman.Hatalar ? JSON.parse(response.data.dokuman.Hatalar) : []
            setRaporHatalar(stepErrors)

            const stepTamamlanan = response.data.dokuman.Tamamlananlar ? JSON.parse(response.data.dokuman.Tamamlananlar) : []
            const createAdimState = (completed: number[]) => {
              const result: Record<string, boolean> = {};
              for (let i = 1; i <= 3; i++) {
                result[`Adim${i}`] = completed.includes(i);
              }
              return result;
            };

            setTamamlananAdimlar(createAdimState(stepTamamlanan));
          }

        } else {
          setProjeRaporu({} as ProjeRaporuType)
        }
        setitemValue({ ...itemValue, BelgesizIslem: false })
        setFile(null)
        setError('')
        if (!response.data.error && !(response.data.personelListesi && response.data.personelListesi.farklilar && response.data.personelListesi.farklilar.length > 0)) {
          setStepFunc(stepId);
        }

        scrollTopFunc()

        return response.data;
      } else {
        setError(response.data?.message || 'Döküman kaydedilirken hata oluştu');
        scrollTopFunc()

        return { success: false, error: response.data?.message || 'Döküman kaydedilirken hata oluştu' };
      }
    } catch (error: any) {
      console.log(error)
      setSuccessMessage('');
      scrollTopFunc();
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
          return { success: false, error: errorMessages };
        } else {
          setError("Bilinmeyen bir hata oluştu.");

          toast.error("Bilinmeyen bir hata oluştu.", { duration: 5000 });
          return { success: false, error: "Bilinmeyen bir hata oluştu." };
        }
      } else {
        setError("Bilinmeyen bir hata oluştu.");
        toast.error("Bilinmeyen bir hata oluştu.", { duration: 5000 });
        return { success: false, error: "Bilinmeyen bir hata oluştu." };
      }

    } finally {
      setSubmitVisible(false);
      scrollTopFunc();
    }
  };

  return (
    <div className="relative grid grid-cols-12 gap-0 min-h-[100%] flex flex-col justify-center">
      {submitVisible && (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <span className="text-white text-lg font-medium">İşleniyor...</span>
        </div>
      )}
      <div className="col-span-12 md:col-span-3">
        <Menu
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          stepErrors={stepErrors}
        />
      </div>
      <div className="col-span-12 md:col-span-9 min-h-[100%] ">
        <div className='flex flex-col gap-4 p-4 bg-white shadow rounded-lg md:rounded-l-none min-h-[100%] justify-between'>
          <div className="flex flex-col">
            {pageError && <div className="error-message text-red-700">{pageError}</div>}
            {error && <div className="error-message text-red-700">{error}</div>}
            {successMessage &&
              <div className="success-message text-green-700 p-4 flex justify-center align-center min-height-[400px]">
                <KeenIcon icon="check" className="w-30 h-30" />{successMessage}</div>
            }



            {

              Step1 && seciliDonem &&
              <Suspense fallback={<div>Yükleniyor...</div>}>
                <div style={currentStep !== 1 ? { height: 0, width: 0, overflow: 'hidden', opacity: 0 } : {}}>
                  <Step1
                    fetchFile={fetchFile}
                    handleSubmit={handleSubmit}
                    donemler={donemler}
                  />
                </div>
              </Suspense>
            }

            {

              Step2 && seciliDonem &&
              <Suspense fallback={<div>Yükleniyor...</div>}>
                <div style={currentStep !== 2 ? { height: 0, width: 0, overflow: 'hidden', opacity: 0 } : {}}>
                  <Step2
                    fetchFile={fetchFile}
                    handleSubmit={handleSubmit}
                  />
                </div>
              </Suspense>
            }

            {

              Step3 && seciliDonem &&
              <Suspense fallback={<div>Yükleniyor...</div>}>
                <div style={currentStep !== 3 ? { height: 0, width: 0, overflow: 'hidden', opacity: 0 } : {}}>
                  <Step3
                    handleSubmit={handleSubmit}
                  />
                </div>
              </Suspense>
            }


          </div>

          <div className="flex justify-between items-bottom border-t mt-5 pt-10">
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
              {currentStep === 3 ? (
                <></>
              ) : (
                <Button
                  color="primary"
                  className="text-sm font-medium px-6 py-2 text-white"
                  onClick={handleNextClick}
                  disabled={Object.keys(stepErrors).length > 0}
                >
                  İlerle
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DokumanYuklemeContent };
