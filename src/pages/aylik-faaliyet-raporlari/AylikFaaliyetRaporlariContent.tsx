import { MiscHelp } from '@/partials/misc';
import { FaaliyetRaporlari } from './raporlar';

const AylikFaaliyetRaporlariContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <FaaliyetRaporlari />

     {/*  <MiscHelp /> */}
    </div>
  );
};

export { AylikFaaliyetRaporlariContent };
