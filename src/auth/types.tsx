
import { Dispatch, SetStateAction } from "react";

export interface IDropdownChatProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  localPropsUserId?: number | null;
}

export interface IDropdownSohbetProps {
  menuTtemRef?: any;
  itemChatRef?: any;
}

export type DropdownChatMessageType = 'in' | 'out';

export interface IDropdownMessage {
  avatar: string;
  time: string;
  text: string;
  read?: boolean;
  in?: boolean;
  out?: boolean;
}

export interface KullaniciType {
  id: number;
  ProfilResmi?: string;
  AdSoyad: string;
  Email: string;
  Telefon?: string;
  KullaniciTipi?: number;
  isActive?: boolean;
  Cihazlar?:{
    Token:string;
    Platform:string;
    SonGuncellemeTarihi:string;
    isActive:boolean
  }[]
}

export interface FirmaType {
  FirmaID: number;
  FirmaAdi: string;
  FirmaBilgisi?:{
    Logo?:string
  }
}

export interface TeknokentType {
  TeknokentID: number;
  TeknokentAdi: string;
}



export interface SohbetData {
  SohbetID: number;
  OlusturanKullaniciID: number;
  GrupAdi?: string;
  SohbetTipi: string;
  SohbetFirmalar?: {
    Firma: FirmaType;
  }[];
  SohbetTeknokentler?: {
    Teknokent: TeknokentType;
  }[];
  OlusturmaTarihi: string;
  SonDuzenlenmeTarihi?: string;
  Mesajlar?: SohbetMessage[];
  Kullanicilar: { KullaniciID: number; AyrildiMi?: boolean; AyrilmaTarihi?: string;KatilmaTarihi?:string; Kullanici: KullaniciType; }[];
  SonMesaj: SohbetMessage;
  OkunmayanMesajSayisi: number;
  pageSohbet?: number;
  totalPageSohbet?: number;
  YazıyorData?: { userId: number, SohbetID: number, KullaniciAdi: string, Durum: boolean }
}

export interface SohbetMessage {
  MesajID: number;
  tempId?: number;
  SohbetID: number;
  UstMesajID?: number;
  MesajIcerigi?: string | null;
  Dosyalar?: {
    DosyaID: number;
    DosyaTipi: string;
    DosyaURL: string;
    YuklenmeTarihi: string;
  }[];
  GonderenKullaniciID: number;
  GonderenKullanici: KullaniciType;
  GonderimTarihi: string;
  DuzenlenmeTarihi?: string;
  OkunmaBilgileri: {
    MesajID: number;
    KullaniciID: number;
    OkunmaTarihi: string;
    Kullanici: KullaniciType;
  }[];
  SilindiMi?: boolean;
  AltMesajlar?: SohbetMessage[];
  hata?: boolean;
  Gonderiliyor?: boolean;
}

export interface IBildirimData {
  KullaniciBildirimID: number;
  BildirimID: number;
  KullaniciID: number;
  Baslik: string;
  Link: string;
  Icerik: string;
  Durum: string;
  OkunduMu: boolean;
}

export interface GrupData {
  grupAdi: string;
  grupID: number;
  grupTipi: 'firma' | 'teknokent';
  logo?: string | null;
  kullanicilar: Array<{
    id: number;
    adSoyad: string;
    email: string;
    telefon: string;
    profilResmi: string | null;
  }>;
}
