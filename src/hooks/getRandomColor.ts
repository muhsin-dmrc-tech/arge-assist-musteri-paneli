const colors = ['primary', 'success', 'warning', 'danger', 'info'];
const getRandomColor = (ilkHarf: string) => {
    // Türkçe alfabedeki harfler
    const alfabe = 'abcçdefgğhıijklmnoöprsştuüvyz'.split('');

    // Harfin alfabedeki index'ini bul
    const index = alfabe.indexOf(ilkHarf.toLowerCase());
    // Eğer harf alfabede varsa
    if (index !== -1) {
      // colors dizisinin uzunluğuna göre mod alarak döngüsel olarak renk seç
      return colors[index % colors.length];
    }

    // Harf alfabede yoksa varsayılan olarak ilk rengi döndür
    return colors[0];
  };

  export default getRandomColor