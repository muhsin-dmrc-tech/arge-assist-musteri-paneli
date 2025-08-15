export const handleParaMaskeChange = (value: any): string => {
    // Gelen değer string değilse string'e çevir
    let strValue = String(value || '');

    // Sadece rakam ve virgül kalsın, ilk virgül ondalık ayırıcı olarak alınacak
    strValue = strValue.replace(/[^0-9,]/g, '');

    // Birden fazla virgül varsa, sadece ilkini ondalık ayırıcı olarak kabul et
    const firstCommaIndex = strValue.indexOf(',');
    let integerPart = '';
    let decimalPart = '';
    let endsWithComma = false;
    if (firstCommaIndex !== -1) {
        integerPart = strValue.slice(0, firstCommaIndex);
        decimalPart = strValue.slice(firstCommaIndex + 1, firstCommaIndex + 3); // En fazla 2 hane
        // Eğer input virgül ile bitiyorsa (örn. 26.005,) bunu yakala
        if (strValue.endsWith(',')) {
            endsWithComma = true;
        }
    } else {
        integerPart = strValue;
    }

    // Başta gereksiz sıfırları kaldır (örn. 000123 -> 123)
    integerPart = integerPart.replace(/^0+(?!$)/, '');

    // Tam sayı kısmını maksimum 14 karakterle sınırla
    if (integerPart.length > 14) {
        integerPart = integerPart.slice(0, 14);
    }

    // Binlik ayracı ekle
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Son formatı oluştur
    if (decimalPart) {
        return `${integerPart},${decimalPart}`;
    } else if (endsWithComma) {
        return `${integerPart},`;
    } else {
        return integerPart;
    }
};

export const formatToDecimal = (tlValue: string): string => {
    if (!tlValue) return "0";
    let cleanedValue = tlValue.replace(/\./g, '');
    cleanedValue = cleanedValue.replace(',', '.');
    return cleanedValue;
};