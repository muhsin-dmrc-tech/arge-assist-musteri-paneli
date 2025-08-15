/* eslint-disable prettier/prettier */
import { useMemo, useState } from 'react';
import { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, DataGridRowSelect, DataGridRowSelectAll, KeenIcon, useDataGrid, DefaultTooltip, TDataGridRequestParams } from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { DeviceData, UserLoginsDataType } from '.';
import axios from 'axios';





interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const Device = () => {
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [itemDataes, setItemDataes] = useState<UserLoginsDataType[] | []>([]);

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

      const productData = await fetchUsers(queryParams)
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

  const fetchUsers = async (queryParams: any) => {
    try {
      const response = await axios.get(
        `${API_URL}/users/get-users-logins?${queryParams.toString()}`
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

  const columns = useMemo<ColumnDef<UserLoginsDataType>[]>(
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
        accessorFn: (row) => row.Kullanici?.AdSoyad,
        id: 'Kullanici',
        header: ({ column }) => <DataGridColumnHeader title="Kullanıcı" filter={<ColumnInputFilter column={column} />} column={column} />,
        enableSorting: true,
        cell: (info) => info.getValue() || '-',
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.Kullanici?.Email,
        id: 'Email',
        header: ({ column }) => <DataGridColumnHeader title="E-posta" filter={<ColumnInputFilter column={column} />} column={column} />,
        enableSorting: true,
        cell: (info) => info.getValue() || '-',
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.GirisZamani,
        id: 'GirisZamani',
        header: ({ column }) => <DataGridColumnHeader title="Giriş Zamanı" column={column} />,
        enableSorting: true,
        cell: (info) => formatDate(info.getValue()),
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.IPAdresi,
        id: 'IPAdresi',
        header: ({ column }) => <DataGridColumnHeader title="IP Adresi" filter={<ColumnInputFilter column={column} />} column={column} />,
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.CihazBilgisi,
        id: 'CihazBilgisi',
        header: ({ column }) => <DataGridColumnHeader title="Cihaz Bilgisi" filter={<ColumnInputFilter column={column} />} column={column} />,
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.BasariliMi,
        id: 'BasariliMi',
        header: ({ column }) => <DataGridColumnHeader title="Durum" column={column} />,
        enableSorting: false,
        cell: (info) => (
          <span className={`badge ${info.getValue() ? 'badge-success' : 'badge-danger'}`}>
            {info.getValue() ? 'Başarılı' : 'Başarısız'}
          </span>
        ),
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm'
        }
      },
      {
        accessorFn: (row) => row.HataNedeni,
        id: 'HataNedeni',
        header: ({ column }) => <DataGridColumnHeader title="Hata Nedeni" filter={<ColumnInputFilter column={column} />} column={column} />,
        enableSorting: true,
        cell: (info) => info.getValue() || '-',
        meta: {
          headerClassName: 'min-w-[50px]',
          cellClassName: 'text-sm text-gray-800 font-normal'
        }
      }
    ],
    [itemDataes]
  );




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
        <h3 className="card-title">Kullanıcı Giriş Kayıtları</h3>
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
