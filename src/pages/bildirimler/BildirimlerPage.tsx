import { Fragment } from 'react';

import { toAbsoluteUrl } from '@/utils/Assets';
import { Container } from '@/components/container';

import { BildirimArsiviContent } from '.';

const BildirimArsiviPage = () => {
  const image = (
    <img
      src={toAbsoluteUrl('/media/avatars/300-1.png')}
      className="rounded-full border-3 border-success size-[100px] shrink-0"
    />
  );

  return (
    <Fragment>
      <Container>
        <div className="flex flex-wrap items-center gap-5 justify-between mb-7.5">
          <h3 className="text-lg text-gray-900 font-semibold">Bildirim Arşivi</h3>
        </div>
        <BildirimArsiviContent />
      </Container>
    </Fragment>
  );
};

export { BildirimArsiviPage };
