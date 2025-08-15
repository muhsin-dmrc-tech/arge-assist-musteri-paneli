interface IITemsTypesData {
  AbonelikPlanID:number;
  PlanAdi:string;
  Aciklama:string;
  DeletedAt?:string;
  Fiyat:number;
  IsDeleted?:boolean;
  Aktifmi?:boolean;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
