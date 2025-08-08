export const handleParaMaskeChange = (value: any): string => {
    // Gelen değer string değilse string'e çevir
    const strValue = String(value || '');
    
    if(strValue.length < 2){
        return strValue;
    }
    
    // Sayı ve virgül dışındaki karakterleri temizle
    let cleanValue = strValue.replace(/[^0-9,]/g, '');
    
    let parts = cleanValue.split(',');
    if (parts.length > 2) {
        cleanValue = parts[0] + ',' + parts[1];
    }
    
    let [integerPart, decimalPart] = parts;
    
    // Tam sayı kısmını maksimum 14 karakterle sınırla
    if (integerPart?.length > 14) {
        integerPart = integerPart.slice(0, 14);
    }
    
    // Ondalık kısmı maksimum 2 karakterle sınırla
    if (decimalPart?.length > 2) {
        decimalPart = decimalPart.slice(0, 2);
    }
    
    // Binlik ayracı ekle
    integerPart = (integerPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Son formatı oluştur
    return decimalPart !== undefined ? `${integerPart},${decimalPart}` : integerPart;
};

export const formatToDecimal = (tlValue: string): string => {
    if (!tlValue) return "0";
    let cleanedValue = tlValue.replace(/\./g, '');
    cleanedValue = cleanedValue.replace(',', '.');
    return cleanedValue;
};