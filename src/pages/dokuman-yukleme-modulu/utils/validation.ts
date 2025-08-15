import { ProjeRaporuType } from "../types";


// Validation sonuç tipi
interface ValidationResult {
  isValid: boolean;
  error: string;
}


interface ValidationPayload {
  itemValue: {
    DonemID: number;
  };
  projeRaporu: ProjeRaporuType
}

// Step validasyon fonksiyonları
const step1 = (payload: ValidationPayload): ValidationResult => {
  const { itemValue, projeRaporu } = payload;
  if (!itemValue.DonemID || itemValue.DonemID < 1) {
    return { isValid: false, error: 'Lütfen bir dönem seçimi yapın' };
  }
  if (!projeRaporu || !projeRaporu.SGKHizmet || !projeRaporu.MuhtasarVePrim) {
    return { isValid: false, error: 'Devam edebilmeniz için geçerli belgeleri yüklemeniz gerekmektedir.' };
  }
  return { isValid: true, error: '' };
};

const step2 = (payload: ValidationPayload): ValidationResult => {
  const { projeRaporu } = payload;

  if (!projeRaporu || !projeRaporu.OnayliSGKHizmet || !projeRaporu.OnayliMuhtasarVePrim || !projeRaporu.SGKTahakkuk) {
    return { isValid: false, error: 'Devam edebilmeniz için geçerli belgeleri yüklemeniz gerekmektedir.' };
  }
  return { isValid: true, error: '' };
};

const step3 = (payload: ValidationPayload): ValidationResult => {
  const { projeRaporu } = payload;

  if (!projeRaporu || (projeRaporu.Durum).toLocaleUpperCase('tr-TR') === ('Onay Sürecinde').toLocaleUpperCase('tr-TR')) {
    return { isValid: false, error: 'Raporunuz onay sürecinde incelenmektedir. Değerlendirme tamamlandığında tarafınıza bilgi verilecek ve işlemlere devam edebileceksiniz.' };
  }
  if (!projeRaporu || !projeRaporu.Onaylimi) {
    return { isValid: false, error: 'Raporunuz henüz onay sürecini tamamlamamış.' };
  }
  return { isValid: true, error: '' };
};


export const stepValidations = {
  step1,
  step2,
  step3
} as const;

// Tip güvenliği için ValidationResult tipini de export et
export type { ValidationResult };
