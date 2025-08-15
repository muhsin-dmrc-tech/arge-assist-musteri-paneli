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
}

export interface FarklılarListesiData {
    tcKimlikNo: string;
    ad: string;
    soyAd: string;
    Gun?: number;
    izinliGun?: number;
    Aciklama?: string
    baslangicTarihi?: string;
    gelirVergiIstisnasi?:string;
    sigortaPrimiIsverenHissesi?:string;
}









export interface IITemsTypesData {
}


