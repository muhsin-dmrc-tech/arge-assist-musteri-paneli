const yetkiKontrolu = (seciliLiski:any, currentUser: any,gerekliIzinler:string[],OneOwner?:string | null) => {
   if (seciliLiski && seciliLiski.Rol) {
    if (seciliLiski?.Rol === 'owner') return true;
    //sadece owner yetkisi olanlar girebilir
    if (OneOwner === 'owner') {
      if (seciliLiski?.Rol !== 'owner') return false;
    }
    if (seciliLiski && seciliLiski?.Grup && seciliLiski?.Grup.Yetkiler?.length > 0) {
      const yetkilimi = gerekliIzinler.every(izin => seciliLiski?.Grup?.Yetkiler?.includes(izin));
      return yetkilimi;
    } else {
      return false
    }
  } else if (currentUser?.KullaniciTipi === 2 && currentUser.role === 'admin') {
    return true
  }
  return false;
  };

  export default yetkiKontrolu;