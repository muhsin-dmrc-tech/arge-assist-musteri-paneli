import { forwardRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button, InputLabel } from '@mui/material';
import { Textarea } from '@/components/ui/textarea';
import TimeSelect from '@/components/timeselect/TimeSelect';
import { KeenIcon } from '@/components';

interface IModalCreateitemProps {
  open: boolean;
  onOpenChange: (data: any) => void;
  item?: { Tarih: string; Baslangic: string; Bitis: string; ToplamSure: string; Aciklama?: string }
}

const IzinGunuUpdateModal = forwardRef<HTMLDivElement, IModalCreateitemProps>(
  ({ open, onOpenChange, item }, ref) => {
    const [itemValue, setitemValue] = useState({ Tarih: item?.Tarih, Baslangic: item?.Baslangic, Bitis: item?.Bitis, ToplamSure: item?.ToplamSure, Aciklama: item?.Aciklama });
    const [error, setError] = useState('')

    const handleCreateitem = async () => {
      onOpenChange({ status: 201, data: itemValue });
    }

    useEffect(() => {
      if (item && item.Tarih) {
        setitemValue({
          Tarih: item.Tarih,
          Baslangic: item.Baslangic,
          Bitis: item.Bitis,
          ToplamSure: item.ToplamSure,
          Aciklama: item.Aciklama,
        })
      }
    }, [item])



    const handleSetFunc = (key: 'Baslangic' | 'Bitis', value: string) => {
      setError('');
    
      // Yeni saat değerlerini belirle
      const yeniBaslangic = key === 'Baslangic' ? value : itemValue.Baslangic;
      const yeniBitis = key === 'Bitis' ? value : itemValue.Bitis;
    
      // Tarihleri oluştur
      const baslangicSaat = new Date(`2025-01-01T${yeniBaslangic}:00`);
      const bitisSaat = new Date(`2025-01-01T${yeniBitis}:00`);
    
      // Saat farkını hesapla (milisaniye → saat)
      const toplamSure = (bitisSaat.getTime() - baslangicSaat.getTime()) / (1000 * 60 * 60);
    
      if (toplamSure <= 0) {
        setError('Bitiş saati, başlangıç saatinden sonra olmalıdır.');
        return;
      }
    
      // Herşey yolundaysa state'i güncelle
      setitemValue(prev => ({
        ...prev,
        [key]: value,
        ToplamSure: toplamSure.toFixed(2)
      }));
    };

    return (
      <Dialog open={open} onOpenChange={() => onOpenChange('close')}>
        <DialogContent className="max-w-[400px]" ref={ref}>
          <DialogHeader className="flex flex-col gap-2.5">
            <DialogTitle className="text-2xl font-bold">Seçili Tarihi Düzenle</DialogTitle>
            <DialogDescription>Seçili Tarih hakkında bilgi verin</DialogDescription>
          </DialogHeader>
          {error && (
            <div className="text-red-700 flex items-center gap-2 ps-3">
              <KeenIcon icon="information-2" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex flex-col gap-2.5 p-2.5">
            <div className="times col-span-6 flex flex-col gap-1">
              <div className="flex flex-row gap-1 justify-between">
                <InputLabel required>Başlangıç Saati</InputLabel>
                <TimeSelect time={itemValue.Baslangic ?? '00:00'} setTime={(value) => handleSetFunc('Baslangic', value)} />
              </div>
              <div className="flex flex-row gap-1 justify-between">
                <InputLabel required>Bitis Saati</InputLabel>
                <TimeSelect time={itemValue.Bitis ?? '00:00'} setTime={(value) => handleSetFunc('Bitis', value)} />
              </div>
              <div className="flex flex-row gap-1 justify-between">
                <InputLabel required>Toplam Süre</InputLabel>
                <Input className="w-20 h-8 py-0"
                  type='text'
                  value={itemValue.ToplamSure ?? ''}
                  disabled
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <InputLabel required>Açıklama</InputLabel>
              <Textarea
                className="w-full"
                value={itemValue?.Aciklama ?? ''}
                placeholder='Açıklama'
                onChange={(e) => setitemValue({ ...itemValue, Aciklama: e.target.value })}
              />
            </div>



          </div>

          <div className="flex flex-col gap-1 mt-2.5 p-2.5">
            <Button
              className="w-full text-white"
              variant="contained"
              onClick={handleCreateitem}>
              Kaydet
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    );
  }
);

export { IzinGunuUpdateModal };
