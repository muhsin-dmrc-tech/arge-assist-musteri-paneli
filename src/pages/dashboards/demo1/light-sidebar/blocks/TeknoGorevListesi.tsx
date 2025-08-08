import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useAuthContext } from '@/auth';
import axios from 'axios';
import { toast } from 'sonner';
import { IITemsTypesData } from './GorevListesiData';
import { format } from 'date-fns';
import { DropdownButton } from '@/components/dropdown/DropdownButton';
import { DefaultTooltip } from '@/components';
import { useNavigate } from 'react-router';
import AlertDialog from '@/components/alert-modal/AlertDialog';
import { GorevDetayModal } from '@/partials/modals/tekno-admin-gorev-detay';



interface ButtonProps {
  text: string;
  onClick: () => void;
}
interface AlertDialogProps {
  title: string;
  text?: string;
  closeButton: ButtonProps;
  actionButton?: ButtonProps;
}


const TeknoGorevListesi = () => {
  const navigate = useNavigate();
  const [selectedDonem, setSelectedDonem] = useState(0);
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([] as IITemsTypesData[]);
  const [filteredItems, setFilteredItems] = useState([] as IITemsTypesData[]);
  const [total, setTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [complatedTotal, setComplatedTotal] = useState(0);
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { currentUser, seciliTeknokent } = useAuthContext();
  const [donemler, setDonemler] = useState([]);
  const [projeler, setProjeler] = useState([]);
  const [seciliDonem, setSeciliDonem] = useState<any>({});
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [openDetayModal, setOpenDetayModal] = useState(false);
  const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);
  const [seciliProje, setSeciliProje] = useState<any>({});
  const [ProjeID, setProjeID] = useState<number>(1);
  const [seciliAnahtar, setSeciliAnahtar] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      setSeciliDonem(donemler.find((item: any) => item.DonemID === selectedDonem) ?? {});
    }
  }, [donemler, ProjeID, selectedDonem, currentUser])

  const getDonemler = async () => {
    try {
      const response = await axios.get(`${API_URL}/donem/get-active-donemler`);

      if (response.status === 200) {
        setDonemler(response.data);
        setSelectedDonem(
          response.data.reduce((maxItem: any, currentItem: any) => {
            if (
              currentItem.Yil > (maxItem?.Yil || 0) ||
              (currentItem.Yil === maxItem?.Yil && currentItem.Ay > (maxItem?.Ay || 0))
            ) {
              return currentItem;
            }
            return maxItem;
          }, null)?.DonemID
        );
      } else {
        setDonemler([])
      }
    } catch (error) {
      toast.error('data alınırken hata oluştu');
    }
  };

  useEffect(() => {
    getDonemler();
  }, [])
  useEffect(() => {
    if(seciliTeknokent?.TeknokentID){
      getProjeler();
    }
  }, [seciliTeknokent?.TeknokentID])

  const getProjeler = async () => {
    try {
      const response = await axios.get(`${API_URL}/projeler/get-tekno-aktif-projeler/${seciliTeknokent?.TeknokentID}`);

      if (response.status === 200) {
        setProjeler(response.data);
        setProjeID(response.data[0]?.ProjeID);
      } else {
        setProjeler([])
      }
    } catch (error) {
      toast.error('data alınırken hata oluştu');
    }
  };

  useEffect(() => {
    if (ProjeID && ProjeID > 0) {
      setSeciliProje(projeler.find((item: any) => item.ProjeID === ProjeID) ?? {});
    }
  }, [ProjeID, projeler])



  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/gorev-listesi/get-gorev-listesi-teknoadmin/${seciliTeknokent?.TeknokentID}/${ProjeID}/${selectedDonem}`);
      if (response.status !== 200) {
        return;
      }
      if (response.data && response.data?.data) {
        setItems(response.data.data)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
    }
  };

  useEffect(() => {
    if (selectedDonem && selectedDonem > 0 && ProjeID && ProjeID > 0 && seciliTeknokent?.TeknokentID) {
      fetchItems();
    }

  }, [selectedDonem, ProjeID,seciliTeknokent?.TeknokentID])

  useEffect(() => {
    if (items.length > 0) {
      setTotal(items.length);
      setPendingTotal(items.filter((item) => item.Tamamlandimi === false).length);
      setComplatedTotal(items.filter((item) => item.Tamamlandimi === true).length);
    }
  }, [items]);

  useEffect(() => {
    let selectFilter = filter === 'completed' ? true : filter === 'pending' ? false : false;
    const filtered = items?.filter((item) => item.Tamamlandimi === selectFilter);
    setFilteredItems(filter === 'all' ? items : filtered);
  }, [items, filter]);

  const bolumAdiRenderFunc = (key: string) => {
    switch (key) {
      case 'proje-ilerleme-bilgileri':
        return 'Proje İlerleme Bilgileri';
      case 'proje-gelir-bilgileri':
        return 'Proje Gelir Bilgileri';
      case 'proje-gider-bilgileri':
        return 'Proje Gider Bilgileri';
      case 'proje-disi-gelir-bilgileri':
        return 'Proje Dışı Gelir Bilgileri';
      case 'proje-disi-gider-bilgileri':
        return 'Proje Dışı Gider Bilgileri';
      case 'proje-dis-ticaret-bilgileri':
        return 'Proje Dış Ticaret Bilgileri';
      case 'proje-disi-dis-ticaret-bilgileri':
        return 'Proje Dışı Dış Ticaret Bilgileri';
      case 'firma-muafiyet-bilgileri':
        return 'Firma Muafiyet Bilgileri';
      default:
        return key;
    }
  }


  const alertModalFunc = (data: Omit<AlertDialogProps, 'open' | 'setOpen'>) => {
    setAlertModalData(data);
    setOpenAlertModal(true);
  };

  const detayModalFunc = (anahtar:string) => {
    setSeciliAnahtar(anahtar);
    setOpenDetayModal(true);
  };

  return (
    <div className="card p-6 shadow-sm space-y-6">
      {alertModalData.actionButton && <AlertDialog
        open={openAlertModal}
        setOpen={setOpenAlertModal}
        title={alertModalData.title}
        text={alertModalData.text}
        actionButton={alertModalData.actionButton}
        closeButton={alertModalData.closeButton}
      />}
      <div className="flex flex-col  gap-4 border-b border-dashed  border-gray-200">
        <div>
          <div className="flex gap-4 mb-5" data-tabs="true">
            {[
              { label: `Tümü (${total})`, value: 'all' },
              { label: `Bekleyen (${pendingTotal})`, value: 'pending' },
              { label: `Tamamlanan (${complatedTotal})`, value: 'completed' },
            ].map((btn) => (
              <button className={`text-sm font-bold pb-2 ${filter === btn.value ? 'text-black border-black border-b-2' : 'text-gray-500'}`} key={btn.value} onClick={() => setFilter(btn.value)}>
                {btn.label}
              </button>
            ))}

          </div>

        </div>
        <div className="flex max-md:flex-col  flex-row gap-8 max-md:gap-0 items-center">
          <div className='flex items-center gap-2'>
            <span className='text-xs font-semibold text-gray-500'>Proje</span>
            <Select value={ProjeID ? ProjeID?.toString() : ''}
              onValueChange={(e) => setProjeID(Number(e))} >
              <SelectTrigger className=" border-0 text-sm font-bold" >
                <SelectValue placeholder="Proje Seçin" />
              </SelectTrigger>
              <SelectContent className=''>
                {projeler?.map((item: any) => (<SelectItem className='max-w-[300px] md:max-w-[500px]' key={item.ProjeID} value={item.ProjeID?.toString()}>{item?.ProjeAdi}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-xs font-semibold text-gray-500'>Dönem</span>
            <Select value={selectedDonem ? selectedDonem?.toString() : ''} onValueChange={(e) => setSelectedDonem(Number(e))} >
              <SelectTrigger className="max-w-[165px] border-0 text-sm font-bold" >
                <SelectValue placeholder="Dönem Seçin" />
              </SelectTrigger>
              <SelectContent>
                {donemler?.map((item: any) => (<SelectItem key={item.DonemID} value={item.DonemID?.toString()}>{item?.DonemAdi}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-auto min-w-full">
          <tbody>
            {filteredItems?.length > 0 ?
              filteredItems?.map((item: IITemsTypesData) => (
                <tr className='border-b border-dashed  border-gray-200' key={item.GorevID}>
                  <td className="min-w-[210px] py-3">
                    <div className="relative ps-6 pe-3 py-2">
                      <div className={`absolute left-0 top-0 w-[4px] h-full rounded-2 ${item.Tamamlandimi === true ? 'bg-success' : 'bg-warning-light'}`}></div>
                      <a href="#" className="mb-1 text-gray-900 text-sm font-bold">{bolumAdiRenderFunc(item.BolumAnahtar)}</a>
                      <div className="text-sm text-gray-500 font-semibold">{format(item.OlusturmaTarihi, 'dd/MM/yyy')}</div>
                    </div>
                  </td>

                  <td>

                    {item.Tamamlandimi === true ?
                      <DefaultTooltip title={item.TamamlanmaTarihi ? format(item.TamamlanmaTarihi, 'dd/MM/yyy') : 'Tamamlandı'} placement="top" className="max-w-48">
                        <span className="badge badge-success">Tamamlandı</span>
                      </DefaultTooltip>
                      : item.Tamamlandimi === false ?
                        <DefaultTooltip title='Beklemede' placement="top" className="max-w-48">
                          <span className="badge ">Beklemede</span>
                        </DefaultTooltip>
                        :
                        <DefaultTooltip title='Beklemede' placement="top" className="max-w-48">
                          <span className="badge ">Beklemede</span>
                        </DefaultTooltip>
                    }
                  </td>

                  <td className="min-w-[75px]">
                    <div className="text-sm font-bold">{format(item.SonTeslimTarihi, 'dd/MM/yyy')}</div>
                    <div className="text-xs font-semibold text-gray-500">Son Tamamlanma Tarihi</div>
                  </td>
                  <td className="text-end">
                    <DefaultTooltip title={`Görev detayını gör`} placement="top" className="max-w-48">
                      <button type="button"
                        onClick={() => detayModalFunc(item.BolumAnahtar)}
                        className="btn btn-icon btn-sm btn-light btn-active-primary w-25px h-25px">
                        <i className="ki-filled ki-search-list"></i>
                      </button>
                    </DefaultTooltip>
                  </td>
                </tr>
              ))
              :
              <tr className='border-b border-dashed  border-gray-200'>
                <td colSpan={5} className="text-center py-4">
                  <span className="text-gray-700">
                    !{seciliProje?.ProjeAdi ? seciliProje?.ProjeAdi.toUpperCase() : 'Seçili'} 'projesi için {seciliDonem?.DonemAdi ?? 'Seçili'}
                    'dönemine ait {filter === 'all' ? '' : filter === 'pending' ? 'Tamamlanmamış' : 'Tamamlanan'} Görev bulunamadı
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <GorevDetayModal
        open={openDetayModal}
        onOpenChange={() => {setOpenDetayModal(false); setSeciliAnahtar('')}}
        gorevAnahtar={seciliAnahtar}
        ProjeID={ProjeID}
        DonemID={selectedDonem}
      />
    </div>
  );
};

export default TeknoGorevListesi;
