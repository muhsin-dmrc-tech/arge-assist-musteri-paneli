export interface PersonelType {
  PersonelID: number;
  AdSoyad?: string;
  TCNo?: string;
  FirmaID?: number;
  IseGirisTarihi: string;
  IstenCikisTarihi?: string
}
export interface DonemType {
  DonemID:number;
  DonemAdi:string;
  Ay: number;
  Yil: number;
}
interface IITemsTypesData {
  PersonelAdi: string;
  Mezuniyet:string;
  Unvan:string;
  NetMaas:string;
  BrutMaas:string;
  VergiIstisnasiUygula:boolean;
  BesPuanlikIndirimUygula:boolean;
  ArgeGunSayisi:number
}
export interface TeknoKentHesaplama {
  gunSayisi: number;
  argeGunSayisi: number;
  tutar: number;
  bordroEsasBrut: number;
  calisanSGKPrimi: number;
  calisanIssizlikSigortasi: number;
  vergiDilimi: number;
  gelirVergisi: number;
  damgaVergisi: number;
  asgariUcretVergiIstisnasi: number;
  netUcret: number;
  maas: number;
  sgkPayi: number;
  issizlikPayi: number;
  toplamSGKIstisna: number;
  gelirVergisiIstisnasi: number;
  damgaVergisiIstisnasi: number;
  toplamSGKOdemesi: number;
  damgaVergiOdemesi: number;
  gelirVergisiOdemesi: number;
  toplamMaliyet: number;
  PersonelAdi?: string;
  vergiIstisnasiUygula?:boolean;
  besPuanlikIndirimUygula?:boolean;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
