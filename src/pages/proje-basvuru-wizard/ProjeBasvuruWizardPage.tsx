import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { ProjeBasvuruWizardContent } from '.';
import { useLayout } from '@/providers';

const ProjeBasvuruWizardPage = () => {
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
        <ProjeBasvuruWizardContent />
      </Container>
    </Fragment>
  );
};

export { ProjeBasvuruWizardPage };
