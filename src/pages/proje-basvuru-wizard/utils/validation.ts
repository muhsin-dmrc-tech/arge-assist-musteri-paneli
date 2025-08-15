interface ValidationResult {
  isValid: boolean;
  error: string;
}

interface ItemValue {
  TeknokentID: number;
  OnerilenProjeIsmi: string;
  ProjeKonusuVeAmaci: string;
  ProjeyiOrtayaCikaranProblem: string;
  ProjeKapsamindakiCozum: string;
  ProjeninIcerdigiYenilikler: string;
  RakipAnalizi: string;
  TicariBasariPotansiyeli: string;
}

type ValidationFunction = (itemValue: ItemValue) => ValidationResult;

interface StepValidations {
  [key: `step${number}`]: ValidationFunction;
}
const FORBIDDEN_WORDS = new Set([
  'siktir', 'amk','am', 'aq', 'oç', 'piç', 'göt', 'yarak', 'sik',
  'gerizekalı', 'salak', 'aptal', 'dangalak', 'mal',
  'ibne', 'penis', 'vajina', 'yarrak', 'amcık',
  'züppe', 'yobaz', 'gerici', 'pkk', 'terörist',
  'zenci', 'arap', 'kürt', 'ermeni', 'yahudi',
  'hain', 'vatan haini', 'şerefsiz'
]);
// Kelime kontrolü için yardımcı fonksiyon
const checkInappropriateContent = (text: string): ValidationResult => {
  if (!text) return { isValid: true, error: '' };

  const words = text.toLowerCase().split(/\s+/);
  const foundBadWord = words.find(word => FORBIDDEN_WORDS.has(word));

  return {
    isValid: !foundBadWord,
    error: foundBadWord ? 'Metinde uygunsuz ifadeler kullanılamaz.' : ''
  };
};

export const stepValidations: StepValidations = {
  step1: (itemValue): ValidationResult => {
    if (!itemValue.OnerilenProjeIsmi) {
      return { isValid: false, error: 'Lütfen önerilen proje ismini giriniz' };
    }
    /* if (!itemValue.TeknokentID || itemValue.TeknokentID < 1) {
      return { isValid: false, error: 'Lütfen Teknokent seçiniz' };
    } */
    const projectNameCheck = checkInappropriateContent(itemValue.OnerilenProjeIsmi);
    if (!projectNameCheck.isValid) {
      return { isValid: false, error: 'Lütfen hakaret, aşağılama ve küfür içeren kelimeleri kullanmayanız.' };
    }
    return { isValid: true, error: '' };
  },
  step2: (itemValue): ValidationResult => {
    if (!itemValue.ProjeKonusuVeAmaci) {
      return { isValid: false, error: 'Lütfen proje konusu ve amacını açıklayınız' };
    }
    const projectNameCheck = checkInappropriateContent(itemValue.ProjeKonusuVeAmaci);
    if (!projectNameCheck.isValid) {
      return { isValid: false, error: 'Lütfen hakaret, aşağılama ve küfür içeren kelimeleri kullanmayanız.' };
    }
    return { isValid: true, error: '' };
  },
  step3: (itemValue): ValidationResult => {
    if (!itemValue.ProjeyiOrtayaCikaranProblem || !itemValue.ProjeKapsamindakiCozum) {
      return { isValid: false, error: 'Lütfen problem ve çözüm bilgilerini eksiksiz giriniz' };
    }
    const projectNameCheck = checkInappropriateContent(itemValue.ProjeyiOrtayaCikaranProblem);
    if (!projectNameCheck.isValid) {
      return { isValid: false, error: 'Lütfen hakaret, aşağılama ve küfür içeren kelimeleri kullanmayanız.' };
    }
    const projectNameCheck1 = checkInappropriateContent(itemValue.ProjeKapsamindakiCozum);
    if (!projectNameCheck1.isValid) {
      return { isValid: false, error: 'Lütfen hakaret, aşağılama ve küfür içeren kelimeleri kullanmayanız.' };
    }
    return { isValid: true, error: '' };
  },
  step4: (itemValue): ValidationResult => {
    if (!itemValue.ProjeninIcerdigiYenilikler) {
      return { isValid: false, error: 'Lütfen projenin içerdiği yenilikleri açıklayınız' };
    }
    const projectNameCheck = checkInappropriateContent(itemValue.ProjeninIcerdigiYenilikler);
    if (!projectNameCheck.isValid) {
      return { isValid: false, error: 'Lütfen hakaret, aşağılama ve küfür içeren kelimeleri kullanmayanız.' };
    }
    return { isValid: true, error: '' };
  },
  step5: (itemValue): ValidationResult => {
    if (itemValue.RakipAnalizi.length > 4000) {
      return { isValid: false, error: 'Rakip analizini en fazla 4000 karakter girebilirsiniz.' };
    }
    const projectNameCheck = checkInappropriateContent(itemValue.RakipAnalizi);
    if (!projectNameCheck.isValid) {
      return { isValid: false, error: 'Lütfen hakaret, aşağılama ve küfür içeren kelimeleri kullanmayanız.' };
    }
    return { isValid: true, error: '' };
  },
  step6: (itemValue): ValidationResult => {
    if (!itemValue.TicariBasariPotansiyeli) {
      return { isValid: false, error: 'Lütfen ticari başarı ve satış stratejilerini giriniz' };
    }
    const projectNameCheck = checkInappropriateContent(itemValue.TicariBasariPotansiyeli);
    if (!projectNameCheck.isValid) {
      return { isValid: false, error: 'Lütfen hakaret, aşağılama ve küfür içeren kelimeleri kullanmayanız.' };
    }
    return { isValid: true, error: '' };
  }
};
