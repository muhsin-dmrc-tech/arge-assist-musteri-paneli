export interface AuthModel {
  access_token: string;
  refreshToken?: string;
  api_token: string;
}


export interface UserModel {
  id: number;
  FirmaAdi: string;
  AdSoyad: string;
  ProfilResmi?:string;
  Sifre: string | undefined;
  Email: string;
  Telefon?: string;
  auth?: AuthModel;
  isActive?:boolean;
  KullaniciTipi?: number;
  Abonelik?:string
}
