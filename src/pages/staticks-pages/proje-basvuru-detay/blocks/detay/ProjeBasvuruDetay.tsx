/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthContext } from '@/auth/useAuthContext';
import { KeenIcon } from '@/components/keenicons';
import { useParams } from 'react-router';
import { IITemsTypesData } from './ProjeBasvuruData';
import yetkiKontroluTeknokent from '@/hooks/yetkiKontrolTeknokentFunc';



const ProjeBasvuruDetay = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState<IITemsTypesData>();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const { currentUser } = useAuthContext();

  //sayfa için gerekli izinler
  const gerekliIzinler = ['proje-basvuru-seeing'];


  const fetchItem = async () => {
    try {
      const response = await axios.get(`${API_URL}/proje-basvuru/get-proje-basvuru-item/${itemId}`);
      if (response.status !== 200) {
        return;
      }
      if (response.data && response.data?.BasvuruID) {
        setItem(response.data)
        setError(null)
        setPageError(null)
      } else {
        setPageError('Bu id ile eşleşen proje başvurusu bulunamadı')
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


  const fetchFile = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/proje-basvuru/get-proje-basvuru-file/${itemId}`,
        {
          responseType: 'blob' // Doğrudan blob olarak al
        }
      );

      if (response.status === 200 && response.data) {
        // Dosya adını Content-Disposition header'dan al
        const contentDisposition = response.headers['content-disposition'];
        const fileName = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
          : 'basvuru-eki';

        // Blob URL oluştur
        const blob = new Blob([response.data], {
          type: response.headers['content-type'] || 'application/octet-stream'
        });
        const url = URL.createObjectURL(blob);

        // İndirme işlemi
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Temizlik
        URL.revokeObjectURL(url);
        setError(null);
      }
    } catch (error: any) {
      console.error('Dosya indirme hatası:', error);
      toast.error(error?.message || 'Dosya indirilirken bir hata oluştu', {
        duration: 5000
      });
      setError(error?.message || 'Dosya indirilirken bir hata oluştu');
    }
  };


  const degerlendirmeSonucFunc = async (degerlendirmeSonuc: string) => {
    if (!item?.BasvuruID) {
      toast.error("Proje başvurusu bulunamadı");
      setError("Proje başvurusu bulunamadı");
      return
    }
    if (item?.Durum !== 'Bekliyor') {
      toast.error("Proje başvurusu zaten sonuçlanmış.");
      setError("Proje başvurusu zaten sonuçlanmış.");
      return
    }
    try {
      const response = await axios.post(`${API_URL}/proje-basvuru/degerlendir`, { itemId: item?.BasvuruID, degerlendirmeSonuc });
      if (response.status === 201) {
        // Başarılı olursa state'i güncelle
        setItem(response.data);
        //window.location.reload()
      } else {
        toast.error("Proje başvurusu değerlendirmeye alınamadı");
      }
    } catch (error) {
      console.error(error);
      toast.error("Proje başvurusu değerlendirmeye alınamadı");
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
        <div className="card ">

          {error &&
            <div className="card-header">
              <div className="text-red-700">
                <KeenIcon icon={'information-2'} />
                <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span></div>
            </div>
          }


          <div className="card-body flex flex-col gap-4">



            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-3">Firma :</div>
              <div className="col-span-12 md:col-span-9">{item?.Kullanici?.FirmaAdi}</div>
            </div>

           {/*  <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-3">Teknokent :</div>
              <div className="col-span-12 md:col-span-9">{item?.Teknokent.TeknokentAdi}</div>
            </div> */}

            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-3">Önerilen proje ismi :</div>
              <div className="col-span-12 md:col-span-9">{item?.OnerilenProjeIsmi} </div>
            </div>

            <div className="space-y-6">
              <div className="card bg-gray-50 p-3 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Projenin Konusu ve Amacı</h3>
                <p className="text-gray-600 bg-white p-4 rounded-md border border-gray-100">
                  {item?.ProjeKonusuVeAmaci || 'Belirtilmemiş'}
                </p>
              </div>

              <div className="card bg-gray-50 p-3 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Problem Tanımı</h3>
                <p className="text-gray-600 bg-white p-4 rounded-md border border-gray-100">
                  {item?.ProjeyiOrtayaCikaranProblem || 'Belirtilmemiş'}
                </p>
              </div>

              <div className="card bg-gray-50 p-3 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Önerilen Çözüm</h3>
                <p className="text-gray-600 bg-white p-4 rounded-md border border-gray-100">
                  {item?.ProjeKapsamindakiCozum || 'Belirtilmemiş'}
                </p>
              </div>

              <div className="card bg-gray-50 p-3 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Ürün ve Yenilikler</h3>
                <p className="text-gray-600 bg-white p-4 rounded-md border border-gray-100">
                  {item?.ProjeninIcerdigiYenilikler || 'Belirtilmemiş'}
                </p>
              </div>

              <div className="card bg-gray-50 p-3 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Rakip Analizi</h3>
                <p className="text-gray-600 bg-white p-4 rounded-md border border-gray-100">
                  {item?.RakipAnalizi || 'Belirtilmemiş'}
                </p>
              </div>

              <div className="card bg-gray-50 p-3 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Ticari Başarı Potansiyeli ve Satış Stratejileri</h3>
                <p className="text-gray-600 bg-white p-4 rounded-md border border-gray-100">
                  {item?.TicariBasariPotansiyeli || 'Belirtilmemiş'}
                </p>
              </div>
            </div>
            {
              item?.DosyaEki &&
              <button
                className="btn btn-sm btn-primary"
                onClick={fetchFile}
              >
                Dosya Eki'ni İndir
              </button>
            }

          </div>


          {item?.Durum === 'Bekliyor' ?
            <div className="card-footer">
              <button
                className="btn btn-sm btn-success"
                onClick={() => degerlendirmeSonucFunc('Onaylandı')}
              >
                Onayla
              </button>

              <button
                className="btn btn-sm btn-danger"
                onClick={() => degerlendirmeSonucFunc('Reddedildi')}
              >
                Reddet
              </button>
            </div> :
            <div className="card-footer">
              {item?.Durum === 'Onaylandı' ?
                <div className="text-s text-green-700">{item?.Durum}</div> :
                <div className="text-s text-red-700">{item?.Durum}</div>
              }
            </div>
          }


        </div>
      }
    </>
  )
};

export { ProjeBasvuruDetay };
