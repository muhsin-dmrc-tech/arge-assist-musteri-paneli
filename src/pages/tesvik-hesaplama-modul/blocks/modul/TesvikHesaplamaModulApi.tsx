/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { DefaultTooltip, KeenIcon } from '@/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AlertDialog from '@/components/alert-modal/AlertDialog';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';
import { handleParaMaskeChange } from '@/components/helpers/numberFormatFunctions';
import axios from 'axios';
import { toast } from 'react-toastify';
import BordroItem from './BordroItem';
import { handlePdfDownload } from './pdfDownload';
import { Button } from '@mui/material';

interface ButtonProps {
  text: string;
  onClick: () => void;
}

interface AlertDialogProps {
  title: string;
  text?: string;
  closeButton: ButtonProps;
  actionButton: ButtonProps;
}



export interface TeknoKentHesaplama {
  Ay: string;
  BordroGunSayisi: number,
  TeknoGunSayisi: number,
  ArgeGunSayisi: number,
  KanunNo: string,
  BESOrani: number,
  BESKEsintisi: number,
  AylikBrutUcret: number,
  BrutUcret: number,
  SGKMatrahi: number,
  SGKIsciPayi: number,
  SGKIsverenPayi: number,
  SGK5510Tesvigi: number,
  SGK4691Tesvigi: number,
  SGKTesvigi: number,
  KalanSGKIsverenPrimi: number,
  IssizlikIsciPrimi: number,
  IssizlikIsverenPrimi: number,
  OdenecekSGKPrimi: number,
  GelirVergisiMatrahi: number,
  KumGelirVergisiMatrahi: number,
  GelirVergisi: number,
  AsgUcretIstisnaMatrahi: number,
  AsgUcretKumuleIstisnaMatrahi: number,
  AsgUcretVergiIstisnasi: number,
  GelirVergisiTesvigi: number,
  KalanGelirVergisi: number,
  AsgUcretDamgaVergiIstisnasi: number,
  DamgaVergisiTesvigi: number,
  OdenecekDamgaVergisi: number,
  NetTesviksizMaas: number,
  NetOdenen: number,
  ToplamMaliyet: number,
  ToplamTesvik: number
}
interface IITemsTypesData {
  PersonelAdi: string;
  KanunSecimi: 'standart' | '4691' | '5746',
  UcretTuru: 'aylik' | 'gunluk',
  HesaplamaSekli: 'netten-brute' | 'brutten-nete',
  KumGelirVergiMatrahi: string,
  AsgUcretKumIstisnaMatrahi: string,
  GirilenDeger: string,
  Yil: number,
  BaslangicAyi: string,
  KacAylikBordro: number,
  BordroGunSayisi: number,
  SirketOrtagi: boolean,
  TeknoparkGunSayisi: number,
  ArgeGunSayisi: number,
  EgitimDurumu: string,
  BesPuanlikIndirimUygula: boolean,
  DortPuanlikIndirimUygula: boolean,
  BESKesintisiUygula: boolean,
  BesYuzdesi: number,
  EngelliIndirimi: string,
  SSKGrup: 'tum-sigorta-kollarina-tabi' | 's-g-destek-primine-tabi' | 's-g-destek-primine-tabi-eytli',
  SSKTesvigiUygula: boolean,
  AsgUcretIstisnaUygula: boolean
}

const initialValue: IITemsTypesData = {
  PersonelAdi: '',
  KanunSecimi: '4691',
  UcretTuru: 'aylik',
  HesaplamaSekli: 'netten-brute',
  KumGelirVergiMatrahi: '',
  AsgUcretKumIstisnaMatrahi: '',
  GirilenDeger: '',
  Yil: 2025,
  BaslangicAyi: 'Ocak',
  KacAylikBordro: 12,
  BordroGunSayisi: 30,
  SirketOrtagi: false,
  TeknoparkGunSayisi: 30,
  ArgeGunSayisi: 30,
  EgitimDurumu: 'diger',
  BesPuanlikIndirimUygula: true,
  DortPuanlikIndirimUygula: false,
  BESKesintisiUygula: false,
  BesYuzdesi: 3,
  EngelliIndirimi: 'yok',
  SSKGrup: 'tum-sigorta-kollarina-tabi',
  SSKTesvigiUygula: true,
  AsgUcretIstisnaUygula: true
}

