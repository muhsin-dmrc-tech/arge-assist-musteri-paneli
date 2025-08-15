interface IITemsTypesData {
  TeknokentID:number;
  TeknokentAdi?:string;
  Sehir?: string;
  Ilce?: string;
  OwnerKullanici?:{
    id:number;
    AdSoyad:string
  };
  IsDeleted?:boolean;
}

const ITemsTypesData: IITemsTypesData[] = [];


export { ITemsTypesData, type IITemsTypesData };
