import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ITemplateData {
    SozlesmeID: number;
    Baslik: string;
    Aciklama: string;
    Anahtar: string;
}

const SozlesmelerModal = ({ open, setOpen, anahtar }: { open: boolean; setOpen: (value: boolean) => void; anahtar: string }) => {
    const [item, setItem] = useState({} as ITemplateData);
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const fetchItem = async () => {
        try {
            const response = await fetch(`${API_URL}/sozlesmeler/get-sozlesme-item/${anahtar}`);
            const data = await response.json();
            if (data && data?.SozlesmeID) {
                setItem(data)
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
        }
    };

    useEffect(() => {
        if (anahtar && open) {
            fetchItem();
        } else {
            setItem({} as ITemplateData)
        }
    }, [anahtar, open])


    return (
        <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[1000px] w-[90%] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="flex flex-col gap-2.5">
                <DialogTitle className="text-2xl font-bold break-words">{item.Baslik}</DialogTitle>
                <DialogDescription></DialogDescription>
            </DialogHeader>
            <DialogBody className="overflow-y-auto">
                <div 
                    className="text-gray-600 text-base leading-normal  break-words" 
                    dangerouslySetInnerHTML={{ __html: item.Aciklama }} 
                />
            </DialogBody>
        </DialogContent>
    </Dialog>
    )
}

export default SozlesmelerModal