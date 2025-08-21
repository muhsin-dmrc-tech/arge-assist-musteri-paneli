/* eslint-disable prettier/prettier */
import { lazy, Suspense, useEffect, useState } from 'react';
import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { IITemsTypesData } from '.';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
const SozlesmelerModal = lazy(() => import('@/partials/modals/sozlesmeler-modal/SozlesmelerModal'));



const OdemeSayfasi = () => {
  const navigate = useNavigate();
  const { siparisId } = useParams();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { auth,currentUser } = useAuthContext();
  const [submitVisible, setSubmitVisible] = useState(false);
  const [sozlesmeModalOpen, setSozlesmeModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [item, setItem] = useState({} as IITemsTypesData);
  const [sozlesmeChecked, setSozlesmeChecked] = useState(false);
  const [odemeYontemi, setOdemeYontemi] = useState('Havale/EFT')
  const [faturaBilgi, setFaturaBilgi] = useState({
    FaturaBilgiID: 0,
    FirmaAdi: currentUser?.FirmaAdi ?? '',
    VergiNo: '',
    VergiDairesi: '',
    Adres: '',
    Sehir: '',
    Ilce: '',
    Telefon: '',
    Eposta: currentUser?.Email ?? ''
  });
  const [kartBilgi, setKartBilgi] = useState({
    AdSoyad: '',
    Iban: '',
    SonKullanmaTarihi: '',
    Cvc: '',
    OdemeYontemi: ''
  });

  const fetchItem = async () => {
    try {
      const response = await axios.get(`${API_URL}/siparisler/get-siparis-item/${siparisId}`);
      if (response.status !== 200) {
        return;
      }
      if (response.data && response.data?.SiparisID) {
        setItem(response.data)
        if (response.data.FaturaBilgi) {
          setFaturaBilgi(response.data.FaturaBilgi)
        }
        setPageError(null)
      } else {
        setPageError('Bu id ile eşleşen sipariş bulunamadı')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
      setPageError(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu')
    }
  };

  useEffect(() => {
    if (siparisId) {
      fetchItem();
    } else {
      resetForm()
    }
  }, [siparisId])

  const resetForm = () => {
    setItem({} as IITemsTypesData);
  }

  const validateInput = () => {
    let errors: string[] = [];

    if (!item.SiparisID) {
      errors.push('Sipariş ID bulunamadı.');
    }

    if (!faturaBilgi?.FirmaAdi || faturaBilgi.FirmaAdi.length < 3) {
      errors.push('Firma adı en az 3 karakter olmalıdır.');
    }

    if (!faturaBilgi?.VergiNo || faturaBilgi.VergiNo.length < 11) {
      errors.push('Vergi/TC No en az 11 karakter olmalıdır.');
    }

    if (!faturaBilgi?.VergiDairesi || faturaBilgi.VergiDairesi.length < 3) {
      errors.push('Vergi Dairesi en az 3 karakter olmalıdır.');
    }

    if (!faturaBilgi?.Adres || faturaBilgi.Adres.length < 10) {
      errors.push('Adres en az 10 karakter olmalıdır.');
    }

    /* if (!kartBilgi?.AdSoyad || kartBilgi?.AdSoyad.length < 5) {
      errors.push('Kart sahibinin adı soyadı en az 5 karakter olmalıdır.');
    } */

    /* if (!kartBilgi?.Iban || !/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(kartBilgi.Iban)) {
      errors.push('Geçerli bir IBAN giriniz.');
    }

    if (!kartBilgi?.SonKullanmaTarihi || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(kartBilgi.SonKullanmaTarihi)) {
      errors.push('Son Kullanma Tarihi MM/YY formatında olmalıdır.');
    }

    if (!kartBilgi?.Cvc || kartBilgi.Cvc.length !== 3 || isNaN(Number(kartBilgi.Cvc))) {
      errors.push('CVC 3 basamaklı bir sayı olmalıdır.');
    } */

    if (errors.length > 0) {
      setError(errors.join(' | '));
      scrollTopFunc();
      return false;
    }

    return true;
  };

  const handleCreateItem = async () => {
    if (submitVisible) return;
    if (!sozlesmeChecked) {
      setError('Abonelik sözleşmesini kabul etmelisiniz.');
      scrollTopFunc();
      return false;
    }
    setError(null);
    setSuccessMessage(null);

    // Önce form validasyonu yap
    if (!validateInput()) {
      return;
    }

    setSubmitVisible(true);
    try {
      const response = await axios.post(
        `${API_URL}/odemeler/create`,
        { SiparisID: item.SiparisID, faturaBilgi, odemeYontemi /*, kartBilgi */ },
        { headers: { Authorization: `Bearer ${auth?.access_token}` } }
      );
      if (response.status === 201) {
        let successMessage = response.data?.message ?? 'Ödeme işlemi başarılı';
        if (response.data.status === 213 && response.data.devamEdenIslem) {
          successMessage = response.data?.message ?? 'Ödeme işlemi devam ediyor';
        }
        setSuccessMessage(successMessage);
        toast.success(successMessage, { duration: 10000 });
        scrollTopFunc();
        setTimeout(() => navigate(`/siparisler`), 1500);
        resetForm();
      } else {
        setError(response.data?.message || 'Ödeme işleminde hata oluştu');
        scrollTopFunc();
        toast.error('Ödeme işleminde hata oluştu', { duration: 5000 });
      }
    } catch (error: any) {
      setSuccessMessage('');
      let errorMessages = 'Bilinmeyen bir hata oluştu.';

      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (Array.isArray(message)) {
          errorMessages = message
            .map((err) => (typeof err === 'string' ? err : Object.values(err.constraints || {}).join(' ')))
            .join(' | ');
        } else if (typeof message === 'string') {
          errorMessages = message;
        }
      }

      setError(errorMessages);
      scrollTopFunc();
      toast.error('Ödeme işleminde hata oluştu', { duration: 5000 });
    } finally {
      setSubmitVisible(false);
    }
  };


  const scrollTopFunc = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  // Türkiye IBAN formatı doğrulama fonksiyonu
  const validateCardNumber = (cardNumber: string) => {
    const cardRegex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
    return cardRegex.test(cardNumber.trim()); // Boşlukları koruyarak kontrol et
  };

  // Kullanıcı yazarken 4 karakterde bir boşluk ekleyen fonksiyon
  const formatCardNumber = (input: string) => {
    return input
      .replace(/\D/g, '') // Sadece rakamları al
      .replace(/(.{4})/g, '$1 ') // Her 4 karakterde bir boşluk ekle
      .trim(); // Fazla boşlukları kaldır
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setKartBilgi({ ...kartBilgi, Iban: formatted });
  };

  // Son Kullanma Tarihi doğrulama fonksiyonu (MM/YY formatında ve gelecekte olmalı)
  const validateExpiryDate = (date: string) => {
    if (!/^\d{2}\/\d{2}$/.test(date)) return false; // MM/YY formatında mı?
    const [month, year] = date.split("/").map(Number);
    if (month < 1 || month > 12) return false; // Ay 1-12 arasında mı?

    const currentYear = new Date().getFullYear() % 100; // Son 2 rakamı al
    const currentMonth = new Date().getMonth() + 1; // Ay bilgisini al

    return year > currentYear || (year === currentYear && month >= currentMonth);
  };

  // CVV doğrulama fonksiyonu (3 veya 4 haneli olmalı)
  const validateCVV = (cvv: string) => /^[0-9]{3,4}$/.test(cvv);





  return (
    <>
      <Suspense fallback={<div>Yükleniyor...</div>}>
        {sozlesmeModalOpen && <SozlesmelerModal open={sozlesmeModalOpen} setOpen={setSozlesmeModalOpen} anahtar='abonelik-sozlesmesi' />}
      </Suspense>
      {pageError ? <div className="text-red-700 w-full bg-red-100 p-1 rounded-lg flex items-center max-w-full">
        <KeenIcon icon={'information-2'} />
        <span>{typeof error === 'string' ? error : JSON.stringify(pageError)}</span></div>
        :
        <div className="flex-col px-5 py-5 border rounded-lg">
          <div className="mt-3">
            <div className="flex flex-col p-3 gap-3 card  bg-gray-50">
              <div className="flex flex-col justify-center align-center">
                <div className="text-sky-700 w-full bg-sky-100 p-1 rounded-lg flex items-center">  <KeenIcon
                  icon={'information-1'}
                  style="solid"
                  className={`text-lg leading-0 me-2`}
                  aria-label={'information-1'}
                /> <span>Ödeme işlemlerini tamamla.</span>
                </div>
                {error && (
                  <div className="text-red-700 flex items-center gap-2 ps-3">
                    <KeenIcon icon="information-2" />
                    <span>{error}</span>
                  </div>
                )}
                {successMessage && (
                  <div className="text-lime-400 flex items-center gap-2 ps-3">
                    <KeenIcon icon="information-1" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </div>

              <div className="card-body flex flex-col gap-2">
                <div className="text-lg">Fatura Bilgileri</div>
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">Firma Adı :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        value={faturaBilgi.FirmaAdi}
                        required
                        placeholder="Firma Adı"
                        onChange={(e) => setFaturaBilgi({ ...faturaBilgi, FirmaAdi: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">Vergi/TC No :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        value={faturaBilgi.VergiNo || ""}
                        required
                        placeholder="TC No"
                        type="text"
                        pattern="\d{11}"
                        maxLength={11}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 11) {
                            setFaturaBilgi({ ...faturaBilgi, VergiNo: value });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">Vergi Dairesi :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        value={faturaBilgi.VergiDairesi}
                        required
                        placeholder="Vergi Dairesi"
                        onChange={(e) => setFaturaBilgi({ ...faturaBilgi, VergiDairesi: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">Adres :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Textarea
                        className="w-full"
                        value={faturaBilgi.Adres}
                        required
                        placeholder="Adres"
                        onChange={(e) => setFaturaBilgi({ ...faturaBilgi, Adres: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">Şehir :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        value={faturaBilgi.Sehir}
                        required
                        placeholder="Şehir"
                        onChange={(e) => setFaturaBilgi({ ...faturaBilgi, Sehir: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">İlçe :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        value={faturaBilgi.Ilce}
                        required
                        placeholder="İlçe"
                        onChange={(e) => setFaturaBilgi({ ...faturaBilgi, Ilce: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">Telefon :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        value={faturaBilgi.Telefon}
                        required
                        placeholder="Telefon"
                        onChange={(e) => setFaturaBilgi({ ...faturaBilgi, Telefon: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">E-posta :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        value={faturaBilgi.Eposta}
                        required
                        placeholder="E-posta"
                        onChange={(e) => setFaturaBilgi({ ...faturaBilgi, Eposta: e.target.value })}
                      />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-4 items-center mt-6">
                  <div className="col-span-12 md:col-span-3 text-md font-semibold">Ücret :</div>
                  <div className="col-span-12 md:col-span-9 text-md font-bold">{item.Tutar} TL</div>
                </div>
              </div>





              {/* <div className="card-body flex flex-col gap-4">
                <div className="text-lg">Kart Bilgileri</div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">Kartın Sahibinin Adı Soyadı :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        value={kartBilgi.AdSoyad}
                        required
                        placeholder="Ad Soyad"
                        onChange={(e) => setKartBilgi({ ...kartBilgi, AdSoyad: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">Kart Numarası :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        type="text"
                        value={kartBilgi.Iban}
                        required
                        maxLength={19}
                        placeholder="0000 0000 0000 0000"
                        onChange={handleCardChange}
                        style={{ borderColor: kartBilgi.Iban && !validateCardNumber(kartBilgi.Iban) ? "red" : "" }}
                      />
                    </label>
                    {!validateCardNumber(kartBilgi.Iban) && kartBilgi.Iban.length > 0 && (
                      <p className="text-red-500 text-xs">Geçersiz Kart Numarası formatı</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">Son Kul. Tarihi :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        type="text"
                        maxLength={5}
                        value={kartBilgi.SonKullanmaTarihi}
                        required
                        placeholder="MM/YY"
                        onChange={(e) => setKartBilgi({ ...kartBilgi, SonKullanmaTarihi: e.target.value })}
                        style={{ borderColor: kartBilgi.SonKullanmaTarihi && !validateExpiryDate(kartBilgi.SonKullanmaTarihi) ? "red" : "" }}
                        autoComplete='off'
                        name="fake-name"
                      />
                    </label>
                    {!validateExpiryDate(kartBilgi.SonKullanmaTarihi) && kartBilgi.SonKullanmaTarihi.length > 0 && (
                      <p className="text-red-500 text-xs">Geçersiz tarih formatı veya tarih geçmiş</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3 text-xs">CVC (Güvenlik Kodu) :</div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="checkbox-group">
                      <Input
                        className="w-full"
                        type="text"
                        maxLength={4}
                        value={kartBilgi.Cvc}
                        required
                        placeholder="123"
                        onChange={(e) => setKartBilgi({ ...kartBilgi, Cvc: e.target.value })}
                        style={{ borderColor: kartBilgi.Cvc && !validateCVV(kartBilgi.Cvc) ? "red" : "" }}
                      />
                    </label>
                    {!validateCVV(kartBilgi.Cvc) && kartBilgi.Cvc.length > 0 && (
                      <p className="text-red-500 text-xs">Geçersiz CVC</p>
                    )}
                  </div>
                </div>
                
              </div> */}



              <div className="card-body flex flex-col gap-4">
                <label className="checkbox-group">
                  <input
                    className="checkbox checkbox-sm"
                    type="checkbox"
                    checked={sozlesmeChecked}
                    onChange={() => setSozlesmeChecked(!sozlesmeChecked)}
                  />
                  <span className="checkbox-label">
                    <button onClick={() => setSozlesmeModalOpen(true)} className="text-2sm link">
                      Abonelik Sözleşmesini
                    </button>{' '}
                    kabul ediyorum
                  </span>
                </label>


                <div className="text-lg font-bold">Havele/EFT Yapabileceğiniz Hesaplar</div>
                <div>
                  <div className="bg-sky-100 text-sky-700 p-1 rounded-lg flex items-center hidden md:flex mb-1">
                  <i aria-label="information-1" className="ki-solid ki-information-1 text-s leading-0 me-2"></i>
                    Not: Lütfen açıklama alanına aşağıdaki bilgileri yazınız. 
                    <br />
                    Firma Adı : {item?.Kullanici?.FirmaAdi ? item?.Kullanici?.FirmaAdi : faturaBilgi.FirmaAdi} <br />
                    Sipariş ID : {siparisId}
                  </div>
                  <div className='max-sm:flex max-sm:flex-row'>
                    {/* Başlık Satırı */}
                    <div className="max-sm:flex max-sm:flex-col sm:grid sm:grid-cols-12 gap-4 border-b bg-muted">
                      <div className="col-span-4 p-4 font-semibold">Banka</div>
                      <div className="col-span-4 p-4 font-semibold">IBAN</div>
                      <div className="col-span-4 p-4 font-semibold">Alıcı</div>
                    </div>

                    {/* İçerik Satırı */}
                    <div className="sm:grid sm:grid-cols-12 gap-4">
                      <div className="col-span-4 p-4">Vakıfbank</div>
                      <div className="col-span-4 p-4">TR32 0001 5001 5800 7325 0277 95</div>
                      <div className="col-span-4 p-4 text-sm">AGT YAZILIM DANIŞMANLIK LİMİTED ŞİRKETİ</div>
                    </div>
                  </div>
                </div>

              </div>

              <button disabled={submitVisible} onClick={() => handleCreateItem()}
                className='btn btn-primary text-lg justify-center'>Ödemeyi Bildir</button>


            </div>
          </div >

        </div>
      }
    </>
  )
};

export { OdemeSayfasi };
