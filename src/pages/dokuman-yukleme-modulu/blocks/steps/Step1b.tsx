import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box, Typography, Checkbox, FormControlLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';
import { FarklılarListesiData, handleSubmitPropsType, MuhtasarBeyannameMeta } from '../../types';
import { useRapor } from '../../DokumanYuklemeContextType';
import { DefaultTooltip, KeenIcon } from '@/components';
import { produce } from 'immer';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';


interface Step1Props {
    fetchFile: (filepath: string) => Promise<any>;
    setErrors: React.Dispatch<React.SetStateAction<{ index: number; error: string; }[]>>;
    errors: { index: number; error: string; }[]
    setTamamlananlar: React.Dispatch<React.SetStateAction<{ index: number; }[]>>;
    tamamlananlar: { index: number; }[]
    handleSubmit: ({ stepId, file, belgeAdi }: handleSubmitPropsType) => Promise<any>;
    adimSelect: (index: number) => void;
    goToNext: () => void;
}

const Step1b = ({ fetchFile, setErrors, errors, tamamlananlar, setTamamlananlar, adimSelect, handleSubmit, goToNext }: Step1Props) => {
    const [loading, setLoading] = useState(false);
    const [dosyaEklendi, setDosyaEklendi] = useState(false);
    const [farkliListesi, setFarkliListesi] = useState<FarklılarListesiData[]>([] as FarklılarListesiData[]);
    const [geciciListe, setGeciciListe] = useState<FarklılarListesiData[]>([]);
    const { muhtasarMeta, setMuhtasarMeta,projeRaporu, muhtasarTableData, setSgkHizmetListesi, setMuhtasarTableData,setCalismaSureleriData } = useRapor()
    const [yuklenenDosya, setYuklenenDosya] = useState<File | null>(null);
    const [checkedList, setCheckedList] = useState<any>({});


    useEffect(() => {
        const processExistingFile = async () => {
            if (projeRaporu?.MuhtasarVePrim && typeof projeRaporu.MuhtasarVePrim === 'string' && !dosyaEklendi) {
                resetStatesFunc()
                try {
                    setLoading(true);
                    const response = await fetchFile('MuhtasarVePrim');
                    if (!response.data) {
                        return
                    }
                    if (response.data.error) {
                        setErrors(prev => [...prev, {
                            index: 1,
                            error: response.data.error
                        }]);
                        setTamamlananlar(prev => prev.filter(error => error.index !== 1));
                        if (response.data?.muhtasar && response.data?.muhtasar.personelListesi && response.data?.muhtasar.personelListesi.farklilar?.length > 0) {
                            setGeciciListe(response.data?.muhtasar.personelListesi.geciciListe ?? [])
                            setFarkliListesi(response.data?.muhtasar.personelListesi.farklilar ?? [])
                        }
                        if (response.data?.muhtasar && response.data?.muhtasar.muhtasarMeta) {
                            setMuhtasarMeta(response.data?.muhtasar.muhtasarMeta)
                        }

                    } else {
                        if (response.data?.muhtasar?.personelListesi && response.data?.muhtasar?.personelListesi?.farklilar && response.data?.muhtasar?.personelListesi?.farklilar?.length > 0) {
                            //setGeciciListe(response.data?.muhtasar?.personelListesi.geciciListe ?? [])
                            //setFarkliListesi(response.data?.muhtasar?.personelListesi.farklilar ?? [])
                            setMuhtasarTableData(response.data?.muhtasar?.personelListesi.geciciListe ?? [])
                            if (response.data?.sgkHizmet && response.data?.sgkHizmet?.geciciListe) {
                                setSgkHizmetListesi(response.data.sgkHizmet.geciciListe ?? [])
                                setErrors(prev => prev.filter(error => error.index !== 0));
                                setTamamlananlar(prev =>
                                    produce(prev, draft => {
                                        const exists = draft.some(item => item.index === 0);
                                        if (!exists) {
                                            draft.push({ index: 0 });
                                        }
                                    })
                                );
                            }
                            setErrors(prev => prev.filter(error => error.index !== 1));
                            setTamamlananlar(prev =>
                                produce(prev, draft => {
                                    const exists = draft.some(item => item.index === 1);
                                    if (!exists) {
                                        draft.push({ index: 1 });
                                    }
                                })
                            );
                        } else {
                            setMuhtasarTableData(response.data?.muhtasar?.personelListesi.geciciListe ?? [])
                             if (response.data?.calismaSureleri) {
                               setCalismaSureleriData(response.data.calismaSureleri)
                            }
                            if (response.data?.sgkHizmet && response.data?.sgkHizmet?.geciciListe) {
                                setSgkHizmetListesi(response.data.sgkHizmet.geciciListe ?? [])
                                setErrors(prev => prev.filter(error => error.index !== 0));
                                setTamamlananlar(prev =>
                                    produce(prev, draft => {
                                        const exists = draft.some(item => item.index === 0);
                                        if (!exists) {
                                            draft.push({ index: 0 });
                                        }
                                    })
                                );
                            }
                            setErrors(prev => prev.filter(error => error.index !== 1));
                            setTamamlananlar(prev =>
                                produce(prev, draft => {
                                    const exists = draft.some(item => item.index === 1);
                                    if (!exists) {
                                        draft.push({ index: 1 });
                                    }
                                })
                            );
                        }
                        if (response.data?.muhtasar?.muhtasarMeta) {
                            setMuhtasarMeta(response.data?.muhtasar?.muhtasarMeta)
                        }

                        if (response.data?.sgkHizmet && response.data?.sgkHizmet?.geciciListe) {
                            setSgkHizmetListesi(response.data?.sgkHizmet?.geciciListe ?? [])
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
    }, [projeRaporu?.MuhtasarVePrim, dosyaEklendi]);



    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        resetStatesFunc();
        setYuklenenDosya(file)
        setDosyaEklendi(true)
        adimSelect(1)
        // Dosya tipi kontrolü
        if (!file.type || file.type !== 'application/pdf') {
            toast.error('Geçersiz dosya tipi. Lütfen pdf formatında dosya seçin', { duration: 5000 });
            return;
        }
        await handleSubmitFunc(file)
        return
    }, [handleSubmit]);

    const handleSubmitFunc = async (file: File, checkedList?: any) => {
        setLoading(true)
        const response = await handleSubmit({ stepId: 2, file, belgeAdi: 'MuhtasarVePrim', checkedList });
        if (response.error) {
            setErrors(prev => [...prev, {
                index: 1,
                error: response.error
            }]);
            setTamamlananlar(prev => prev.filter(error => error.index !== 1));
            if (response?.muhtasar && response?.muhtasar.personelListesi && response?.muhtasar.personelListesi.farklilar && response?.muhtasar.personelListesi.farklilar?.length > 0) {
                setGeciciListe(response?.muhtasar.personelListesi.geciciListe ?? [])
                setFarkliListesi(response?.muhtasar.personelListesi.farklilar ?? [])
            } else {
                setGeciciListe([])
                setFarkliListesi([])
            }
            if (response?.muhtasar && response?.muhtasar.muhtasarMeta) {
                setMuhtasarMeta(response?.muhtasar.muhtasarMeta)
            } else {
                setMuhtasarMeta({
                    vergiKesintiTutari: '',
                    terkinTutari: '',
                    projeKodu: ''
                })
            }

        } else {
            if (response?.personelListesi && response?.personelListesi?.personelListesi && response?.personelListesi?.personelListesi?.farklilar && response?.personelListesi?.personelListesi?.farklilar?.length > 0) {
                setGeciciListe(response?.personelListesi?.personelListesi?.geciciListe ?? [])
                setFarkliListesi(response?.personelListesi?.personelListesi?.farklilar ?? [])
            } else {
                setMuhtasarTableData(response?.personelListesi?.personelListesi?.geciciListe ?? [])
                setGeciciListe([])
                setFarkliListesi([])
                setErrors(prev => prev.filter(error => error.index !== 1));
                setTamamlananlar(prev =>
                    produce(prev, draft => {
                        const exists = draft.some(item => item.index === 1);
                        if (!exists) {
                            draft.push({ index: 1 });
                        }
                    })
                );


            }
            if (response?.personelListesi?.muhtasarMeta) {
                setMuhtasarMeta(response?.personelListesi?.muhtasarMeta)
            } else {
                setMuhtasarMeta({
                    vergiKesintiTutari: '',
                    terkinTutari: '',
                    projeKodu: ''
                })
            }
        }
        setLoading(false)
    }


    const tekrarGonderFunc = async () => {
        const hatavarmi = farkliListesi.filter(f =>
            f.Aciklama?.includes('SGK Hizmet listesinde')
        );
        if (hatavarmi.length > 0) {
            const tumKayitlarIsaretliMi = hatavarmi.every(hataliKayit =>
                checkedList[hataliKayit.tcKimlikNo] === true
            );

            if (tumKayitlarIsaretliMi) {
                if (!yuklenenDosya) return;
                await handleSubmitFunc(yuklenenDosya, checkedList)
                setCheckedList({})
                return
            } else {
                toast.error('SGK Hizmet Listesinde bulunmayan personellerin tamamı şirket ortağı olarak işaretlenmelidir. Değilse bir önceki adıma dönüp belgeleri güncel belgeyi tekrar yükleyin.', { duration: 5000 });
                return;
            }
        }


    }


    const resetStatesFunc = () => {
        setMuhtasarTableData([]);
        setMuhtasarMeta({} as MuhtasarBeyannameMeta);

        setDosyaEklendi(false)
        setYuklenenDosya(null)
    }



    const aktifListe = muhtasarTableData.length > 0 ? muhtasarTableData : geciciListe;





    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const toggleCheckbox = (tc: string) => {
        setCheckedList((prev: any) => {
            const newList = { ...prev };
            if (newList[tc]) {
                delete newList[tc];
            } else {
                newList[tc] = true;
            }
            return newList;
        });
    };
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                {errors.find(i => i.index === 1) && <div className="error-message text-red-700">{errors.find(i => i.index === 1)?.error}</div>}


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


            </div>

            {aktifListe.length > 0 && <Box sx={{ mt: 3 }}>
                <Typography><strong>Proje Kodu:</strong> {muhtasarMeta?.projeKodu}</Typography>
                <Typography><strong>Vergi Kesinti Tutarı:</strong> {muhtasarMeta?.vergiKesintiTutari}</Typography>
                <Typography><strong>4691 Sayılı Kanun Gereği Terkin Edilen Tutar:</strong> {muhtasarMeta?.terkinTutari}</Typography>
            </Box>}

            {farkliListesi.length > 0 && (
                <div className="mt-4">
                    <Typography color="error" variant="h6">
                        Tutarsız Personel Listesi: <span className='text-sm'>(Lütfen aşağıdaki sorunları giderip güncel belgeyi tekrar yükleyin.)</span><br />
                    </Typography>
                    <span className='text-sm'>Not: SGK Hizmet listesinde bulunmayan personeller şirket ortağı olmalıdır.
                        Aşağıdaki listede yer alan personeller şirket ortağı ise lütfen "Şirket Ortağı" sütunundaki kutucukları işaretleyin ve sonraki adıma geçmeyi deneyin.
                        Şirket ortağı olmayan personel varsa lütfen önceki adımlara geri dönün ve eksiksiz liste ile güncelleyin.
                        "Şirket Ortağı" sütunu işaretli olan personeller sistemde kayıtlı değilse kaydedilir kayıtlı ise güncellenir.
                    </span>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Adı Soyadı</TableCell>
                                    <TableCell>SGK No/TC No</TableCell>
                                    <TableCell>Şirket Ortağı</TableCell>
                                    <TableCell>!</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {farkliListesi.map((row, index) => {
                                    return (
                                        <DefaultTooltip
                                            key={index}
                                            title={row.Aciklama}
                                            placement="top"
                                            className="max-w-full"
                                            enterTouchDelay={0}
                                            leaveTouchDelay={3000}
                                        >
                                            <TableRow className='hover:bg-gray-100'>
                                                <TableCell className='flex flex-row'>{index + 1}</TableCell>
                                                <TableCell className='flex flex-row'>{row.ad} {row.soyAd}</TableCell>
                                                <TableCell>{row.tcKimlikNo}</TableCell>
                                                <TableCell>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={checkedList[row.tcKimlikNo] || false}
                                                                onChange={() => toggleCheckbox(row.tcKimlikNo)}
                                                            />
                                                        }
                                                        label=""
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className='text-red-700'>
                                                        <KeenIcon icon='information-1' />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </DefaultTooltip>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <button className='btn btn-success btn-block' onClick={tekrarGonderFunc}>
                        Tekrar Gönder
                    </button>
                </div>
            )}

            {aktifListe.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 4 }}>
                    <Typography variant="h6" className='p-3'>
                        BİLDİRİM KAPSAMINDA BULUNAN İŞYERLERİNİN ÇALIŞANLARINA İLİŞKİN BİLGİLER
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>TC Kimlik No</TableCell>
                                <TableCell>Ad Soyad</TableCell>
                                <TableCell>İşe Başlama Tarihi</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {aktifListe.map((row, idx) => (
                                <TableRow key={idx} className='hover:bg-gray-100'>
                                    <TableCell className='flex flex-row'>{idx + 1}</TableCell>
                                    <TableCell>{row.tcKimlikNo}</TableCell>
                                    <TableCell>{row.ad} {row.soyAd}</TableCell>
                                    <TableCell>{row.baslangicTarihi}</TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default Step1b;
