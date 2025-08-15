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
  FirmaAdi:string;
}
export interface IITemsTypesData {
  BasvuruID:number;
  TeknokentID: number;
  //Teknokent:TeknokentType;
  KullaniciID: number;
  Kullanici:KullaniciType;
  OnerilenProjeIsmi:string;
  ProjeKonusuVeAmaci:string;
  DegerlendirmedeMi?:boolean;
  ProjeyiOrtayaCikaranProblem:string;
  ProjeKapsamindakiCozum:string;
  ProjeninIcerdigiYenilikler:string;
  TicariBasariPotansiyeli:string;
  DosyaEki?:string;
  RakipAnalizi?:string;
  Durum?:string;
}


