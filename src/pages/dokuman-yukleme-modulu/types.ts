import { KullaniciType } from "@/auth/types";

export interface ItemValutype {
    ID: number,
    KullaniciID: number,
    DonemID: number,
    BelgesizIslem?: boolean
    adim?:string
}

export interface SGKTahakkuktype{
    primeEsasKazanc:string;
    toplamPrim:string;
    istisnaTutari:string;
}

export interface DonemType {
    DonemID: number;
    DonemAdi: string;
    Ay: number;
    Yil: number;
}




export interface PersonelTableData {
    tcKimlikNo: string;
    ad: string;
    soyAd: string;
    baslangicTarihi: string;
    gelirVergiIstisnasi: string;
    sigortaPrimiIsverenHissesi: string;
}

interface GeciciPersonelTableData {
    tcKimlikNo: string;
    ad: string;
    soyAd: string;
    baslangicTarihi: string;
    gelirVergiIstisnasi: string;
    sigortaPrimiIsverenHissesi: string;
    Aciklama?: string;
}

export interface SgkHizmetListesiData {
    tcKimlikNo: string;
    ad: string;
    soyAd: string;
    Gun?: number;
}

export interface FarklılarListesiData {
    tcKimlikNo: string;
    ad: string;
    soyAd: string;
    Gun?: number;
    izinliGun?: number;
    Aciklama?: string
    baslangicTarihi?: string;
}

export interface MuhtasarTableData {
    tcKimlikNo: string;
    ad: string;
    soyAd: string;
    baslangicTarihi?: string;
}

export interface MuhtasarBeyannameMeta {
    vergiKesintiTutari: string;
    terkinTutari: string;
    projeKodu: string;
}

export interface PersonelBilgi {
    tcKimlikNo: string;
    ad: string;
    soyAd: string;
}

export interface FaaliyetBilgisi {
    matrah: string;
    hesaplananVergiPrim: string;
    muafiyetTutari: string;
    hata?:string
}

export interface FirmaDonemsalFaaliyetBilgileri {
    argePersonelGelirVergisiIstisnaTutari: FaaliyetBilgisi;
    kdvIstisnaTutari: FaaliyetBilgisi;
    sgkPrimiIsverenHissesiDestegi: FaaliyetBilgisi;
}


export interface PersonellerType {
  PersonelID: number;
  AdSoyad: string;
  TCNo: string;
  FirmaID?: number;
  IseGirisTarihi: string;
  IstenCikisTarihi?: string;
  IzinliGunSayisi: number;
  SirketOrtagi: boolean
}

export interface SurecAdimBaglantilariData {
  ID:number;
  SurecID:number;
  KaynakAdimID:number;
  HedefAdimID:number;
  BaglantiTuru:string;
  SiraNo:number | null;
}

export interface SurecAdimlariData {
  ID:number;
  SurecID:number;
  AdimAdi:string;
  SiraNo:number;
  KaynakAdimBaglantilari?:SurecAdimBaglantilariData[];
  HedefAdimBaglantilari?:SurecAdimBaglantilariData[];
  Surec?:SureclerData;
}

export interface SureclerData {
  ID:number;
  SurecAdi:string;
  Anahtar:string;
  Adimlar?:SurecAdimlariData[];
  IsDeleted?:boolean
}

export interface SurecKayitlariType {
  ID: number;
  SurecID: number;
  AdimID: number;
  KullaniciID: number;
  ItemID: number;
  Durum: string;
  Aciklama: string;
  BaslamaZamani: string;
  BitirmeZamani?: string;
  Kullanici:KullaniciType;
  Adim:SurecAdimlariData
}


export interface ProjeRaporuType {
  ID: number;
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
  OnayliMuhtasarVePrim?:string;
  SGKTahakkuk?: string;
  Durum: string;
  OlusturmaTarihi: string;
  SonDuzenlenmeTarihi?: string;
  Onaylimi?:boolean;
  Tamamlananlar?:string;
  Hatalar?:string;
}


export interface handleSubmitPropsType {
stepId: number, 
file?: File, 
belgeAdi?: string,
checkedList?:any,
adim?: string | null,
}
