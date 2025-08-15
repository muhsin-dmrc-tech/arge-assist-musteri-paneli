/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { DefaultTooltip, KeenIcon } from '@/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@mui/material';
import AlertDialog from '@/components/alert-modal/AlertDialog';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';
import { handleParaMaskeChange } from '@/components/helpers/numberFormatFunctions';
import clsx from 'clsx';

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

interface IITemsTypesData {
  PersonelAdi: string;
  Unvan: string;
  NetMaas: string;
  BrutMaas: string;
  AsgariUcretIstisnasiUygula: boolean;
  BesPuanlikIndirimUygula: boolean;
  DortPuanlikIndirimUygula: boolean;
  ArgeGunSayisi: number;
  CalismaGunSayisi: number;
  CalismaTuru: 'standart' | '4691' | '5746';
  Isveren: boolean;
  HesaplamaTipi: string; // 'BruttenNete' veya 'NettenBrute'
  EgitimDurumu: string;
  EngellilikDurumu: string;
}

interface TeknoKentHesaplama {
  id: number,
  PersonelAdi: string;
  CalismaTuru: 'standart' | '4691' | '5746';
  GunSayisi: number,
  ArgeGunSayisi: number,
  CalismaGunSayisi: number,
  BodroyaEsasBrut: number,
  CalisanSGKPrimi: number,
  CalisanIssizlikSigortasi: number,
  VergiDilimi: number,
  GelirVergisi: number,
  DamgaVergisi: number,
  AsgariUcretVergiIstisnasi: number,
  NetUcret: number,
  Maas: number,
  SGKPayi: number,
  IssizlikPayi: number,
  ToplamSGKIstisna: number,
  GelirVergisiIstisnasi: number,
  DamgaVergisiIstisnasi: number,
  ToplamSGKOdemesi: number,
  DamgaVergiOdemesi: number,
  GelirVergisiOdemesi: number,
  ToplamMaliyet: number,
  Isveren: boolean;
}

const initialValue: IITemsTypesData = {
  PersonelAdi: '',
  Unvan: '',
  NetMaas: '',
  BrutMaas: '',
  AsgariUcretIstisnasiUygula: true,
  BesPuanlikIndirimUygula: false,
  DortPuanlikIndirimUygula: false,
  ArgeGunSayisi: 30,
  CalismaGunSayisi: 30,
  CalismaTuru: '4691',
  Isveren: false,
  EgitimDurumu: '',
  EngellilikDurumu: '',
  HesaplamaTipi: 'BruttenNete'
}

