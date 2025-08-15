import React from 'react'
import { Textarea } from '@/components/ui/textarea';
import { type Step3Props } from '../../types';

const Step3 = ({ itemValue, setitemValue }: Step3Props) => {
  return (
    <div className="form-container">
      <div className="form-group">
        <label className="block mb-2">Projeyi ortaya çıkaran problem nedir?</label>
        <Textarea
          value={itemValue.ProjeyiOrtayaCikaranProblem}
          onChange={(e) => setitemValue(prev => ({
            ...prev,
            ProjeyiOrtayaCikaranProblem: e.target.value
          }))}
          placeholder="Projeyi ortaya çıkaran problem"
          className="min-h-[200px]"
        />
      </div>

      <div className="form-group">
        <label className="block mb-2">Proje kapsamında önerdiğiniz çözüm nedir?</label>
        <Textarea
          value={itemValue.ProjeKapsamindakiCozum}
          onChange={(e) => setitemValue(prev => ({
            ...prev,
            ProjeKapsamindakiCozum: e.target.value
          }))}
          placeholder="Proje kapsamında önerdiğiniz çözüm"
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};

export default Step3;