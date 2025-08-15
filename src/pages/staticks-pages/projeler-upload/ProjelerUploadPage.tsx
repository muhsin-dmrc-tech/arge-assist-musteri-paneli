import { Fragment, useEffect } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { ProjelerUploadContent } from '.';
import { useLayout } from '@/providers';
import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

interface IMenuBreadcrumb {
  title?: string;
  path?: string;
  active?: boolean;
}

const ProjelerUploadPage = () => {
  const { currentLayout,setBreadCrumb } = useLayout();
  const { itemId } = useParams();

  useEffect(() => {
    setBreadCrumb([
      {
        title: 'Proje Listesi',
        path: '/admin-projeler'
      },
      {
        title: itemId ? 'Proje Düzenle' : 'Proje Ekle',
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
        <title>{itemId ? `Proje Düzenle-` : `Proje Ekle-`}ARGE ASSIST</title>
      </Helmet>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text={itemId ? 'Proje Düzenle' : 'Proje Ekle'} />
            </ToolbarHeading>

          </Toolbar>
        </Container>
      )}

      <Container>
        <ProjelerUploadContent />
      </Container>
    </Fragment>
  );
};

export { ProjelerUploadPage };
