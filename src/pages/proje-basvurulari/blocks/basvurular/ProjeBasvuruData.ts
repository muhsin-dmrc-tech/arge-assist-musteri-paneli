
interface FirmaType {
  FirmaAdi:string;
  FirmaID:number
}

interface TeknokentType {
  TeknokentID:number;
  TeknokentAdi:string;
}
interface KullaniciType {
  id:number;
  AdSoyad:string;
  FirmaAdi:string
}
interface IITemsTypesData {
  BasvuruID:number;
  TeknokentID: number;
  //Teknokent:TeknokentType;
  KullaniciID: number;
  Kullanici:KullaniciType;
  OnerilenProjeIsmi:string;
  ProjeKonusuVeAmaci:string;
  IsDeleted?:boolean;
  Durum?:string;
  DegerlendirmedeMi:boolean;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
