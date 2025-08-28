import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';
import { DonemType, handleSubmitPropsType } from '../../types';
import { useRapor } from '../../DokumanYuklemeContextType';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useParams } from 'react-router';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';



interface StepProps {
  fetchFile: (filepath: string) => Promise<any>;
  handleSubmit: ({ stepId, file, belgeAdi }: handleSubmitPropsType) => Promise<any>;
  donemler: DonemType[]
}
const Step = ({ fetchFile, handleSubmit, donemler }: StepProps) => {
  const { itemId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dosyaEklendi, setDosyaEklendi] = useState(false);
  const { calismaSureleriData, setCalismaSureleriData, itemValue, projeRaporu, setitemValue } = useRapor();

  useEffect(() => {
    const processExistingFile = async () => {
      if (projeRaporu?.CalismaSureleri && typeof projeRaporu.CalismaSureleri === 'string' && !dosyaEklendi && !projeRaporu?.SGKHizmet) {
        resetStatesFunc()
        try {
          setLoading(true);
          const response = await fetchFile('SGKHizmet');
          if (!response.data) {
            return
          }
          if (response.error) {
            setError(response.data.error);
          } else if (response.data.calismaSureleri && response.data.calismaSureleri && response.data.calismaSureleri.length > 0) {
            setError('');
            setCalismaSureleriData(response.data.calismaSureleri ?? [])
          }
        } catch (error) {
          console.error('PDF işleme hatası:', error);
          toast.error('PDF işlenirken bir hata oluştu', { duration: 5000 });
        } finally {
          setLoading(false);
        }
      }
    };

    processExistingFile();
  }, [projeRaporu?.CalismaSureleri, dosyaEklendi]);


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    resetStatesFunc();
    setDosyaEklendi(true)
    // Dosya tipi kontrolü
    if (!file.type || file.type !== 'application/pdf') {
      toast.error('Geçersiz dosya tipi. Lütfen pdf formatında dosya seçin', { duration: 5000 });
      return;
    }

    const response = await handleSubmit({ stepId: 1, file, belgeAdi: 'CalismaSureleri' });
    if (response.error) {
      setError(response.error);
    } else {
      setError('');
      setCalismaSureleriData(response.personelListesi ?? [])
      setLoading(false)
    }
  }, [handleSubmit]);

  const resetStatesFunc = () => {
    setCalismaSureleriData([]);
    setDosyaEklendi(false);
  }


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div className="form-container min-h-[100%]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label>SGK Çalışan Bildirgesi Gün Detaylı Raporu</label>
          {error && <div className="error-message text-red-700">{error}</div>}


          <div className="flex flex-col gap-1">
            <label>Dönem Seç</label>
            {donemler.length < 1 ? <span className='text-red-700'>Hiç dönem bulunamadı.</span> : ''}
            <Select disabled={itemId ? true : false} value={itemValue.DonemID > 0 ? itemValue.DonemID.toString() : ''} onValueChange={(value) => setitemValue({ ...itemValue, DonemID: Number(value) })} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Dönem Seçin" />
              </SelectTrigger>
              <SelectContent>
                {donemler?.map((item: any) => (<SelectItem key={item.DonemID} value={item.DonemID?.toString()}>{item?.DonemAdi}</SelectItem>))}

              </SelectContent>
            </Select>
          </div>


          {projeRaporu?.Onaylimi ?
            <div className="flex p-5 rounded-lg border items-center justify-center">
              <span>Onay işlemi başarıyla tamamlandı. Bu aşamadan sonra sistem üzerinde herhangi bir değişiklik yapılamamaktadır.</span>
            </div> :
            <Box {...getRootProps()} sx={{
              border: '2px dashed #cccccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? '#f0f0f0' : 'white',
              '&:hover': {
                bgcolor: '#f0f0f0'
              }
            }}>
              <input {...getInputProps()} />
              {loading ? (
                <CircularProgress />
              ) : (
                <Typography>
                  {isDragActive
                    ? 'Dosyayı buraya bırakın'
                    : 'PDF dosyasını sürükleyip bırakın veya tıklayarak seçin'}
                </Typography>
              )}
            </Box>
          }

          {calismaSureleriData.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>TC Kimlik No</TableCell>
                    <TableCell>Personel</TableCell>
                    <TableCell>Başlangıç Tarihi</TableCell>
                    <TableCell>Gelir Vergi İstisnası Gün</TableCell>
                    <TableCell>Sigorta Primi İşveren Hissesi Gün</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>

                  {calismaSureleriData.length > 0 && calismaSureleriData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.tcKimlikNo}</TableCell>
                      <TableCell>{row.ad} {row.soyAd}</TableCell>
                      <TableCell>{row.baslangicTarihi}</TableCell>
                      <TableCell>{row.gelirVergiIstisnasi}</TableCell>
                      <TableCell>{row.sigortaPrimiIsverenHissesi}</TableCell>
                    </TableRow>
                  ))}

                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step