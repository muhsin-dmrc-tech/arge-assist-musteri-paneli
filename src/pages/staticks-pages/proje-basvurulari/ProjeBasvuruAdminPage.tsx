import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { ProjeBasvuruContent } from '.';
import { useLayout } from '@/providers';

const ProjeBasvuruAdminPage = () => {
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
        <ProjeBasvuruContent />
      </Container>
    </Fragment>
  );
};

export { ProjeBasvuruAdminPage };
