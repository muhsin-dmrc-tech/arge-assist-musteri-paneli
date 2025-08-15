interface KullaniciType {
  AdSoyad:string;
  FirmaAdi:string
}


interface IITemsTypesData {
  ProjeID:number;
  ProjeAdi?:string;
  KullaniciID: number;
  Kullanici:KullaniciType;
  IsDeleted?:boolean;
  ProjeKodu?:string;
  STBProjeKodu?:string;
  BaslangicTarihi?:string;
  BitisTarihi?:string;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
