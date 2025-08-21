interface FirmaType {
  FirmaAdi: string;
  FirmaID: number
}

interface KullaniciType {
  AdSoyad: string;
  id: number;
  FirmaAdi: string;
}
interface FaturaBilgiType {
  FaturaBilgiID: number;
  FirmaID: number;
  FirmaAdi: string;
  VergiNo: string;
  VergiDairesi: string;
  Adres: string;
  Sehir: string;
  Ilce: string;
  Telefon: string;
  Eposta: string;
}

interface AbonelikPlanType {
  AbonelikPlanID: number;
  PlanAdi: string;
  Aciklama: string;
  Fiyat: number;
}

interface IITemsTypesData {
  SiparisID: number;
  FaturaID: number;
  AbonelikPlanID: number;
  AbonelikPlan: AbonelikPlanType;
  KullaniciID: number;
  Kullanici: KullaniciType;
  FaturaBilgiID: number;
  FaturaBilgi: FaturaBilgiType;
  OlusturmaTarihi: string;
  OdemeTarihi: string;
  OdemeVadesi: string;
  Tutar: number;
  Durum: string;
  DeletedAt?: string;
  IsDeleted?: boolean;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
