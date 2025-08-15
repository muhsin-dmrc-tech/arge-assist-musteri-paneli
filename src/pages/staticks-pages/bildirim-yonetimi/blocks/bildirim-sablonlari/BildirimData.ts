interface User {
  id: number;
  AdSoyad: string;
  Email: string;
}


interface ITemplateData {
  BildirimID:number;
  Baslik:string;
  Icerik: string;
  Tur: string;
  TumKullanicilar: boolean;
  Durum: string;
  OlusturmaTarihi: string;
  PlanlananTarih?: string;
  IsDeleted: boolean;
}

const TemplateData: ITemplateData[] = [];


export { TemplateData, type ITemplateData };
