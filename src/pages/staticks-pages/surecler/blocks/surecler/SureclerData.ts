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

