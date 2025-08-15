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
import { default as ReactSelect } from 'react-select';
import Countryjson from '../../../config/CountryData.json';
import Discriptjson from '../../../config/Discript.json';



interface IModalCreateitemProps {
  open: boolean;
  onOpenChange: (data: any) => void;
  item: any;
}
type UserDataType = {
  AdSoyad: string;
  id: number;
  Email: string;
}

const TeknokentUpdateModal = forwardRef<HTMLDivElement, IModalCreateitemProps>(
  ({ open, onOpenChange, item }, ref) => {
    const [itemValue, setitemValue] = useState({
      TeknokentID: 0,
      TeknokentAdi: '',
      Sehir: '',
      Ilce: '',
      KullaniciID: 0
    });
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const { auth } = useAuthContext();
    const [submitVisible, setSubmitVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const sehirler = Countryjson;
    const ilceler = Discriptjson;
    const [selectsehir,setSelectSehir] = useState<any>({});
    const [filterIlceler,setFilterIlceler] = useState<any>([]);
    const [users, setUsers] = useState<UserDataType[] | []>([]);
    // Select stilleri için ortak config
    const selectStyles = {
      control: (base: any) => ({
        ...base,
        minHeight: '40px',
        borderRadius: '6px',
        borderColor: '#e2e8f0'
      }),
      menu: (base: any) => ({
        ...base,
        zIndex: 9999
      })
    };
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/teknokentler/get-users`
        );
        if (response.data && response.data.length > 0) {
          setUsers(response.data)
        }


      } catch (error: any) {
        const message = error.response?.data?.message ?? `Veriler getirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin`;
        toast(`Bağlantı hatası`, {
          description: message,
          action: {
            label: 'Ok',
            onClick: () => { console.log('Ok') }
          }
        });
      }
    }

    useEffect(() => {
      if (open) {
        fetchUsers()
      }
    }, [open])

    const selectSehirFunc = (value:string)=>{
      const sehir:any = sehirler.find(i=>i.il_adi === value);
      setSelectSehir(sehir)
      setitemValue({ ...itemValue, Sehir: value })
    }
    useEffect(()=>{      
      const filtilceler = ilceler.filter(i=>i.il_plaka === selectsehir?.plaka);
      setFilterIlceler(filtilceler)
    },[selectsehir])



    useEffect(() => {
      if (item && item.TeknokentAdi) {
        setitemValue({
          ...itemValue,
          TeknokentAdi: item.TeknokentAdi,
          TeknokentID: Number(item.TeknokentID),
          Ilce: item.Ilce,
          Sehir: item.Sehir,
          KullaniciID:item.OwnerKullanici ? item.OwnerKullanici.id : 0
        })
        if(item.Sehir){
          const sehir:any = sehirler.find(i=>i.il_adi === item.Sehir);
      setSelectSehir(sehir)
        }
        /* if(item.Ilce){
          setitemValue({
            ...itemValue,
            Ilce: item.Ilce
          })
        } */
      }
    }, [item])

    const handleUpdateitem = async () => {
      if (!itemValue.TeknokentAdi || itemValue.TeknokentID == 0) {
        setSuccessMessage('')
        setError('Lütfen Gerekli alanları doldurun');
        return
      }
      if (submitVisible) {
        toast.error('Gerekli alanları doldurun', { duration: 2000 });
        return
      }
      if (itemValue.TeknokentAdi.length < 2 || itemValue.TeknokentAdi.length > 255) {
        setSuccessMessage('')
        setError('Teknokent adı en az 2 ve en fazla 255 karakter olabilir.');
        return
      }

      setSubmitVisible(true);
      try {

        const response: any = await axios.post(`${API_URL}/teknokentler/update`, itemValue, {
          headers: {
            Authorization: `Bearer ${auth?.access_token}`
          }
        });
        if (response) {
          if (response.data) {
            if (response.status === 201) {
              setitemValue({
                TeknokentID: 0,
                TeknokentAdi: '',
                Sehir: '',
                Ilce: '',
                KullaniciID: 0
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
            <DialogTitle className="text-2xl font-bold">Teknokent i Düzenle</DialogTitle>
            <DialogDescription>Teknokent hakkında bilgi verin</DialogDescription>
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
              <InputLabel required>Teknokent Adı</InputLabel>
              <Input className="w-full"
                value={itemValue.TeknokentAdi}
                required
                minLength={2}
                maxLength={255}
                placeholder="Teknokent Adı"
                onChange={(e) => setitemValue({ ...itemValue, TeknokentAdi: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <InputLabel required>Şehir</InputLabel>
              <ReactSelect
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                name="sehir"
                value={itemValue.Sehir ? {
                  value: itemValue.Sehir,
                  label: itemValue.Sehir
                } : null}
                options={sehirler.map((sehir:any) => ({
                  value: sehir.il_adi,
                  label: sehir.il_adi
                }))}
                placeholder="Şehir seçin..."
                onChange={(selected: any) => selectSehirFunc(selected ? selected.value : '')}
                styles={selectStyles}
              />
            </div>

            <div className="flex flex-col gap-1">
              <InputLabel required>İlçe</InputLabel>
              <ReactSelect
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                isDisabled={itemValue.Sehir.length < 1}
                name="ilce"
                value={itemValue.Ilce ? {
                  value: itemValue.Ilce,
                  label: itemValue.Ilce
                } : null}
                options={filterIlceler.map((ilce:any) => ({
                  value: ilce.ilce_adi,
                  label: ilce.ilce_adi
                }))}
                placeholder="İlçe seçin..."
                onChange={(selected: any) =>
                  setitemValue({
                    ...itemValue,
                    Ilce: selected ? selected.value : ''
                  })
                }
                styles={selectStyles}
              />
            </div>

            <div className="flex flex-col gap-1">
              <InputLabel required>Kullanıcı Ata</InputLabel>
              <ReactSelect
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                name="user"
                value={itemValue.KullaniciID > 0 ? {
                  value: itemValue.KullaniciID,
                  label: item.OwnerKullanici?.AdSoyad + ' ('+item.OwnerKullanici?.Email+')'
                } : null}
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.AdSoyad} (${user.Email})`
                }))}
                placeholder="Kullanıcı seçin..."
                onChange={(selected) =>
                  setitemValue({
                    ...itemValue,
                    KullaniciID: selected ? selected.value : 0
                  })
                }
                styles={selectStyles}
              />
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

export { TeknokentUpdateModal };
