import React from 'react'
import { Textarea } from '@/components/ui/textarea';
import { type Step3Props } from '../../types';

const Step4 = ({ itemValue, setitemValue }: Step3Props) => {
  return (
    <div className="form-container flex flex-col gap-3">
      <div className="alert">
        <div className="text-s bg-warning rounded-[15px] p-2">
          (Detaylı ve teknik olarak açıklayınız. 
          Kullanmak istediğiniz teknoloji ve yöntemleri de 
          detaylı belirtiniz. Modüler bir proje ise modül 
          modül açıklamanız gerekmektedir.)
        </div>
      </div>
      <div className="form-group">
        <label className="block mb-2">Projenin İçerdiği Ürün ve Yeniliklerini Açıklayınız</label>
        <Textarea
          value={itemValue.ProjeninIcerdigiYenilikler}
          onChange={(e) => setitemValue(prev => ({
            ...prev,
            ProjeninIcerdigiYenilikler: e.target.value
          }))}
          placeholder="Projenin İçerdiği Ürün ve Yeniliklerini Açıklayınız"
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};

export default Step4;