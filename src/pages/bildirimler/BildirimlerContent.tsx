import { Fragment, useEffect, useState } from 'react';
import { ActivitiesNewArticle, bildirimType } from './ActivitiesNewArticle';
import { toast } from 'sonner';
import axios from 'axios';
import Pagination from './Pagination';
import { CircularProgress } from '@mui/material';

interface yearsTYpe {
  Yil: number
}

const BildirimArsiviContent = () => {
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const [currentYear, setCurrentYear] = useState<number>();
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [bildirimler, setBildirimler] = useState<bildirimType[]>([]);
  const [years, setYears] = useState<yearsTYpe[]>([]);
  const [loading, setLoading] = useState(false);



  const fetchBildirimler = async () => {
    setLoading(true)
    const queryParams = new URLSearchParams();

    queryParams.set('page', String(pageIndex));
    queryParams.set('items_per_page', '100');
    if (currentYear) {
      queryParams.set('selectyear', String(currentYear));
    }

    try {
      const response = await axios.get(
        `${API_URL}/mp-kullanici-bildirimleri/get-bildirim-arsiv?${queryParams.toString()}`
      );
      if (response.data.selectedYear) {
        setCurrentYear(Number(response.data.selectedYear))
      }
      if (response.data.total) {
        setTotalCount(response.data.total)
      }
      if (response.data.yillar) {
        setYears(response.data.yillar)
      }
      setBildirimler(response.data.data)

    } catch (error: any) {
      const message = error.response?.data?.message ?? `Veriler getirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin`;
      toast(`Bağlantı hatası`, {
        description: message,
        action: {
          label: 'Ok',
          onClick: () => { console.log('Ok') }
        }
      });
    }
    setLoading(false)
  }


  useEffect(() => {
    if (pageIndex > 0) {
      fetchBildirimler();
    }
  }, [pageIndex, currentYear]);



  const year = years.find(y => y.Yil === currentYear) ?? null;
  return (
    <div className="flex gap-5 lg:gap-7.5">

      {loading ? <CircularProgress /> :


        (
          year ?
            <div
              className={`card grow ${year.Yil === currentYear ? '' : 'hidden'}`}
              id={`activity_${year.Yil}`}
            >
              <div className="card-header">
                <h3 className="card-title">{year.Yil} yılına ait bildirimler</h3>
                <div className="flex items-center gap-2">
                  {/* <label className="switch">
                <input className="order-2" type="checkbox" value="1" name="check" defaultChecked />
                <span className="switch-label">
                  Auto refresh:&nbsp;
                  <span className="switch-on:hidden">Off</span>
                  <span className="hidden switch-on:inline">On</span>
                </span>
              </label> */}
                </div>
              </div>
              <div className="card-body">
                {bildirimler && bildirimler.map((bildirim, index) =>
                  <ActivitiesNewArticle key={index} bildirim={bildirim} line={bildirimler.length !== index + 1} />)
                }
              </div>

              {Math.ceil(totalCount / 100) > 1 &&
                <div className="card-footer justify-center">
                  <Pagination
                    currentPage={pageIndex}
                    totalPages={Math.ceil(totalCount / 100)}
                    onPageChange={(page) => {
                      setPageIndex(page);
                      fetchBildirimler();
                    }}
                  />
                </div>}
            </div> :

            <div className="flex border rounded-lg p-5 w-full justify-center items-center">
              <span>Şu anda herhangi bir bildiriminiz yok.</span>
            </div>

        )



      }

      {years && years.length > 0 && <div className="flex flex-col gap-2.5" data-tabs="true">
        {years.map((year, index) => (
          <button
            key={index}
            data-tab-toggle={`#activity_${year.Yil}`}
            className={`btn btn-sm text-gray-600 hover:text-primary tab-active:bg-primary-light tab-active:text-primary ${year.Yil === currentYear ? 'active' : ''
              }`}
            onClick={() => {
              if (year.Yil !== currentYear) {
                setPageIndex(1);
                setCurrentYear(year.Yil);
              }
            }}
          >
            {year.Yil}
          </button>
        ))}
      </div>}
    </div>
  );
};

export { BildirimArsiviContent };
