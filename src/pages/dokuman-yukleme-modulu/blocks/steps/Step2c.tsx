import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';
import { handleSubmitPropsType, SGKTahakkuktype } from '../../types';
import { useRapor } from '../../DokumanYuklemeContextType';
import { produce } from 'immer';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';


interface Step1Props {
    fetchFile: (filepath: string) => Promise<any>;
    setErrors: React.Dispatch<React.SetStateAction<{ index: number; error: string; }[]>>;
    errors: { index: number; error: string; }[]
    setTamamlananlar: React.Dispatch<React.SetStateAction<{ index: number; }[]>>;
    tamamlananlar: { index: number; }[];
    handleSubmit: ({ stepId, file, belgeAdi }: handleSubmitPropsType) => Promise<any>;
    adimSelect: (index: number) => void;
    goToNext: () => void;
}

interface primlerType {
    no: number;
    aciklama: string;
    primeEsasKazanc: string;
    primOrani: string;
    primTutari: string;
}

interface dataValueType {
    kisiSayisi: string;
    gunSayisi: string;
    toplamPrim: string;
    primIndirimi5746: string;
    issizlikTutari: string;
    primIndirimi5510: string;
    netPrimTutari: string;
    odenecekNetTutar: string;
}

const Step2c = ({ fetchFile, setErrors, errors, tamamlananlar, setTamamlananlar, adimSelect, handleSubmit, goToNext }: Step1Props) => {
    const [loading, setLoading] = useState(false);
    const [dosyaEklendi, setDosyaEklendi] = useState(false);
    const [primler, setPrimler] = useState<primlerType[]>([]);
    const [dataValue, setDataValue] = useState<dataValueType>({} as dataValueType);
    const { setSGKTahakkuk, projeRaporu } = useRapor();


    useEffect(() => {
        const processExistingFile = async () => {
            if (projeRaporu?.SGKTahakkuk && typeof projeRaporu.SGKTahakkuk === 'string' && !dosyaEklendi) {
                resetStatesFunc()
                try {
                    setLoading(true);
                    const response = await fetchFile('SGKTahakkuk');
                    if (!response.data) {
                        return
                    }
                    if (response.data.error) {
                        setErrors(prev => [...prev, {
                            index: 2,
                            error: response.data.error
                        }]);
                        setTamamlananlar(prev => prev.filter(error => error.index !== 2));

                    } else {
                        if (response.data?.sgkTahakkuk && response.data?.sgkTahakkuk?.sgkTahakkuk) {
                            setSGKTahakkuk(response.data?.sgkTahakkuk?.sgkTahakkuk ?? {})
                            setDataValue(response.data?.sgkTahakkuk?.dataValue ?? {})
                            setPrimler(response.data?.sgkTahakkuk?.primler ?? [])
                            setErrors(prev => prev.filter(error => error.index !== 2));
                            setTamamlananlar(prev =>
                                produce(prev, draft => {
                                    const exists = draft.some(item => item.index === 2);
                                    if (!exists) {
                                        draft.push({ index: 2 });
                                    }
                                })
                            );
                        }

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
    }, [projeRaporu?.SGKTahakkuk, dosyaEklendi]);



    const resetStatesFunc = () => {
        setSGKTahakkuk({} as SGKTahakkuktype);
        setDosyaEklendi(false);
    }







    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        resetStatesFunc();
        setDosyaEklendi(true)
        adimSelect(2)

        // Dosya tipi kontrolü
        if (!file.type || file.type !== 'application/pdf') {
            toast.error('Geçersiz dosya tipi. Lütfen pdf formatında dosya seçin', { duration: 5000 });
            return;
        }

        const response = await handleSubmit({ stepId: 2, file, belgeAdi: 'SGKTahakkuk' });


        if (response.error) {
            setErrors(prev => [...prev, {
                index: 2,
                error: response.error
            }]);
            setTamamlananlar(prev => prev.filter(error => error.index !== 2));
        } else {
            setErrors(prev => prev.filter(error => error.index !== 2));
            setSGKTahakkuk(response.data?.sgkTahakkuk ?? {})
            setDataValue(response.data?.dataValue ?? {})
            setPrimler(response.data?.primler ?? [])
            setTamamlananlar(prev =>
                produce(prev, draft => {
                    const exists = draft.some(item => item.index === 2);
                    if (!exists) {
                        draft.push({ index: 2 });
                    }
                })
            );
            setLoading(false)
            goToNext()
        }
    }, [handleSubmit]);







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
                    {errors.find(i => i.index === 1) && <div className="error-message text-red-700">{errors.find(i => i.index === 1)?.error}</div>}



                    {projeRaporu?.Onaylimi ?
                        <div className="flex p-5 rounded-lg border items-center justify-center">
                            <span>Proje hakem onay işlemi başarıyla tamamlandı. Bu aşamadan sonra sistem üzerinde herhangi bir değişiklik yapılamamaktadır.</span>
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
                        </Box>}



                </div>

                {primler.length > 0 && (
                    <div>
                        <TableContainer component={Paper} sx={{ mt: 4 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Açıklama</TableCell>
                                        <TableCell>PRİME ESAS KAZANÇ TUTARI</TableCell>
                                        <TableCell>PRİM ORANI %</TableCell>
                                        <TableCell>PRİM TUTARI</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {primler.map((item: any, idx: any) => (
                                        <TableRow key={idx} className='hover:bg-gray-100'>
                                            <TableCell className='flex flex-row'>{item.no}</TableCell>
                                            <TableCell>{item.aciklama}</TableCell>
                                            <TableCell>{item.primeEsasKazanc}</TableCell>
                                            <TableCell>{item.primOrani}</TableCell>
                                            <TableCell>{item.primTutari}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}

                {dataValue && dataValue.kisiSayisi &&
                    <Box sx={{ mt: 3 }}>
                        <Typography><strong>Kiş sayısı:</strong> {dataValue.kisiSayisi}</Typography>
                        <Typography><strong>Gün sayısı:</strong> {dataValue.gunSayisi}</Typography>
                        <Typography><strong>Toplam prim:</strong> {dataValue.toplamPrim}</Typography>
                        <Typography><strong>05746 sayılı kanundan doğan prim indirimi:</strong> {dataValue.primIndirimi5746}</Typography>
                        <Typography><strong>05510 sayılı kanundan doğan prim indirimi:</strong> {dataValue.primIndirimi5510}</Typography>
                        <Typography><strong>İşsizlik tutarı:</strong> {dataValue.issizlikTutari}</Typography>
                        <Typography><strong>Net prim tutarı:</strong> {dataValue.netPrimTutari}</Typography>
                        <Typography><strong>Ödenecek net tutarı:</strong> {dataValue.odenecekNetTutar}</Typography>
                    </Box>}

            </div>
        </div>
    );
};

export default Step2c;
