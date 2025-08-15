interface IITemsTypesData {
  SozlesmeID:number;
  Aciklama:string;
  Baslik:string;
  Anahtar:string;
  IsDeleted?:boolean;
  DeletedAt?:boolean;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
