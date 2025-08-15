interface User {
  id: number;
  AdSoyad: string;
  Email: string;
}


interface ITemplateData {
  BildirimID:number;
  KullaniciID:number;
  KullaniciBildirimID:number;
  Baslik:string;
  Icerik: string;
  Link: string;
  OkunduMu: boolean;
  Durum: string;
  OkunmaTarihi: string;
  PlanlananTarih?: string;
  EpostaGonderildiMi: boolean;
  EpostaGonderimTarihi: string;
}

const TemplateData: ITemplateData[] = [];


export { TemplateData, type ITemplateData };
