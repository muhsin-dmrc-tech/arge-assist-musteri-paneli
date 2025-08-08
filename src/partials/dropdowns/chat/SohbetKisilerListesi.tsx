import { useAuthContext } from "@/auth";
import { useSocketData } from "@/auth/SocketDataContext";
import clsx from "clsx";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";





interface propsType {
    selectedUserIds: number[];
    setSelectedUserIds: Dispatch<SetStateAction<number[]>>;
    setGrupAdi: Dispatch<SetStateAction<string>>;
    grupAdi: string;
    sohbeteBasla: (secilenler: number[]) => void;
    setSohbetFirmalarID: Dispatch<SetStateAction<number[]>>;
    setSohbetTeknokentlerID: Dispatch<SetStateAction<number[]>>;
}

export default function SohbetKisileriListesi({ selectedUserIds, sohbeteBasla, setSelectedUserIds, grupAdi, setGrupAdi, setSohbetFirmalarID, setSohbetTeknokentlerID }: propsType) {
    const { currentUser } = useAuthContext();
    const { sohbetKisileri } = useSocketData();
    const [butonError, setButonError] = useState(false);
    const [butonError1, setButonError1] = useState(false);
    const { pathname } = useLocation();
    const [grupIslemi, setGrupIslemi] = useState(false);
    const API_URL = import.meta.env.VITE_APP_API_URL;

    const isChecked = useCallback(
        (id: number) => selectedUserIds.includes(id),
        [selectedUserIds]
    );

    const toggleUser = (id: number) => {
        if (grupIslemi) {
            if (isChecked(id)) {
                setSelectedUserIds((prev) => prev.filter(uid => uid !== id));
            } else {
                setSelectedUserIds((prev) => [...prev, id]);
            }

        } else {
            setSelectedUserIds([id]);
            sohbeteBasla([id])
        }

    };



    useEffect(() => {
        // Seçili kullanıcı yoksa setleri sıfırla
        if (selectedUserIds.length === 0) {
            setSohbetTeknokentlerID([]);
            setSohbetFirmalarID([]);
            setGrupAdi('');
            return;
        } else {
            setButonError1(false);
            if (selectedUserIds.length > 1 && grupAdi.length > 1) {
                setButonError(false);
            }
        }

        // Her seçili kullanıcı için grup bilgilerini topla
        const firmaIds = new Set<number>();
        const teknokentIds = new Set<number>();
        let grupAdiSet = false;

        // Her seçili kullanıcı için tüm grupları kontrol et
        selectedUserIds.forEach(selectedId => {
            sohbetKisileri.forEach(grup => {
                // Firma kullanıcıları kontrolü
                const firmaKullanicisiMi = grup.kullanicilar.some(u => u.id === selectedId);
                if (firmaKullanicisiMi && grup.grupID) {
                    firmaIds.add(grup.grupID);
                    if (!grupAdiSet) {
                        setGrupAdi(grup.grupAdi || '');
                        grupAdiSet = true;
                    }
                }
            });
        });

        // Benzersiz firma ve teknokent ID'lerini state'e kaydet
        setSohbetFirmalarID(Array.from(firmaIds));
        setSohbetTeknokentlerID(Array.from(teknokentIds));

    }, [selectedUserIds, sohbetKisileri]);

    /*  const toggleGroup = (userIds: number[]) => {
         setSelectedUserIds(prev => {
             const allSelected = userIds.every(id => prev.includes(id));
 
             if (allSelected) {
                 const newSelected = prev.filter(id => !userIds.includes(id));
                 setGrupIslemi(false); // Hepsi kaldırılıyorsa grup işlemi iptal
                 return newSelected;
             } else {
                 setGrupIslemi(true); // Eksik varsa grup işlemi aktif
                 return [...new Set([...prev, ...userIds])];
             }
         });
     }; */





    const filterlist = sohbetKisileri
        .map(grup => ({
            ...grup,
            kullanicilar: grup.kullanicilar.filter(k => k.id !== currentUser?.id)
        }))
        .filter(grup => grup.kullanicilar.length > 0);
    const temizlenmisSohbetKisileri = filterlist;



    useEffect(() => {
        if (grupAdi.length > 0) {
            setButonError(false)
        }
    }, [grupAdi])





    return (
        <div className="w-full flex flex-col h-full max-h-[100vh] justify-between flex-1 gap-4 p-3">
            <div className={`flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${pathname === '/sohbetler' && 'min-h-[550px]'}`}>
                <div className="flex flex-col gap-3">
                    <h2 className="text-xl max-md:text-md font-semibold">Sohbet Edebileceğiniz Kişiler</h2>

                    <label className="flex flex-row items-center gap-2 p-1">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={grupIslemi}
                            onChange={() => { setGrupIslemi(!grupIslemi) }}
                        />
                        <span className="text-sm max-md:text-xs">Yeni Grup ({selectedUserIds.length})</span>
                    </label>



                </div>

                {temizlenmisSohbetKisileri.map((grup, grupIndex) => {
                    const grupKullanicilar = grup.kullanicilar || [];

                    const allUsers: typeof grupKullanicilar = [];

                    if (grupKullanicilar?.length) {
                        allUsers.push(...grupKullanicilar);
                    }
                    const allUserIds = allUsers.map(u => u.id);

                    const grupSecildiMi = allUserIds.length > 0 && allUserIds.every(id => selectedUserIds.includes(id));


                    return (
                        <div key={grupIndex} className="p-2 mb-2">
                            <div className={clsx("flex-col items-center mb-2 gap-2",
                                grupIslemi && grupSecildiMi && 'bg-green-200'
                            )}
                            >

                                {grupIndex !== 0 && <div className="h-0.5 bg-gray-500 w-full mb-3"></div>}
                                <div className="flex flex-row items-center justify-start w-full gap-1">
                                    {grup.logo ? (
                                        <img
                                            src={`${API_URL + grup.logo}`}
                                            className="rounded-full w-9 h-9 flex-shrink-0 border border-primary"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center min-w-9 min-h-9 rounded-full border-2 border-green-500 bg-red-400">
                                            <span className="text-sm font-semibold text-white">
                                                {grup.grupAdi?.slice(0, 1).toLocaleUpperCase('tr-TR')}
                                            </span>
                                        </div>
                                    )}
                                    < span
                                        className="text-xs font-medium flex flex-wrap max-w-[90%]"
                                    >
                                        {grup.grupAdi}
                                    </span>
                                </div>

                            </div>


                            <div className="flex flex-col gap-2">
                                {grupKullanicilar.map((kullanici, i) => (
                                    <button
                                        key={`firma-${grupIndex}-${i}`}
                                        className={clsx("flex-row items-center gap-2 p-2 rounded-lg bg-white",
                                            grupIslemi && isChecked(kullanici.id) && 'bg-green-200'
                                        )}
                                        onClick={() => toggleUser(kullanici.id)}
                                    >

                                        <div className="flex flex-row items-center justify-start w-full gap-2">
                                            {kullanici.profilResmi ? (
                                                <img
                                                    src={`${API_URL + kullanici.profilResmi}`}
                                                    className="rounded-full w-9 h-9 flex-shrink-0 border border-primary"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center min-w-9 min-h-9 rounded-full border-2 border-green-500 bg-red-400">
                                                    <div className="text-sm font-semibold text-white">
                                                        {kullanici.adSoyad?.slice(0, 1).toLocaleUpperCase('tr-TR')}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex flex-col items-start justify-center w-full">
                                                <div
                                                    className="text-xs font-medium flex flex-wrap max-w-full"
                                                >
                                                    {kullanici.adSoyad}
                                                </div>
                                                <div
                                                    className="text-xs font-medium text-gray-500 flex flex-wrap max-w-full"
                                                >
                                                    {kullanici.email}
                                                </div>

                                            </div>


                                        </div>

                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>



            {grupIslemi && selectedUserIds.length > 1 &&
                <div className="flex flex-col gap-2">
                    <>
                        <label htmlFor="grupadi">Grup Adı Giriniz* {butonError && <span className="text-red-700">Grup adı zorunludur</span>}</label>
                        <input type="text" id="grupadi"
                            value={grupAdi}
                            className="input"
                            placeholder="Grup adı giriniz..."
                            onChange={(e) => { e.target.value.length < 31 && setGrupAdi(e.target.value) }}
                        />
                    </>
                    {butonError1 && <span className="text-red-700">En az bir kişi seçilmelidir</span>}
                    <button
                        onClick={() => { (selectedUserIds.length > 2 && grupAdi.length < 1) ? setButonError(true) : (selectedUserIds.length < 2) ? setButonError1(true) : sohbeteBasla(selectedUserIds) }}
                        className="btn btn-success flex justify-center"
                    >Sohbete Başla</button>
                </div>}
        </div>
    );
}
