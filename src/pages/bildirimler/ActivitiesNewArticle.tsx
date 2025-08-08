import { Link } from 'react-router-dom';

import { TimelinesWrapper } from '@/partials/timelines/default/item';
import formatTarih from '@/hooks/formatTarih';

export interface bildirimType {
  BildirimID: number;
  KullaniciID: number;
  KullaniciBildirimID: number;
  Baslik: string;
  Icerik: string;
  Link: string;
  OkunduMu: boolean;
  Durum: string;
  OkunmaTarihi: string;
  PlanlananTarih?: string;
  EpostaGonderildiMi: boolean;
  EpostaGonderimTarihi?: string;
  OlusturmaTarihi?: string;
  Bildirim:BildirimTuruType;
}
interface BildirimTuruType {
  BildirimID:number;
  Baslik:string;
  Icerik: string;
  Tur: string;
  TumKullanicilar: boolean;
  Durum: string;
  OlusturmaTarihi: string;
  PlanlananTarih?: string;
  IsDeleted: boolean;
}

const ActivitiesNewArticle = ({ bildirim,line }: { bildirim: bildirimType,line:boolean }) => {

  const iconFunc=(tur:string)=>{
    switch(tur){
      case('Bilgi'):
      return 'question-2'
      case('Uyarı'):
      return 'information-2'
      case('Hata'):
      return 'shield-cross'
      default:
        return 'people'
    }
  }


  return (
    <TimelinesWrapper icon={iconFunc(bildirim.Bildirim.Tur)} line={line}>
      <div className="flex flex-col">
        <div className="text-sm text-gray-800 font-semibold">
          {bildirim.Baslik}
        </div>
        {bildirim.Link ? <a href={bildirim.Link} className="text-sm font-medium">
          {bildirim.Icerik}
        </a> :
          <div className="text-sm font-medium">
            {bildirim.Icerik}
          </div>
        }
        <span className="text-xs text-gray-600">{bildirim.OlusturmaTarihi && formatTarih(bildirim.OlusturmaTarihi)}</span>
      </div>
    </TimelinesWrapper>
  );
};

export { ActivitiesNewArticle };
