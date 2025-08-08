import { useSocketData } from "@/auth/SocketDataContext";
import { SohbetData } from "@/auth/types";
import { KeenIcon } from "@/components";
import { Link, useNavigate } from "react-router-dom";
import { renderUserStatus } from "./renderUserStatus";
import { useUserStatus } from "@/auth/UserStatusContext";
import { useAuthContext } from "@/auth";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Menu, MenuItem, MenuSub, MenuToggle } from '@/components';
import { gruptanAyrilFunc } from "./functions";
import AlertDialog from "@/components/alert-modal/AlertDialog";


interface Props {
    isLoading: boolean;
    selectedUserIds: number[];
    grupAdi: string;
    sohbetId?: number;
}

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

const BuildTopbar: React.FC<Props> = ({ isLoading, selectedUserIds, grupAdi, sohbetId }: Props) => {

    const { sohbetler, seciliSohbetId, setSeciliSohbetId, sohbetKisileri, setSohbetler, sohbetSayisi, setSohbetSayisi, setSeciliEkran } = useSocketData();
    const { getUsersStatus, getUserStatus } = useUserStatus();
    const { currentUser, setOpenSohbetModal } = useAuthContext();
    const seciliSohbet = useRef<SohbetData | null>(null);
    const API_URL = import.meta.env.VITE_APP_API_URL;
    const itemChatRef = useRef<any>(null);
    const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);
    const [openAlertModal, setOpenAlertModal] = useState(false);
    const navigate = useNavigate();

    const alertModalFunc = (data: Omit<AlertDialogProps, 'open' | 'setOpen'>) => {
        setAlertModalData(data);
        setOpenAlertModal(true);
    };

    const handleShow = () => {
        window.dispatchEvent(new Event('resize'));
    };




    const gruptanAyril = () => {
        if (!sohbetId) return;
        alertModalFunc({
            title: "Dikkat!",
            text: "Gruptan ayrılırsanız sohbetteki konuşmaları bir daha göremezsiniz. Devam etmek istiyormusunuz?",
            actionButton: {
                onClick: () => gruptanAyrilFunc(sohbetId, {
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


    const profileGit = async (url: string) => {
        if (url) {
            navigate(url)
        }
        setOpenSohbetModal(false)
    };




    useEffect(() => {
        const sohbet = sohbetler.find(i => i.SohbetID === seciliSohbetId);
        if (sohbet) {
            seciliSohbet.current = sohbet
        } else {
            seciliSohbet.current = null
        }
    }, [sohbetler, seciliSohbetId]);


    const isimRenderFunc = (id: number): string => {

          
        for (const sohbet of sohbetKisileri) {
            const firmaKullanici = sohbet.kullanicilar?.find((k: any) => k.id === id);
            if (firmaKullanici) {
                return firmaKullanici.adSoyad || '';
            }
        }
        return '';
    };

    if (!seciliSohbet.current) {
        if (isLoading) return null;
        return (
            <div className="shadow-card border-b border-gray-200 py-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2 px-5">
                    <div className="flex items-center flex-wrap gap-2">
                        <div className="flex items-center justify-center shrink-0 rounded-full bg-gray-100 border border-gray-200 size-11">
                            <span className="flex items-center justify-center size-7 rounded-full border-2 border-success  text-sm font-semibold text-white bg-red-400">
                                <KeenIcon icon="users" />
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <Link
                                to='#'
                                className="text-2sm font-semibold text-gray-900 hover:text-primary-active"
                            >
                                {selectedUserIds.length > 1 ? grupAdi : (selectedUserIds.length === 1 ?
                                    isimRenderFunc(selectedUserIds[0]) : '')}
                            </Link>
                            <span className="text-2xs font-medium italic text-gray-500 truncate block max-w-full">
                                Sohbeti başlatmak için ilk mesajını gönder
                            </span>
                        </div>
                    </div>
                </div>
            </div>)
    }

    const seciliSohbetFirmasi: any = seciliSohbet.current?.SohbetFirmalar && seciliSohbet.current?.SohbetFirmalar?.length > 0 ? seciliSohbet.current.SohbetFirmalar[0] : null;
    const seciliSohbetTeknokenti: any = seciliSohbet.current?.SohbetTeknokentler && seciliSohbet.current?.SohbetTeknokentler?.length > 0 ? seciliSohbet.current.SohbetTeknokentler[0] : null;
    const sonMesaj = seciliSohbet.current?.Mesajlar ? (seciliSohbet.current?.Mesajlar?.length > 0 ? seciliSohbet.current?.Mesajlar[seciliSohbet.current?.Mesajlar.length - 1] : seciliSohbet.current?.SonMesaj ?? null) : seciliSohbet.current?.SonMesaj ?? null;
    const mesajHtml = sonMesaj && sonMesaj?.MesajIcerigi ? sonMesaj?.MesajIcerigi?.replace(/<br>/g, " ") : '';
    return (
        <div className="shadow-card border-b border-gray-200 py-2.5 flex w-full">
            <div className="flex items-center justify-between flex-wrap gap-2 px-5 w-full">
                <div className="flex items-center flex-wrap gap-2">
                    <div className="relative flex items-center justify-center shrink-0 rounded-full bg-gray-100 border border-gray-200 size-11">
                        {seciliSohbet.current && seciliSohbet.current.Kullanicilar && seciliSohbet.current.Kullanicilar.length == 2 ?

                            (seciliSohbet.current.Kullanicilar.find(i => i.Kullanici.id !== currentUser?.id)?.Kullanici.ProfilResmi ?
                                <img
                                    src={`${API_URL + seciliSohbet.current.Kullanicilar.find(i => i.Kullanici.id !== currentUser?.id)?.Kullanici.ProfilResmi}`}
                                    className="rounded-full size-7 shrink-0"
                                    alt={`${seciliSohbet.current.Kullanicilar.find(i => i.Kullanici.id !== currentUser?.id)?.Kullanici.AdSoyad}`}
                                /> :
                                <span className="flex items-center justify-center size-7 rounded-full border-2 border-success  text-sm font-semibold text-white bg-red-400">
                                    {seciliSohbet.current.Kullanicilar.find(i => i.Kullanici.id !== currentUser?.id)?.Kullanici.AdSoyad?.slice(0, 1).toLocaleUpperCase('tr-TR')}
                                </span>) :
                            <span className="flex items-center justify-center size-7 rounded-full border-2 border-success  text-sm font-semibold text-white bg-red-400">
                                {seciliSohbet.current && seciliSohbet.current.Kullanicilar && seciliSohbet.current.Kullanicilar?.length} <KeenIcon icon="users" />
                            </span>

                        }
                        {currentUser && renderUserStatus({
                            Sohbet: seciliSohbet.current ?? {} as SohbetData,
                            currentUserID: currentUser.id,
                            getUsersStatus: getUsersStatus,
                            getUserStatus: getUserStatus
                        })}
                    </div>

                    <div className="flex flex-col">
                        <a onClick={() => {
                            seciliSohbet.current && (seciliSohbetFirmasi || seciliSohbetTeknokenti) && seciliSohbet.current.Kullanicilar &&
                                seciliSohbet.current.Kullanicilar?.length == 2 ?
                                profileGit(`/performans-takip-paneli/detay/${seciliSohbet.current.Kullanicilar?.find(i => i.Kullanici.id !== currentUser?.id)?.KullaniciID}?iliskiId=${seciliSohbetFirmasi ? seciliSohbetFirmasi.FirmaID : seciliSohbetTeknokenti.TeknokentID}&tip=${seciliSohbetFirmasi ? 1 : 3}`) : null
                        }} className="text-2sm font-semibold text-gray-900 hover:text-primary-active"
                        >
                            {seciliSohbet.current && seciliSohbet.current.Kullanicilar && seciliSohbet.current.Kullanicilar?.length == 2 ? seciliSohbet.current.Kullanicilar?.find(i => i.Kullanici.id !== currentUser?.id)?.Kullanici.AdSoyad : seciliSohbet.current && seciliSohbet.current.GrupAdi}

                        </a>
                        {seciliSohbet.current?.YazıyorData &&
                            seciliSohbet.current?.YazıyorData?.Durum ?
                            <span className="text-2xs font-medium italic text-gray-500 truncate block max-w-full">
                                {seciliSohbet.current?.YazıyorData?.KullaniciAdi?.split(' ')[0]}: yazıyor..</span>
                            : <span className="text-2xs font-medium italic text-gray-500 truncate block max-w-[200px] pe-1">
                                {sonMesaj?.GonderenKullaniciID === currentUser?.id ? 'Sen' : sonMesaj?.GonderenKullanici?.AdSoyad?.split(' ')[0]}:
                                {sonMesaj?.Dosyalar && sonMesaj?.Dosyalar.length > 0 ? 'Dosya gönderdi' : mesajHtml}
                            </span>}
                    </div>
                </div>

                {/* <div className="flex items-center gap-2.5">
                        <CommonAvatars
                            size="size-[30px]"
                            group={sohbetler.find(s => Number(s.SohbetID) === Number(seciliSohbetId ?? 0))?.Kullanicilar}
                            each={{
                                fallback: '+10',
                                variant: 'text-success-inverse size-6 ring-success-light bg-success'
                            }}
                        />

                    </div> */}
            </div>

            <Menu>
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
                    <MenuSub rootClassName="w-full max-w-[150px] max-h-[150px]" className="light:border-gray-300 p-2">
                        {seciliSohbet.current?.SohbetTipi === 'grup' && <button onClick={gruptanAyril}>Gruptan ayrıl</button>}
                        {seciliSohbet.current?.SohbetTipi !== 'grup' && seciliSohbetFirmasi &&
                            <button onClick={() => profileGit(`/firma-profilleri/detay/${seciliSohbetFirmasi?.FirmaID}`)}>Firma Profili</button>
                        }

                    </MenuSub>
                </MenuItem>
            </Menu>

            {alertModalData.actionButton && <AlertDialog
                open={openAlertModal}
                setOpen={setOpenAlertModal}
                title={alertModalData.title}
                text={alertModalData.text}
                actionButton={alertModalData.actionButton}
                closeButton={alertModalData.closeButton}
            />}
        </div>
    );

};

export { BuildTopbar, type Props };