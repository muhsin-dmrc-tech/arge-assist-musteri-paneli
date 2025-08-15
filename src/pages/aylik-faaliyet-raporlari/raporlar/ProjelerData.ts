import { KullaniciType } from "@/auth/types";

interface FirmaType {
  FirmaAdi: string;
  FirmaID: number
}

interface ProjeType {
  ProjeAdi: string;
  ProjeID: number;
  ProjeUzmanKullanici?:{
    AdSoyad: string
  };
  ProjeHakemKullanici?:{
    AdSoyad: string
  };
  ProjeUzmanKullaniciID?:number;
  ProjeHakemKullaniciID?:number;
  Firma:FirmaType;
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
  TeknokentID: number;
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
