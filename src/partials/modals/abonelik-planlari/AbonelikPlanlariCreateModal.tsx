import { forwardRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button, InputLabel } from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthContext } from '@/auth/useAuthContext';
import { KeenIcon } from '@/components/keenicons';
import TinyMcEditor from '@/components/tinymceditor/TinyMcEditor';

interface IModalCreateitemProps {
  open: boolean;
  onOpenChange: (data: any) => void;
}

const AbonelikPlanlariCreateModal = forwardRef<HTMLDivElement, IModalCreateitemProps>(
  ({ open, onOpenChange }, ref) => {
    const [itemValue, setitemValue] = useState({
      PlanAdi: '',
      Fiyat: '',
      Aciklama: ''
    });
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const { auth } = useAuthContext();
    const [submitVisible, setSubmitVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleCreateitem = async () => {
      if (submitVisible) {
        toast.error('Gerekli alanları doldurun', { duration: 2000 });
        return
      }
      if (!itemValue.PlanAdi || !itemValue.Aciklama || !itemValue.Fiyat) {
        setSuccessMessage('')
        setError('Plan Adı, Açıklama ve Fiyat zorunludur');
        setSubmitVisible(false)
        return
      }
      if (itemValue.PlanAdi.length < 2 || itemValue.PlanAdi.length > 255) {
        setSuccessMessage('')
        setError('Plan Adı en az 2 ve en fazla 255 karakter olabilir.');
        setSubmitVisible(false)
        return
      }
      if (itemValue.Aciklama.length < 3 || itemValue.Aciklama.length > 2000) {
        setSuccessMessage('')
        setError('Açıklama en az 3 ve en fazla 2000 karakter olabilir.');
        setSubmitVisible(false)
        return
      }
      const fiyat = parseFloat(itemValue.Fiyat);

      if (isNaN(fiyat) || fiyat <= 0) {
        setError("Geçerli bir Fiyat girin (0'dan büyük bir sayı).")
        setSuccessMessage('')
        setSubmitVisible(false)
        return;
      }


      setSubmitVisible(true);
      try {
        const response: any = await axios.post(`${API_URL}/abonelik-planlari/create`, itemValue, {
          headers: {
            Authorization: `Bearer ${auth?.access_token}`
          }
        });
        if (response) {
          if (response.data) {
            if (response.status === 201) {
              setitemValue({
                PlanAdi: '',
                Fiyat: '',
                Aciklama: ''
              });
              setSuccessMessage('Öğe başarıyla oluşturuldu')
              setError('');
              onOpenChange(response);
            } else {
              if (response.data?.message) {
                console.log(response.data?.message)
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
        toast.error('Öğe Oluşturma Hatası', { duration: 5000 });
      }
    }
    const handleFiyatChange = (e: any, key: 'Fiyat') => {
      let value = e.target.value;
      const regex = /^\d{0,7}([.,]?\d{0,2})?$/; // 12 basamak + ondalık kontrol

      if (regex.test(value)) {
        // Tam sayı ve ondalık kısmını ayır
        const [integerPart, decimalPart] = value.split(/[.,]/);

        // Tam kısmın 12 karakteri geçmediğinden emin ol
        if (integerPart.length <= 7) {
          // Virgülü noktaya çevirerek formatla
          const formattedValue = value.replace(',', '.');
          setitemValue({ ...itemValue, [key]: formattedValue });
        }
      }
    };


    return (
      <Dialog open={open} onOpenChange={() => onOpenChange('close')}>
        <DialogContent className="max-w-[1000px]" ref={ref}>
          <DialogHeader className="flex flex-col gap-2.5">
            <DialogTitle className="text-2xl font-bold">Yeni Abonelik Planı Ekle</DialogTitle>
            <DialogDescription>Abonelik Planı hakkında bilgi verin</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2.5 p-2.5">
            {error && <div className="text-red-700">
              <KeenIcon icon={'information-2'} />
              <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span></div>}
            {successMessage && <div className="text-lime-400">  <KeenIcon
              icon={'information-1'}
              style="solid"
              className={`text-lg leading-0 me-2`}
              aria-label={'information-1'}
            /> <span>{successMessage}</span></div>}

            <div className="flex flex-col gap-1">
              <InputLabel required>Plan Adı</InputLabel>
              <Input className="w-full"
                value={itemValue.PlanAdi}
                required
                minLength={2}
                maxLength={255}
                placeholder="Plan Adı"
                onChange={(e) => setitemValue({ ...itemValue, PlanAdi: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <InputLabel required>Fiyat</InputLabel>
              <Input className="w-full"
                value={itemValue.Fiyat}
                required
                placeholder="000,00"
                onChange={(e) => handleFiyatChange(e, 'Fiyat')} />
            </div>
            <div className="flex flex-col gap-1">
              <InputLabel required>Açıklama</InputLabel>
              <TinyMcEditor content={itemValue.Aciklama ?? ''} setContent={(value: string) => setitemValue({ ...itemValue, Aciklama: value })} />
            </div>

          </div>

          <div className="flex flex-col gap-1 mt-2.5 p-2.5">
            <Button disabled={submitVisible}
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

export { AbonelikPlanlariCreateModal };
