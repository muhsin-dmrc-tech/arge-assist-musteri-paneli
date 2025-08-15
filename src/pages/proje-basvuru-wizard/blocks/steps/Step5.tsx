import React from 'react'
import { Textarea } from '@/components/ui/textarea';
import { type Step3Props } from '../../types';

const Step5 = ({ itemValue, setitemValue }: Step3Props) => {
  return (
    <div className="form-container flex flex-col gap-3">
      <div className="alert">
        <div className="text-s bg-warning rounded-[15px] p-2">
          (Rakip analizi yapıldıysa detaylı belirtmeniz gerekmektedir.)
        </div>
      </div>
      <div className="form-group">
        <label className="block mb-2">Rakipleriniz kimlerdir?</label>
        <Textarea
          value={itemValue.RakipAnalizi}
          onChange={(e) => setitemValue(prev => ({
            ...prev,
            RakipAnalizi: e.target.value
          }))}
          placeholder="Rakip analizi yapıldıysa detaylı belirtmeniz gerekmektedir"
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};

export default Step5;