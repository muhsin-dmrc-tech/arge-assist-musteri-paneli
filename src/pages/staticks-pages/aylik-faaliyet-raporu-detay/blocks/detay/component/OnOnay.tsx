import React, { useEffect, useState } from 'react'
import { Skeleton } from '@mui/material';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuthContext } from '@/auth';
import { cn } from '@/lib/utils';
import AlertDialog from '@/components/alert-modal/AlertDialog';
import { ProjeRaporuType, SurecKayitlariType } from '@/pages/dokuman-yukleme-modulu/types';


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
interface StepProps {
    projeRaporu: ProjeRaporuType;
    handleSubmit: (durum: 'onaylandi' | 'reddedildi', surecAnahtar: string, aciklama: string | null) => Promise<any>;
}
const OnOnay = ({ projeRaporu, handleSubmit }: StepProps) => {
    const [loading, setLoading] = useState(false);
    const [aciklama, setAciklama] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [surecKayitlari, setSurecKayitlari] = useState<SurecKayitlariType[]>([]);
    const { currentUser } = useAuthContext();
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const [openAlertModal, setOpenAlertModal] = useState(false);
    const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);

    const fetchSurecKayitlari = async () => {
        if (!projeRaporu.ID) return;
        const queryParams = new URLSearchParams();
        queryParams.set('surec', 'Onay');
        queryParams.set('zaman', 'ay');
        if (projeRaporu?.ID) {
            queryParams.set('raporId', String(projeRaporu.ID));
        }

        try {
            setLoading(true)
            const response = await axios.get(`${API_URL}/dokumanlar/surec-kayitlari?${queryParams.toString()}`);
            if (response.status !== 200) {
                return;
            }
            if (response.data) {
                const surecKayitlari = response.data;
                setSurecKayitlari(surecKayitlari);

            } else {
                setSurecKayitlari([]);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchSurecKayitlari()
    }, [projeRaporu])


    const handleCevapSubmit = async (durum: 'onaylandi' | 'reddedildi') => {
        setError('')
        if (!durum) return;
        if (durum === 'reddedildi') {
            if (aciklama.length < 1) {
                setError('Lütfen açıklama alanını doldurun. Red işleminde açıklama zorunludur.')
                return;
            }

        }
        const response = await handleSubmit(durum, 'aylik-faaliyet-on-onay', aciklama);
        if (response && response.status === 201) {
            setAciklama('');
            setSuccessMessage('İşlem başarıyla tamamlandı.')
            if (response.data) {
                const surecKayitlari = response.data;
                setSurecKayitlari(surecKayitlari);
            } else {
                setSurecKayitlari([]);
            }
        }
    }

    const alertModalFunc = (data: Omit<AlertDialogProps, 'open' | 'setOpen'>) => {
        setAlertModalData(data);
        setOpenAlertModal(true);
    };


    return (
        <div className="flex flex-col gap-3 justify-center items-center py-4 w-full">
            {alertModalData.actionButton && <AlertDialog
                open={openAlertModal}
                setOpen={setOpenAlertModal}
                title={alertModalData.title}
                text={alertModalData.text}
                actionButton={alertModalData.actionButton}
                closeButton={alertModalData.closeButton}
            />}
            {loading ?
                <div className="flex flex-col gap-4">
                    <Skeleton
                        variant="rectangular"
                        height={80}
                        animation="wave"
                        style={{ borderRadius: 8 }}
                    />
                </div> :
                (<div className="flex flex-col gap-2">
                    {surecKayitlari &&
                        <div className="flex flex-col min-h-[60px] w-full border-t">
                            {surecKayitlari.map((s, index) =>
                                <div key={index} className='flex flex-col'>
                                    <div className="flex gap-1">
                                        <div className="flex flex-row items-center justify-end pr-3 gap-2 min-w-[120px] max-w-[120px] py-2">
                                            <div className="flex flex-col text-3xs">
                                                <div className="flex flex-col items-end">
                                                    <span className='font-semibold truncate block max-w-[120px]'>{s.Kullanici.AdSoyad}</span>
                                                    <span>{format(s.BaslamaZamani, 'dd/MM/yyy')}</span>
                                                    <span>{format(s.BaslamaZamani, 'HH:mm')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-auto min-h-[60px] border-l-[1px] border-gray-700 flex justify-center items-center">
                                            <span
                                                className={cn(
                                                    'bg-white border-[2px] left-[-8px] rounded-full h-[16px] w-[16px] relative',
                                                    {
                                                        'border-green-500': s.BitirmeZamani && s.Durum === 'Tamamlandı',
                                                        'border-yellow-500': !s.BitirmeZamani && s.Durum === 'İncelemede',
                                                        'border-red-500': s.BitirmeZamani && s.Durum === 'Reddedildi',
                                                    }
                                                )}
                                            ></span>
                                        </div>

                                        <div className="flex flex-col justify-center py-2">
                                            <div className="text-sm font-semibold">
                                                {s.Adim.AdimAdi}
                                            </div>
                                            <div className={cn(
                                                'text-xs font-semibold',
                                                {
                                                    'text-green-500': s.Durum === 'Tamamlandı',
                                                    'text-yellow-500': s.Durum === 'İncelemede',
                                                    'text-red-500': s.Durum === 'Reddedildi'
                                                }
                                            )}>
                                                {s.Durum}
                                            </div>

                                            {s.Aciklama && surecKayitlari.length !== index + 1 &&
                                                <div className="text-xs italic text-gray-500 block max-w-[300px] pr-1">
                                                    "{s.Aciklama}"
                                                </div>
                                            }
                                        </div>

                                    </div>


                                    {s.Durum === 'Tamamlandı' && surecKayitlari.length === (index + 1) && s.KullaniciID === currentUser?.id &&
                                        <div className="border rounded-lg border-green-500 flex flex-col w-fit p-3 gap-3">
                                            {s.Aciklama && <div className="text-xs italic text-gray-700">
                                                "{s.Aciklama}"
                                            </div>}
                                            <div className="text-md text-green-500 flex gap-1 items-center">
                                                <KeenIcon icon='check-circle' />
                                                Onay süreci tamamlandı.</div>
                                        </div>}
                                </div>
                            )
                            }

                        </div>
                    }


                </div>)

            }

            {successMessage && <span className='text-md text-green-500'><KeenIcon icon='check' className='mr-1' /> {successMessage}</span>}
            {!projeRaporu.Onaylimi &&
                (surecKayitlari.length > 0 && surecKayitlari[surecKayitlari.length - 1]?.KullaniciID !== currentUser?.id ||
                    (surecKayitlari[surecKayitlari.length - 1]?.KullaniciID === currentUser?.id && surecKayitlari[surecKayitlari.length - 1]?.Durum === 'İncelemede')) &&
                <>
                    <h4 className='text-xlg font-bold'>Onay için gerekli dosyalar tamamlandı !</h4>
                    <span className='text-gary-700'>Onay süreci için gerekli dosyalar yukarıdaki alanda incelemenize sunulmuştur.</span>
                    {error && <span className='text-md text-red-500'>{error}</span>}
                    <textarea
                        className='w-full min-h-[100px] rounded-md p-4 outline-0 outline-offset-0 border'
                        value={aciklama}
                        onChange={(e) => setAciklama(e.target.value)}
                        placeholder='Açıklama...'
                    />
                    <div className="flex items-center gap-2">
                        <button onClick={() => {
                            alertModalFunc({
                                title: "Süreci reddetmek istediğinize eminmisiniz?",
                                actionButton: {
                                    onClick: () => handleCevapSubmit('reddedildi'),
                                    text: "Devam et"
                                },
                                closeButton: {
                                    onClick: () => setOpenAlertModal(false),
                                    text: "Vazgeç"
                                }
                            });

                        }} className='btn btn-warning'>Reddet</button>
                        <button onClick={() => {
                            alertModalFunc({
                                title: "Süreci onaylamak istediğinize eminmisiniz?",
                                actionButton: {
                                    onClick: () => handleCevapSubmit('onaylandi'),
                                    text: "Devam et"
                                },
                                closeButton: {
                                    onClick: () => setOpenAlertModal(false),
                                    text: "Vazgeç"
                                }
                            });

                        }} className='btn btn-success'>Onayla</button>


                    </div>
                </>
            }

        </div>
    )
}

export default OnOnay
