import { Fragment, useEffect } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { ProjeBasvuruDetayContent } from '.';
import { useLayout } from '@/providers';
import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from '@/auth';

interface IMenuBreadcrumb {
  title?: string;
  path?: string;
  active?: boolean;
}

const ProjeBasvuruDetayPage = () => {
  const { currentLayout,setBreadCrumb } = useLayout();
  const { itemId } = useParams();
    const { currentUser } = useAuthContext();

  useEffect(() => {
    setBreadCrumb([
      {
        title: 'Proje Başvuruları',
        path: currentUser?.KullaniciTipi === 2 ? '/statick/proje-basvurulari' : '/proje-basvurulari'
      },
      {
        title: 'Proje Başvurusu Detay',
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
        <title>Proje Başvurusu Detay-ARGE ASSIST</title>
      </Helmet>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text='Proje Başvurusu Detay' />
            </ToolbarHeading>

          </Toolbar>
        </Container>
      )}

      <Container>
        <ProjeBasvuruDetayContent />
      </Container>
    </Fragment>
  );
};

export { ProjeBasvuruDetayPage };
