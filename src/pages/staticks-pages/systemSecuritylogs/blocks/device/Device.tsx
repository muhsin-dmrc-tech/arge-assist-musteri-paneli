/* eslint-disable prettier/prettier */
import { useMemo, useState } from 'react';
import { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, DataGridRowSelect, DataGridRowSelectAll, KeenIcon, useDataGrid, DefaultTooltip, TDataGridRequestParams } from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { DeviceData, IDeviceData } from '.';
import axios from 'axios';


interface User {
  id: number;
  AdSoyad: string;
  Email: string;
}
interface Business {
  businessName: string;
}
interface Currency {
  currencyCode: string;
}

interface ProductDataType {
  productId: number;
  businessId: number;
  business: Business;
  productName: string;
  currency:Currency;
  price: number;
  imageUrl: string;
  creatorUserId: number;
  lastModifierUserId: number | null;
  deleterUserId: number | null;
  creatorUser: User;
  deleterUser: User | null;
  lastModifierUser: User | null;
  creationTime: Date;
  lastModificationTime: Date | null;
  deletedTime: Date | null;
  isDeleted: boolean;
}

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const Device = () => {
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [itemDataes, setItemDataes] = useState<ProductDataType[] | []>([]);

  const fetchLogsData = async (params: TDataGridRequestParams) => {
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
        const { id, value } = params.columnFilters[params.columnFilters.length - 1] ?? { id: undefined, value: null }
        if (value !== undefined && value !== null) {
          queryParams.set(`filter[${id}]`, String(value)); // Properly serialize filter values
        }
      }

      const productData = await fetchLogs(queryParams)
      return productData;
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

const fetchLogs = async(queryParams:any)=>{
  try {
    const response = await axios.get(
      `${API_URL}/logs/get-logs?${queryParams.toString()}`
    );
    
    return {
      data: response.data.data, // Server response data
      totalCount: response.data.total // Total count for pagination
    }
    
  } catch (error:any) {
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

const formatDate = (dateString:any) => {
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
      const [inputValue, setInputValue] = useState<string>((column.getFilterValue() as string) ?? '');
  
      const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          column.setFilterValue(inputValue);
        }
      };
  
      return (
        <Input
          placeholder="Filtrele..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 w-full max-w-40"
        />
      );
    };

  const columns = useMemo<ColumnDef<IDeviceData>[]>(
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
        accessorFn: (row: IDeviceData) => row.userAgent,
        id: 'userAgent',
        header: ({ column }) => <DataGridColumnHeader title="Cihaz" filter={<ColumnInputFilter column={column} />} column={column} />,
        enableSorting: true,
        cell: ({ row }) => {  // 'row' argumentini cell funksiyasiga qo'shdik
          return (
            <div className="flex items-center gap-4">
             {/*  <KeenIcon icon={row.original.device.icon} className="text-2xl text-gray-500" /> */}

              <div className="flex flex-col gap-0.5">
                <span className="leading-none font-medium text-sm text-gray-900">
                  {row.original.userAgent}
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
        accessorFn: (row) => row.ipAddress,
        id: 'ipAddress',
        header: ({ column }) => <DataGridColumnHeader title="IP Adresi" column={column} />,
        enableSorting: true,
        cell: (info) => {
          return info.row.original.ipAddress;
        },
        meta: {
          headerTitle: 'IP Adresi',
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },   
      {
        accessorFn: (row) => row.logType,
        id: 'logType',
        header: ({ column }) => <DataGridColumnHeader title="Tip" column={column} />,
        enableSorting: true,
        cell: (info) => {                    
          return info.row.original.logType;
        },
        meta: {
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },  
      {
        accessorFn: (row) => row.logLevel,
        id: 'logLevel',
        header: ({ column }) => <DataGridColumnHeader title="Seviye" column={column} />,
        enableSorting: true,
        cell: (info) => {                    
          return info.row.original.logLevel;
        },
        meta: {
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },  
      {
        accessorFn: (row) => row.logUser,
        id: 'logUser',
        header: ({ column }) => <DataGridColumnHeader title="Kullanıcı" column={column} />,
        enableSorting: true,
        cell: (info) => {                    
          return info.row.original.logUser?.AdSoyad;
        },
        meta: {
          headerTitle: 'logUser',
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      }, 
      {
        accessorFn: (row) => row.eventType,
        id: 'eventType',
        header: ({ column }) => <DataGridColumnHeader title="Olay Tipi" column={column} />,
        enableSorting: true,
        cell: (info) => {                    
          return info.row.original.eventType;
        },
        meta: {
          headerTitle: 'eventType',
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      }, 
      {
        accessorFn: (row) => row.message,
        id: 'message',
        header: ({ column }) => <DataGridColumnHeader title="Mesaj" column={column} />,
        enableSorting: true,
        cell: (info) => {                    
          return info.row.original.message;
        },
        meta: {
          headerTitle: 'message',
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.relatedEntity,
        id: 'relatedEntity',
        header: ({ column }) => <DataGridColumnHeader title="İlgili Varlık" column={column} />,
        enableSorting: true,
        cell: (info) => {                    
          return info.row.original.relatedEntity;
        },
        meta: {
          headerTitle: 'relatedEntity',
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.relatedEntityId,
        id: 'relatedEntityId',
        header: ({ column }) => <DataGridColumnHeader title="relatedEntityId" column={column} />,
        enableSorting: true,
        cell: (info) => {                    
          return info.row.original.relatedEntityId;
        },
        meta: {
          headerTitle: 'relatedEntityId',
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.requestUrl,
        id: 'requestUrl',
        header: ({ column }) => <DataGridColumnHeader title="requestUrl" column={column} />,
        enableSorting: true,
        cell: (info) => {                    
          return info.row.original.requestUrl;
        },
        meta: {
          headerTitle: 'requestUrl',
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.source,
        id: 'source',
        header: ({ column }) => <DataGridColumnHeader title="Kaynak" column={column} />,
        enableSorting: true,
        cell: (info) => {                    
          return info.row.original.source;
        },
        meta: {
          headerTitle: 'source',
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: ({ column }) => <DataGridColumnHeader title="Durum" column={column} />,
        enableSorting: true,
        cell: (info) => {                    
          return info.row.original.status;
        },
        meta: {
          headerTitle: 'status',
          headerClassName: 'min-w-[55px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
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
          headerClassName: 'min-w-[50px]',
        },
      },
      {
        accessorFn: (row) => ( <div className='flex flex-col text-center'>
          <span>{formatDate(row.lastModificationTime)}</span>
          <span className='text text-sm italic'>{row.lastModifierUser?.AdSoyad}</span>
          </div>),
        id: 'lastModificationTime',
        header: ({ column }) => <DataGridColumnHeader title="Son Değişiklik Zamanı" column={column} />,
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          headerClassName: 'min-w-[50px]',
        },
      },
      /* {
        id: 'edit',
        header: () => '',
        enableSorting: false,
        cell: () => {                    
          return (
            <button className="btn btn-sm btn-icon btn-clear btn-light">
              <KeenIcon icon="notepad-edit" /> 
            </button>
          );
        },
        meta: {
          headerClassName: 'w-[60px]'
        }
      },      
      {
        id: 'delete',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          !row.original.isDeleted ? (
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => {if(confirm('Are you sure you want to delete the product?')){handleReloadOrDeleteFunc(row.original.logId , 'delete')} }}
            >
              <KeenIcon icon="trash" />
            </button>
          ) : (
            <div className='flex flex-col text-red-300 text-center'>
              <span>{formatDate(row.original.deletionTime)}</span>
              <span className='text text-sm italic'>{row.original.deleterUser?.fullName}</span>
              </div>
          )
        ),
        meta: {
          headerClassName: 'w-[60px]',
        },
      }, */
    ],
    [itemDataes]
  );

 /*  const handleReloadOrDeleteFunc = async(productId: any,type:any) => {
    const formData = new FormData();
    formData.append('productId',productId)
    try {
      const response: any = await axios.post(`${API_URL}/product/${type}`, {productId:productId});
      console.log(response)
      if (response) {
        if (response.data) {
          if (response.status === 201) {
            window.location.reload()
          } else {
            toast.error('Error delete or reload product' + response.data?.message, { duration: 5000 });
          }
        }
      }
    } catch (error) {
      console.log(error)
      toast.error('Error delete or reload product', { duration: 5000 });
    }
  }; */



 
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
        <h3 className="card-title">Sistem & Güvenlik Kayıtları</h3>
        <div className="input input-sm max-w-48">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="Kayıtlarda Ara"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <DataGridColumnVisibility table={table}/>
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
    onFetchData={fetchLogsData}
    rowSelection={true}
    getRowId={(row: any) => row.id}
    onRowSelectionChange={handleRowSelection}
    pagination={{ size: 100 }}
    toolbar={<Toolbar setSearchQuery={setSearchQuery} />}
    layout={{ card: true }}
  />
  )
};

export { Device };