const TesvikHesaplamaModul = () => {
  const [pageError, setPageError] = useState<string | null>(null);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);
  const [itemValue, setItemValue] = useState<IITemsTypesData>(initialValue);
  const [nextId, setNextId] = useState(1);
  const [openItem, setOpenItem] = useState(1);
  const API_URL = import.meta.env.VITE_APP_API_URL;
  // Her personel için 12 aylık veri tutan yapı
  const [personelAylikListesi, setPersonelAylikListesi] = useState<{ id: number; PersonelAdi: string; ayliklar: TeknoKentHesaplama[]; }[]>([]);
  const [yilToplamTesvik, setYilToplamTesvik] = useState(0);
  const [yilToplamMaliyet, setYilToplamMaliyet] = useState(0);



  const temizleFunc = () => {
    setPageError(null)
    setPersonelAylikListesi([]);
    setItemValue(initialValue)
  };


  const hesaplaVeEkle = async () => {
    if (submitVisible) return;
    if (!itemValue.PersonelAdi) {
      toast.error('Personel adı gereklidir')
      return
    }
    if (!itemValue.GirilenDeger) {
      toast.error("Hesaplanacak tutar gereklidir");
      return
    }
    setSubmitVisible(true)
    try {
      const response = await axios.post(`${API_URL}/bordro-hesaplama/hesapla-api`, { id: nextId, ...itemValue });
      if (response.status === 201) {
        setNextId(prev => prev + 1)
        if (response.data && response.data.id) {
          setPersonelAylikListesi(prev => [response.data, ...prev])
          setOpenItem(1)
        }
      } else {
        toast.error("İşlem yapılırken hata oluştu Bordro hesaplama");
      }
    } catch (error) {
      console.error(error);
      toast.error("İşlem yapılırken hata oluştu Bordro hesaplama");
    } finally {
      setSubmitVisible(false)
    }
  }


  const personelSil = (id: number) => {
    setPersonelAylikListesi(prev => prev.filter(item => item.id !== id));
    toast.success('Personel listeden silindi.');
  };




  // Excel export: her personel ve aylıklar için BordroItem'daki gibi detaylı veri
  const handleExcelDownload = () => {
    if (personelAylikListesi.length < 1) return;

    let excelRows: any[] = [];
    let genelToplamTesvik = 0;
    let genelToplamMaliyet = 0;
    let toplamPersonel = personelAylikListesi.length;

    personelAylikListesi.forEach((personel) => {
      // 1. Satır: Personel Adı ve Çalışma Türü aynı satırda
      const calismaTuru = personel.ayliklar && personel.ayliklar[0] ? (
        personel.ayliklar[0]?.KanunNo === '4691' ? '(4691) Teknokent Projeleri İçin Çalışan' :
          personel.ayliklar[0]?.KanunNo === '5746' ? '(5746) Tubitak projeleri, Arge ve Tasarım Merkezleri İçin Çalışan' :
            'Standart Çalışan') : 'Hesaplama Yapılamadı';

      excelRows.push({
        'Ay': 'Personel Adı:',
        'Aylık Brüt Ücret': personel.PersonelAdi,
        'Gün Sayısı': 'Çalışma Türü:',
        'Sgk Matrahı': calismaTuru,
      });

      // 2. Satır: Boş satır (ayırıcı)
      excelRows.push({});

      // 3. Satır: Tablo başlıkları - A sütunundan başlayacak
      excelRows.push({
        'Ay': 'Ay',
        'Aylık Brüt Ücret': 'Aylık Brüt Ücret',
        'Gün Sayısı': 'Gün Sayısı',
        'Sgk Matrahı': 'Sgk Matrahı',
        'BES Oranı': 'BES Oranı',
        'BES Kesintisi': 'BES Kesintisi',
        'Sgk İşçi Primi': 'Sgk İşçi Primi',
        'Sgk İşveren Primi': 'Sgk İşveren Primi',
        'Sgk 5510/15510 Teşviği': 'Sgk 5510/15510 Teşviği',
        'Sgk 5746-4691 Teşviği': 'Sgk 5746-4691 Teşviği',
        'Sgk Teşvik Toplamı': 'Sgk Teşvik Toplamı',
        'Kalan Sgk İşveren Primi': 'Kalan Sgk İşveren Primi',
        'İşsizlik İşçi Primi': 'İşsizlik İşçi Primi',
        'İşsizlik İşveren Primi': 'İşsizlik İşveren Primi',
        'Ödenecek Sgk Primi': 'Ödenecek Sgk Primi',
        'Gelir Vergisi Matrahı': 'Gelir Vergisi Matrahı',
        'Kümülatif Gel.Ver.Matrahı': 'Kümülatif Gel.Ver.Matrahı',
        'Gelir Vergisi': 'Gelir Vergisi',
        'Asg.Ücr. İstisna Matrahı': 'Asg.Ücr. İstisna Matrahı',
        'Asg.Ücr. Kümüle İst.Matr.': 'Asg.Ücr. Kümüle İst.Matr.',
        'Asg.Ücr. Vergi İstisnası': 'Asg.Ücr. Vergi İstisnası',
        'Gelir Ver. Teşviği': 'Gelir Ver. Teşviği',
        'Kalan Gel.Ver.': 'Kalan Gel.Ver.',
        'Asg.Ücr. Dam. Ver. İstisnası': 'Asg.Ücr. Dam. Ver. İstisnası',
        'Dam. Ver. Teşviği': 'Dam. Ver. Teşviği',
        'Ödenecek Dam. Ver.': 'Ödenecek Dam. Ver.',
        'Net Maaş': 'Net Maaş',
        'Toplam Maliyet': 'Toplam Maliyet'
      });

      if (!personel.ayliklar || personel.ayliklar.length === 0) {
        excelRows.push({ 'Ay': 'Hesaplama yapılamamış' });
        // Personel arası boşluk
        excelRows.push({});
        return;
      }

      let yillikToplamTesvik = 0;
      let yillikToplamMaliyet = 0;

      // Aylıklar
      personel.ayliklar.forEach((data) => {
        excelRows.push({
          'Ay': data.Ay,
          'Aylık Brüt Ücret': data.AylikBrutUcret?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Gün Sayısı': data.BordroGunSayisi?.toString(),
          'Sgk Matrahı': data.SGKMatrahi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'BES Oranı': data.BESOrani?.toString(),
          'BES Kesintisi': data.BESKEsintisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Sgk İşçi Primi': data.SGKIsciPayi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Sgk İşveren Primi': data.SGKIsverenPayi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Sgk 5510/15510 Teşviği': data.SGK5510Tesvigi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Sgk 5746-4691 Teşviği': data.SGK4691Tesvigi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Sgk Teşvik Toplamı': data.SGKTesvigi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Kalan Sgk İşveren Primi': data.KalanSGKIsverenPrimi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'İşsizlik İşçi Primi': data.IssizlikIsciPrimi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'İşsizlik İşveren Primi': data.IssizlikIsverenPrimi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Ödenecek Sgk Primi': data.OdenecekSGKPrimi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Gelir Vergisi Matrahı': data.GelirVergisiMatrahi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Kümülatif Gel.Ver.Matrahı': data.KumGelirVergisiMatrahi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Gelir Vergisi': data.GelirVergisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Asg.Ücr. İstisna Matrahı': data.AsgUcretIstisnaMatrahi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Asg.Ücr. Kümüle İst.Matr.': data.AsgUcretKumuleIstisnaMatrahi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Asg.Ücr. Vergi İstisnası': data.AsgUcretVergiIstisnasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Gelir Ver. Teşviği': data.GelirVergisiTesvigi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Kalan Gel.Ver.': data.KalanGelirVergisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Asg.Ücr. Dam. Ver. İstisnası': data.AsgUcretDamgaVergiIstisnasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Dam. Ver. Teşviği': data.DamgaVergisiTesvigi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Ödenecek Dam. Ver.': data.OdenecekDamgaVergisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Net Maaş': data.NetOdenen?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
          'Toplam Maliyet': data.ToplamMaliyet?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
        });
        yillikToplamTesvik += data.ToplamTesvik || 0;
        yillikToplamMaliyet += data.ToplamMaliyet || 0;
      });

      // Yıllık toplam satırı
      excelRows.push({
        'Ay': 'Yıl Toplamı',
        'Aylık Brüt Ücret': personel.ayliklar.reduce((sum, d) => sum + (d.AylikBrutUcret || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Gün Sayısı': '',
        'Sgk Matrahı': personel.ayliklar.reduce((sum, d) => sum + (d.SGKMatrahi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'BES Oranı': '',
        'BES Kesintisi': personel.ayliklar.reduce((sum, d) => sum + (d.BESKEsintisi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Sgk İşçi Primi': personel.ayliklar.reduce((sum, d) => sum + (d.SGKIsciPayi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Sgk İşveren Primi': personel.ayliklar.reduce((sum, d) => sum + (d.SGKIsverenPayi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Sgk 5510/15510 Teşviği': personel.ayliklar.reduce((sum, d) => sum + (d.SGK5510Tesvigi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Sgk 5746-4691 Teşviği': personel.ayliklar.reduce((sum, d) => sum + (d.SGK4691Tesvigi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Sgk Teşvik Toplamı': personel.ayliklar.reduce((sum, d) => sum + (d.SGKTesvigi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Kalan Sgk İşveren Primi': personel.ayliklar.reduce((sum, d) => sum + (d.KalanSGKIsverenPrimi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'İşsizlik İşçi Primi': personel.ayliklar.reduce((sum, d) => sum + (d.IssizlikIsciPrimi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'İşsizlik İşveren Primi': personel.ayliklar.reduce((sum, d) => sum + (d.IssizlikIsverenPrimi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Ödenecek Sgk Primi': personel.ayliklar.reduce((sum, d) => sum + (d.OdenecekSGKPrimi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Gelir Vergisi Matrahı': personel.ayliklar.reduce((sum, d) => sum + (d.GelirVergisiMatrahi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Kümülatif Gel.Ver.Matrahı': '',
        'Gelir Vergisi': personel.ayliklar.reduce((sum, d) => sum + (d.GelirVergisi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Asg.Ücr. İstisna Matrahı': personel.ayliklar.reduce((sum, d) => sum + (d.AsgUcretIstisnaMatrahi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Asg.Ücr. Kümüle İst.Matr.': personel.ayliklar.reduce((sum, d) => sum + (d.AsgUcretKumuleIstisnaMatrahi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Asg.Ücr. Vergi İstisnası': personel.ayliklar.reduce((sum, d) => sum + (d.AsgUcretVergiIstisnasi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Gelir Ver. Teşviği': personel.ayliklar.reduce((sum, d) => sum + (d.GelirVergisiTesvigi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Kalan Gel.Ver.': personel.ayliklar.reduce((sum, d) => sum + (d.KalanGelirVergisi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Asg.Ücr. Dam. Ver. İstisnası': personel.ayliklar.reduce((sum, d) => sum + (d.AsgUcretDamgaVergiIstisnasi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Dam. Ver. Teşviği': personel.ayliklar.reduce((sum, d) => sum + (d.DamgaVergisiTesvigi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Ödenecek Dam. Ver.': personel.ayliklar.reduce((sum, d) => sum + (d.OdenecekDamgaVergisi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Net Maaş': personel.ayliklar.reduce((sum, d) => sum + (d.NetOdenen || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
        'Toplam Maliyet': personel.ayliklar.reduce((sum, d) => sum + (d.ToplamMaliyet || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })
      });

      // Personeller arası boşluk
      excelRows.push({});

      genelToplamTesvik += yillikToplamTesvik;
      genelToplamMaliyet += yillikToplamMaliyet;
    });

    // Genel toplam satırı
    excelRows.push({
      'Ay': 'Toplam Personel: ' + toplamPersonel,
      'Aylık Brüt Ücret': 'Toplam Teşvik: ' + genelToplamTesvik.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Gün Sayısı': 'Toplam Maliyet: ' + genelToplamMaliyet.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
    });

    // Excel'e aktar
    const ws = XLSX.utils.json_to_sheet(excelRows, { skipHeader: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teknokent_Tesvik_Hesaplama");

    // Kolon genişlikleri
    ws['!cols'] = Array(30).fill({ wch: 22 });

    XLSX.writeFile(wb, `Teknokent_Tesvik_Hesaplama_${new Date().toLocaleDateString('tr-TR')}.xlsx`);
  };

  const tumAylar = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Toplamları hesapla
  const yillikToplamTesvik = personelAylikListesi.reduce(
    (acc, personel) => acc + personel.ayliklar.reduce((sum, item) => sum + item.ToplamTesvik, 0),
    0
  );

  const yillikToplamMaliyet = personelAylikListesi.reduce(
    (acc, personel) => acc + personel.ayliklar.reduce((sum, item) => sum + item.ToplamMaliyet, 0),
    0
  );

  // State’e set et (liste değişince hesaplanır)
  useEffect(() => {
    setYilToplamTesvik(yillikToplamTesvik);
    setYilToplamMaliyet(yillikToplamMaliyet);
  }, [personelAylikListesi]);



  return (
    <>
      {alertModalData.actionButton && <AlertDialog
        open={openAlertModal}
        setOpen={setOpenAlertModal}
        title={alertModalData.title}
        text={alertModalData.text}
        actionButton={alertModalData.actionButton}
        closeButton={alertModalData.closeButton}
      />}
      {pageError ?
        <div className="text-red-700 w-full bg-red-100 p-1 rounded-lg flex items-center">
          <KeenIcon icon={'information-2'} />
          <span>{typeof pageError === 'string' ? pageError : JSON.stringify(pageError)}</span></div>
        :
        <div className='max-w-[100%]'>
          <div className="card bg-gray-50 relative">
            {submitVisible && (
              <div className="absolute inset-0 bg-black/50 z-50 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                <span className="text-white text-lg font-medium">Hesaplanıyor...</span>
              </div>
            )}
            {/*  <div className="card-header">
              {error && <div className="text-red-700 flex items-center gap-2 mb-2">
                <KeenIcon icon={'information-2'} />
                <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span></div>}
              {successMessage && <div className="text-lime-600 flex items-center gap-2 mb-2">
                <KeenIcon icon={'information-1'} style="solid" className="text-lg" />
                <span>{successMessage}</span></div>}
            </div> */}

            <div className="card-body flex flex-col gap-4">

              <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-3">
                  <div className="">Çalışma Türü</div>
                  <Select value={itemValue.KanunSecimi} onValueChange={(value: 'standart' | '4691' | '5746') => setItemValue({ ...itemValue, KanunSecimi: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Çalışma Türü Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='standart'>Standart Çalışan</SelectItem>
                      <SelectItem value='4691'>(4691) Teknokent Projeleri İçin</SelectItem>
                      <SelectItem value='5746'>(5746) Tubitak projeleri, Arge ve Tasarım Merkezleri İçin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 md:col-span-2">
                  <div className="">Ücret Türü</div>
                  <Select value={itemValue.UcretTuru} onValueChange={(value: 'aylik' | 'gunluk') => setItemValue({ ...itemValue, UcretTuru: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ücret Türü Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='aylik'>Aylık Ücret</SelectItem>
                      <SelectItem value='gunluk'>Günlük Ücret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <div className="col-span-12 md:col-span-2">
                  <div className="">Hesaplama Şekli</div>
                  <Select
                    value={itemValue.HesaplamaSekli}
                    onValueChange={(value: any) => {
                      setItemValue({
                        ...itemValue,
                        HesaplamaSekli: value
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Hesaplama Şekli Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='brutten-nete'>Brütten Nete</SelectItem>
                      <SelectItem value='netten-brute'>Netten Brüte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>




                <div className="col-span-12 md:col-span-3">
                  <div className="">Personel Adı</div>
                  <Input
                    className="w-full"
                    value={itemValue.PersonelAdi}
                    required
                    placeholder="Personel Adı"
                    onChange={(e) => setItemValue({ ...itemValue, PersonelAdi: e.target.value })}
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <div className="">
                    <span className="text-blue-600 font-semibold">
                      {
                        itemValue.HesaplamaSekli === 'brutten-nete' ? 'Brüt Ücret' :
                          itemValue.HesaplamaSekli === 'netten-brute' ? 'Net Ödenen' :
                            itemValue.HesaplamaSekli === 'netten-brute-agi-haric' ? 'Net Ücret (AGİ Hariç)' :
                              itemValue.HesaplamaSekli === 'toplam-maliyet' ? 'Toplam Maliyet (Tübitak İçin)' : ''
                      }
                    </span>
                  </div>
                  <Input
                    className="w-full border-blue-300 focus:border-blue-500"
                    value={itemValue.GirilenDeger}
                    required
                    placeholder="0,00"
                    onChange={(e) => setItemValue({ ...itemValue, GirilenDeger: handleParaMaskeChange(e.target.value) })}
                  />
                </div>

                <div className="col-span-12 md:col-span-1">
                  <div className="">Yılı</div>
                  <Select value={itemValue.Yil.toString()} onValueChange={(value) => { setItemValue({ ...itemValue, Yil: Number(value) }) }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Yılı Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='2025'>2025</SelectItem>
                      <SelectItem value='2024'>2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 md:col-span-1">
                  <div className="">Baş. Ayı</div>
                  <Select value={itemValue.BaslangicAyi} onValueChange={(value) => { setItemValue({ ...itemValue, BaslangicAyi: value }) }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Başlangıç Ayı Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        tumAylar.map(ay =>
                          <SelectItem key={ay} value={ay}>{ay}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 md:col-span-2">
                  <div className="">Kaç Aylık Bordro?</div>
                  <Select value={itemValue.KacAylikBordro.toString()} onValueChange={(value) => { setItemValue({ ...itemValue, KacAylikBordro: Number(value) }) }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Kaç Aylık Bordro?" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(ay => <SelectItem key={ay} value={ay}>{ay}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>



                <div className="col-span-12 md:col-span-2">
                  <div className="">Bordro Gün Sayısı:</div>
                  <Input
                    className="w-full"
                    value={itemValue.BordroGunSayisi}
                    required
                    placeholder="Bordro Gün Sayısı"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 30) {
                        setItemValue({ ...itemValue, BordroGunSayisi: value });
                      }
                    }}
                  />
                </div>


                <div className="col-span-12 md:col-span-2">
                  <div className="">Şirket Ortağı Mı?</div>
                  <Select value={itemValue.SirketOrtagi ? '1' : '0'} onValueChange={(value) => { setItemValue({ ...itemValue, SirketOrtagi: value === '1' ? true : false }) }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Şirket Ortağı Mı?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>Evet</SelectItem>
                      <SelectItem value='0'>Hayır</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {itemValue.KanunSecimi === '4691' ?
                  <div className="col-span-12 md:col-span-2">
                    <div className="">Teknopark Gün Sayısı:</div>
                    <Input
                      className="w-full"
                      value={itemValue.TeknoparkGunSayisi}
                      required
                      placeholder="Teknopark Gün Sayısı"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 0 && value <= 30) {
                          setItemValue({ ...itemValue, TeknoparkGunSayisi: value });
                        }
                      }}
                    />
                  </div> : itemValue.KanunSecimi === '5746' ?
                    <>
                      <div className="col-span-12 md:col-span-2">
                        <div className="">Arge Gün Sayısı:</div>
                        <Input
                          className="w-full"
                          value={itemValue.ArgeGunSayisi}
                          required
                          placeholder="Ar-Ge Gün Sayısı"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 0 && value <= 30) {
                              setItemValue({ ...itemValue, ArgeGunSayisi: value });
                            }
                          }}
                        />
                      </div>
                      <div className='col-span-12 md:col-span-2'>
                        <div className="">Eğitim Durumu</div>
                        <Select value={itemValue.EgitimDurumu ?? 'diger'} onValueChange={(value: 'doktora' | 'yuksek-lisans') => setItemValue({ ...itemValue, EgitimDurumu: value })}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Eğitim Durumu Seç" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='diger'>Diğer Ar-Ge Personeli</SelectItem>
                            <SelectItem value='doktora'>Doktoralı veya Temel Bilimlerde Yüksek Lisanslı</SelectItem>
                            <SelectItem value='yuksek-lisans'>Yüksek Lisanslı veya Temel Bilimlerde Lisanslı</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </> : <></>


                }







                <div className="col-span-12 md:col-span-2">
                  <div className="">Engelli İndirimi</div>
                  <Select value={itemValue.EngelliIndirimi} onValueChange={(value) => { setItemValue({ ...itemValue, EngelliIndirimi: value }) }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Engelli İndirimi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='yok'>Yok</SelectItem>
                      <SelectItem value='1.derece'>1. Derece Engelli</SelectItem>
                      <SelectItem value='2.derece'>2. Derece Engelli</SelectItem>
                      <SelectItem value='3.derece'>3. Derece Engelli</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <div className="">SSK Grup</div>
                  <Select value={itemValue.SSKGrup} onValueChange={(value: any) => { setItemValue({ ...itemValue, SSKGrup: value }) }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="SSK Grup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='tum-sigorta-kollarina-tabi'>01 Hizmet Akdi İle Tüm Sigorta Kollarına Tabi Çalışanlar (Yabancı Çalışanlar Dahil)</SelectItem>
                      <SelectItem value='s-g-destek-primine-tabi'>02 Sosyal Güvenlik Destek Primine Tabi Çalışanlar</SelectItem>
                      <SelectItem value='s-g-destek-primine-tabi-eytli'>02 Sosyal Güvenlik Destek Primine Tabi Çalışanlar (EYT'liler)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>





                <div className="col-span-12 md:col-span-2">
                  <label className="checkbox-group flex items-center gap-2">
                    <input
                      className="checkbox checkbox-sm"
                      type="checkbox"
                      checked={itemValue.BESKesintisiUygula}
                      onChange={(e) => setItemValue({ ...itemValue, BESKesintisiUygula: e.target.checked })}
                    />
                    <span className="text-sm">BES Kesintisi Uygula</span>
                  </label>
                  <div className="flex gap-1 items-center">
                    <div className="text-sm">BES Yüzdesi:</div>
                    %<Input
                      className=" max-w-[50px]"
                      value={itemValue.BesYuzdesi}
                      disabled={!itemValue.BESKesintisiUygula}
                      required
                      placeholder="BES Yüzdesi"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 0 && value <= 99) {
                          setItemValue({ ...itemValue, BesYuzdesi: value });
                        }
                      }}
                    />
                  </div>
                </div>



                <DefaultTooltip title="SGK işveren primi indirimleri: Sadece toplam maliyetten düşülür, net maaşı etkilemez. 5 puanlık indirim üretim/ihracat ve Ar-Ge/Teknokent için, 4 puanlık indirim diğer sektörler için uygulanır.">
                  <div className="col-span-12 md:col-span-4 flex-col gap-4">
                    <label className="checkbox-group flex items-center gap-2">
                      <input
                        className="checkbox checkbox-sm"
                        type="checkbox"
                        checked={itemValue.BesPuanlikIndirimUygula}
                        onChange={(e) => setItemValue({ ...itemValue, BesPuanlikIndirimUygula: e.target.checked, DortPuanlikIndirimUygula: false })}
                      />
                      <span className="text-sm">SGK 5 Puanlık İndirim (5510/81. madde)</span>
                    </label>
                    <label className="checkbox-group flex items-center gap-2">
                      <input
                        className="checkbox checkbox-sm"
                        type="checkbox"
                        checked={itemValue.DortPuanlikIndirimUygula}
                        onChange={(e) => setItemValue({ ...itemValue, DortPuanlikIndirimUygula: e.target.checked, BesPuanlikIndirimUygula: false })}
                      />
                      <span className="text-sm">SGK 4 Puanlık İndirim (Diğer Sektörler)</span>
                    </label>
                  </div>
                </DefaultTooltip>

                <div className="col-span-12 md:col-span-3">
                  <label className="checkbox-group flex items-center gap-2">
                    <input
                      className="checkbox checkbox-sm"
                      type="checkbox"
                      checked={itemValue.SSKTesvigiUygula}
                      onChange={(e) => setItemValue({ ...itemValue, SSKTesvigiUygula: e.target.checked })}
                    />
                    <span className="text-sm">SSK Teşviği Uygula</span>
                  </label>
                  <label className="checkbox-group flex items-center gap-2">
                    <input
                      className="checkbox checkbox-sm"
                      type="checkbox"
                      checked={itemValue.AsgUcretIstisnaUygula}
                      onChange={(e) => setItemValue({ ...itemValue, AsgUcretIstisnaUygula: e.target.checked })}
                    />
                    <span className="text-sm">Asg.Ücr.İst. Uygula</span>
                  </label>
                </div>



                {itemValue.BaslangicAyi !== 'Ocak' &&
                  <>
                    <div className="col-span-12 text-info">
                      <KeenIcon icon="information-1" style="solid" className="text-lg leading-0 me-2" />
                      <span>Personel {itemValue.BaslangicAyi} ayında işe başlamamışsa sonuçların doğru çıkması için lütfen aşağıdaki alanı {tumAylar[tumAylar.findIndex(a => a === itemValue.BaslangicAyi) - 1] ?? ''} ayı verileri ile doldurun.</span>
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <div className="">Küm.Gel.Ver. Matrahı</div>
                      <Input
                        className="w-full"
                        value={itemValue.KumGelirVergiMatrahi}
                        required
                        placeholder="Küm.Gel.Ver. Matrahı"
                        onChange={(e) => setItemValue({ ...itemValue, KumGelirVergiMatrahi: handleParaMaskeChange(e.target.value) })}
                      />
                    </div>

                  
                    <div className="col-span-12 md:col-span-2">
                      <div className="">Asg.Ücr. Küm.İst.Matr.</div>
                      <Input
                        className="w-full"
                        value={itemValue.AsgUcretKumIstisnaMatrahi}
                        required
                        placeholder="Asg.Ücr. Küm.İst.Matr."
                        onChange={(e) => setItemValue({ ...itemValue, AsgUcretKumIstisnaMatrahi: handleParaMaskeChange(e.target.value) })}
                      />
                    </div>
                  </>
                }



              </div>
            </div>
            <div className="flex flex-col gap-1 mt-2.5 p-2.5">
              <Button
                disabled={submitVisible}
                className="w-full text-white"
                variant="contained"
                onClick={hesaplaVeEkle}
              >
                Hesapla ve Listeye Ekle
              </Button>
            </div>

          </div>

          {personelAylikListesi.length > 0 && (
            <div className='flex flex-col gap-4'>
              <div className="card mt-4 max-w-[100%] scrollable-x-auto">
                <div className="card-header flex justify-between items-center">

                  <h5>Genel Toplamlar</h5>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-danger"
                      onClick={() => temizleFunc()}
                      disabled={!personelAylikListesi.length}
                    >
                      Listeyi Temizle
                    </button>
                    <button
                      className="btn btn-light"
                      onClick={handleExcelDownload}
                      disabled={!personelAylikListesi.length}
                    >
                      Excel İndir
                    </button>
                    <button
                      className="btn btn-light"
                      onClick={()=>handlePdfDownload(personelAylikListesi)}
                      disabled={!personelAylikListesi.length}
                    >
                      PDF İndir
                    </button>
                  </div>


                </div>
                <div className='grid grid-cols-12 gap-4 p-4'>
                  <div className="col-span-12 md:col-span-3">
                    <div className="text-sm text-gray-600">Personel Sayısı</div>
                    <div className="text-lg font-bold text-green-600">
                      {personelAylikListesi.length}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <div className="text-sm text-gray-600">Teknokent Teşviki</div>
                    <div className="text-lg font-bold text-green-600">
                      {yilToplamTesvik.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-3">
                    <div className="text-sm text-gray-600">Toplam Maliyet</div>
                    <div className="text-lg font-bold text-red-600">
                      {yilToplamMaliyet.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </div>
                  </div>
                </div>
              </div>
              {personelAylikListesi.map((personel, index) => (
                <div key={index}>
                  <BordroItem item={personel} personelSil={() => personelSil(personel.id)} open={openItem === index + 1} setOpen={() => setOpenItem(openItem === index + 1 ? 0 : index + 1)} />
                </div>
              )
              )}
            </div>
          )}
        </div>
      }
    </>
  )
};

export { TesvikHesaplamaModul };