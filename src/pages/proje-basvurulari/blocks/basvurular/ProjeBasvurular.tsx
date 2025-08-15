/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from 'react';
import { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, DataGridRowSelect, DataGridRowSelectAll, KeenIcon, useDataGrid, TDataGridRequestParams, DataGridLoader } from '@/components';
import { toast } from 'sonner';
import { IITemsTypesData } from '.';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputLabel } from '@mui/material';
import AlertDialog from '@/components/alert-modal/AlertDialog';
import { format } from 'date-fns';
import { useAuthContext } from '@/auth';

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

const ProjeBasvurular = () => {
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
        `${API_URL}/proje-basvuru/get-proje-basvurulari?${queryParams.toString()}`
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
      /* {
        accessorFn: (row: IITemsTypesData) => row.Kullanici?.FirmaAdi,
        id: 'Firma',
        header: ({ column }) => <DataGridColumnHeader title="Firma" column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.Kullanici?.FirmaAdi}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      }, */
      /* {
        accessorFn: (row: IITemsTypesData) => row.Teknokent.TeknokentAdi,
        id: 'Teknokent',
        header: ({ column }) => <DataGridColumnHeader title="Teknokent" column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {`${row.original.Teknokent.TeknokentAdi.slice(0, 35)}${row.original.Teknokent.TeknokentAdi.length > 35 && '...'}`}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      }, */
      {
        accessorFn: (row: IITemsTypesData) => row.OnerilenProjeIsmi,
        id: 'OnerilenProjeIsmi',
        header: ({ column }) => <DataGridColumnHeader title="Önerilen Proje İsmi" column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {`${row.original.OnerilenProjeIsmi.slice(0, 35)}${row.original.OnerilenProjeIsmi.length > 35 ? '...' : ''}`}
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
        accessorFn: (row: IITemsTypesData) => row.Durum,
        id: 'Durum',
        header: ({ column }) => <DataGridColumnHeader title="Durum" column={column} />,
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.Durum === 'Onaylandı' ?
                    <div className="text-s text-green-700">{row.original.Durum}</div> :
                    row.original.Durum === 'Reddedildi' ?
                      <div className="text-s text-red-700">{row.original.Durum}</div> :
                      <div className="text-s text-gray-700">{row.original.Durum}</div>
                  }
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
        id: "edit",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => {
          const handleEditOrReload = async () => {
            if (row.original.DegerlendirmedeMi) {
              alertModalFunc({
                title:"Değerlendirme Sürecinde !",
                text: "Bu proje şuan değerlendirme aşamasında! Değerlendirme süreci bitmeden düzenleme işlemi yapamazsınız.",
                actionButton: {
                  onClick: () => { },
                  text: ""
                },
                closeButton: {
                  onClick: () => setOpenAlertModal(false),
                  text: "İPTAL"
                }
              });
              return
            } else {
              if (!row.original.IsDeleted) {
                if (row.original.Durum === 'Onaylandı') {
                  navigate(`/proje-basvuru-detay/${row.original.BasvuruID}`);
                } else {
                  navigate(`/proje-basvurulari/edit/${row.original.BasvuruID}`);
                }
              } else {
                alertModalFunc({
                  title: "Geri Yüklensinmi?",
                  text: "Proje başvurusunu geri yüklemek istiyormusunuz",
                  actionButton: {
                    onClick: () => handleReloadOrDeleteFunc(row.original.BasvuruID, "reload"),
                    text: "GERİ YÜKLE"
                  },
                  closeButton: {
                    onClick: () => setOpenAlertModal(false),
                    text: "İPTAL"
                  }
                });
              }
            }
          };

          return activeLoading[row.original.BasvuruID] ? (
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
            if (row.original.DegerlendirmedeMi) {
              alertModalFunc({
                title:"Değerlendirme Sürecinde !",
                text: "Bu proje şuan değerlendirme aşamasında! Değerlendirme süreci bitmeden düzenleme işlemi yapamazsınız.",
                actionButton: {
                  onClick: () => { },
                  text: ""
                },
                closeButton: {
                  onClick: () => setOpenAlertModal(false),
                  text: "İPTAL"
                }
              });
              return
            } else {
              alertModalFunc({
                title: "Silinsin mi?",
                text: "Proje başvurusunu silmek istiyormusunuz.",
                actionButton: {
                  onClick: () => handleReloadOrDeleteFunc(row.original.BasvuruID, "delete"),
                  text: "SİL"
                },
                closeButton: {
                  onClick: () => setOpenAlertModal(false),
                  text: "İPTAL"
                }
              });
            }
          };

          return activeLoading[row.original.BasvuruID] ? (
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
      const response = await axios.post(`${API_URL}/proje-basvuru/${type}`, { itemId });
      if (response.status === 201) {
        // Başarılı olursa state'i güncelle
        setItemDataes(prevData =>
          prevData.map(item =>
            item.BasvuruID === response.data.BasvuruID ? response.data : item
          )
        );
        //window.location.reload()
      } else {
        toast.error("Proje başvurusunu silinemedi veya geri yüklenemedi");
      }
    } catch (error) {
      console.error(error);
      toast.error("Proje başvurusunu silinemedi veya geri yüklenemedi");
    } finally {
      setActiveLoading((prev) => ({
        ...prev,
        [itemId]: false,
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
          <div className="input input-sm max-w-48">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Proje başvurusu Ara"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link to={`/proje-basvurulari/edit`} className="btn btn-sm btn-primary">Proje Başvurusu Oluştur</Link>
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
};

export { ProjeBasvurular };
