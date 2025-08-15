/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, DataGridRowSelect, DataGridRowSelectAll, KeenIcon, useDataGrid, DefaultTooltip, TDataGridRequestParams, DataGridLoader } from '@/components';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { IITemsTypesData } from '.';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputLabel } from '@mui/material';
import AlertDialog from '@/components/alert-modal/AlertDialog';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import yetkiKontrolu from '@/hooks/yetkiKontrolFunc';



interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
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

const OdemeBildirimleri = () => {
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLoading, setActiveLoading] = useState<Record<number, boolean>>({});
  const [itemDataes, setItemDataes] = useState<IITemsTypesData[] | []>([]);
  const [serverSide, setServerSide] = useState(true);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);
  const { currentUser, auth } = useAuthContext();
  const [submitVisible, setSubmitVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);



  useEffect(() => {
    if (currentUser?.KullaniciTipi === 2) {
      setServerSide(false)
      setTimeout(() => {
        setServerSide(true)
      }, 100)
    }
  }, [currentUser]);


  const fetchBusinessTypessData = async (params: TDataGridRequestParams) => {
    try {
      const queryParams = new URLSearchParams();

      queryParams.set('page', String(params.pageIndex + 1)); // Page is 1-indexed on server
      queryParams.set('items_per_page', String(params.pageSize));

      if (params.sorting?.[0]?.id) {
        queryParams.set('sort', params.sorting[0].id);
        queryParams.set('order', params.sorting[0].desc ? 'desc' : 'asc');
      }

      if (searchQuery.trim().length > 0) {
        queryParams.set('query', searchQuery);
      }

      // Column filters
      if (params.columnFilters) {
        params.columnFilters.forEach(({ id, value }) => {
          if (value !== undefined && value !== null) {
            queryParams.set(`filter[${id}]`, String(value)); // Properly serialize filter values
          }
        });
      }

      if (currentUser?.KullaniciTipi === 2) {
        const templateData = await fetchBusinessTypess(queryParams)
        return templateData;
      } else {
        return {
          data: [],
          totalCount: 0
        }
      }
    } catch (error) {
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
      const response = await axios.get(
        `${API_URL}/siparisler/get-odeme-bildirimleri?${queryParams.toString()}`
      );

      return {
        data: response.data.data, // Server response data
        totalCount: response.data.total // Total count for pagination
      }

    } catch (error: any) {
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
    }
  }


  function formatNumber(num: number) {
    return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  const columns = useMemo<ColumnDef<IITemsTypesData>[]>(
    () => [
      {
        accessorKey: 'id',
        header: () => <DataGridRowSelectAll />,
        cell: ({ row }) => <DataGridRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: 'w-0'
        }
      },
      {
        accessorFn: (row: IITemsTypesData) => row.Kullanici.AdSoyad,
        id: 'Kullanici',
        header: ({ column }) => <DataGridColumnHeader title="Kullanıcı" column={column} />,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.Kullanici.AdSoyad}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: IITemsTypesData) => row.Firma.FirmaAdi,
        id: 'Firma',
        header: ({ column }) => <DataGridColumnHeader title="Firma" column={column} />,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.Firma.FirmaAdi}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: IITemsTypesData) => row.AbonelikPlan.PlanAdi,
        id: 'AbonelikPlan',
        header: ({ column }) => <DataGridColumnHeader title="Abonelik Plan" column={column} />,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.AbonelikPlan.PlanAdi}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: IITemsTypesData) => row.Tutar,
        id: 'Tutar',
        header: ({ column }) => <DataGridColumnHeader title="Tutar(TL)" column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {formatNumber(row.original.Tutar ?? 0)}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: IITemsTypesData) => row.OlusturmaTarihi,
        id: 'OlusturmaTarihi',
        header: ({ column }) => <DataGridColumnHeader title="Oluşturma Tarihi" column={column} />,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.OlusturmaTarihi ? format(row.original.OlusturmaTarihi, "dd-MM-yyyy") : '-'}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: IITemsTypesData) => row.OdemeTarihi,
        id: 'OdemeTarihi',
        header: ({ column }) => <DataGridColumnHeader title="Ödeme Tarihi" column={column} />,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.OdemeTarihi ? format(row.original.OdemeTarihi, "dd-MM-yyyy") : '-'}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorKey: "Durum",
        id: "Durum",
        header: ({ column }) => (
          <DataGridColumnHeader title="Durum" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const handleOnayFunc = async () => {
            alertModalFunc({
              title: "Ödeme Onayla",
              text: "Ödemeyi onaylamak istiyormusunuz? Bu işlem geri alınamaz.",
              actionButton: {
                onClick: () => odemeyiOnaylaFunc(row.original.SiparisID),
                text: "Onayla"
              },
              closeButton: {
                onClick: () => setOpenAlertModal(false),
                text: "Vazgeç"
              }
            });
          };
          return activeLoading[row.original.FirmaID] ? (
            <div className="flex items-center justify-center bg-white/50 z-10">
              <span className="text-sm text-gray-500">Güncelleniyor...</span>
            </div>
          ) : (
            row.original.Durum !== 'Ödendi' && !row.original.OdemeTarihi) &&
          <button className="btn btn-primary btn-sm h-[1.5rem] px-0 flex justify-center"
            onClick={() => handleOnayFunc()}>
            Ödemeyi Onayla
          </button>
        },
        meta: {
          headerClassName: "min-w-[50px]",
        },
      }
    ],
    [itemDataes, activeLoading]
  );
  const alertModalFunc = (data: Omit<AlertDialogProps, 'open' | 'setOpen'>) => {
    setAlertModalData(data);
    setOpenAlertModal(true);
  };
  const odemeyiOnaylaFunc = async (siparisID: number) => {
    if (submitVisible) return;
    setActiveLoading((prev) => ({
      ...prev,
      [siparisID]: true,
    }));
    try {
      const response = await axios.post(
        `${API_URL}/odemeler/odeme-onay`,
        { SiparisID: siparisID },
        { headers: { Authorization: `Bearer ${auth?.access_token}` } }
      );
      if (response.status === 201) {
        let successMessage = response.data?.message ?? 'İşlem başarılı';
        setSuccessMessage(successMessage);
        toast.success(successMessage, { duration: 10000 });
        setItemDataes(prev => prev.filter(item => item.SiparisID !== siparisID));
      } else {
        setError(response.data?.message || 'İşlem sıarsında hata oluştu');
        toast.error('İşlem sıarsında hata oluştu', { duration: 5000 });
      }
    } catch (error: any) {
      setSuccessMessage('');
      let errorMessages = 'Bilinmeyen bir hata oluştu.';

      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (Array.isArray(message)) {
          errorMessages = message
            .map((err) => (typeof err === 'string' ? err : Object.values(err.constraints || {}).join(' ')))
            .join(' | ');
        } else if (typeof message === 'string') {
          errorMessages = message;
        }
      }

      setError(errorMessages);
      toast.error('İşlem sıarsında hata oluştu', { duration: 5000 });
    } finally {
      setSubmitVisible(false);
      setActiveLoading((prev) => ({
        ...prev,
        [siparisID]: false,
      }));
    } 

  };


  const handleRowSelection = (state: RowSelectionState) => {
    const selectedRowIds = Object.keys(state);

    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: 'Undo',
          onClick: () => { console.log('Undo') }
        }
      });
    }
  };

  const Toolbar = ({ setSearchQuery }: { setSearchQuery: (query: string) => void }) => {
    const [inputValue, setInputValue] = useState(searchQuery);
    const { table } = useDataGrid();


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setSearchQuery(inputValue);
        if (inputValue.trim() === '') {
          // Remove the 'query' filter if input is empty
          table.setColumnFilters(
            table.getState().columnFilters.filter((filter) => filter.id !== 'query') // Exclude the filter with id 'query'
          );
        } else {
          // Add or update the 'query' filter
          table.setColumnFilters([
            ...table.getState().columnFilters.filter((filter) => filter.id !== 'query'), // Remove existing 'query' filter
            { id: 'query', value: inputValue }, // Add the new filter
          ]);
        }
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value); // Update local state
    };
    return (
      <div className="flex-col px-5 py-5 border-b-0">
        <div className="flex w-full justify-between flex-wrap gap-2">
          <div>{error && (
            <div className="text-red-700 flex items-center gap-2 ps-3">
              <KeenIcon icon="information-2" />
              <span>{error}</span>
            </div>
          )}
            {successMessage && (
              <div className="text-lime-400 flex items-center gap-2 ps-3">
                <KeenIcon icon="information-1" />
                <span>{successMessage}</span>
              </div>
            )}</div>
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {alertModalData.actionButton && <AlertDialog
              open={openAlertModal}
              setOpen={setOpenAlertModal}
              title={alertModalData.title}
              text={alertModalData.text}
              actionButton={alertModalData.actionButton}
              closeButton={alertModalData.closeButton}
            />}
            <div className="text-info max-w-[70%]">
              Not: Ödeme bildirimi yapan firmaları görüntülüyorsunuz.
              Lütfen banka hesabını kontrol edin ödeme yapıldı ise ödemeyi onayla butonuna tıklayın. Eğer ödeme yapılmamışsa hiç bir işlem yapmayın.
              24 saat içinde ödeme yapılmayan işlemler ödenmedi olarak otomatik işaretlenir.
            </div>
            <DataGridColumnVisibility table={table} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {currentUser?.KullaniciTipi !== 2 ? (
        <div className='alert alert-error'>
          <div className='flex items-center gap-2'>
            <KeenIcon icon="shield-cross" className="text-red-600" />
            <span>Bu sayfaya erişim için gerekli izninleriniz eksik!</span>
          </div>
        </div>
      ) :
        (
          <DataGrid
            columns={columns}
            itemData={itemDataes}
            setData={setItemDataes}
            serverSide={serverSide}
            onFetchData={fetchBusinessTypessData}
            rowSelection={true}
            getRowId={(row: any) => row.id}
            onRowSelectionChange={handleRowSelection}
            pagination={{ size: 100 }}
            toolbar={<Toolbar setSearchQuery={setSearchQuery} />}
            layout={{ card: true }}
          />
        )
      }
    </>
  )
};

export { OdemeBildirimleri };
