interface User {
  id: number;
  AdSoyad: string;
  Email: string;
}


interface ITemplateData {
  emailTemplateId:number;
  templateName?:string;
  body?: string;
  subject?: string;
  isActive?: boolean;
  creationTime?: string;
  lastModificationTime?: string;
  deletionTime?: string;
  creatorUser?: User;
  lastModifierUser?: User;
  deleterUser?: User;
  isDeleted?:boolean;
}

const TemplateData: ITemplateData[] = [];


export { TemplateData, type ITemplateData };
