/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, DataGridRowSelect, DataGridRowSelectAll, KeenIcon, useDataGrid, TDataGridRequestParams, DataGridLoader } from '@/components';
import { toast } from 'sonner';
import { IITemsTypesData } from '.';
import axios from 'axios';
import AlertDialog from '@/components/alert-modal/AlertDialog';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { format } from 'date-fns';
import yetkiKontroluTeknokent from '@/hooks/yetkiKontrolTeknokentFunc';



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

const Projeler = () => {
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
    if (currentUser?.KullaniciTipi === 2) {
      setServerSide(false)
      setTimeout(() => {
        setServerSide(true)
      }, 100)
    }
  }, [currentUser?.KullaniciTipi]);

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
        `${API_URL}/projeler/get-projeler-admin?${queryParams.toString()}`
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
    }
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
        accessorFn: (row: IITemsTypesData) => row.ProjeAdi,
        id: 'ProjeAdi',
        header: ({ column }) => <DataGridColumnHeader title="Proje/Firma Adı" column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none text-sm text-gray-700">
                  {row.original.ProjeAdi}
                </span>
                 <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.Kullanici.FirmaAdi}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[200px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: IITemsTypesData) => row.ProjeKodu,
        id: 'ProjeKodu',
        header: ({ column }) => <DataGridColumnHeader title="Proje Kodu" column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.ProjeKodu}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[150px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: IITemsTypesData) => row.STBProjeKodu,
        id: 'STBProjeKodu',
        header: ({ column }) => <DataGridColumnHeader title="Stb Kodu" column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.STBProjeKodu}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[150px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: IITemsTypesData) => row.BaslangicTarihi,
        id: 'BaslangicTarihi',
        header: ({ column }) => <DataGridColumnHeader title="Başlangıç Tarihi" column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.BaslangicTarihi ? format(row.original.BaslangicTarihi, 'dd/MM/yyy') : '-'}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[150px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: IITemsTypesData) => row.BitisTarihi,
        id: 'BitisTarihi',
        header: ({ column }) => <DataGridColumnHeader title="Bitiş Tarihi" column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.BitisTarihi ? format(row.original.BitisTarihi, 'dd/MM/yyy') : '-'}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[150px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        id: "edit",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => {
          const handleEditOrReload = async () => {
            navigate(`/admin-projeler/edit/${row.original.ProjeID}`)
          };

          return <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={handleEditOrReload}>
              <KeenIcon icon="notepad-edit" />
            </button>
        },
        meta: {
          headerClassName: "w-[60px]",
        },
      },
      {
        id: "detay",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => {
          const handleEditOrReload = async () => {
            navigate(`/admin-projeler/detay/${row.original.ProjeID}`)
          };

          return <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={handleEditOrReload}>
              <KeenIcon icon="update-file" />
            </button>
        },
        meta: {
          headerClassName: "w-[60px]",
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
          <div className="input input-sm max-w-48">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Proje ara"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link to={`/admin-projeler/edit`} className="btn btn-sm btn-primary">Proje Ekle</Link>
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

export { Projeler };
