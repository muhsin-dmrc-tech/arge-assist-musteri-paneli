/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, DataGridRowSelect, DataGridRowSelectAll, KeenIcon, useDataGrid, DefaultTooltip, TDataGridRequestParams, DataGridLoader } from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { IITemsTypesData } from '.';
import axios from 'axios';
import { DestekTipiCreateModal, DestekTipiUpdateModal } from '@/partials/modals/destek-tipleri';
import AlertDialog from '@/components/alert-modal/AlertDialog';



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

const DestekTipi = () => {
  const [selectedItem, setSelectedItem] = useState<IITemsTypesData | {}>({});
  const [openModal, setOpenModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLoading, setActiveLoading] = useState<Record<number, boolean>>({});
  const [itemDataes, setItemDataes] = useState<IITemsTypesData[] | []>([]);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);


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

      const templateData = await fetchBusinessTypess(queryParams)
      return templateData;
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
        `${API_URL}/destek-tipleri/get-destek-tipleri?${queryParams.toString()}`
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


  const ColumnInputFilter = <TData, TValue>({ column }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filter..."
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };
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
        accessorFn: (row: IITemsTypesData) => row.Tanim,
        id: 'Tanim',
        header: ({ column }) => <DataGridColumnHeader title="Tanım" filter={<ColumnInputFilter column={column} />} column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.Tanim}
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
        accessorFn: (row: IITemsTypesData) => row.Departman,
        id: 'Departman',
        header: ({ column }) => <DataGridColumnHeader title="Departman" filter={<ColumnInputFilter column={column} />} column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.Departman}
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
            if (!row.original.IsDeleted) {
              updateModalFunc(row.original.DestekTipiID)
            } else {
              alertModalFunc({
                title: "Geri Yüklensinmi?",
                text: "Destek Tipini geri yüklemek istiyormusunuz",
                actionButton: {
                  onClick: () => handleReloadOrDeleteFunc(row.original.DestekTipiID, "reload"),
                  text: "GERİ YÜKLE"
                },
                closeButton: {
                  onClick: () => setOpenAlertModal(false),
                  text: "İPTAL"
                }
              });
            }
          };

          return activeLoading[row.original.DestekTipiID] ? (
            <div className="flex items-center justify-center bg-white/50 z-10">
              <span className="text-sm text-gray-500">Yükleniyor...</span>
            </div>
          ) : (
            <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={handleEditOrReload}>
              <KeenIcon icon={!row.original.IsDeleted ? "notepad-edit" : "update-file"} />
            </button>
          );
        },
        meta: {
          headerClassName: "w-[60px]",
        },
      },
      {
        id: "delete",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => {
          const handleDelete = async () => {
            alertModalFunc({
              title: "Silinsin mi?",
              text: "Destek Tipini silmek istiyormusunuz",
              actionButton: {
                onClick: () => handleReloadOrDeleteFunc(row.original.DestekTipiID, "delete"),
                text: "SİL"
              },
              closeButton: {
                onClick: () => setOpenAlertModal(false),
                text: "İPTAL"
              }
            });
          };

          return activeLoading[row.original.DestekTipiID] ? (
            <div className="flex items-center justify-center bg-white/50 z-10">
              <span className="text-sm text-gray-500">Yükleniyor...</span>
              <DataGridLoader />
            </div>
          ) : !row.original.IsDeleted ? (
            <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={handleDelete}>
              <KeenIcon icon="trash" />
            </button>
          ) : (
            <div className="flex flex-col text-red-300 text-center">
              <span>Silinmiş</span>
            </div>
          );
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

  const handleReloadOrDeleteFunc = async (itemId: any, type: "delete" | "reload") => {
    setActiveLoading((prev) => ({
      ...prev,
      [itemId]: true,
    }));
    try {
      const response = await axios.post(`${API_URL}/Destek-tipleri/${type}`, { itemId });
      if (response.status === 201) {
        // Başarılı olursa state'i güncelle
        setItemDataes(prevData =>
          prevData.map(item =>
            item.DestekTipiID === response.data.DestekTipiID ? response.data : item
          )
        );
        //window.location.reload()
      } else {
        toast.error("İşlem yapılırken hata oluştu DestekTipi");
      }
    } catch (error) {
      console.error(error);
      toast.error("İşlem yapılırken hata oluştu DestekTipi");
    } finally {
      setActiveLoading((prev) => ({
        ...prev,
        [itemId]: false,
      }));
    }
  };

  const updateModalFunc = useCallback(async (selectId: any) => {

    if (!itemDataes || itemDataes.length === 0) {
      toast(`Bağlantı hatası`, {
        description: `DestekTipi Verileri mevcut değil`,
        action: {
          label: 'Ok',
          onClick: () => { console.log('Ok') }
        }
      });
      return;
    }

    // selectId'nin geçerli olup olmadığını kontrol edin
    if (!selectId) {
      toast(`Bağlantı hatası`, {
        description: `Geçersiz DestekTipiID`,
        action: {
          label: 'Ok',
          onClick: () => { console.log('Ok') }
        }
      });
      return;
    }

    const findTemplate = itemDataes.find((item) => item.DestekTipiID === selectId);
    if (findTemplate) {
      setSelectedItem(findTemplate);
      setOpenUpdateModal(true);
    } else {
      toast(`Bağlantı hatası`, {
        description: `DestekTipi bulunamadı`,
        action: {
          label: 'Ok',
          onClick: () => { console.log('Ok') }
        }
      });
    }
  }, [itemDataes]);


  interface IModalResponse {
    status: number;
    data: IITemsTypesData;
  }
  const handleOpenModal = async (data: IModalResponse | 'close') => {
    if (data === 'close') {
      setSelectedItem({} as IITemsTypesData);
      setOpenModal(false);
      setOpenUpdateModal(false);
      return;
    }
    try {
      if (data.status === 201 && data.data) {
        setItemDataes(prevData => {
          const existingItem = prevData.find(item => item.DestekTipiID === data.data.DestekTipiID);

          if (existingItem) {
            return prevData.map(item =>
              item.DestekTipiID === data.data.DestekTipiID ? data.data : item
            );
          } else {
            return [data.data, ...prevData];
          }
        });
        toast.success('Süreç başarılı', { duration: 3000 });
      } else {
        toast.error('Öğeyi oluştururken hata oluştu DestekTipi', { duration: 5000 });
      }
    } catch (error) {
      toast.error('Beklenmedik bir hata oluştu', { duration: 5000 });
    } finally {
      setSelectedItem({} as IITemsTypesData);
      setOpenModal(false);
      setOpenUpdateModal(false);
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
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">Destek Tipi</h3>
        <div className="input input-sm max-w-48">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="Destek Tipi Ara"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <a onClick={() => setOpenModal(true)} id="select_ip_btn" className="btn btn-sm btn-primary">Destek Tipi Ekle</a>
          {alertModalData.actionButton && <AlertDialog
            open={openAlertModal}
            setOpen={setOpenAlertModal}
            title={alertModalData.title}
            text={alertModalData.text}
            actionButton={alertModalData.actionButton}
            closeButton={alertModalData.closeButton}
          />}
          <DestekTipiCreateModal open={openModal} onOpenChange={handleOpenModal} />
          <DestekTipiUpdateModal open={openUpdateModal} onOpenChange={handleOpenModal} item={selectedItem} />
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  return (
    <DataGrid
      columns={columns}
      itemData={itemDataes}
      setData={setItemDataes}
      serverSide={true}
      onFetchData={fetchBusinessTypessData}
      rowSelection={true}
      getRowId={(row: any) => row.id}
      onRowSelectionChange={handleRowSelection}
      pagination={{ size: 100 }}
      toolbar={<Toolbar setSearchQuery={setSearchQuery} />}
      layout={{ card: true }}
    />
  )
};

export { DestekTipi };
