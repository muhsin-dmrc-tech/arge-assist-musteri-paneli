/* eslint-disable prettier/prettier */
import { useEffect, useMemo,useState } from 'react';
import { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, DataGridRowSelect, DataGridRowSelectAll, KeenIcon, useDataGrid,  TDataGridRequestParams } from '@/components';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { IITemsTypesData } from '.';
import axios from 'axios';
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

const Siparisler = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLoading, setActiveLoading] = useState<Record<number, boolean>>({});
  const [itemDataes, setItemDataes] = useState<IITemsTypesData[] | []>([]);
  const [serverSide, setServerSide] = useState(true);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);
  const { currentUser } = useAuthContext();



  useEffect(() => {
    if (currentUser?.id) {
      setServerSide(false)
      setTimeout(() => {
        setServerSide(true)
      }, 100)
    }
  }, [currentUser?.id]);


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

      if (currentUser?.id) {
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
        `${API_URL}/siparisler/get-siparisler?${queryParams.toString()}`
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
        accessorFn: (row: IITemsTypesData) => row.Kullanici.FirmaAdi,
        id: 'Firma',
        header: ({ column }) => <DataGridColumnHeader title="Firma" column={column} />,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.Kullanici.FirmaAdi}
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
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className={`badge badge-sm badge-outline ${row.original.Durum === 'Ödendi' ? "badge-success" : row.original.Durum === 'Bekleniyor' ? "badge-warning" : "badge-danger"}`}>
                  {row.original.Durum ?? "Bekliyor"}
                </span>
                {(row.original.Durum !== 'Ödendi' && !row.original.OdemeTarihi) &&
                  <button className="btn btn-primary btn-sm h-[1.5rem] px-0 flex justify-center" onClick={() => navigate(`/odeme-sayfasi/${row.original.SiparisID}`)}>
                    Şimdi Öde
                  </button>
                }
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[50px]",
        },
      },
      {
        accessorKey: "OdenmemeSebebi",
        id: "OdenmemeSebebi",
        header: ({ column }) => (
          <DataGridColumnHeader title="Ödenmeme Sebebi" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.OdenmemeSebebi ?? '-'}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[50px]",
        },
      },
    ],
    [itemDataes, activeLoading]
  );
  const alertModalFunc = (data: Omit<AlertDialogProps, 'open' | 'setOpen'>) => {
    setAlertModalData(data);
    setOpenAlertModal(true);
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
          <div></div>
          <div className="flex flex-wrap items-center gap-2.5">
            {alertModalData.actionButton && <AlertDialog
              open={openAlertModal}
              setOpen={setOpenAlertModal}
              title={alertModalData.title}
              text={alertModalData.text}
              actionButton={alertModalData.actionButton}
              closeButton={alertModalData.closeButton}
            />}
            <DataGridColumnVisibility table={table} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {
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
        
      }
    </>
  )
};

export { Siparisler };
