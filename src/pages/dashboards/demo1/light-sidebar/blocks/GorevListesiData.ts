interface FirmaTypesData {
  FirmaID:number;
  FirmaAdi?:string;
  IsDeleted?:boolean;
}
export interface UsersData {
  GorevKullaniciID:number;
  GorevID:number;
  KullaniciID:number;
  Kullanici:UserTypesData;
  IsDeleted?: boolean;
}
interface UserTypesData {
  id:number;
  AdSoyad:string;
  Email?: string;
  isActive?: boolean;
}
interface IITemsTypesData {
  GorevID:number;
  FirmaID:number;
  ProjeID:number;
  DonemID:number;
  BolumAnahtar:string;
  Tamamlandimi?:boolean;
  SonTeslimTarihi:string;
  TamamlanmaTarihi?:string;
  OlusturmaTarihi:string;
  Firma: FirmaTypesData;
  Kullanicilar?: UsersData[];
  TamamlayanKullanici?: UserTypesData;
  Proje:{
    ProjeID:number;
    ProjeAdi?:string;
  };
  Donem:{
    DonemID:number;
    DonemAdi:string;
    Ay:number;
    Yil:number;
  };
  IsDeleted?:boolean;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
