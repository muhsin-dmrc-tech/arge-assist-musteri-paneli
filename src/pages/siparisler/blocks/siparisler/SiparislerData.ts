interface FirmaType {
  FirmaAdi:string;
  FirmaID:number
}

interface KullaniciType {
  AdSoyad:string;
  FirmaAdi:string;
}

interface AbonelikPlanType {
  AbonelikPlanID:number;
  PlanAdi:string;
  Aciklama:string;
  Fiyat:number;
}

interface IITemsTypesData {
  SiparisID:number;
  FaturaID:number;
  AbonelikPlanID:number;
  AbonelikPlan:AbonelikPlanType;
  KullaniciID:number;
  Kullanici:KullaniciType;
  FaturaBilgiID:number;
  OlusturmaTarihi:string;
  OdemeTarihi:string;
  OdemeVadesi:string;
  Tutar:number;
  Durum:string;
  DeletedAt?:string;
  IsDeleted?:boolean;
  OdenmemeSebebi?:string;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
