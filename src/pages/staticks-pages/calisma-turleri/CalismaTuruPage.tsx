import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { CalismaTuruContent } from '.';
import { useLayout } from '@/providers';

const CalismaTuruPage = () => {
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
        <CalismaTuruContent />
      </Container>
    </Fragment>
  );
};

export { CalismaTuruPage };
