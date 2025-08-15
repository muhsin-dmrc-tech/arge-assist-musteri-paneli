import React, { forwardRef, useEffect, useState } from 'react';
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



interface IModalCreateitemProps {
  open: boolean;
  onOpenChange: (data: any) => void;
  item: any;
}

const RotaIzinleriUpdateModal = forwardRef<HTMLDivElement, IModalCreateitemProps>(
  ({ open, onOpenChange, item }, ref) => {
    const [itemValue, setitemValue] = useState({
      id: 0,
      Tanim: '',
      Anahtar: '',
      Bolum: '',
      Type: ''
    });
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const { auth } = useAuthContext();
    const [submitVisible, setSubmitVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);



    useEffect(() => {
      if (item && item.Tanim) {
        setitemValue({
          Tanim: item.Tanim,
          Anahtar: item.Anahtar,
          Bolum: item.Bolum,
          Type: item.Type,
          id: Number(item.id)
        })
      }
    }, [item])

    const handleUpdateitem = async () => {
      if (!itemValue.Tanim || !itemValue.Anahtar || itemValue.id == 0 || !itemValue.Type) {
        setSuccessMessage('')
        setError('Lütfen Gerekli alanları doldurun');
        return
      }
      if (submitVisible) {
        toast.error('Gerekli alanları doldurun', { duration: 2000 });
        return
      }
      if (itemValue.Tanim.length < 2 || itemValue.Tanim.length > 255) {
        setSuccessMessage('')
        setError('Tanim en az 2 ve en fazla 255 karakter olabilir.');
        return
      }

      if (itemValue.Anahtar.length < 2 || itemValue.Anahtar.length > 50) {
        setSuccessMessage('')
        setError('Anahtar en az 2 ve en fazla 50 karakter olabilir.');
        return
      }
      if (itemValue.Bolum.length < 2 || itemValue.Bolum.length > 50) {
        setSuccessMessage('')
        setError('Bölüm en az 2 ve en fazla 50 karakter olabilir.');
        return
      }

      if (itemValue.Type.length < 2 || itemValue.Type.length > 50) {
        setSuccessMessage('')
        setError('Type en az 2 ve en fazla 50 karakter olabilir.');
        return
      }

      setSubmitVisible(true);
      try {

        const response: any = await axios.post(`${API_URL}/rota-izinleri/update`, itemValue, {
          headers: {
            Authorization: `Bearer ${auth?.access_token}`
          }
        });
        if (response) {
          if (response.data) {
            if (response.status === 201) {
              setitemValue({
                id: 0,
                Tanim: '',
                Anahtar: '',
                Bolum: '',
                Type: ''
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
        toast.error('Öğe güncelleme hatası', { duration: 5000 });
      }

    }


    return (
      <Dialog open={open} onOpenChange={() => onOpenChange('close')}>
        <DialogContent className="max-w-[1000px]" ref={ref}>
          <DialogHeader className="flex flex-col gap-2.5">
            <DialogTitle className="text-2xl font-bold">Rota İzni ni Düzenle</DialogTitle>
            <DialogDescription>Rota izni hakkında bilgi verin</DialogDescription>
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
              <InputLabel required>Anahtar</InputLabel>
              <Input className="w-full"
                value={itemValue.Anahtar}
                required
                minLength={2}
                maxLength={50}
                placeholder="Anahtar"
                onChange={(e) => setitemValue({ ...itemValue, Anahtar: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <InputLabel required>Tanım</InputLabel>
              <Input className="w-full"
                value={itemValue.Tanim}
                required
                minLength={2}
                maxLength={255}
                placeholder="Tanim"
                onChange={(e) => setitemValue({ ...itemValue, Tanim: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <InputLabel required>Tip</InputLabel>
              <Input className="w-full"
                value={itemValue.Type}
                required
                minLength={2}
                maxLength={50}
                placeholder="Tip"
                onChange={(e) => setitemValue({ ...itemValue, Type: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1">
              <InputLabel required>Bölüm</InputLabel>
              <Input className="w-full"
                value={itemValue.Bolum}
                required
                minLength={2}
                maxLength={50}
                placeholder="Bölüm"
                onChange={(e) => setitemValue({ ...itemValue, Bolum: e.target.value })} />
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-2.5 p-2.5">
            <Button disabled={submitVisible}
              className="w-full text-white"
              variant="contained"
              onClick={handleUpdateitem}>
              Kaydet
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    );
  }
);

export { RotaIzinleriUpdateModal };
