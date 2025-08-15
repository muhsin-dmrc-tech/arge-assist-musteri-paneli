/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import { IITemsTypesData } from '.';
import axios from 'axios';
import AlertDialog from '@/components/alert-modal/AlertDialog';
import { useNavigate } from 'react-router';
import { useAuthContext } from '@/auth';
import { Plan } from './Plan';
import Pagination from './Pagination';
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import yetkiKontrolu from '@/hooks/yetkiKontrolFunc';
import { CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';


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

interface filterType {
  id: string;
  value: string;
}

const FaaliyetRaporlari = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [itemDataes, setItemDataes] = useState<IITemsTypesData[] | []>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);
  const { currentUser } = useAuthContext();
  const [queryFilter, setQueryFilter] = useState<filterType[]>([] as filterType[]);
  const [showNotFound, setShowNotFound] = useState(false);

useEffect(() => {
  if (!loading && itemDataes.length === 0) {
    const timeout = setTimeout(() => {
      setShowNotFound(true);
    }, 1000); // 1 saniye sonra mesajı göster

    return () => clearTimeout(timeout); // component unmount olursa temizle
  } else {
    setShowNotFound(false); // veri varsa veya loading'se resetle
  }
}, [loading, itemDataes]);










  /* const getDonemler = async () => {
    try {
      const response = await axios.get(`${API_URL}/donem/get-active-donemler`);

      if (response.status === 200) {
        setDonemler(response.data);
        if (response.data.length > 0) {
          // DonemID'ye göre sıralama yapıp en küçük ID'li (en eski) dönemi seç
          const sortedDonemler = response.data.sort((a: any, b: any) => b.DonemID - a.DonemID);
          setSeciliDonemId(sortedDonemler[0].DonemID.toString());
        }
      } else {
        setDonemler([]);
      }
    } catch (error) {
      console.log(error)
      toast.error('data alınırken hata oluştu');
    }
  };

  useEffect(() => {
    getDonemler();
  }, []) */




  useEffect(() => {
     setLoading(true);
    if (currentUser?.id) {
      fetchBusinessTypessData()
    }else{
       setLoading(false);
    }
  }, [pageIndex, searchQuery, currentUser?.id]);

  /*  useEffect(() => {
     if (queryFilter && seciliDonemId) {
       const donemId = parseInt(seciliDonemId);
       if (!isNaN(donemId)) {
         fetchBusinessTypessData()
       }
     }
   }, [queryFilter, seciliDonemId]); */




  const fetchBusinessTypessData = async () => {
    try {
      const queryParams = new URLSearchParams();

      queryParams.set('page', String(pageIndex + 1)); // Page is 1-indexed on server
      queryParams.set('items_per_page', String(10));

      /* if (params.sorting?.[0]?.id) {
        queryParams.set('sort', params.sorting[0].id);
        queryParams.set('order', params.sorting[0].desc ? 'desc' : 'asc');
      } */

      if (searchQuery.trim().length > 0) {
        queryParams.set('query', searchQuery);
      }
      /* if (seciliDonemId.length > 0) {
        queryParams.set('donemId', seciliDonemId);
      } */

      // Column filters
      if (queryFilter.length > 0) {
        queryFilter.forEach(({ id, value }) => {
          if (value !== undefined && value !== null) {
            queryParams.set(`filter[${id}]`, String(value));
          }
        });
      }

      if (currentUser?.id) {
        const templateData = await fetchBusinessTypess(queryParams)
        setItemDataes(templateData.data);
        setTotalCount(templateData.totalCount);
      } else {
        return {
          data: [],
          totalCount: 0
        }
      }

    } catch (error) {
      console.log(error)
      toast(`Bağlantı hatası`, {
        description: `Veriler getirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin`,
        action: {
          label: 'Ok',
          onClick: () => { console.log('Ok') }
        }
      });
      return {
        data: [],
        totalCount: 0
      }
    }
  };

  const fetchBusinessTypess = async (queryParams: any) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/dokumanlar/aylik-faaliyet-raporlari?${queryParams.toString()}`
      );
      return {
        data: response.data.data, // Server response data
        totalCount: response.data.total // Total count for pagination
      }

    } catch (error: any) {
      console.log(error)
      const message = error.response?.data?.message ?? `Veriler getirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin`;
      toast(`Bağlantı hatası`, {
        description: message,
        action: {
          label: 'Ok',
          onClick: () => { console.log('Ok') }
        }
      });
      return {
        data: [],
        totalCount: 0
      }
    } finally {
      setLoading(false);
    }
  }





  const Toolbar = ({ setSearchQuery }: { setSearchQuery: (query: string) => void }) => {
    const [inputValue, setInputValue] = useState(searchQuery);


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {

        setSearchQuery(inputValue);

        setQueryFilter([{ id: 'query', value: inputValue.trim() }]);
      };
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value); // Update local state
    };
    return (
      <div className="flex-col px-5 py-5 border-b-0">
        <div className="flex w-full justify-left flex-wrap gap-2">
          {/* <div className="input input-sm max-w-48">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Proje/Firma ara"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div> */}

          {/* <div className="">
            <Select
              value={seciliDonemId}
              onValueChange={(value) => {
                setSeciliDonemId(value);

                // Önce mevcut tam/eksik dönem filtresini bul
                const existingFilter = queryFilter.find(i => i.id === 'tamDonem' || i.id === 'eksikDonem');

                if (existingFilter) {
                  // Eğer filtre varsa, diğer filtreleri koru ve mevcut filtreyi güncelle
                  const updatedFilters = queryFilter.map(filter =>
                    (filter.id === 'tamDonem' || filter.id === 'eksikDonem')
                      ? { ...filter, value }
                      : filter
                  );
                  setQueryFilter(updatedFilters);
                }
              }}
              required
            >
              <SelectTrigger className="w-full max-h-[32px]">
                <SelectValue placeholder="Dönem Seç" />
              </SelectTrigger>
              <SelectContent>
                {donemler?.map((item: any) => (<SelectItem key={item.DonemID} value={item.DonemID?.toString()}>{item?.DonemAdi}</SelectItem>))}

              </SelectContent>
            </Select>
          </div> */}

          {/* <div className="">
            <Select
              value={queryFilter.find(i => i.id === 'tamDonem' || i.id === 'eksikDonem') ? queryFilter.find(i => i.id === 'tamDonem' || i.id === 'eksikDonem')?.id : ''}
              onValueChange={(value) => {
                setSearchQuery('')
                setInputValue('')
                if (value !== 'bosalt') {
                  // Önce eksikDonem filtresini kaldır, sonra yeni değeri ekle
                  const filteredQuery = queryFilter.filter(item => item.id !== 'tamDonem' && item.id !== 'eksikDonem' && item.id !== 'query');
                  setQueryFilter([...filteredQuery, { id: value, value: seciliDonemId }]);
                } else {
                  // Sadece eksikDonem filtresini kaldır
                  const filteredQuery = queryFilter.filter(item => item.id !== 'tamDonem' && item.id !== 'eksikDonem' && item.id !== 'query');
                  setQueryFilter(filteredQuery);
                }
              }} required>
              <SelectTrigger className="w-full max-h-[32px]">
                <SelectValue placeholder="Görev durumuna göre filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bosalt'>Seçimi kaldır</SelectItem>
                <SelectItem value='eksikDonem'>Seçili Dönemde Görevi Tamamlamayanlar</SelectItem>
                <SelectItem value='tamDonem'>Seçili Dönemde Görevi Tamamlayanlar</SelectItem>

              </SelectContent>
            </Select>
          </div> */}


          <div className="flex flex-wrap items-center justify-end w-full gap-2.5">
           <Link to={`/aylik-faaliyet-raporlari/edit`} className="btn btn-sm btn-primary px-1">Aylik Faaliyet Raporu Oluştur</Link>
            {alertModalData.actionButton && <AlertDialog
              open={openAlertModal}
              setOpen={setOpenAlertModal}
              title={alertModalData.title}
              text={alertModalData.text}
              actionButton={alertModalData.actionButton}
              closeButton={alertModalData.closeButton}
            />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {
          <div className="gap-3 flex flex-col">
            <Toolbar setSearchQuery={setSearchQuery} />
            {itemDataes.length > 0 ?
              <>

                {
                  loading ?
                    <CircularProgress />
                    :
                    itemDataes.map((item, index) =>
                      <Plan key={index} item={item} />
                    )}


                {totalCount > 10 && <Pagination
                  currentPage={pageIndex}
                  totalPages={Math.ceil(totalCount / 10)}
                  onPageChange={(page) => {
                    setPageIndex(page);
                    fetchBusinessTypessData();
                  }}
                />}
              </>
              : loading ?
                    <CircularProgress />
                    : showNotFound ? (
              <div className="flex items-center p-3 w-full justify-center bg-red-100 rounded-lg">
                <h2 className="font-semibold text-red-700">Hiç Aylık Faaliyet Raporu Bulunamadı !</h2>
              </div>) : null
            }
          </div>
        
      }
    </>
  )
};

export { FaaliyetRaporlari };
