import { MiscHelp } from '@/partials/misc';

import { Bildirimler } from './blocks';
import { KullaniciBildirimleri } from './blocks/kullanici-bildirimleri';

const BildirimlerContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Bildirimler />

      <KullaniciBildirimleri/>

     {/*  <MiscHelp /> */}
    </div>
  );
};

export { BildirimlerContent };
