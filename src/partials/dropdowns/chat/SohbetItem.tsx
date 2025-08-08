import { SohbetData } from "@/auth/types";
import { KeenIcon } from "@/components";
import { useAuthContext } from "@/auth";
import formatTarih from "@/hooks/formatTarih";
import getRandomColor from "@/hooks/getRandomColor";
import clsx from "clsx";
import { useSocketData } from "@/auth/SocketDataContext";
import { useUserStatus } from "@/auth/UserStatusContext";
import { renderUserStatus } from "./renderUserStatus";
import { useRef, useState } from "react";
import Portal from "@/components/Portal";
import { Menu, MenuItem, MenuSub, MenuToggle } from '@/components';
import { gruptanAyrilFunc } from "./functions";
import AlertDialog from "@/components/alert-modal/AlertDialog";


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
interface propsType {
    Sohbet: SohbetData;
    handleOpenModal: () => void;
}

const SohbetItem = ({ Sohbet, handleOpenModal }: propsType) => {
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const { currentUser } = useAuthContext();
    const { setSeciliSohbetId, setSeciliEkran, setSohbetler, seciliSohbetId, setSohbetSayisi, sohbetler } = useSocketData();
    const { getUsersStatus, getUserStatus } = useUserStatus();
    const itemChatRef = useRef<any>(null);
    const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);
    const [openAlertModal, setOpenAlertModal] = useState(false);
    const sonMesaj = Sohbet?.Mesajlar ? (Sohbet?.Mesajlar?.length > 0 ? Sohbet?.Mesajlar[Sohbet?.Mesajlar.length - 1] : Sohbet.SonMesaj ?? null) : Sohbet.SonMesaj ?? null;
    const mesajHtml = sonMesaj ? sonMesaj?.MesajIcerigi?.replace(/<br>/g, " ") : '';
    

    const bilgiBasligi = (() => {
        // Grup sohbeti kontrolü
        if (Sohbet.Kullanicilar.length > 2) {
            return Sohbet.Kullanicilar.map(i => i.Kullanici.AdSoyad).join(', ');
        }

        // Karşı kullanıcıyı bul
        const karsiKullanici = Sohbet.Kullanicilar.find(i => i.Kullanici.id !== currentUser?.id);

        if (!karsiKullanici) {
            return '';
        }

        // Kullanıcı tipine göre başlık döndür
        switch (karsiKullanici.Kullanici.KullaniciTipi) {
            case 3: // Teknokent
                return 'Teknokent Yöneticisi';

            case 1: // Firma  
                return 'Firma Yöneticisi';

            default: // Diğer tipler
                return karsiKullanici.Kullanici.Email
        }
    });
    const randomColor = (adsoyad: string) => { return getRandomColor(adsoyad.charAt(0)) };
    const sohbetKullanici = Sohbet.Kullanicilar.find(i => i.Kullanici.id !== currentUser?.id);



    const handleShow = () => {
        window.dispatchEvent(new Event('resize'));
    };

    const alertModalFunc = (data: Omit<AlertDialogProps, 'open' | 'setOpen'>) => {
        setAlertModalData(data);
        setOpenAlertModal(true);
    };
    const gruptanAyril = () => {
        if (!Sohbet) return;
        alertModalFunc({
            title: "Dikkat!",
            text: "Gruptan ayrılırsanız sohbetteki konuşmaları bir daha göremezsiniz. Devam etmek istiyormusunuz?",
            actionButton: {
                onClick: () => gruptanAyrilFunc(Sohbet.SohbetID, {
                    sohbetler,
                    setSohbetler,
                    seciliSohbetId,
                    setSohbetSayisi,
                    setSeciliEkran,
                    setSeciliSohbetId
                }),
                text: "Devam et"
            },
            closeButton: {
                onClick: () => setOpenAlertModal(false),
                text: "İPTAL"
            }
        });
    }




    return (
        <div
            className={`shadow-card border relative flex w-full justify-between rounded-lg border-gray-200 py-2.5 cursor-pointer hover:shadow-md duration-300`}
        >

            <div className="flex items-center w-full justify-between flex-wrap gap-2 px-2"
                onClick={() => { setSeciliSohbetId(Sohbet.SohbetID); handleOpenModal(); setSeciliEkran('sohbet') }}
            >
                <div className="flex items-center flex-wrap gap-2">
                    <div className="relative flex items-center justify-center shrink-0 rounded-full bg-gray-100 border border-gray-200 size-11">
                        {Sohbet.Kullanicilar.length == 2 ?
                            sohbetKullanici?.Kullanici.ProfilResmi ? <img
                                src={`${API_URL + sohbetKullanici?.Kullanici.ProfilResmi}`}
                                className="rounded-full size-9 shrink-0"
                                alt={`${sohbetKullanici?.Kullanici.AdSoyad}`}
                            /> : <span
                                className={clsx('flex items-center justify-center size-9 rounded-full border-2 border-success  text-sm font-semibold',
                                    `text-${randomColor(sohbetKullanici?.Kullanici.AdSoyad ?? 'b')}-inverse`,
                                    `ring-${randomColor(sohbetKullanici?.Kullanici.AdSoyad ?? 'c')}-light`,
                                    `bg-${randomColor(sohbetKullanici?.Kullanici.AdSoyad ?? 'a')}`
                                )}>
                                {Sohbet.Kullanicilar.find(i => i.Kullanici.id !== currentUser?.id)?.Kullanici.AdSoyad?.slice(0, 1).toLocaleUpperCase('tr-TR')}
                            </span> :
                            <span className="flex items-center justify-center size-9 rounded-full border-2 border-success  text-sm font-semibold text-white bg-red-400">
                                {Sohbet.Kullanicilar.length} <KeenIcon icon="users" />
                            </span>

                        }
                        {currentUser && renderUserStatus({
                            Sohbet: Sohbet,
                            currentUserID: currentUser.id,
                            getUsersStatus: getUsersStatus,
                            getUserStatus: getUserStatus
                        })}

                    </div>

                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-2xs  max-w-[250px] max-md:max-w-[100px] rounded-md px-2 font-medium bg-gray-200 text-gray-500">
                            <div className="truncate block max-w-full">{bilgiBasligi()}</div>
                        </span>
                        <span className="text-2sm font-semibold text-gray-900 hover:text-primary-active"
                        >
                            {Sohbet.Kullanicilar.length == 2 ? sohbetKullanici?.Kullanici.AdSoyad : Sohbet.GrupAdi}

                        </span>

                    
                        {Sohbet?.YazıyorData &&
                            Sohbet?.YazıyorData?.Durum ?
                            <span className="text-2xs font-medium italic text-gray-500 truncate block max-md:max-w-[100px] max-w-[200px]">
                                {Sohbet?.YazıyorData?.KullaniciAdi?.split(' ')[0]}: yazıyor..</span>
                            : <span className="text-2xs font-medium italic text-gray-500 truncate block max-md:max-w-[100px] max-w-[200px] pe-1">
                                <span className="not-italic text-gray-700">
                                    {sonMesaj?.GonderenKullaniciID === currentUser?.id ? 'Sen' : sonMesaj?.GonderenKullanici?.AdSoyad?.split(' ')[0]}:
                                </span>
                                {sonMesaj?.Dosyalar && sonMesaj?.Dosyalar.length > 0 ? 'Dosya gönderdi' : mesajHtml}
                            </span>}

                    </div>
                </div>

                <div className="flex flex-col items-end gap-0.5 absolute top-[20px] right-[25px]">
                    {Sohbet.OkunmayanMesajSayisi > 0 && <span className="flex items-center justify-center size-6 rounded-full text-2xs text-green-700 bg-green-100">
                        {Sohbet.OkunmayanMesajSayisi > 99 ? '99+' : Sohbet.OkunmayanMesajSayisi}
                    </span>}
                </div>






            </div>

            {Sohbet.SohbetTipi === 'grup' && <Menu>
                <MenuItem
                    ref={itemChatRef}
                    onShow={handleShow}
                    toggle="dropdown"
                    trigger="click"
                    dropdownProps={{
                        placement: 'bottom-start',
                        modifiers: [
                            {
                                name: 'offset',
                                options: {
                                    offset: [-120, 0]
                                }
                            }
                        ]
                    }}
                >
                    <MenuToggle className="btn btn-icon btn-icon-lg relative size-9 rounded-full hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500">
                        <KeenIcon icon="dots-circle-vertical" />
                    </MenuToggle>
                    <MenuSub rootClassName="w-full max-w-[150px] max-h-[150px]" className="light:border-gray-300">
                        {Sohbet.SohbetTipi === 'grup' && <button onClick={gruptanAyril}>Gruptan ayrıl</button>}
                    </MenuSub>
                </MenuItem>
            </Menu>}

            {alertModalData.actionButton && <AlertDialog
                open={openAlertModal}
                setOpen={setOpenAlertModal}
                title={alertModalData.title}
                text={alertModalData.text}
                actionButton={alertModalData.actionButton}
                closeButton={alertModalData.closeButton}
            />}
        </div >
    );
};

export default SohbetItem;