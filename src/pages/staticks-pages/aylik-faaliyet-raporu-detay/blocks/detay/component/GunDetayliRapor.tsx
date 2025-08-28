import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton } from '@mui/material';
import { FarklılarListesiData } from '../AylikFaaliyetRaporuDetayData';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';

interface StepProps {
    fetchFile: (filepath: string) => Promise<any>;
    fetchFileAnalize: (filepath: string) => Promise<any>;
    CalismaSureleri: string;
    SGKHizmet: string | null;
    MuhtasarVePrim: string | null;
    handlePdfResponse: (blob: Blob | null, file: any) => void;
    handleDownload: (pdfDataSave: Blob | null, filename: any) => void;
    gunDetayliData: FarklılarListesiData[];
    setGunDetayliData: React.Dispatch<React.SetStateAction<FarklılarListesiData[]>>
}
const GunDetayliRapor = ({ fetchFile, CalismaSureleri, handlePdfResponse, handleDownload, gunDetayliData, setGunDetayliData, SGKHizmet, fetchFileAnalize }: StepProps) => {
    const [loading, setLoading] = useState(false);
    const [pdfDataSave, setPdfDataSave] = useState<Blob | null>(null);

    useEffect(() => {
        const processExistingFile = async () => {
            if (SGKHizmet && typeof SGKHizmet === 'string') {
                try {
                    setLoading(true);
                    const response = await fetchFile(SGKHizmet);

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
    }, [CalismaSureleri]);


    useEffect(() => {
        const processExistingFile = async () => {
            if (CalismaSureleri && typeof CalismaSureleri === 'string' && !SGKHizmet) {
                try {
                    setLoading(true);
                    const response = await fetchFileAnalize('CalismaSureleri');
                    if (!response.data) {
                        return
                    }
                    if (response.error) {
                        toast.error('PDF işlenirken bir hata oluştu');
                    } else if (response.data.calismaSureleri && response.data.calismaSureleri.length > 0) {
                        setGunDetayliData(response.data.calismaSureleri ?? [])
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
    }, [SGKHizmet, CalismaSureleri]);
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
                        <button onClick={() => handlePdfResponse(pdfDataSave, 'SGKCalışanBildirgesiGunDetayliRapor.pdf')} className='btn btn-md btn-light'>Dosyayı Görüntüle <KeenIcon icon='graph' /></button>
                        <button onClick={() => handleDownload(pdfDataSave, 'SGKCalışanBildirgesiGunDetayliRapor')} className='btn btn-md btn-light'><KeenIcon icon='file-down' /></button>

                    </div>


                    {gunDetayliData.length > 0 && (

                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Typography variant="h6" className='p-3'>
                                SGK Hizmet Listesi
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>TC Kimlik No</TableCell>
                                        <TableCell>Personel</TableCell>
                                        <TableCell>Başlangıç Tarihi</TableCell>
                                        <TableCell>Gelir Vergi İstisnası Gün</TableCell>
                                        <TableCell>Sigorta Primi İşveren Hissesi Gün</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {gunDetayliData.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
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
                </div>)
            }
        </>
    )
}

export default GunDetayliRapor
