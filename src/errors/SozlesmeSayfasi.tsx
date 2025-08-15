import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';


interface ITemplateData {
  SozlesmeID: number;
  Baslik: string;
  Aciklama: string;
  Anahtar: string;
}
const SozlesmeSayfasi = () => {
  const { anahtar } = useParams();
  const [item, setItem] = useState({} as ITemplateData);
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const navigate = useNavigate();
  console.log(anahtar)

  const fetchItem = async () => {
    try {
      const response = await fetch(`${API_URL}/sozlesmeler/get-sozlesme-item/${anahtar}`);
      const data = await response.json();
      if (data && data?.SozlesmeID) {
        setItem(data)
      } else {
        navigate('error/404')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
    }
  };

  useEffect(() => {
    if (anahtar) {
      fetchItem();
    } else {
      setItem({} as ITemplateData)
      navigate('error/404')
    }
  }, [anahtar])

  return (
    <Fragment>
       

      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
          </ToolbarHeading>

        </Toolbar>
      </Container>

      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <div className="">
            <div className="">

              <div className="text-gray-600 text-base leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: item.Aciklama }} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { SozlesmeSayfasi };
