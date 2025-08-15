
interface UserLoginsDataType {
  id: bigint;                 // BIGINT IDENTITY
  KullaniciId: number;        // INT NOT NULL
  GirisZamani: Date;         // DATETIME NOT NULL with DEFAULT GETDATE()
  IPAdresi: string;          // VARCHAR(45) NOT NULL
  CihazBilgisi: string;      // VARCHAR(255) NOT NULL
  BasariliMi: boolean;       // BIT NOT NULL with DEFAULT 0
  HataNedeni: string | null; // VARCHAR(255) NULL
  Kullanici?: {              // Foreign key reference
    id: number;
    AdSoyad: string;
    Email: string;
    // ... diğer kullanıcı bilgileri
  };
}

const DeviceData: UserLoginsDataType[] = [];

export { DeviceData, type UserLoginsDataType };
