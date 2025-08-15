interface ProjeType {
  ProjeAdi: string;
  ProjeID: number;
  ProjeUzmanKullaniciID:number;
  ProjeHakemKullaniciID:number;
}

interface DonemType {
  DonemAdi: string;
  DonemID: number
}


interface IITemsTypesData {
  ID: number;
  ProjeID: number;
  Proje: ProjeType;
  DonemID: number;
  Donem: DonemType;
  KullaniciID: number;
  Kullanici: {
    AdSoyad: string,
    FirmaAdi:string
  };
  SurecSirasi: number;
  SGKHizmet?: string;
  OnayliSGKHizmet?: string;
  MuhtasarVePrim?: string;
  OnayliMuhtasarVePrim?: string;
  SGKTahakkuk?: string;
  Durum: string;
  OlusturmaTarihi: string;
  SonDuzenlenmeTarihi?: string;
  Onaylimi?: boolean;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
