// context/SocketDataContext.tsx

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { GrupData, IBildirimData, SohbetData, SohbetMessage } from './types'; // tiplerini senin projene göre ayarla
import axios from 'axios';
import { useAuthContext } from './useAuthContext';
import { produce } from "immer";
import { toast } from 'react-toastify';
import { useLocation, useParams } from 'react-router';

type ContextType = {
    bildirimler: IBildirimData[];
    setBildirimler: React.Dispatch<React.SetStateAction<IBildirimData[]>>;
    bildirimSayisi: number;
    setBildirimSayisi: React.Dispatch<React.SetStateAction<number>>;
    bildirimPage: number;
    setBildirimPage: React.Dispatch<React.SetStateAction<number>>;
    totalPageBildirim: number;
    setTotalPageBildirim: React.Dispatch<React.SetStateAction<number>>;
    handleBildirimGeldi: (data: any) => void;
    handleBildirimOkundu: (data: any) => void;
};

const SocketDataContext = createContext<ContextType | undefined>(undefined);



const SocketDataProvider = ({ children }: { children: React.ReactNode }) => {
    const [bildirimler, setBildirimler] = useState<IBildirimData[]>([]);
    const [bildirimSayisi, setBildirimSayisi] = useState(0);
    const [bildirimPage, setBildirimPage] = useState(1);
    const [totalPageBildirim, setTotalPageBildirim] = useState<number>(0);
    const { currentUser, auth } = useAuthContext();
    const islenmisBildirimler = useRef<Set<number>>(new Set());
    const [seciliEkran, setSeciliEkran] = useState<'sohbet' | 'kisiler'>('sohbet');
    const { pathname } = useLocation();


  
    const bildirimlerRef = useRef<IBildirimData[]>(bildirimler);
    useEffect(() => {
        bildirimlerRef.current = bildirimler;
    }, [bildirimler]);







    const handleBildirimGeldi = (data: any) => {
        if (data.KullaniciID === currentUser?.id) {

            if (islenmisBildirimler.current.has(data.KullaniciID)) return;
            islenmisBildirimler.current.add(data.KullaniciID);
            const exists = bildirimlerRef.current.find(b => b.KullaniciBildirimID === data.KullaniciBildirimID);
            if (!exists) {
                setBildirimler(prev => [data, ...prev]);
                toast.info(`${data.Baslik || 'Bildirim'}: ${data.Icerik?.slice(0, 50)}`, {
                    position: 'top-right',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    };

    const handleBildirimOkundu = (data: any) => {
        if (data.KullaniciID === currentUser?.id) {
            setBildirimler(prev =>
                prev.map(b =>
                    b.KullaniciBildirimID === data.BildirimID
                        ? { ...b, OkunduMu: true }
                        : b
                )
            );
            setBildirimSayisi(prev => prev - 1)
        }
    };





 

   

    return (
        <SocketDataContext.Provider
            value={{
                bildirimler,
                setBildirimler,
                bildirimSayisi,
                setBildirimSayisi,
                bildirimPage,
                setBildirimPage,
                totalPageBildirim,
                setTotalPageBildirim,
                handleBildirimOkundu,
                handleBildirimGeldi
            }}
        >
            {children}
        </SocketDataContext.Provider>
    );
};

const useSocketData = () => {
    const context = useContext(SocketDataContext);

    if (!context) throw new Error('SocketDataContext must be used within AuthProvider');

    return context;
};

export { SocketDataProvider, useSocketData };
