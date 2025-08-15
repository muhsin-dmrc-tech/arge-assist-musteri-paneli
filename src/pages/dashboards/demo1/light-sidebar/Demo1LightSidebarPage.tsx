import { Fragment, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';

import { useAuthContext } from '@/auth';

const Demo1LightSidebarPage = () => {
const {currentUser} = useAuthContext();

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading title={
            <span className='text-md decoration-uppercase'>{currentUser?.AdSoyad && "Hoşgeldin "+currentUser?.AdSoyad.split(' ')[0]}</span>} description="" />
          <ToolbarActions>
            
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
       {/* <Demo1LightSidebarContent /> */}

       <div>Dashboard Düzenlenecek</div>
      </Container>
    </Fragment>
  );
};

export { Demo1LightSidebarPage };
