/* eslint-disable prettier/prettier */
import { useCallback, useMemo, useState } from 'react';
import { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, DataGridRowSelect, DataGridRowSelectAll, KeenIcon, useDataGrid, TDataGridRequestParams, DataGridLoader } from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ITemplateData } from '.';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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

const Templates = () => {
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLoading, setActiveLoading] = useState<Record<number, boolean>>({});
  const [itemDataes, setItemDataes] = useState<ITemplateData[] | []>([]);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [alertModalData, setAlertModalData] = useState<AlertDialogProps>({} as AlertDialogProps);
  const navigate = useNavigate();

  const fetchEmailTemplatesData = async (params: TDataGridRequestParams) => {
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

      const templateData = await fetchEmailTemplates(queryParams)
      return templateData;
    } catch (error) {
      toast(`Bağlantı Hatası`, {
        description: `Veri getirme sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin`,
        action: {
          label: 'Tamam',
          onClick: () => console.log('Tamam')
        }
      });
      return {
        data: [],
        totalCount: 0
      }
    }
  };

  const fetchEmailTemplates = async (queryParams: any) => {
    try {
      const response = await axios.get(
        `${API_URL}/email-templates/get-email-templates?${queryParams.toString()}`
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

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(',', '');
  };


  const ColumnInputFilter = <TData, TValue>({ column }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filtrele..."
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };
  const columns = useMemo<ColumnDef<ITemplateData>[]>(
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
        accessorFn: (row: ITemplateData) => row.templateName,
        id: 'templateName',
        header: ({ column }) => <DataGridColumnHeader title="Şablon Adı" filter={<ColumnInputFilter column={column} />} column={column} />,
        enableSorting: true,
        cell: ({ row }) => {  // 'row' argumentini cell funksiyasiga qo'shdik
          return (
            <div className="flex items-center gap-4">
              {/*  <KeenIcon icon={row.original.device.icon} className="text-2xl text-gray-500" /> */}

              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.templateName}
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
        accessorFn: (row) => row.subject,
        id: 'subject',
        header: ({ column }) => <DataGridColumnHeader title="Konu" column={column} />,
        enableSorting: true,
        cell: (info) => {
          return info.row.original.subject;
        },
        meta: {
          headerTitle: 'subject',
          headerClassName: 'min-w-[105px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorKey: "isActive",
        id: "isActive",
        header: ({ column }) => (
          <DataGridColumnHeader title="Aktif" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          return activeLoading[row.original.emailTemplateId] ? (
            <div className="flex items-center justify-center bg-white/50 z-10">
              <span className="text-sm text-gray-500">Güncelleniyor...</span>
            </div>
          ) : (
            <div className="switch switch-sm">
              <input
                type="checkbox"
                name="param"
                checked={row.original.isActive}
                onChange={async (e) => {
                  await isActiveFunc(row.original.emailTemplateId, e.target.checked);
                }}
                disabled={activeLoading[row.original.emailTemplateId]}
              />
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[50px]",
        },
      },
      {
        accessorFn: (row) => (<div className='flex flex-col text-center'>
          <span>{formatDate(row.creationTime)}</span>
          <span className='text text-sm italic'>{row.creatorUser?.AdSoyad}</span>
        </div>),
        id: 'creationTime',
        header: ({ column }) => <DataGridColumnHeader title="Oluşturulma Zamanı" column={column} />,
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          headerClassName: 'min-w-[100px]',
        },
      },
      {
        accessorFn: (row) => (<div className='flex flex-col text-center'>
          <span>{formatDate(row.lastModificationTime)}</span>
          <span className='text text-sm italic'>{row.lastModifierUser?.AdSoyad}</span>
        </div>),
        id: 'lastModificationTime',
        header: ({ column }) => <DataGridColumnHeader title="Son Değişiklik Zamanı" column={column} />,
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          headerClassName: 'min-w-[100px]',
        },
      },
      {
        id: "edit",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => {
          const handleEditOrReload = async () => {
            if (!row.original.isDeleted) {
              navigate(`/statick/email-templates-upload/${row.original.emailTemplateId}`)
            } else {
              alertModalFunc({
                title: "Geri Yüklensinmi?",
                text: "Şablonu geri yüklemek istiyormusunuz",
                actionButton: {
                  onClick: () => handleReloadOrDeleteFunc(row.original.emailTemplateId, "reload"),
                  text: "GERİ YÜKLE"
                },
                closeButton: {
                  onClick: () => setOpenAlertModal(false),
                  text: "İPTAL"
                }
              });
            }
          };

          return activeLoading[row.original.emailTemplateId] ? (
            <div className="flex items-center justify-center bg-white/50 z-10">
              <span className="text-sm text-gray-500">Güncelleniyor...</span>
            </div>
          ) : (
            <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={handleEditOrReload}>
              <KeenIcon icon={!row.original.isDeleted ? "notepad-edit" : "update-file"} />
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
              text: "Şablonu silmek istiyormusunuz",
              actionButton: {
                onClick: () => handleReloadOrDeleteFunc(row.original.emailTemplateId, "delete"),
                text: "SİL"
              },
              closeButton: {
                onClick: () => setOpenAlertModal(false),
                text: "İPTAL"
              }
            });
          };

          return activeLoading[row.original.emailTemplateId] ? (
            <div className="flex items-center justify-center bg-white/50 z-10">
              <span className="text-sm text-gray-500">Güncelleniyor...</span>
              <DataGridLoader />
            </div>
          ) : !row.original.isDeleted ? (
            <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={handleDelete}>
              <KeenIcon icon="trash" />
            </button>
          ) : (
            <div className="flex flex-col text-red-300 text-center">
              <span>{formatDate(row.original.deletionTime)}</span>
              <span className="text text-sm italic">{row.original.deleterUser?.AdSoyad}</span>
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
  const isActiveFunc = async (itemId: number, value: boolean) => {
    setActiveLoading((prev) => ({
      ...prev,
      [itemId]: true,
    }));
    try {
      const response = await axios.post(`${API_URL}/email-templates/is-active-update`, {
        itemId: itemId,
        value: value
      });

      if (response?.status === 201) {
        setItemDataes(prevData =>
          prevData.map(item =>
            item.emailTemplateId === response.data.emailTemplateId ? response.data : item
          )
        );
      } else {
        toast.error('Şablon durumu güncellenirken hata oluştu: ' + response.data?.message, { duration: 5000 });
      }
    } catch (error) {
      console.error(error);
      toast.error('Şablon durumu güncellenirken hata oluştu', { duration: 5000 });
    } finally {
      setActiveLoading((prev) => ({
        ...prev,
        [itemId]: false,
      }));
    }
  };



  const handleReloadOrDeleteFunc = async (itemId: any, type: "delete" | "reload") => {
    setActiveLoading((prev) => ({
      ...prev,
      [itemId]: true,
    }));
    try {
      const response = await axios.post(`${API_URL}/email-templates/${type}`, { itemId });
      if (response.status === 201) {
        // Başarılı olursa state'i güncelle
        setItemDataes(prevData =>
          prevData.map(item =>
            item.emailTemplateId === response.data.emailTemplateId ? response.data : item
          )
        );
        //window.location.reload()
      } else {
        toast.error("Şablonu silme veya yeniden yükleme hatası");
      }
    } catch (error) {
      console.error(error);
      toast.error("Şablonu silme veya yeniden yükleme hatası");
    } finally {
      setActiveLoading((prev) => ({
        ...prev,
        [itemId]: false,
      }));
    }
  };

  const updateModalFunc = useCallback(async (selectId: any) => {

    if (!itemDataes || itemDataes.length === 0) {
      toast(`Bağlantı Hatası`, {
        description: `Şablon verisi bulunamadı`,
        action: {
          label: 'Tamam',
          onClick: () => console.log('Tamam')
        }
      });
      return;
    }

    // selectId'nin geçerli olup olmadığını kontrol edin
    if (!selectId) {
      toast(`Bağlantı Hatası`, {
        description: `Geçersiz E-posta Şablon ID'si`,
        action: {
          label: 'Tamam',
          onClick: () => console.log('Tamam')
        }
      });
      return;
    }

    const findTemplate = itemDataes.find((item) => item.emailTemplateId === selectId);
    if (findTemplate) {
      //setOpenUpdateModal(true);
      navigate('/statick/email-templates-upload', { state: { item: findTemplate } });
    } else {
      toast(`Bağlantı Hatası`, {
        description: `E-posta Şablonu bulunamadı`,
        action: {
          label: 'Tamam',
          onClick: () => console.log('Tamam')
        }
      });
    }
  }, [itemDataes]);





  const handleRowSelection = (state: RowSelectionState) => {
    const selectedRowIds = Object.keys(state);

    if (selectedRowIds.length > 0) {
      toast(`Toplam ${selectedRowIds.length} seçildi.`, {
        description: `Seçilen satır ID'leri: ${selectedRowIds}`,
        action: {
          label: 'Geri Al',
          onClick: () => console.log('Geri Al')
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
        <h3 className="card-title">E-posta Şablonları</h3>
        <div className="input input-sm max-w-48">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="E-posta Şablonlarında Ara"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to='/statick/email-templates-upload' id="select_ip_btn" className="btn btn-sm btn-primary">E-posta şablonu oluştur</Link>
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
    );
  };

  return (
    <DataGrid
      columns={columns}
      itemData={itemDataes}
      setData={setItemDataes}
      serverSide={true}
      onFetchData={fetchEmailTemplatesData}
      rowSelection={true}
      getRowId={(row: any) => row.id}
      onRowSelectionChange={handleRowSelection}
      pagination={{ size: 100 }}
      toolbar={<Toolbar setSearchQuery={setSearchQuery} />}
      layout={{ card: true }}
    />
  )
};

export { Templates };
