import axios from "axios";
import { produce } from "immer";
import { toast } from "sonner";

export const gruptanAyrilFunc = async (
    sohbetID: number,
    {
        sohbetler,
        setSohbetler,
        seciliSohbetId,
        setSohbetSayisi,
        setSeciliEkran,
        setSeciliSohbetId
    }: {
        sohbetler: any[],
        setSohbetler: React.Dispatch<React.SetStateAction<any[]>>,
        seciliSohbetId: number;
        setSohbetSayisi: React.Dispatch<React.SetStateAction<number>>
        setSeciliEkran: React.Dispatch<React.SetStateAction<'sohbet' | 'kisiler'>>,
        setSeciliSohbetId: React.Dispatch<React.SetStateAction<number>>;
    }
) => {
    const API_URL = import.meta.env.VITE_APP_API_URL;
    if (!sohbetID) return;

    try {
        const response = await axios.post(`${API_URL}/sohbetler/gruptan-ayril`, { sohbetID });
        if (response.status === 201) {
            const sohbet = sohbetler.find(s => s.SohbetID === sohbetID);
            if (sohbet) {
                setSohbetSayisi(prev => prev - sohbet.OkunmayanMesajSayisi);
                setSohbetler(prev =>
                    produce(prev, draft => {
                        return draft.filter(s => s.SohbetID !== sohbetID);
                    })
                );
                if (seciliSohbetId === sohbetID) {
                    setSeciliEkran('kisiler')
                    setSeciliSohbetId(0)
                }
            }
        }
    } catch (error) {
        console.log(error);
        toast.error('Bir hata oluştu lütfen daha sonra tekrar deneyin.');
    }
};
