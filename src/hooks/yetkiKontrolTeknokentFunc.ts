const yetkiKontroluTeknokent = (seciliTeknokent: any, currentUser: any, gerekliIzinler: string[], OneOwner?: string | null) => {
  if (seciliTeknokent && seciliTeknokent.Rol) {
    if (seciliTeknokent?.Rol === 'owner') return true;
    //sadece owner yetkisi olanlar girebilir
    if (OneOwner === 'owner') {
      if (seciliTeknokent?.Rol !== 'owner') return false;
    }


    if (seciliTeknokent && seciliTeknokent?.Gurup) {
      const yetkilimi = gerekliIzinler.every(izin => seciliTeknokent?.Gurup?.Yetkiler.split(',').includes(izin));
      return yetkilimi;
    } else {
      return false
    }
  } else if (currentUser?.KullaniciTipi === 2 && currentUser.role === 'admin') {
    return true
  }
  return false;
};

export default yetkiKontroluTeknokent;