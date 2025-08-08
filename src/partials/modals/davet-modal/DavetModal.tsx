import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { useAuthContext } from '@/auth';
import axios from 'axios';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';

const DavetModal = ({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) => {

    const { currentUser, auth, setCurrentUser } = useAuthContext();
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const [submitVisible, setSubmitVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!currentUser) {
        if (setOpen) {
            setOpen(false)
        }
    }
    // Hangi davet tipinin kullanılacağını belirle
    const isDavetler = currentUser?.davetler && currentUser?.davetler?.length > 0;


    const davetCevapFunc = async (DavetID: number, Cevap: 'Onaylandı' | 'Reddedildi') => {
        try {
            const response: any = await axios.post(`${API_URL}/kullanici-davetleri/cevap`, { DavetID, Cevap }, {
                headers: {
                    Authorization: `Bearer ${auth?.access_token}`
                }
            });
            if (response) {
                if (response.data) {
                    if (response.status === 201) {
                        setCurrentUser(prevUser => {
                            if (!prevUser) return prevUser;
                            return {
                                ...prevUser,
                                davetler: (prevUser.davetler ?? []).map(davet =>
                                    davet.id === DavetID ? { ...davet, Durum: Cevap } : davet
                                )
                            };
                        });
                        setSuccessMessage('İşlem tamamlandı')
                        setError('');

                    } else {
                        if (response.data?.message) {
                            setSuccessMessage('')
                            setError(response.data?.message);
                        }
                        toast.error('Davet Cevaplama Hatası' + response.data?.message, { duration: 5000 });
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
        <Dialog open={open} onOpenChange={() => setOpen(false)}>
            <DialogContent className="max-w-[500px]">
                <DialogHeader className="flex flex-col gap-2.5">
                    <DialogTitle className="text-2xl font-bold">Yöneticilik davetleri</DialogTitle>
                    <DialogDescription>Yönetici olman için sana gönderilen davetler.</DialogDescription>

                    {error && <div className="text-red-700">
                        <KeenIcon icon={'information-2'} />
                        <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span></div>}
                    {successMessage && <div className="text-lime-400">  <KeenIcon
                        icon={'information-1'}
                        style="solid"
                        className={`text-lg leading-0 me-2`}
                        aria-label={'information-1'}
                    /> <span>{successMessage}</span></div>}



                    {isDavetler &&
                        currentUser?.davetler?.map((item) => (
                            item.Durum === null &&
                            <div key={item.id} className="flex flex-col gap-5">
                                {item.Tip !== 3 ?
                                    <div className=''>
                                        Merhaba <span className='font-bold'>{currentUser?.AdSoyad}</span>, <br />
                                        <span className='font-bold'>{item.DavetciKullanici?.AdSoyad}</span> adlı
                                        kullanıcı seni <span className='font-bold'>{item.Firma?.FirmaAdi}</span> adlı firmaya yönetici olman için davet ediyor.
                                    </div>
                                    :
                                    <div className=''>
                                        Merhaba <span className='font-bold'>{currentUser?.AdSoyad}</span>, <br />
                                        <span className='font-bold'>{item.DavetciKullanici?.AdSoyad}</span> adlı
                                        kullanıcı seni <span className='font-bold'>{item.Teknokent?.TeknokentAdi}</span> adlı Teknokent'e yönetici olman için davet ediyor.
                                    </div>}

                                <div className="flex flex-row gap-3 justify-between">
                                    <button disabled={submitVisible} onClick={() => davetCevapFunc(item.id, 'Onaylandı')} className='btn btn-success'>Kabul Et</button>
                                    <button disabled={submitVisible} onClick={() => davetCevapFunc(item.id, 'Reddedildi')} className='btn btn-warning'>Reddet</button>
                                </div>
                            </div>)
                        )

                    }

                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default DavetModal