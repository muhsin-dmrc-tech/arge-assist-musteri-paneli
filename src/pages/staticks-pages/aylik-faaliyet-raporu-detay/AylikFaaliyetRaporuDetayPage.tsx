import { Fragment, useEffect } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { AylikFaaliyetRaporuDetayContent } from '.';
import { useLayout } from '@/providers';
import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from '@/auth';

interface IMenuBreadcrumb {
  title?: string;
  path?: string;
  active?: boolean;
}

const AylikFaaliyetRaporuDetayPage = () => {
  const { currentLayout,setBreadCrumb } = useLayout();
  const { itemId } = useParams();
    const { currentUser } = useAuthContext();

  useEffect(() => {
    setBreadCrumb([
      {
        title: 'Aylık Faaliyet Raporları',
        path: '/admin-aylik-faaliyet-raporlari'
      },
      {
        title: 'Aylık Faaliyet Raporu Detay',
        active:true
      }
    ]);

    // Component unmount olduğunda manuelItems'ı temizle
    return () => {
      setBreadCrumb([]);
    };
  }, [itemId]);

  return (
    <Fragment>
      
      <Helmet>
        <title>Aylık Faaliyet Raporu Detay-ARGE ASSIST</title>
      </Helmet>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text='Aylık Faaliyet Raporu Detay' />
            </ToolbarHeading>

          </Toolbar>
        </Container>
      )}

      <Container>
        <AylikFaaliyetRaporuDetayContent />
      </Container>
    </Fragment>
  );
};

export { AylikFaaliyetRaporuDetayPage };
