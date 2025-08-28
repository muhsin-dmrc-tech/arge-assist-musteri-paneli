import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton } from '@mui/material';
import { FarklılarListesiData } from '../AylikFaaliyetRaporuDetayData';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';

interface StepProps {
    fetchFile: (filepath: string) => Promise<any>;
    fetchFileAnalize: (filepath: string) => Promise<any>;
    MuhtasarVePrim: string;
    handlePdfResponse: (blob: Blob | null, file: any) => void;
    handleDownload: (pdfDataSave: Blob | null, filename: any) => void;
    muhtasarVePrimData: FarklılarListesiData[];
    sgkHizmetData: FarklılarListesiData[];
    setGunDetayliData: React.Dispatch<React.SetStateAction<FarklılarListesiData[]>>;
    setMuhtasarVePrimData: React.Dispatch<React.SetStateAction<FarklılarListesiData[]>>;
    vergiTutar: string;
    setVergiTutar: (value: string) => void;
    terkinTutar: string;
    setTerkinTutar: (value: string) => void;
    projeKoduTespiti: string;
    setProjeKoduTespiti: (value: string) => void;
    setSgkHizmetData: React.Dispatch<React.SetStateAction<FarklılarListesiData[]>>
}
const OnaysizMuhtasarVePrimHizmet = ({ fetchFile, fetchFileAnalize, setSgkHizmetData, sgkHizmetData,setGunDetayliData,
     MuhtasarVePrim, handlePdfResponse, handleDownload, muhtasarVePrimData, setMuhtasarVePrimData, vergiTutar, setVergiTutar,
    terkinTutar, setTerkinTutar, projeKoduTespiti, setProjeKoduTespiti }: StepProps) => {
    const [loading, setLoading] = useState(false);
    const [pdfDataSave, setPdfDataSave] = useState<Blob | null>(null);
    const [farkliListesi, setFarkliListesi] = useState<FarklılarListesiData[]>([] as FarklılarListesiData[]);

    useEffect(() => {
        const processExistingFile = async () => {
            if (MuhtasarVePrim && typeof MuhtasarVePrim === 'string') {
                try {
                    setLoading(true);
                    const response = await fetchFile(MuhtasarVePrim);

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
    }, [MuhtasarVePrim]);

    useEffect(() => {
        const processExistingFile = async () => {
            if (MuhtasarVePrim && typeof MuhtasarVePrim === 'string') {
                try {
                    setLoading(true);
                    const response = await fetchFileAnalize('MuhtasarVePrim');
                    if (!response.data) {
                        return
                    }
                    if (response.error) {
                        toast.error('PDF işlenirken bir hata oluştu');
                    } else if (response.data?.muhtasar?.personelListesi && response.data?.muhtasar?.personelListesi?.farklilar && response.data?.muhtasar?.personelListesi?.farklilar?.length > 0) {
                        setMuhtasarVePrimData(response.data?.muhtasar?.personelListesi.geciciListe ?? [])
                         if (response.data?.calismaSureleri) {
                            setGunDetayliData(response.data.calismaSureleri ?? [])
                        }
                        if (response.data?.sgkHizmet && response.data?.sgkHizmet?.geciciListe) {
                            setSgkHizmetData(response.data.sgkHizmet.geciciListe ?? [])
                        }
                    }
                    if (response.data?.muhtasar?.muhtasarMeta) {
                        setVergiTutar(response.data?.muhtasar?.muhtasarMeta?.vergiKesintiTutari)
                        setTerkinTutar(response.data?.muhtasar?.muhtasarMeta?.terkinTutari);
                        setProjeKoduTespiti(response.data?.muhtasar?.muhtasarMeta?.projeKodu);
                    }

                    if (response.data?.sgkHizmet && response.data?.sgkHizmet?.geciciListe) {
                        setSgkHizmetData(response.data?.sgkHizmet?.geciciListe ?? [])
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
    }, [MuhtasarVePrim]);


    useEffect(() => {
        if (sgkHizmetData.length > 0 && muhtasarVePrimData.length > 0 && loading === false) {
            const farklilar: FarklılarListesiData[] = [];

            muhtasarVePrimData.forEach(muhtasarper => {
                const personel = sgkHizmetData.find(p =>
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
    }, [sgkHizmetData, muhtasarVePrimData]);


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
                        <button onClick={() => handlePdfResponse(pdfDataSave, 'OnaysızMuhtasarVePrimHizmet.pdf')} className='btn btn-md btn-light'>Dosyayı Görüntüle <KeenIcon icon='graph' /></button>
                        <button onClick={() => handleDownload(pdfDataSave, 'OnaysızMuhtasarVePrimHizmet')} className='btn btn-md btn-light'><KeenIcon icon='file-down' /></button>

                    </div>


                    {muhtasarVePrimData.length > 0 && <Box sx={{ mt: 3 }}>
                        <Typography><strong>Proje Kodu:</strong> {projeKoduTespiti}</Typography>
                        <Typography><strong>Vergi Kesinti Tutarı:</strong> {vergiTutar}</Typography>
                        <Typography><strong>4691 Sayılı Kanun Gereği Terkin Edilen Tutar:</strong> {terkinTutar}</Typography>
                    </Box>}

                    {farkliListesi.length > 0 && (
                        <div className="mt-4">
                            <div className='p-3 text-md font-semibold'>
                                <KeenIcon icon='information-2' />
                                Onaysız SGK Hizmet listesinde bulunmayan ve şirket ortağı olarak işaretlenen personeller.
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

                    {muhtasarVePrimData.length > 0 && (
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
                                    {muhtasarVePrimData.map((row, idx) => (
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

export default OnaysizMuhtasarVePrimHizmet
