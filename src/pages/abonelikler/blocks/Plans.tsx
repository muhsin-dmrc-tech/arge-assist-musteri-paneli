import { Fragment, useEffect, useState } from 'react';

import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputLabel } from '@mui/material';
import { differenceInDays, format, isBefore } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/auth';

interface IPlanPrice {
  regular: string;
  annual?: string;
}

interface IPlanInfo {
  title: string;
  description: string;
  free?: boolean;
  price?: IPlanPrice;
}

interface IFeaturePlans {
  basic: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
  enterprise: string | boolean;
}

interface IFeature {
  title: string;
  plans: string[];
}

interface IPlansInfo {
  basic: IPlanInfo;
  pro: IPlanInfo;
  premium: IPlanInfo;
  enterprise: IPlanInfo;
}

interface IPlansItem {
  title: string;
  plans: IFeaturePlans[];
}

interface IPlansItems {
  info: IPlansInfo;
  features: IFeature[];
}
interface FirmalarTypesData {
  AbonelikPlanID: number;
  PlanAdi: string;
  Aciklama: string;
  DeletedAt?: string;
  Fiyat: number;
  IsDeleted?: boolean;
  Aktifmi?: boolean;
}

const Plans = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { auth,currentUser } = useAuthContext();
  const [aktifAbonelik, setAktifAbonelik] = useState({} as any);
  const [abonelikBulunamadi, setAbonelikBulunamadi] = useState(false);
  const [planlar, setPlanlar] = useState<FirmalarTypesData[]>([]);
  const [submitVisible, setSubmitVisible] = useState(false);

 

  const fetchPlanlar = async () => {
    try {
      const response = await axios.get(`${API_URL}/abonelik-planlari/get-active-planlar`);
      if (response.status !== 200) {
        return;
      }
      if (response.data.length > 0) {
        setPlanlar(response.data)
      }
    } catch (error: any) {
      const message = error.response?.data?.message ?? `Veriler getirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin`;
      toast(`Bağlantı hatası`, {
        description: message,
        action: {
          label: 'Ok',
          onClick: () => { console.log('Ok') }
        }
      });
    }
  };

  useEffect(() => {
    fetchPlanlar();
  }, [])

  useEffect(() => {
    if (currentUser?.id) {
      fetchBusinessTypess()
    }
  }, [currentUser?.id]);




  const fetchBusinessTypess = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/firma-abonelikleri/get-abonelikler`
      );
      if (response?.data?.data?.AbonelikPlanID) {
        setAbonelikBulunamadi(false)
      } else {
        setAbonelikBulunamadi(true)
      }
      setAktifAbonelik(response.data.data)
    } catch (error: any) {
      setAbonelikBulunamadi(false)
      const message = error.response?.data?.message ?? `Veriler getirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin`;
      toast(`Bağlantı hatası`, {
        description: message,
        action: {
          label: 'Ok',
          onClick: () => { console.log('Ok') }
        }
      });
      return {
        data: [],
        totalCount: 0
      }
    }
  }

  const handleToggleBilling = () => {
    setIsAnnual(!isAnnual);
  };

  const planlarData = planlar.map(item => ({
    pro: {
      title: item.PlanAdi,
      planId: item.AbonelikPlanID,
      description: item.Aciklama,
      price: {
        annual: `${item.Fiyat.toString()} TL`,
        regular: `${item.Fiyat.toString()} TL`
      }
    }
  }))
  const plans1 = {
    info: planlarData,
    features: [
      {
        title: 'Kullanıcı Hesapları',
        plans: [
          '20 Adete kadar',
          '20 Adete kadar',
        ]
      },
      {
        title: 'Veri Depolama',
        plans: [
          '50 GB',
          '50 GB',
        ]
      },
      {
        title: 'API Çağrıları',
        plans: [
          'Aylık 10.000',
          'Aylık 10.000',
        ]
      },
      {
        title: 'Destek',
        plans: [
          'E-posta + Sohbet',
          'E-posta + Sohbet',
        ]
      },
      {
        title: 'Veri Yedekleme',
        plans: [
          'Günlük',
          'Günlük',
        ]
      },
      {
        title: 'Analitik Araçlar',
        plans: [
          'Gelişmiş',
          'Gelişmiş',
        ]
      },
      {
        title: 'Entegrasyon Seçenekleri',
        plans: [
          'Standart',
          'Standart',
        ]
      },
      {
        title: 'Çalışma Süresi Garantisi',
        plans: [
          '%99.9',
          '%99.9',
        ]
      },
      {
        title: 'Özel Raporlar',
        plans: [
          'false',
          'true'
        ]
      },
      {
        title: 'Mobil Erişim',
        plans: [
          'true',
          'false'
        ]
      },
      {
        title: 'Özel Markalama',
        plans: [
          'true',
          'false'
        ]
      }
    ]
  }


  const handleCreateItem = async (abonelikPlanID: number) => {
    if (submitVisible) return;

    if (!abonelikPlanID) {
      return
    }



    setSubmitVisible(true);
    try {
      const response = await axios.post(`${API_URL}/siparisler/create`,
        { AbonelikPlanID: abonelikPlanID }, {
        headers: { Authorization: `Bearer ${auth?.access_token}` }
      });
      if (response.status === 201) {
        const succesMessaj = response.data?.message ?? 'Sipariş başarıyla oluşturuldu';
        toast.success(succesMessaj, { duration: 10000 });
        setTimeout(() => {
          navigate(`/odeme-sayfasi/${response.data?.siparisID}`);
        }, 700);
      } else {
        toast.error('Sipariş oluşturulurken hata oluştu', { duration: 5000 });
      }
    } catch (error: any) {
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
          toast.error(errorMessages, { duration: 5000 });
        } else {
          toast.error("Bilinmeyen bir hata oluştu.", { duration: 5000 });
        }
      } else {
        toast.error("Bilinmeyen bir hata oluştu.", { duration: 5000 });
      }
      toast.error('Sipariş oluşturulurken hata oluştu', { duration: 5000 });
    } finally {
      setSubmitVisible(false);
    }
  };

  const renderPlanInfo = (type: string, info: any, BitisTarihi: string | null,AbonelikPlanID:number) => (
    <Fragment>
      <h3 className="text-lg text-gray-900 font-medium pb-2">{info.title}</h3>
      <div className="text-gray-700 text-2sm" dangerouslySetInnerHTML={{ __html: info.description }} />
      <div className="py-4">
        {info.free ? (
          <h4 className="text-2xl text-gray-900 font-semibold leading-none">Free</h4>
        ) : (
          <div className="flex items-end gap-1.5" data-plan-type={type}>
            <div
              className="text-2xl text-gray-900 font-semibold leading-none"
              data-plan-price-regular={info.price?.regular}
              data-plan-price-annual={info.price?.annual}
            >
              {isAnnual ? info.price?.regular : info.price?.annual}
            </div>
            <div className="text-gray-700 text-2xs">{isAnnual ? 'aylık' : 'yıllık'}</div>
          </div>
        )}
      </div>
      <div>
        <div
          className={
            BitisTarihi
              ? 'border rounded-md px-2 flex justify-center w-full'
              : 'text-center flex justify-center w-full'
          }
        >
          {BitisTarihi ? (
            (() => {
              const bitisTarihi = new Date(BitisTarihi);
              const bugun = new Date();
              const farkGun = differenceInDays(bitisTarihi, bugun);

              if (isBefore(bitisTarihi, bugun)) {
                // Süresi geçmiş
                return (
                  <div className=' flex flex-row justify-center'>
                  <span className="leading-none font-medium text-xs text-red-900">
                    (Süresi Geçmiş)                    
                  </span>
                  <button onClick={()=>handleCreateItem(AbonelikPlanID)} className="btn btn-sm btn-primary text-lg flex justify-center">
                      Yenile
                    </button>
                  </div>
                );
              } else if (farkGun <= 3) {
                // 3 gün veya daha az kaldıysa "Süresi Dolmak Üzere"
                return (
                  <div className=' flex flex-row items-center gap-2'>
                  <span className="leading-none font-medium text-xs text-yellow-900 flex flex-row">
                    Süresi Dolmak Üzere({format(new Date(BitisTarihi), "dd-MM-yyyy")})                   
                  </span>
                  <button onClick={()=>handleCreateItem(AbonelikPlanID)} className="btn btn-sm btn-primary text-lg flex justify-center">
                      Yenile
                    </button>
                  </div>
                );
              } else {
                // Abonelik hala aktif
                return (
                  <span className="leading-none font-medium text-xs text-green-700 py-2.5">
                    Bitiş Tarihi({format(new Date(BitisTarihi), "dd-MM-yyyy")})
                  </span>
                );
              }
            })()
          ) : <button onClick={()=>handleCreateItem(AbonelikPlanID)} className="btn btn-sm btn-primary text-lg flex justify-center w-full">
            Yükselt
          </button>}
        </div>
      </div>
    </Fragment>
  );

  const renderFeatureDetail = (detail: string) => {
    if (detail === 'false' || detail === 'true') {
      return detail === 'false' ? null : <KeenIcon icon="check" className="text-success text-lg" />;
    }
    return <div className="text-gray-800 text-2sm">{detail}</div>;
  };

  const renderItem = (feature: any, index: number) => {
    return (
      <tr key={index}>
        <td className="table-border-s !px-5 !py-3.5">
          <div className="text-gray-900 text-2sm leading-none font-medium">{feature.title}</div>
        </td>
        <td className="table-border-s !px-5 !py-3.5">{renderFeatureDetail(feature.plans[0])}</td>

        <td className="table-border-s !px-5 !py-3.5">
          {renderFeatureDetail(feature.plans[1])}
        </td>
      </tr>
    );
  };
  return (
    <div className="scrollable-x-auto pt-3 -mt-3">
      <table
        className="table table-fixed min-w-[1000px] table-border-b table-border-e table-rounded card-rounded 
      [&_tr:nth-of-type(2)>td]:table-border-t [&_tr:nth-of-type(2)>td:first-child]:card-rounded-ts"
      >
        <tbody>
          <tr>
            <td className="!border-b-0 align-top !p-5 !pt-7.5 !pb-6">
              {
                  abonelikBulunamadi &&
                  <span className="text-red-700">
                    Aktif Plan Bulunamadı Hizmetlerden Yararlanabilmeniz İçin Plan Satın Alın
                  </span>
              }
            </td>

            {plans1.info.map((item, index) => (
              <td key={index} className={`!border-b-0 table-border-s table-border-t ${(plans1.info.length - 1) === index ? 'card-rounded-te' : index === 0 ? 'card-rounded-ts' : 'card-rounded-tr'} bg-light-active dark:bg-coal-100 !p-5 !pt-7.5 relative`}>
                {!abonelikBulunamadi &&
                  aktifAbonelik?.AbonelikPlanID === item.pro.planId && <span className="absolute badge badge-sm badge-outline badge-success absolutes top-0 start-1/2 rtl:translate-x-1/2 -translate-x-1/2 -translate-y-1/2">
                    Aktif Plan
                  </span>}
                {renderPlanInfo('pro', item.pro,
                  aktifAbonelik?.AbonelikPlanID === item.pro.planId && aktifAbonelik.BitisTarihi,
                  item.pro.planId
                  )}
              </td>))}
          </tr>
          {plans1.features.map((feature: any, index: number) => renderItem(feature, index))}
        </tbody>
      </table>
    </div>
  );
};

export { Plans, type IPlansItem, type IPlansItems };
