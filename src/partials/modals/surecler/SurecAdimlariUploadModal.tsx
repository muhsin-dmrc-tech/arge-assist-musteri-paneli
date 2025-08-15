import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Button, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import { SurecAdimlariData } from '@/pages/staticks-pages/surecler';
import { KeenIcon } from '@/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthContext } from '@/auth';

interface SureclerUploadModalProps {
  open: boolean;
  onOpenChange: (data: any, adim: boolean) => void;
  item: any
}

const SurecAdimlariUploadModal = ({ open, onOpenChange, item }: SureclerUploadModalProps) => {
  const [seciliAdim, setSeciliAdim] = useState<SurecAdimlariData>({} as SurecAdimlariData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { auth } = useAuthContext();
  const [submitVisible, setSubmitVisible] = useState(false);


  const handleAdimDegisikligi = (field: keyof SurecAdimlariData, value: any, seciliAdim: SurecAdimlariData) => {
    setSeciliAdim({ ...seciliAdim, [field]: value });
  };




  const handleBaglantiDegisikligi = (
    baglantiIndex: string,
    value: any,
    seciliAdim: SurecAdimlariData
  ) => {
    const mevcutBaglantilar = seciliAdim.HedefAdimBaglantilari ?? [];



    // Aynı BaglantiTuru'na sahip mevcut bağlantıyı bul
    const mevcutBaglantiIndex = mevcutBaglantilar.findIndex(
      baglanti => baglanti.BaglantiTuru === baglantiIndex
    );

    let yeniBaglantilar;
    if (value === 'bosalt') {
      yeniBaglantilar = seciliAdim.HedefAdimBaglantilari?.filter(i => i.BaglantiTuru !== baglantiIndex);
    } else {
      if (mevcutBaglantiIndex !== -1) {
        // Mevcut bağlantının HedefAdimID'sini güncelle
        yeniBaglantilar = mevcutBaglantilar.map((baglanti, index) =>
          index === mevcutBaglantiIndex
            ? { ...baglanti, HedefAdimID: Number(value) }
            : baglanti
        );
      } else {
        // Yeni bağlantı ekle
        yeniBaglantilar = [
          ...mevcutBaglantilar,
          {
            ID: 0,
            SurecID: seciliAdim.SurecID,
            HedefAdimID: Number(value),
            KaynakAdimID: seciliAdim.ID,
            BaglantiTuru: baglantiIndex,
            SiraNo: baglantiIndex === 'onceki' ? 1 : 2,
          },
        ];
      }
    }
    setSeciliAdim({
      ...seciliAdim,
      HedefAdimBaglantilari: yeniBaglantilar,
    });


  };





  const handleSave = async () => {
    if (submitVisible) {
      toast.error('Gerekli alanları doldurun', { duration: 2000 });
      return
    }
    // Validasyon Başlangıcı
    if (!seciliAdim.AdimAdi || seciliAdim.AdimAdi.trim() === '') {
      toast.error(`Adımın adı boş olamaz`, { duration: 2500 });
      return;
    }

    if (!seciliAdim.SiraNo || seciliAdim.SiraNo <= 0) {
      toast.error(`Adımın sıra numarası geçerli değil`, { duration: 2500 });
      return;
    }

    if (Array.isArray(seciliAdim.HedefAdimBaglantilari)) {
      for (let j = 0; j < seciliAdim.HedefAdimBaglantilari.length; j++) {
        const baglanti = seciliAdim.HedefAdimBaglantilari[j];
        if (!baglanti.BaglantiTuru || baglanti.BaglantiTuru.trim() === '') {
          toast.error(`Adımın ${j + 1}. bağlantısında "Bağlantı Türü" zorunludur`, { duration: 2500 });
          return;
        }
      }
    }



    setSubmitVisible(true);
    try {

      const response: any = await axios.post(`${API_URL}/surecler/adim-upload`, seciliAdim, {
        headers: {
          Authorization: `Bearer ${auth?.access_token}`
        }
      });
      if (response) {
        if (response.data) {
          if (response.status === 201) {
            setSeciliAdim({} as SurecAdimlariData);
            setSuccessMessage('Öğe başarıyla oluşturuldu')
            setError('');
            onOpenChange(response, true);
            if (response.status === 201 && response.data) {
              // Mevcut adımı bul
              const existingAdimIndex = item.Adimlar.findIndex((i: SurecAdimlariData) => i.ID === response.data.ID);

              if (existingAdimIndex !== -1) {
                // Mevcut adımı güncelle
                item.Adimlar[existingAdimIndex] = response.data;
              } else {
                // Yeni adım ekle
                item.Adimlar = [...item.Adimlar, response.data];
              }
            }
          } else {
            if (response.data?.message) {
              setSuccessMessage('')
              setError(response.data?.message);
            }
            toast.error('Öğe Oluşturma Hatası' + response.data?.message, { duration: 5000 });
          }
        }
        setSubmitVisible(false);
      }
    } catch (error: any) {
      setSubmitVisible(false);
      setSuccessMessage('');
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        let errorMessages: string;
        if (Array.isArray(message)) {
          errorMessages = message
            .map((err: any) =>
              typeof err === "string" ? err : Object.values(err.constraints || {}).join(" ")
            )
            .join(" | ");
        } else if (typeof message === "string") {
          errorMessages = message;
        } else {
          errorMessages = "Bilinmeyen bir hata oluştu.";
        }

        setError(errorMessages);
      } else {
        setError("Bilinmeyen bir hata oluştu.");
      }
      toast.error('Öğe güncelleme hatası', { duration: 5000 });
    }

  }

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange('close', false)}>
      <DialogContent className="max-w-[900px] min-h-[90vh] max-h-[90vh] overflow-auto flex flex-col items-start">
        <DialogHeader className="flex flex-col gap-2.5 w-full">
          <DialogTitle className="text-2xl font-bold">Süreç Adımları</DialogTitle>
          <DialogDescription>Süreç adımlarını görüntüle düzenle veya yeni ekle.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 p-2.5 relative h-[78vh] w-full max-h-[100%] max-w-[900px] scrollable-y-auto">
          {error && <div className="text-red-700">
            <KeenIcon icon={'information-2'} />
            <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span></div>}
          {successMessage && <div className="text-lime-400">  <KeenIcon
            icon={'information-1'}
            style="solid"
            className={`text-lg leading-0 me-2`}
            aria-label={'information-1'}
          /> <span>{successMessage}</span></div>}

          <button className='btn btn-light btn-md block'
            onClick={() => {
              setSeciliAdim({
                ID: 0,
                AdimAdi: '',
                SiraNo: 1,
                SurecID: item.ID,
                KaynakAdimBaglantilari: undefined
              })
            }}
          >Yeni Adım Ekle<KeenIcon icon='plus' /></button>
          {item && item.Adimlar && <h3 className="text-md font-semibold">"{item.SurecAdi}" Adlı Sürecin Adımları</h3>}
          {item && item.Adimlar && <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Adım adı</TableCell>
                  <TableCell>Düzenle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {item.Adimlar?.sort((a: SurecAdimlariData, b: SurecAdimlariData) => a.SiraNo - b.SiraNo).map((item: SurecAdimlariData, idx: any) => (
                  <TableRow key={idx} className='hover:bg-gray-100'>
                    <TableCell className='flex flex-row'>{item.SiraNo}</TableCell>
                    <TableCell>{item.AdimAdi}</TableCell>
                    <TableCell>
                      <button className='btn btn-sm btn-light' onClick={() => setSeciliAdim(item)}><KeenIcon icon='update-file' /></button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>}



          {seciliAdim && seciliAdim.SiraNo &&
            <div className="bg-gray-50 p-[50px] w-full max-w-[98%] z-[9999] absolute top-15 bottom-15 right-15 left-15">

              <div className="flex flex-col p-4 border rounded-md gap-4">
                <div className="flex flex-row justify-between item-center">
                  <h3 className="text-md font-semibold">Adım {seciliAdim.ID === 0 ? 'Ekle' : 'Düzenle'}</h3>
                  <button onClick={() => { setSeciliAdim({} as SurecAdimlariData) }} ><KeenIcon icon='cross' /></button>
                </div>
                <div>
                  <InputLabel>Adım Adı</InputLabel>
                  <Input
                    value={seciliAdim.AdimAdi}
                    onChange={(e) => handleAdimDegisikligi('AdimAdi', e.target.value, seciliAdim)}
                    placeholder="Adım Adı"
                  />
                </div>

                <div>
                  <InputLabel>Sıra No</InputLabel>
                  <Input
                    type="number"
                    value={seciliAdim.SiraNo}
                    onChange={(e) =>
                      handleAdimDegisikligi('SiraNo', Number(e.target.value), seciliAdim)
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <InputLabel>Önceki (Hedef (varış) adımı seçin) {item.Adimlar.filter((a: any) => a.ID !== seciliAdim.ID).length < 1 &&
                    <span className='text-xs text-red-700'>(Hiç hedef adım bulunamadı)</span>}</InputLabel>
                  <Select disabled={item.Adimlar.filter((a: any) => a.ID !== seciliAdim.ID).length < 1}
                    value={seciliAdim.HedefAdimBaglantilari?.find(k => k.BaglantiTuru === 'onceki')?.HedefAdimID.toString() || ''}
                    onValueChange={(value) => handleBaglantiDegisikligi('onceki', value, seciliAdim)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Hedef adım seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={'bosalt'}>Boşalt</SelectItem>
                      {item.Adimlar?.filter((a: any) => a.ID !== seciliAdim.ID).map((it: any, index: any) => (
                        <SelectItem key={index} value={it.ID.toString()}>{it?.AdimAdi}</SelectItem>))}

                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <InputLabel>Sonraki (Hedef (varış) adımı seçin) {item.Adimlar.filter((a: any) => a.ID !== seciliAdim.ID).length < 1 &&
                    <span className='text-xs text-red-700'>(Hiç hedef adım bulunamadı)</span>}</InputLabel>
                  <Select disabled={item.Adimlar.filter((a: any) => a.ID !== seciliAdim.ID).length < 1}
                    value={seciliAdim.HedefAdimBaglantilari?.find(k => k.BaglantiTuru === 'sonraki')?.HedefAdimID.toString() || ''}
                    onValueChange={(value) => handleBaglantiDegisikligi('sonraki', value, seciliAdim)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Hedef adım seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={'bosalt'}>Boşalt</SelectItem>

                      {item.Adimlar?.filter((a: any) => a.ID !== seciliAdim.ID).map((it: any, index: any) => (
                        <SelectItem key={index} value={it.ID.toString()}>{it?.AdimAdi}</SelectItem>))}

                    </SelectContent>
                  </Select>
                </div>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Kaydet
                </Button>
              </div>
            </div>
          }


        </div>
      </DialogContent>
    </Dialog>
  );
};

export { SurecAdimlariUploadModal };
