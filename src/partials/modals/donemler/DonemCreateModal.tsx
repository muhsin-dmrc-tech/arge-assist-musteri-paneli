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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IModalCreateitemProps {
  open: boolean;
  onOpenChange: (data: any) => void;
}

const DonemCreateModal = forwardRef<HTMLDivElement, IModalCreateitemProps>(
  ({ open, onOpenChange }, ref) => {
    const [itemValue, setitemValue] = useState({
      DonemAdi: '',
      Ay: 1,
      Yil: 2024,
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
      if (!itemValue.DonemAdi) {
        setSuccessMessage('')
        setError('Donem adı zorunludur');
        return
      }
      if (itemValue.DonemAdi.length < 2 || itemValue.DonemAdi.length > 255) {
        setSuccessMessage('')
        setError('Donem adı en az 2 ve en fazla 255 karakter olabilir.');
        return
      }


      setSubmitVisible(true);
      try {
        const response: any = await axios.post(`${API_URL}/donem/create`, itemValue, {
          headers: {
            Authorization: `Bearer ${auth?.access_token}`
          }
        });
        if (response) {
          if (response.data) {
            if (response.status === 201) {
              setitemValue({
                DonemAdi: '',
                Ay: 1,
                Yil: 2024,
              });
              setSuccessMessage('Öğe başarıyla oluşturuldu')
              setError('');
               onOpenChange(response);
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
        toast.error('Öğe Oluşturma Hatası', { duration: 5000 });
      }
    }



    return (
      <Dialog open={open} onOpenChange={() => onOpenChange('close')}>
        <DialogContent className="max-w-[1000px]" ref={ref}>
          <DialogHeader className="flex flex-col gap-2.5">
            <DialogTitle className="text-2xl font-bold">Yeni Dönem Ekle</DialogTitle>
            <DialogDescription>Dönem hakkında bilgi verin</DialogDescription>
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
              <InputLabel required>Dönem Adı</InputLabel>
              <Input className="w-full"
                value={itemValue.DonemAdi}
                required
                minLength={2}
                maxLength={255}
                placeholder="Dönem Adı"
                onChange={(e) => setitemValue({ ...itemValue, DonemAdi: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <InputLabel required>Ay</InputLabel>
              <Select value={itemValue.Ay.toString()} onValueChange={(value) => setitemValue({ ...itemValue, Ay: Number(value) })} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>

                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]?.map((item: any) => (<SelectItem key={item} value={item.toString()}>{item}</SelectItem>))}

                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <InputLabel required>Yıl</InputLabel>
              <Select value={itemValue.Yil.toString()} onValueChange={(value) => setitemValue({ ...itemValue, Yil: Number(value) })} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>

                  {Array.from({ length: 2100 - 2024 + 1 }, (_, i) => 2024 + i).map((item) => (
                    <SelectItem key={item} value={item.toString()}>{item}</SelectItem>
                  ))}


                </SelectContent>
              </Select>
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

export { DonemCreateModal };
