export const WIZARD_STEPS = [
    {
    id: 1,
    title: 'SGK Çalışma Süresi Raporu Yükleme',
    description: 'PDF formatında dönem bazlı çalışma süresi raporunu yükleyin',
    state: 'current' // current, pending, completed
  },
  {
    id: 2,
    title: 'Onaysız Dökümanlar Yükleme',
    description: 'Onaysız dökümanları PDF formatında yükleyin',
    state: 'current' // current, pending, completed
  },
  {
    id: 3,
    title: 'Onaylı Dökümanlar Yükleme',
    description: 'PDF formatında dönem bazlı onaylı dökümanları yükleyin',
    state: 'pending'
  },
  {
    id: 4,
    title: 'Onay İşlemi',
    description: 'Tüm belgeleri kontrol edip onay için gönderin',
    state: 'pending'
  },

];
