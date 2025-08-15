import { MiscHelp } from '@/partials/misc';

import { Templates } from './blocks';

const EmailTemplatesContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Templates />

     {/*  <MiscHelp /> */}
    </div>
  );
};

export { EmailTemplatesContent };
