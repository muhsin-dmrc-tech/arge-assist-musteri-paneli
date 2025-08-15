import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { TesvikHesaplamaModulContent } from '.';
import { useLayout } from '@/providers';

const TesvikHesaplamaModulPage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>

      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
            </ToolbarHeading>
            
          </Toolbar>
        </Container>
      )}

      <Container>
        <TesvikHesaplamaModulContent />
      </Container>
    </Fragment>
  );
};

export { TesvikHesaplamaModulPage };
