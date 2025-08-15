import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton } from '@mui/material';
import { FarklılarListesiData } from '../AylikFaaliyetRaporuDetayData';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';

interface StepProps {
    fetchFile: (filepath: string) => Promise<any>;
    OnayliMuhtasarVePrim: string;
    handlePdfResponse: (blob: Blob | null, file: any) => void;
    handleDownload: (pdfDataSave: Blob | null, filename: any) => void;
    onayliMuhtasarVePrimData: FarklılarListesiData[];
    onayliSgkHizmetData: FarklılarListesiData[];
    setOnayliMuhtasarVePrimData: React.Dispatch<React.SetStateAction<FarklılarListesiData[]>>
    onayliVergiTutar: string;
    setOnayliVergiTutar: (value: string) => void;
    onayliTerkinTutar: string;
    setOnayliTerkinTutar: (value: string) => void;
    onayliProjeKoduTespiti: string;
    setOnayliProjeKoduTespiti: (value: string) => void;
    fetchFileAnalize: (filepath: string) => Promise<any>;
    setOnayliSgkHizmetData: React.Dispatch<React.SetStateAction<FarklılarListesiData[]>>
}
const MuhtasarVePrimHizmet = ({ fetchFile, onayliSgkHizmetData, OnayliMuhtasarVePrim, handlePdfResponse, handleDownload, fetchFileAnalize, setOnayliSgkHizmetData,
    onayliMuhtasarVePrimData, setOnayliMuhtasarVePrimData, onayliVergiTutar, setOnayliVergiTutar,
    onayliTerkinTutar, setOnayliTerkinTutar, onayliProjeKoduTespiti, setOnayliProjeKoduTespiti }: StepProps) => {
    const [loading, setLoading] = useState(false);
    const [pdfDataSave, setPdfDataSave] = useState<Blob | null>(null);
    const [farkliListesi, setFarkliListesi] = useState<FarklılarListesiData[]>([] as FarklılarListesiData[]);

    useEffect(() => {
        const processExistingFile = async () => {
            if (OnayliMuhtasarVePrim && typeof OnayliMuhtasarVePrim === 'string') {
                try {
                    setLoading(true);
                    const response = await fetchFile(OnayliMuhtasarVePrim);

                    if (!response) return;
                    setPdfDataSave(response.data)
                } catch (error) {
                    console.error('PDF işleme hatası:', error);
                    toast.error('PDF işlenirken bir hata oluştu');
                } finally {
                    setLoading(false);
                }
            }
        };

        processExistingFile();
    }, [OnayliMuhtasarVePrim]);


    useEffect(() => {
        const processExistingFile = async () => {
            if (OnayliMuhtasarVePrim && typeof OnayliMuhtasarVePrim === 'string') {
                try {
                    setLoading(true);
                    const response = await fetchFileAnalize('OnayliMuhtasarVePrim');
                    if (!response.data) {
                        return
                    }
                    if (response.error) {
                        toast.error('PDF işlenirken bir hata oluştu');
                    } else if (response.data?.muhtasar?.personelListesi && response.data?.muhtasar?.personelListesi?.farklilar && response.data?.muhtasar?.personelListesi?.farklilar?.length > 0) {
                        setOnayliMuhtasarVePrimData(response.data?.muhtasar?.personelListesi.geciciListe ?? [])
                        if (response.data?.sgkHizmet && response.data?.sgkHizmet?.geciciListe) {
                            setOnayliSgkHizmetData(response.data.sgkHizmet.geciciListe ?? [])
                        }
                    }
                    if (response.data?.muhtasar?.muhtasarMeta) {
                        setOnayliVergiTutar(response.data?.muhtasar?.muhtasarMeta?.vergiKesintiTutari)
                        setOnayliTerkinTutar(response.data?.muhtasar?.muhtasarMeta?.terkinTutari);
                        setOnayliProjeKoduTespiti(response.data?.muhtasar?.muhtasarMeta?.projeKodu);
                    }

                    if (response.data?.sgkHizmet && response.data?.sgkHizmet?.geciciListe) {
                        setOnayliSgkHizmetData(response.data?.sgkHizmet?.geciciListe ?? [])
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
    }, [OnayliMuhtasarVePrim]);




    useEffect(() => {
        if (onayliSgkHizmetData.length > 0 && onayliMuhtasarVePrimData.length > 0 && loading === false) {
            const farklilar: FarklılarListesiData[] = [];

            onayliMuhtasarVePrimData.forEach(muhtasarper => {
                const personel = onayliSgkHizmetData.find(p =>
                    (p.ad + ' ' + p.soyAd).trim().toLocaleUpperCase('tr-TR') === (muhtasarper.ad + ' ' + muhtasarper.soyAd).trim().toLocaleUpperCase('tr-TR')
                );



                if (!personel) {
                    farklilar.push({
                        ...muhtasarper,
                        Aciklama: 'Şirket Ortağı'
                    });
                }


            });

            setFarkliListesi(farklilar);

        } else {
            setFarkliListesi([]);
        }
    }, [onayliSgkHizmetData, onayliMuhtasarVePrimData]);


    return (
        <>
            {loading ? (
                <div className="flex flex-col gap-4">
                    <Skeleton
                        variant="rectangular"
                        height={80}
                        animation="wave"
                        style={{ borderRadius: 8 }}
                    />
                    {[...Array(10)].map((_, index) => (
                        <Skeleton
                            key={index}
                            variant="rectangular"
                            height={10}
                            animation="wave"
                            style={{ borderRadius: 5 }}
                        />
                    ))}
                </div>
            ) :
                (<div className='w-full'>

                    <div className="flex items-center gap-2">
                        <button onClick={() => handlePdfResponse(pdfDataSave, 'OnaylıMuhtasarVePrimHizmet.pdf')} className='btn btn-md btn-light'>Dosyayı Görüntüle <KeenIcon icon='graph' /></button>
                        <button onClick={() => handleDownload(pdfDataSave, 'OnaylıMuhtasarVePrimHizmet')} className='btn btn-md btn-light'><KeenIcon icon='file-down' /></button>

                    </div>


                    {onayliMuhtasarVePrimData.length > 0 && <Box sx={{ mt: 3 }}>
                        <Typography><strong>Proje Kodu:</strong> {onayliProjeKoduTespiti}</Typography>
                        <Typography><strong>Vergi Kesinti Tutarı:</strong> {onayliVergiTutar}</Typography>
                        <Typography><strong>4691 Sayılı Kanun Gereği Terkin Edilen Tutar:</strong> {onayliTerkinTutar}</Typography>
                    </Box>}

                    {farkliListesi.length > 0 && (
                        <div className="mt-4">
                            <div className='p-3 text-md font-semibold'>
                                <KeenIcon icon='information-2' />
                                Onaylı SGK Hizmet listesinde bulunmayan ve şirket ortağı olarak işaretlenen personeller.
                            </div>
                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Adı Soyadı</TableCell>
                                            <TableCell>SGK No/TC No</TableCell>
                                            <TableCell>Şirket Ortağı</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {farkliListesi.map((row, index) =>
                                            <TableRow key={index} className='hover:bg-gray-100'>
                                                <TableCell className='flex flex-row'>{index + 1}</TableCell>
                                                <TableCell className='flex flex-row'>{row.ad} {row.soyAd}</TableCell>
                                                <TableCell>{row.tcKimlikNo}</TableCell>
                                                <TableCell>Evet</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}

                    {onayliMuhtasarVePrimData.length > 0 && (
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <div className='p-3 text-lg font-bold'>
                                BİLDİRİM KAPSAMINDA BULUNAN İŞYERLERİNİN ÇALIŞANLARINA İLİŞKİN BİLGİLER
                            </div>
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
                                    {onayliMuhtasarVePrimData.map((row, idx) => (
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
                </div>)
            }
        </>
    )
}

export default MuhtasarVePrimHizmet
