import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { OdemeSayfasiContent } from '.';
import { useLayout } from '@/providers';
import { Helmet } from 'react-helmet-async';

const OdemeSayfasiPage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      <Helmet>
        <title>Güvenli Ödeme-ARGE ASSIST</title>
      </Helmet>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text='Güvenli Ödeme' />
            </ToolbarHeading>

          </Toolbar>
        </Container>
      )}

      <Container className='px-0'>
        <OdemeSayfasiContent />
      </Container>
    </Fragment>
  );
};

export { OdemeSayfasiPage };
