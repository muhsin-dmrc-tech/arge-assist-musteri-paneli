

interface UserDataType {
  id: number;
  AdSoyad: string | null;
  KullaniciTipi: number;
  Email: string;
  Telefon: string | null;
  Sifre: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  isVerified: boolean;
  verifiedAt: Date | null;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  role: string;
}

const DeviceData: UserDataType[] = [];


export { DeviceData, type UserDataType };
