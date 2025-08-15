import { Input } from '@/components/ui/input'
import { type ItemValutype, type Step1Props } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { default as ReactSelect } from 'react-select';
import { SingleValue, ActionMeta } from 'react-select';

interface Teknokent {
  TeknokentID: number;
  TeknokentAdi: string;
}

interface TeknokentOption {
  value: number;
  label: string;
}
const Step1 = ({ itemValue, setitemValue }: Step1Props) => {
  // Select stilleri için ortak config
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '40px',
      borderRadius: '6px',
      borderColor: '#e2e8f0'
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999
    })
  };
  return (
    <div className="form-container">



      <div className="flex flex-col gap-4">

        {/* <div className="flex flex-col gap-1">
          <label>Teknokent</label>
          <ReactSelect
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            name="teknokent"
            value={teknokentler.find((item: Teknokent) =>
              item.TeknokentID === itemValue.TeknokentID
            ) ? {
              value: itemValue.TeknokentID,
              label: teknokentler.find((item: Teknokent) =>
                item.TeknokentID === itemValue.TeknokentID
              )?.TeknokentAdi || ''
            } : null}
            options={teknokentler.map((item: Teknokent) => ({
              value: item.TeknokentID,
              label: item.TeknokentAdi
            }))}
            placeholder="Teknokent Seçiniz"
            onChange={(
              newValue: SingleValue<TeknokentOption>,
              actionMeta: ActionMeta<TeknokentOption>
            ) => {
              setitemValue(prev => ({
                ...prev,
                TeknokentID: newValue ? newValue.value : 0
              }));
            }}
            styles={selectStyles}
          />
        </div> */}

        

        <div className="form-group">
          <label>Önerilen Proje İsmi</label>
          <Input
            value={itemValue.OnerilenProjeIsmi}
            onChange={(e) => setitemValue(prev => ({
              ...prev,
              OnerilenProjeIsmi: e.target.value
            }))}
            placeholder="Proje ismini giriniz"
          />
        </div>
      </div>
    </div>
  );
};

export default Step1;