const TesvikHesaplamaModul = () => {
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);
  const [itemValue, setItemValue] = useState<IITemsTypesData>(initialValue);
  const [manuelTableDataes, setManuelTableDataes] = useState([] as TeknoKentHesaplama[]);
  const [nextId, setNextId] = useState(1);
  // Kümülatif vergi matrahı (yıl başından bugüne)
  const [kumulatifVergiMatrahi, setKumulatifVergiMatrahi] = useState(0);


  // 2025 yılı sabit değerleri (güncellendi)
  const ASGARI_UCRET = 26005.50;
  const SGK_CALISAN_ORANI = 0.14;
  const SGK_ISSIZLIK_CALISAN_ORANI = 0.01;
  const SGK_ISVEREN_ORANI = 0.1575;
  const SGK_ISSIZLIK_ISVEREN_ORANI = 0.02;
  const DAMGA_VERGISI_ORANI = 0.00759;
  const ASGARI_UCRET_VERGI_ISTISNASI = 3315.70;


  useEffect(() => {
    setError(null)
    setSuccessMessage(null)
    setPageError(null)
    setManuelTableDataes([] as TeknoKentHesaplama[]);
    setItemValue(initialValue)
  }, []);

  const getVergiDilimi = (gelir: number): number => {
    if (gelir <= 158000) return 15;
    if (gelir <= 172000) return 20;
    if (gelir <= 870000) return 27;
    if (gelir <= 3100000) return 35;
    return 40;
  };

  // Brütten nete hesaplama fonksiyonu (argebordro.com ile uyumlu, damga vergisi istisnası ve kümülatif matrah)
  const bruttenNeteHesapla = (
    brutMaas: number,
    argeOrani: number,
    sirketOrtagi: boolean,
    kumulatifMatrah: number,
    calismaTuru: string,
    asgariUcretIstisnasiUygula: boolean = false,
    besPuanlikIndirimi: boolean = false,
    dortPuanlikIndirimi: boolean = false
  ): {
    netMaas: number;
    detaylar: any;
  } => {
    brutMaas = Math.round(brutMaas * 100) / 100;
    // 1. SGK primleri (çalışan payı)
    const calisanSGKPrimi = brutMaas * SGK_CALISAN_ORANI;
    const calisanIssizlikSigortasi = brutMaas * SGK_ISSIZLIK_CALISAN_ORANI;

    // İşveren maliyetleri
    const sgkPayi = brutMaas * SGK_ISVEREN_ORANI;
    const issizlikPayi = brutMaas * SGK_ISSIZLIK_ISVEREN_ORANI;
    // Vergi matrahı
    const vergiMatrahi = brutMaas - calisanSGKPrimi - calisanIssizlikSigortasi;
    const yeniKumulatifMatrah = kumulatifVergiMatrahi + vergiMatrahi;

    // 3. Kümülatif matrah ile vergi dilimi hesaplama
    const toplamMatrah = kumulatifMatrah + vergiMatrahi;
    const vergiDilimi = 15;
    let gelirVergisi = vergiMatrahi * 0.15;

    // 4. Damga vergisi (asgari ücret istisnası ile)
    const damgaVergisiMatrahi = Math.max(0, brutMaas - ASGARI_UCRET);
    let damgaVergisi = damgaVergisiMatrahi * DAMGA_VERGISI_ORANI;

    // 5. Asgari ücret vergi istisnası
    let asgariUcretVergiIstisnasi = 0;
    if (asgariUcretIstisnasiUygula) {
      asgariUcretVergiIstisnasi = Math.min(gelirVergisi, ASGARI_UCRET_VERGI_ISTISNASI);
      gelirVergisi = Math.max(0, gelirVergisi - asgariUcretVergiIstisnasi);
    }

    // 6. 5746 sayılı kanun (Ar-Ge) teşvikleri ve eğitim durumu katkısı
    let gelirVergisiTesviki = 0;
    let damgaVergisiTesviki = 0;

    if (calismaTuru === '5746') {
      // Eğitim durumuna göre ek teşvik oranı
      let egitimOrani = 0;
      // Eğitim durumu: doktora (%95), yüksek lisans/temel bilimler (%90), diğer (%80)
      if (itemValue.EgitimDurumu === 'doktora') {
        egitimOrani = 0.95;
      } else if (itemValue.EgitimDurumu === 'yuksek-lisans') {
        egitimOrani = 0.90;
      } else {
        egitimOrani = 0.80;
      }
      // Ar-Ge oranı ile çarpılır
      const toplamOran = argeOrani * egitimOrani;
      gelirVergisiTesviki = gelirVergisi * toplamOran;
      damgaVergisiTesviki = damgaVergisi * toplamOran;

      gelirVergisi = Math.max(0, gelirVergisi - gelirVergisiTesviki);
      damgaVergisi = Math.max(0, damgaVergisi - damgaVergisiTesviki);
    } else if (calismaTuru === '4691') {
      // Teknokent personeli için tam teşvik
      gelirVergisiTesviki = gelirVergisi;
      damgaVergisiTesviki = damgaVergisi;

      gelirVergisi = 0;
      damgaVergisi = 0;
    }

    // 7. İstihdam teşvikleri (5 puan ve 4 puan)
    let besPuanIndirim = 0;
    let dortPuanIndirim = 0;

    if (besPuanlikIndirimi) {
      besPuanIndirim = Math.min(gelirVergisi, vergiMatrahi * 0.05);
      gelirVergisi = Math.max(0, gelirVergisi - besPuanIndirim);
    } else if (dortPuanlikIndirimi) {
      dortPuanIndirim = Math.min(gelirVergisi, vergiMatrahi * 0.04);
      gelirVergisi = Math.max(0, gelirVergisi - dortPuanIndirim);
    }


    let teknokentSGKIndirimi = 0;
    let teknokentGelirVergisiIndirimi = 0;
    let damgaVergisiIstisnasi = 0;

    if (itemValue.CalismaTuru === '4691' || itemValue.CalismaTuru === '5746') {
      // Şirket ortağı ise SGK teşviki yok
      if (!itemValue.Isveren) {
        // SGK işveren payı + işveren işsizlik payı
        teknokentSGKIndirimi = (sgkPayi + issizlikPayi) * argeOrani; // argeOrani tam ise 1, kısmi ise oran
      }
      // Gelir vergisi teşviki (kalan gelir vergisi kadar)
      teknokentGelirVergisiIndirimi = gelirVergisi * argeOrani; // argeOrani tam ise 1, kısmi ise oran
      // Damga vergisi teşviki (kalan damga vergisi kadar)
      damgaVergisiIstisnasi = damgaVergisi * argeOrani; // argeOrani tam ise 1, kısmi ise oran
    }
    // Toplam istisnalar
    const toplamSGKIstisna = teknokentSGKIndirimi;

    const toplamSGKOdemesi = Math.max(0, sgkPayi + issizlikPayi + calisanSGKPrimi + calisanIssizlikSigortasi +
      (itemValue.BesPuanlikIndirimUygula ? besPuanIndirim : brutMaas * 0.05) +
      (itemValue.DortPuanlikIndirimUygula ? dortPuanIndirim : 0));
    const gelirVergisiOdemesi = Math.max(0, gelirVergisi - teknokentGelirVergisiIndirimi);
    const damgaVergiOdemesi = Math.max(0, damgaVergisi - damgaVergisiIstisnasi);

    const toplamMaliyet = (brutMaas + sgkPayi + issizlikPayi) - besPuanIndirim - dortPuanIndirim - asgariUcretVergiIstisnasi;

    // 8. Net maaş hesaplama
    const netMaas = brutMaas - calisanSGKPrimi - calisanIssizlikSigortasi - gelirVergisi - damgaVergisi;
    // Detaylar
    const detaylar = {
      brutMaas,
      calisanSGKPrimi,
      calisanIssizlikSigortasi,
      vergiMatrahi,
      vergiDilimi: Math.round(vergiDilimi * 100) / 100,
      gelirVergisiBrut: (vergiMatrahi * vergiDilimi) / 100,
      damgaVergisiBrut: damgaVergisiMatrahi * DAMGA_VERGISI_ORANI,
      asgariUcretVergiIstisnasi,
      gelirVergisiTesviki,
      damgaVergisiTesviki,
      besPuanIndirim,
      dortPuanIndirim,
      gelirVergisiNet: gelirVergisi,
      damgaVergisiNet: damgaVergisi,
      toplamKesinti: calisanSGKPrimi + calisanIssizlikSigortasi + gelirVergisi + damgaVergisi,
      netMaas: Math.round(netMaas * 100) / 100,
      sgkPayi: Math.round(sgkPayi * 100) / 100,
      issizlikPayi: Math.round(issizlikPayi * 100) / 100,
      gelirVergisiIstisnasi: Math.round(teknokentGelirVergisiIndirimi * 100) / 100,
      damgaVergisiIstisnasi: Math.round(damgaVergisiIstisnasi * 100) / 100,
      toplamSGKIstisna: Math.round(toplamSGKIstisna * 100) / 100,
      toplamSGKOdemesi: Math.round(toplamSGKOdemesi * 100) / 100,
      damgaVergiOdemesi: Math.round(damgaVergiOdemesi * 100) / 100,
      gelirVergisiOdemesi: Math.round(gelirVergisiOdemesi * 100) / 100,
      toplamMaliyet: Math.round(toplamMaliyet * 100) / 100,
    };

    return {
      netMaas: Math.round(netMaas * 100) / 100,
      detaylar
    };
  };

  // Netten brüte hesaplama fonksiyonu (argebordro.com ile uyumlu)
  const nettenBruteHesapla = (
    netMaas: number,
    argeOrani: number,
    sirketOrtagi: boolean,
    kumulatifMatrah: number,
    calismaTuru: string,
    asgariUcretIstisnasiUygula: boolean = false,
    besPuanlikIndirimi: boolean = false,
    dortPuanlikIndirimi: boolean = false
  ): any => {
    let brutTahmin = netMaas * 1.46; // Başlangıç tahmini
    let iterasyon = 0;
    const maxIterasyon = 100;
    const hassasiyet = 0.01;
    let sonGecerliBrut = brutTahmin;
    let sonFark = Number.POSITIVE_INFINITY;

    while (iterasyon < maxIterasyon) {
      const hesaplama = bruttenNeteHesapla(
        brutTahmin,
        argeOrani,
        sirketOrtagi,
        kumulatifMatrah,
        calismaTuru,
        asgariUcretIstisnasiUygula,
        besPuanlikIndirimi,
        dortPuanlikIndirimi
      );

      const hesaplananNet = hesaplama.netMaas;
      const fark = netMaas - hesaplananNet;

      // Eğer brüt maaş 1000 TL'nin altına düştüyse, döngüyü kır (gerçekçi değil)
      if (brutTahmin < 1000) {
        break;
      }

      // En yakın sonucu sakla
      if (Math.abs(fark) < Math.abs(sonFark)) {
        sonGecerliBrut = brutTahmin;
        sonFark = fark;
      }

      if (Math.abs(fark) < hassasiyet) {
        sonGecerliBrut = brutTahmin;
        break;
      }

      // Newton-Raphson benzeri yaklaşım
      const hesaplamaTurev = bruttenNeteHesapla(
        brutTahmin + 1,
        argeOrani,
        sirketOrtagi,
        kumulatifMatrah,
        calismaTuru,
        asgariUcretIstisnasiUygula,
        besPuanlikIndirimi,
        dortPuanlikIndirimi
      );
      const turev = hesaplamaTurev.netMaas - hesaplananNet;

      if (Math.abs(turev) > 1e-6) {
        brutTahmin = brutTahmin + (fark / turev);
      } else {
        // Türev çok küçükse sabit küçük bir adım uygula
        brutTahmin = brutTahmin + (fark > 0 ? 10 : -10);
      }

      // Negatif değerleri engelle
      brutTahmin = Math.max(brutTahmin, 0);

      iterasyon++;
    }

    // Sonuç kontrolü: Hesaplanan net maaş ile istenen net maaş arasında 1 TL'den fazla fark varsa, hata göster
    const sonNet = bruttenNeteHesapla(
      sonGecerliBrut,
      argeOrani,
      sirketOrtagi,
      kumulatifMatrah,
      calismaTuru,
      asgariUcretIstisnasiUygula,
      besPuanlikIndirimi,
      dortPuanlikIndirimi
    );
    if (Math.abs(sonNet.netMaas - netMaas) > 1) {
      // Hatalıysa 0 döndür
      return 0;
    }
    return sonNet;
  };

  const hesaplaVeEkle = () => {
    try {
      setError(null);

      if (!itemValue.PersonelAdi) {
        setError('Lütfen personel adını girin.');
        return;
      }

      let brutMaas = 0;
      const gunSayisi = 30;
      const argeGunSayisi = itemValue.ArgeGunSayisi;
      // Ar-Ge oranı hesaplama (tek tanım)
      const argeOrani = Math.max(0, Math.min(1, argeGunSayisi / gunSayisi));

      let hesaplamaBrut = {} as any;
      // Hesaplama tipine göre brüt maaş belirleme
      if (itemValue.HesaplamaTipi === 'BruttenNete') {
        if (!itemValue.BrutMaas) {
          setError('Lütfen brüt maaş değerini girin.');
          return;
        }
        // Nokta ve virgül ayrıştırma: 48.950,00 veya 48950,00 veya 48,950.00 gibi tüm varyasyonları destekle
        let brutStr = itemValue.BrutMaas.replace(/\s/g, '');
        // Eğer hem nokta hem virgül varsa, son virgül ondalık ayırıcıdır, noktalar binliktir
        if (brutStr.includes('.') && brutStr.includes(',')) {
          brutStr = brutStr.replace(/\./g, '');
          brutStr = brutStr.replace(/,/g, '.');
        } else if (brutStr.includes(',')) {
          // Sadece virgül varsa, ondalık ayırıcıdır
          brutStr = brutStr.replace(/\./g, '');
          brutStr = brutStr.replace(/,/g, '.');
        } else {
          // Sadece nokta varsa, binlik ayırıcı olabilir, kaldır
          brutStr = brutStr.replace(/\./g, '');
        }
        brutMaas = parseFloat(brutStr);
        hesaplamaBrut = bruttenNeteHesapla(
          brutMaas,
          argeOrani,
          itemValue.Isveren,
          kumulatifVergiMatrahi,
          initialValue.CalismaTuru,
          itemValue.AsgariUcretIstisnasiUygula,
          itemValue.BesPuanlikIndirimUygula,
          itemValue.DortPuanlikIndirimUygula
        );
      } else {
        if (!itemValue.NetMaas) {
          setError('Lütfen net maaş değerini girin.');
          return;
        }
        // Nokta ve virgül ayrıştırma: 35.000,00 veya 35000,00 veya 35,000.00 gibi tüm varyasyonları destekle
        let netStr = itemValue.NetMaas.replace(/\s/g, '');
        if (netStr.includes('.') && netStr.includes(',')) {
          netStr = netStr.replace(/\./g, '');
          netStr = netStr.replace(/,/g, '.');
        } else if (netStr.includes(',')) {
          netStr = netStr.replace(/\./g, '');
          netStr = netStr.replace(/,/g, '.');
        } else {
          netStr = netStr.replace(/\./g, '');
        }
        const netMaas = parseFloat(netStr);
        hesaplamaBrut = nettenBruteHesapla(netMaas, argeOrani, itemValue.Isveren, kumulatifVergiMatrahi, itemValue.CalismaTuru, itemValue.AsgariUcretIstisnasiUygula, itemValue.BesPuanlikIndirimUygula, itemValue.DortPuanlikIndirimUygula);
      }


      if (!hesaplamaBrut || hesaplamaBrut === 0 || !hesaplamaBrut.detaylar) {
        setError('Hesaplama sırasında bir hata oluştu. Lütfen brüt veya net maaş değerini kontrol edin.');
        return;
      }

      const yeniListe: TeknoKentHesaplama = {
        id: nextId,
        PersonelAdi: itemValue.PersonelAdi,
        GunSayisi: gunSayisi,
        ArgeGunSayisi: argeGunSayisi,
        CalismaGunSayisi: itemValue.CalismaGunSayisi,
        CalismaTuru: itemValue.CalismaTuru,
        BodroyaEsasBrut: hesaplamaBrut.detaylar.brutMaas,
        CalisanSGKPrimi: hesaplamaBrut.detaylar.calisanSGKPrimi,
        CalisanIssizlikSigortasi: hesaplamaBrut.detaylar.calisanIssizlikSigortasi,
        VergiDilimi: hesaplamaBrut.detaylar.vergiDilimi,
        GelirVergisi: hesaplamaBrut.detaylar.gelirVergisiBrut,
        DamgaVergisi: hesaplamaBrut.detaylar.damgaVergisiBrut,
        AsgariUcretVergiIstisnasi: hesaplamaBrut.detaylar.asgariUcretVergiIstisnasi,
        NetUcret: hesaplamaBrut.detaylar.netMaas,
        Maas: hesaplamaBrut.detaylar.netMaas,
        SGKPayi: hesaplamaBrut.detaylar.sgkPayi,
        IssizlikPayi: hesaplamaBrut.detaylar.issizlikPayi,
        ToplamSGKIstisna: hesaplamaBrut.detaylar.toplamSGKIstisna,
        GelirVergisiIstisnasi: hesaplamaBrut.detaylar.gelirVergisiIstisnasi,
        DamgaVergisiIstisnasi: hesaplamaBrut.detaylar.damgaVergisiIstisnasi,
        ToplamSGKOdemesi: hesaplamaBrut.detaylar.toplamSGKOdemesi,
        DamgaVergiOdemesi: hesaplamaBrut.detaylar.damgaVergiOdemesi,
        GelirVergisiOdemesi: hesaplamaBrut.detaylar.gelirVergisiOdemesi,
        ToplamMaliyet: hesaplamaBrut.detaylar.toplamMaliyet,
        Isveren: itemValue.Isveren
      }


      setManuelTableDataes(prev => [...prev, yeniListe]);
      setNextId(prev => prev + 1);

      // Formu temizle
      setItemValue({
        ...initialValue,
        HesaplamaTipi: itemValue.HesaplamaTipi // Hesaplama tipini koru
      });

      setSuccessMessage(`${itemValue.PersonelAdi} başarıyla listeye eklendi.`);

      // Sonuç eklendikten sonra kümülatif matrahı güncelle
      //setKumulatifVergiMatrahi(yeniKumulatifMatrah);

    } catch (err) {
      setError('Hesaplama sırasında bir hata oluştu: ' + err);
    }
  };

  const personelSil = (id: number) => {
    setManuelTableDataes(prev => prev.filter(item => item.id !== id));
    setSuccessMessage('Personel listeden silindi.');
  };

  const handleExcelDownload = () => {
    if (manuelTableDataes.length < 1) return;

    const data = manuelTableDataes.map((manuelTableData: TeknoKentHesaplama) => ({
      'Personel': manuelTableData.PersonelAdi,
      'Çalışma Günü Sayısı': manuelTableData.CalismaGunSayisi,
      'Ar-Ge Gün Sayısı': manuelTableData.ArgeGunSayisi,
      'Çalışma Türü': manuelTableData.CalismaTuru,
      'Şirket Ortağı': manuelTableData.Isveren ? 'Evet' : 'Hayır',
      'Asgari Ücret Vergi İstisnasi': manuelTableData.AsgariUcretVergiIstisnasi ? 'Evet' : 'Hayır',
      'Bordroya Esas Brüt': manuelTableData.BodroyaEsasBrut?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Çalışan SGK Primi': manuelTableData.CalisanSGKPrimi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Çalışan İşsizlik Sigortası': manuelTableData.CalisanIssizlikSigortasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Vergi Dilimi': manuelTableData.VergiDilimi,
      'Gelir Vergisi': manuelTableData.GelirVergisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Damga Vergisi': manuelTableData.DamgaVergisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Asgari Ücret Vergi İstisnası': manuelTableData.AsgariUcretVergiIstisnasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Net Ücret': manuelTableData.NetUcret?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Maaş': manuelTableData.Maas?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'İşveren SGK Payı': manuelTableData.SGKPayi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'İşveren İşsizlik Payı': manuelTableData.IssizlikPayi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Toplam SGK İstisnası': manuelTableData.ToplamSGKIstisna?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Gelir Vergisi İstisnası': manuelTableData.GelirVergisiIstisnasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Damga Vergisi İstisnası': manuelTableData.DamgaVergisiIstisnasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Toplam SGK Ödemesi': manuelTableData.ToplamSGKOdemesi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Damga Vergi Ödemesi': manuelTableData.DamgaVergiOdemesi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Gelir Vergisi Ödemesi': manuelTableData.GelirVergisiOdemesi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Toplam Maliyet': manuelTableData.ToplamMaliyet?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teknokent_Tesvik_Hesaplama");

    const wscols = Object.keys(data[0]).map(() => ({ wch: 20 }));
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, `Teknokent_Tesvik_Hesaplama_${new Date().toLocaleDateString('tr-TR')}.xlsx`);
  };

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
          <span>{typeof error === 'string' ? error : JSON.stringify(pageError)}</span></div>
        :
        <div className='max-w-[100%]'>
          <div className="card bg-gray-50">
            <div className="card-header">
              <h3 className="text-lg font-semibold mb-2">Teknokent Teşvik Hesaplama</h3>
              {error && <div className="text-red-700 flex items-center gap-2 mb-2">
                <KeenIcon icon={'information-2'} />
                <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span></div>}
              {successMessage && <div className="text-lime-600 flex items-center gap-2 mb-2">
                <KeenIcon icon={'information-1'} style="solid" className="text-lg" />
                <span>{successMessage}</span></div>}
            </div>

            <div className="card-body flex flex-col gap-4">

              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-12 md:col-span-3">
                  <div className="">Hesaplama Tipi</div>
                  <Select
                    value={itemValue.HesaplamaTipi}
                    onValueChange={(value) => {
                      setItemValue({
                        ...itemValue,
                        HesaplamaTipi: value,
                        NetMaas: '',
                        BrutMaas: ''
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Hesaplama Tipi Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='BruttenNete'>Brütten Nete Hesaplama</SelectItem>
                      <SelectItem value='NettenBrute'>Netten Brüte Hesaplama</SelectItem>
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

                <div className="col-span-12 md:col-span-3">
                  <div className="">Ünvan</div>
                  <Input
                    className="w-full"
                    value={itemValue.Unvan}
                    required
                    placeholder="Ünvan"
                    onChange={(e) => setItemValue({ ...itemValue, Unvan: e.target.value })}
                  />
                </div>

                {itemValue.HesaplamaTipi === 'BruttenNete' && (
                  <div className="col-span-12 md:col-span-3">
                    <div className="">
                      <span className="text-blue-600 font-semibold">Brüt Maaş</span>
                    </div>
                    <Input
                      className="w-full border-blue-300 focus:border-blue-500"
                      value={itemValue.BrutMaas}
                      required
                      placeholder="Brüt Maaş Girin"
                      onChange={(e) => setItemValue({ ...itemValue, BrutMaas: handleParaMaskeChange(e.target.value) })}
                    />
                  </div>
                )}

                {itemValue.HesaplamaTipi === 'NettenBrute' && (
                  <div className="col-span-12 md:col-span-3">
                    <div className="">
                      <span className="text-green-600 font-semibold">Net Maaş</span>
                    </div>
                    <Input
                      className="w-full border-green-300 focus:border-green-500"
                      value={itemValue.NetMaas}
                      required
                      placeholder="Net Maaş Girin"
                      onChange={(e) => setItemValue({ ...itemValue, NetMaas: handleParaMaskeChange(e.target.value) })}
                    />
                  </div>
                )}

                <div className="col-span-12 md:col-span-3">
                  <div className="">Çalışma Gün Sayısı:</div>
                  <Input
                    className="w-full"
                    value={itemValue.CalismaGunSayisi}
                    required
                    placeholder="Çalışma Gün Sayısı"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 30) {
                        setItemValue({ ...itemValue, CalismaGunSayisi: value });
                      }
                    }}
                  />
                </div>

                <div className="col-span-12 md:col-span-3">
                  <div className="">Ar-Ge Gün Sayısı:</div>
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

                <div className="col-span-12 md:col-span-3">
                  <div className="">Çalışma Türü</div>
                  <Select value={itemValue.CalismaTuru} onValueChange={(value: 'standart' | '4691' | '5746') => setItemValue({ ...itemValue, CalismaTuru: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Çalışma Türü Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='standart'>Standart Çalışan</SelectItem>
                      <SelectItem value='4691'>Teknokent Personeli(4691)</SelectItem>
                      <SelectItem value='5746'>Ar-Ge Personeli(5746)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className={clsx("col-span-12 md:col-span-3" + (itemValue.CalismaTuru === '5746' ? '' : ' opacity-70'))}>
                  <div className="">Eğitim Durumu</div>
                  <Select disabled={itemValue.CalismaTuru !== '5746'} value={itemValue.EgitimDurumu ?? 'diger'} onValueChange={(value: '4691' | '5746') => setItemValue({ ...itemValue, EgitimDurumu: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Çalışma Türü Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='diger'>Diğer Ar-Ge Personeli</SelectItem>
                      <SelectItem value='doktora'>Doktoralı veya Temel Bilimler Yüksek Lisanslı</SelectItem>
                      <SelectItem value='yuksek-lisans'>Yüksek Lisanslı veya Temel Bilimleri Lisanslı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <label className="checkbox-group flex items-center gap-2">
                    <input
                      className="checkbox checkbox-sm"
                      type="checkbox"
                      checked={itemValue.Isveren}
                      onChange={(e) => setItemValue({ ...itemValue, Isveren: e.target.checked })}
                    />
                    <span className="text-sm">Şirket Ortağı</span>
                  </label>
                </div>

                <DefaultTooltip title="SGK işveren primi indirimleri: Sadece toplam maliyetten düşülür, net maaşı etkilemez. 5 puanlık indirim üretim/ihracat ve Ar-Ge/Teknokent için, 4 puanlık indirim diğer sektörler için uygulanır.">
                  <div className="col-span-12 md:col-span-4 flex-col gap-4">
                    <label className="checkbox-group flex items-center gap-2">
                      <input
                        className="checkbox checkbox-sm"
                        type="checkbox"
                        checked={itemValue.BesPuanlikIndirimUygula}
                        onChange={(e) => setItemValue({ ...itemValue, BesPuanlikIndirimUygula: e.target.checked, DortPuanlikIndirimUygula: e.target.checked ? false : itemValue.DortPuanlikIndirimUygula })}
                        disabled={itemValue.DortPuanlikIndirimUygula}
                      />
                      <span className="text-sm">SGK 5 Puanlık İndirim (5510/81. madde)</span>
                    </label>
                    <label className="checkbox-group flex items-center gap-2">
                      <input
                        className="checkbox checkbox-sm"
                        type="checkbox"
                        checked={itemValue.DortPuanlikIndirimUygula}
                        onChange={(e) => setItemValue({ ...itemValue, DortPuanlikIndirimUygula: e.target.checked, BesPuanlikIndirimUygula: e.target.checked ? false : itemValue.BesPuanlikIndirimUygula })}
                        disabled={itemValue.BesPuanlikIndirimUygula}
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
                      checked={itemValue.AsgariUcretIstisnasiUygula}
                      onChange={(e) => setItemValue({ ...itemValue, AsgariUcretIstisnasiUygula: e.target.checked })}
                    />
                    <span className="text-sm">Asgari ücret vergi istisnası uygula</span>
                  </label>
                </div>



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

          {manuelTableDataes.length > 0 && (
            <div className="card mt-4">
              <div className="card-header flex justify-between items-center">
                <h5>Personel Listesi ({manuelTableDataes.length} Kişi)</h5>
                <div className="flex gap-2">
                  <Button
                    className="text-white bg-red-600 hover:bg-red-700"
                    variant="contained"
                    onClick={() => {
                      setManuelTableDataes([]);
                      setNextId(1);
                      setSuccessMessage('Tüm liste temizlendi.');
                    }}
                    disabled={!manuelTableDataes.length}
                  >
                    Listeyi Temizle
                  </Button>
                  <Button
                    className="text-white"
                    variant="contained"
                    onClick={handleExcelDownload}
                    disabled={!manuelTableDataes.length}
                  >
                    Excel İndir
                  </Button>
                </div>
              </div>
              <div className="card-body">
                <div className="kt-card-content">
                  <div className="grid datatable-initialized">
                    <div className="relative w-full scrollable-x-auto border rounded-md">
                      <table className="w-full align-middle text-left rtl:text-right caption-bottom text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b-2">
                            <th className="p-2 text-center text-xs font-bold border-r">#</th>
                            <th className="p-2 text-left text-xs font-bold border-r">Personel Adı</th>
                            <th className="p-2 text-center text-xs font-bold border-r">Teknokent (4691)</th>
                            <th className="p-2 text-center text-xs font-bold border-r">Ar-Ge (5746)</th>
                            <th className="p-2 text-center text-xs font-bold border-r">Şirket Ortağı</th>
                            <th className="p-2 text-center text-xs font-bold border-r">Gün Sayısı</th>
                            <th className="p-2 text-center text-xs font-bold border-r">Ar-Ge Gün Sayısı</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Bodraya Esas Brüt</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Çalışan SGK Primi</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Çalışan İşsizlik Sigortası</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Vergi Dilimi</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Gelir Vergisi</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Damga Vergisi</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Asgari Ücret Vergi İstisnası (G.V. + D.V.)</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Net Ücret</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Maaş</th>
                            <th className="p-2 text-right text-xs font-bold border-r">SGK Payı</th>
                            <th className="p-2 text-right text-xs font-bold border-r">İşsizlik Payı</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Toplam SGK İstisnası</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Gelir Vergisi İstisnası</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Damga Vergisi İstisnası</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Toplam SGK Ödemesi</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Damga Vergi Ödemesi</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Gelir Vergisi Ödemesi</th>
                            <th className="p-2 text-right text-xs font-bold border-r">Toplam Maliyet</th>
                            <th className="p-2 text-center text-xs font-bold">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {manuelTableDataes.map((data: TeknoKentHesaplama, index: number) => (
                            <tr key={data.id} className="border-b hover:bg-gray-50 even:bg-gray-25">
                              <td className="p-2 text-xs text-center font-medium border-r">{index + 1}</td>
                              <td className="p-2 text-xs font-medium border-r">{data.PersonelAdi}</td>
                              <td className="p-2 text-xs text-center border-r">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${data.CalismaTuru !== 'standart' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {data.CalismaTuru !== 'standart' ? 'Evet' : 'Hayır'}
                                </span>
                              </td>
                              <td className="p-2 text-xs text-center border-r">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${data.CalismaTuru === '5746' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {data.CalismaTuru === '5746' ? 'Evet' : 'Hayır'}
                                </span>
                              </td>
                              <td className="p-2 text-xs text-center border-r">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${data.Isveren ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {data.Isveren ? 'Evet' : 'Hayır'}
                                </span>
                              </td>
                              <td className="p-2 text-xs text-center border-r">{data.CalismaGunSayisi}</td>
                              <td className="p-2 text-xs text-center border-r">{data.ArgeGunSayisi}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.BodroyaEsasBrut?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>

                              <td className="p-2 text-xs text-right font-medium border-r">{data.CalisanSGKPrimi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.CalisanIssizlikSigortasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.VergiDilimi}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.GelirVergisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.DamgaVergisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.AsgariUcretVergiIstisnasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r text-green-700">{data.NetUcret?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.Maas?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.SGKPayi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.IssizlikPayi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.ToplamSGKIstisna?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.GelirVergisiIstisnasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.DamgaVergisiIstisnasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.ToplamSGKOdemesi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.DamgaVergiOdemesi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-medium border-r">{data.GelirVergisiOdemesi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-xs text-right font-bold border-r">{data.ToplamMaliyet?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-center border-r">
                                <Button
                                  size="small"
                                  className="text-white bg-red-500 hover:bg-red-600 min-w-0 px-2 py-1"
                                  variant="contained"
                                  onClick={() => personelSil(data.id)}
                                >
                                  <KeenIcon icon="trash" className="text-xs" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {/* <tfoot>
                          <tr className="bg-blue-50 border-t-2 font-bold">
                            <td colSpan={6} className="p-3 text-center font-bold border-r">TOPLAM</td>
                            <td className="p-3 text-right font-bold border-r">{manuelTableDataes.reduce((sum, item) => sum + item.bordroEsasBrut, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r text-green-700">{manuelTableDataes.reduce((sum, item) => sum + item.netUcret, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r text-blue-600">{manuelTableDataes.reduce((sum, item) => sum + item.teknokentSGKIndirimi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r text-orange-600">{manuelTableDataes.reduce((sum, item) => sum + item.teknokentGelirVergisiIndirimi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r text-green-600">{manuelTableDataes.reduce((sum, item) => sum + item.toplamTeknokentIndirimi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r">{manuelTableDataes.reduce((sum, item) => sum + item.toplamMaliyet, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r">{manuelTableDataes.reduce((sum, item) => sum + item.vergiMatrahi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r">{manuelTableDataes.reduce((sum, item) => sum + item.asgariUcretGelirVergisiIstisnasi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r">{manuelTableDataes.reduce((sum, item) => sum + item.asgariUcretDamgaVergisiIstisnasi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r">{manuelTableDataes.reduce((sum, item) => sum + item.besPuanlikSGKIndirimi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r">{manuelTableDataes.reduce((sum, item) => sum + item.dortPuanlikSGKIndirimi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r">{manuelTableDataes.reduce((sum, item) => sum + item.toplamVergiIstisnasi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold border-r">{manuelTableDataes.reduce((sum, item) => sum + item.toplamOdenenVergi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-center border-r"></td>
                          </tr>
                        </tfoot> */}
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/*  {manuelTableDataes.length > 0 && (
                <div className="card-footer bg-blue-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Toplam Personel</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {manuelTableDataes.length} Kişi
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Aylık Toplam Teşvik</div>
                      <div className="text-lg font-bold text-green-600">
                        {manuelTableDataes.reduce((sum, item) => sum + item.toplamTeknokentIndirimi, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Yıllık Toplam Teşvik</div>
                      <div className="text-lg font-bold text-purple-600">
                        {(manuelTableDataes.reduce((sum, item) => sum + item.toplamTeknokentIndirimi, 0) * 12).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Toplam Maliyet</div>
                      <div className="text-lg font-bold text-red-600">
                        {manuelTableDataes.reduce((sum, item) => sum + item.toplamMaliyet, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                    <div className="text-sm">
                      <strong>Teknokent Teşvik Bilgileri:</strong>
                      <ul className="mt-2 space-y-1 text-xs">
                        <li>• Ar-Ge personeli için SGK primi ve gelir vergisinde %100 teşvik uygulanır</li>
                        <li>• Şirket ortağı personelinde sadece gelir vergisi ve damga vergisi teşviki uygulanır</li>
                        <li>• Teşvik oranı Ar-Ge çalışma gün sayısına göre hesaplanır</li>
                        <li>• Hesaplamalar 2024 yılı vergi dilimlerine göre yapılmıştır</li>
                        <li>• 4 puanlık SGK indirimi gelir vergisi matrahından düşülür</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          )}
        </div>
      }
    </>
  )
};

export { TesvikHesaplamaModul };