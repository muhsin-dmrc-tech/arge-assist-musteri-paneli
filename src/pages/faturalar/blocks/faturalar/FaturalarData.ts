interface FirmaType {
  FirmaAdi:string;
  FirmaID:number
}

interface KullaniciType {
  AdSoyad:string;
  FirmaAdi:string;
}

interface AbonelikType {
  AbonelikID:number;
  PlanAdi:string;
  Aciklama:string;
  Fiyat:number;
}

interface IITemsTypesData {
  FaturaID:number;
  AbonelikID:number;
  KullaniciID:number;
  Kullanici:KullaniciType;
  FaturaBilgiID:number;
  FaturaTarihi:string;
  SonOdemeTarihi:string;
  Tutar:number;
  Durum:string;
  DeletedAt?:string;
  IsDeleted?:boolean;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
