
interface User {
  id: number;
  AdSoyad: string;
  Email: string;
}

interface IDeviceData {
  logId?:number;
  userAgent?:string;
  ipAddress?: string;
  logType?: string;
  eventType?: string;
  logLevel?: string;
  message?: string;
  source?: string;
  requestUrl?: string;
  relatedEntity?: string;
  relatedEntityId?: number;
  status?: string;
  creationTime?: string;
  lastModificationTime?: string;
  deletionTime?: string;
  creatorUser?: User;
  lastModifierUser?: User;
  deleterUser?: User;
  logUser?: User;
  isDeleted?:boolean;
}

const DeviceData: IDeviceData[] = [];


export { DeviceData, type IDeviceData };
