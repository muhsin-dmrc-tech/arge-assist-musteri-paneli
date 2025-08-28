import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';
import { FarklılarListesiData, handleSubmitPropsType } from '../../types';
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

const Step2a = ({ fetchFile, setErrors, errors, tamamlananlar, handleSubmit, setTamamlananlar, adimSelect, goToNext }: Step1Props) => {
    const [loading, setLoading] = useState(false);
    const [dosyaEklendi, setDosyaEklendi] = useState(false);
    const { projeRaporu, onayliSgkHizmetListesi,setOnayliSgkHizmetListesi } = useRapor()


    useEffect(() => {
        const processExistingFile = async () => {
            if (projeRaporu?.OnayliSGKHizmet && typeof projeRaporu.OnayliSGKHizmet === 'string' && !dosyaEklendi && !projeRaporu?.OnayliMuhtasarVePrim) {
                resetStatesFunc()
                try {
                    setLoading(true);
                    const response = await fetchFile('OnayliSGKHizmet');
                    if (!response.data) {
                        return
                    }

                    
                    if (response.data.error) {
                        setErrors(prev => [...prev, {
                            index: 0,
                            error: response.data.error
                        }]);
                        setTamamlananlar(prev => prev.filter(error => error.index !== 0));
                    } else if(response.data.onayliSgkHizmet && response.data.onayliSgkHizmet.geciciListe && response.data.onayliSgkHizmet.geciciListe.length > 0) {
                        setErrors(prev => prev.filter(error => error.index !== 0));
                        setOnayliSgkHizmetListesi(response.data.onayliSgkHizmet.geciciListe ?? [])

                        setTamamlananlar(prev =>
                            produce(prev, draft => {
                                const exists = draft.some(item => item.index === 0);
                                if (!exists) {
                                    draft.push({ index: 0 });
                                }
                            })
                        );
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
    }, [projeRaporu?.OnayliSGKHizmet,dosyaEklendi]);



    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        resetStatesFunc();
        setDosyaEklendi(true)
        adimSelect(0)

        // Dosya tipi kontrolü
        if (!file.type || file.type !== 'application/pdf') {
            toast.error('Geçersiz dosya tipi. Lütfen pdf formatında dosya seçin', { duration: 5000 });
            return;
        }

        const response = await handleSubmit({ stepId: 3, file, belgeAdi: 'OnayliSGKHizmet' });


        if (response.error) {
            setErrors(prev => [...prev, {
                index: 0,
                error: response.error
            }]);
            setTamamlananlar(prev => prev.filter(error => error.index !== 0));
        } else {
            setErrors(prev => prev.filter(error => error.index !== 0));
            setOnayliSgkHizmetListesi(response.personelListesi?.geciciListe ?? [])
            setTamamlananlar(prev =>
                produce(prev, draft => {
                    const exists = draft.some(item => item.index === 0);
                    if (!exists) {
                        draft.push({ index: 0 });
                    }
                })
            );
            setLoading(false)
            goToNext()
        }
    }, [handleSubmit]);







    const resetStatesFunc = () => {
        setOnayliSgkHizmetListesi([]);
        setDosyaEklendi(false);
        //setTamamlananlar(prev => prev.filter(error => error.index !== 0));
    }



    useEffect(() => {
        if (errors.filter(error => error.index === 0).length > 0) {
            setOnayliSgkHizmetListesi([]);
        }
    }, [errors])



    const aktifListe = onayliSgkHizmetListesi.length > 0 ? onayliSgkHizmetListesi : [];

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
                    {errors.find(i => i.index === 0) && <div className="error-message text-red-700">{errors.find(i => i.index === 0)?.error}</div>}

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
                        </Box>}



                    {aktifListe.length > 0 && (

                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Typography variant="h6" className='p-3'>
                                Onaylı SGK Hizmet Listesi
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.Guvenlik No</TableCell>
                                        <TableCell>Adı</TableCell>
                                        <TableCell>Soyadı</TableCell>
                                        <TableCell>Gün</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {aktifListe.map((row, index) => (
                                        <TableRow key={index} className='hover:bg-gray-100'>
                                            <TableCell>{row.tcKimlikNo}</TableCell>
                                            <TableCell>{row.ad}</TableCell>
                                            <TableCell>{row.soyAd}</TableCell>
                                            <TableCell>{row.Gun ?? 0}</TableCell>
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
};

export default Step2a;
