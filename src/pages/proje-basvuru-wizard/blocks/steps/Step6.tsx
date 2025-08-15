import React from 'react'
import { Textarea } from '@/components/ui/textarea';
import { type Step6Props } from '../../types';

const Step6 = ({ itemValue, setitemValue, handlePdfUploadClick, handleFileChange, fileInputRef, fileError, basvuruEki,item,fetchFile }: Step6Props) => {

  return (
    <div className="form-container flex flex-col gap-3">
      <div className="alert">
        <div className="text-s bg-warning rounded-[15px] p-2">
          (Ticari başarı potansiyeli hakkında bilgi veriniz. Satış stratejilerinizi detaylı anlatınız.)
        </div>
      </div>
      <div className="form-group">
        <label className="block mb-2">Ticari başarı potansiyeli?</label>
        <Textarea
          value={itemValue.TicariBasariPotansiyeli}
          onChange={(e) => setitemValue(prev => ({
            ...prev,
            TicariBasariPotansiyeli: e.target.value
          }))}
          placeholder="Ticari başarı potansiyeli hakkında bilgi veriniz"
          className="min-h-[200px]"
        />
      </div>

      <div className="col-span-12 md:col-span-9 flex flex-col gap-1">
        <div className="text-s bg-warning rounded-[15px] p-2">
          (Proje ile ilgili ek dosya yükleyebilirsiniz.)
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
          className="hidden"
        />

        <div className="flex flex-col gap-1 me-2">
          <button
            onClick={handlePdfUploadClick}
            className="btn btn-sm btn-secondary text-white"
          >
            {basvuruEki ? basvuruEki.name : 'Dosya Yükle'}
          </button>

          {fileError && (
            <div className="text-red-500 text-sm">
              {fileError}
            </div>
          )}
          {itemValue.DosyaEki &&
            <div className="text-yellow-500 text-sm">
              {itemValue.DosyaEki}
            </div>
          }


        </div>
        {
          item.DosyaEki &&
          <button
            className="btn btn-sm btn-primary"
            onClick={fetchFile}
          >
            Dosya Eki'ni İndir
          </button>
        }

      </div>

    </div>
  );
};

export default Step6;