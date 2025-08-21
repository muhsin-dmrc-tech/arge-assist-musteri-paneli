import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { Link, useParams } from 'react-router-dom';
import { AccountPlansContent } from '.';
import { useLayout } from '@/providers';

const AccountPlansPage = () => {
  const { currentLayout } = useLayout();
  const { getfirmaId } = useParams();

  return (
    <Fragment>

      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading title="Abonelik Planları"/>
            <ToolbarActions>
              <Link to={`/faturalar`} className="btn btn-sm btn-light">
                Faturalandırmayı Görüntüle
              </Link>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <AccountPlansContent />
      </Container>
    </Fragment>
  );
};

export { AccountPlansPage };
