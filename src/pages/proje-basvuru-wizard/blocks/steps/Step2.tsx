import React from 'react'
import { Input } from '@/components/ui/input';
import { type Step2Props } from '../../types';
import { Textarea } from '@/components/ui/textarea';

const Step2 = ({ itemValue, setitemValue }: Step2Props) => {
  return (
    <div className="form-container flex flex-col gap-3">
      <div className="alert">
        <div className="text-s bg-warning rounded-[15px] p-2">
          (Teknolojik İlerleme, Kullanıcı Kolaylığı, 
          Düşük Maliyetli Çözümler, Yeni İhtiyaçlar ve 
          Mevcut İhtiyaçlar, Kullanım Çeşitliliği, 
          Üretim Sürecini İyileştirmek gibi kriterler 
          çerçevesinde projenin konusu ve amacını detaylı bir şekilde açıklayınız.)
        </div>
      </div>
      <div className="form-group">
        <label className="block mb-2">Projenin Konusu ve Amacını Açıklayınız.</label>
        <Textarea
          value={itemValue.ProjeKonusuVeAmaci}
          onChange={(e) => setitemValue(prev => ({
            ...prev,
            ProjeKonusuVeAmaci: e.target.value
          }))}
          placeholder="Projenin Konusu ve Amacını Açıklayınız."
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};

export default Step2;