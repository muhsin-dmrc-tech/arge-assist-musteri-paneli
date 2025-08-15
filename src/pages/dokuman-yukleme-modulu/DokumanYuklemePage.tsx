import { Fragment, useEffect } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { DokumanYuklemeContent } from '.';
import { useLayout } from '@/providers';
import { RaporProvider } from './DokumanYuklemeContextType';
import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

const DokumanYuklemePage = () => {
  const { currentLayout, setBreadCrumb } = useLayout();
  const { itemId } = useParams();


  useEffect(() => {
    setBreadCrumb([
      {
        title: 'Aylık Faaliyet Onay Süreci',
        path: '/aylik-faaliyet-raporlari'
      },
      {
        title: itemId ? 'Aylık Faaliyet Raporu Düzenle' : 'Aylık Faaliyet Raporu Oluştur',
        active: true
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
        <title>{itemId ? 'Aylık Faaliyet Raporu Düzenle-' : 'Aylık Faaliyet Raporu Oluştur-'}ARGE ASSIST</title>
      </Helmet>
      <RaporProvider>
        {currentLayout?.name === 'demo1-layout' && (
          <Container>
            <Toolbar>
              <ToolbarHeading>
                <ToolbarPageTitle text={itemId ? 'Aylık Faaliyet Raporu Düzenle' : 'Aylık Faaliyet Raporu Oluştur'} />
              </ToolbarHeading>

            </Toolbar>
          </Container>
        )}

        <Container>
          <DokumanYuklemeContent />
        </Container>
      </RaporProvider>
    </Fragment>
  );
};

export { DokumanYuklemePage };
