import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
 

import { GiderTipiContent } from '.';
import { useLayout } from '@/providers';

const GiderTipiPage = () => {
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
        <GiderTipiContent />
      </Container>
    </Fragment>
  );
};

export { GiderTipiPage };
