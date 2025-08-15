import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
 

import { RotaIzinleriContent } from '.';
import { useLayout } from '@/providers';

const RotaIzinleriPage = () => {
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
        <RotaIzinleriContent />
      </Container>
    </Fragment>
  );
};

export { RotaIzinleriPage };
