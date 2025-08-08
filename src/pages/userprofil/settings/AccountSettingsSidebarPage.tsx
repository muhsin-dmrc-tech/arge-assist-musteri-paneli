import { Fragment } from 'react';
import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';

import { AccountSettingsSidebarContent } from '.';
import { useLayout } from '@/providers';
import { Helmet } from 'react-helmet-async';

const AccountSettingsSidebarPage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text={'Hesap Ayarları'}/>
              <ToolbarDescription>
              Hesabınızı Yönetin
                </ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        <AccountSettingsSidebarContent />
      </Container>
    </Fragment>
  );
};

export { AccountSettingsSidebarPage };
