import { format } from "date-fns";
import { IITemsTypesData } from "./ProjelerData";
import { DefaultTooltip, KeenIcon } from "@/components";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/auth";

interface IPlanItem {
  total: string;
  description: string;
}
interface IPlanItems extends Array<IPlanItem> { }

const Plan = ({ item }: { item: IITemsTypesData }) => {
  const { currentUser } = useAuthContext();


  /* const sohbeteBasla = async (kullaniciID?: number) => {
    if (!kullaniciID || isNaN(kullaniciID)) return;
    if (!currentUser || currentUser?.id === kullaniciID) return;
    setSohbetKullaniciId(kullaniciID);
    setOpenSohbetModal(true)
  }; */

  const renderItem = (statistic: IPlanItem, index: number, kullaniciID?: number | null) => {
    return (
      <div
        key={`${index}-${kullaniciID}`}
        onClick={kullaniciID ? () => {/* sohbeteBasla(kullaniciID) */} : undefined}
        className={
          `grid grid-cols-1 content-between gap-1.5 border border-dashed border-gray-400 shrink-0 rounded-md px-3.5 py-2 min-w-24 max-w-auto` +
          (kullaniciID ? ' cursor-pointer' : '')
        }      >
        <span className="text-gray-900 text-md leading-none font-medium">{statistic.total}</span>
        <span className="text-gray-700 text-2sm">{statistic.description}{kullaniciID && <KeenIcon icon='sms' className='ms-1 text-green-500 mr-1' />}</span>
      </div>
    );
  };

  const tamamlanmaOranFunc = () => {
    let oran = 0;

    if (item.Durum === 'Tamamlandı') {
      oran = 100;
    } else if (item.SurecSirasi && item.SurecSirasi <= 3) {
      oran = (item.SurecSirasi / 3) * 100;
    }
    return `${oran}%`;
  };


  return (
    <div className="card">
      <div className="card-body lg:py-7.5">
        <div className="flex flex-col items-stretch gap-5 lg:gap-7.5">
          <div className="flex flex-wrap items-center gap-5 justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-semibold text-gray-900">{item.Donem.DonemAdi} Raporu</h2>
                <span className="badge badge-sm badge-outline badge-success">{item.Durum}</span>
              </div>
              {/* <p className="text-2sm text-gray-700">
                {item.Proje.ProjeAdi}
              </p> */}
            </div>
            <div className="flex gap-2.5">

              <Link to={`/aylik-faaliyet-raporlari/edit/${item.ID}`} className="btn btn-sm btn-primary">
                {item.Durum === 'Tamamlandı' ? 'Raporu Gör' : 'Raporu Tamamla'}
              </Link>

            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 lg:gap-5">
            {renderItem({ total: item.SonDuzenlenmeTarihi ? format(item.SonDuzenlenmeTarihi, 'dd/MM/yyy') : '25/12/2024', description: 'Son Güncelleme' }, 0)}
            {renderItem({ total: item.Kullanici?.AdSoyad, description: 'Raporu Hazırlayan' }, 1)}
           {/*  {item.Proje?.ProjeUzmanKullanici && renderItem({ total: item.Proje?.ProjeUzmanKullanici ? item.Proje?.ProjeUzmanKullanici?.AdSoyad : 'Atanmamış', description: 'Proje Sorumlusu'
             }, 2,item.Proje?.ProjeUzmanKullaniciID ? item.Proje?.ProjeUzmanKullaniciID : null )} */}
            
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm">Raporlama Süreci: Adım {item.SurecSirasi}/3 - {item.SurecSirasi === 1 ? 'Onaysız Dökümanlar' :
                  item.SurecSirasi === 2 ? 'Onaylı Dökümanlar' : item.Durum}</span>
            <div className="progress progress-primary">
              <div className="progress-bar" style={{ width: tamamlanmaOranFunc() }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Plan };
