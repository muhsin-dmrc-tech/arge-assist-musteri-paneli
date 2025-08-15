import React, { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton } from '@mui/material';
import { FarklılarListesiData } from '../AylikFaaliyetRaporuDetayData';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';

interface StepProps {
    fetchFile: (filepath: string) => Promise<any>;
    fetchFileAnalize: (filepath: string) => Promise<any>;
    SGKHizmet: string;
    MuhtasarVePrim: string | null;
    handlePdfResponse: (blob: Blob | null, file: any) => void;
    handleDownload: (pdfDataSave: Blob | null, filename: any) => void;
    sgkHizmetData: FarklılarListesiData[];
    setSgkHizmetData: React.Dispatch<React.SetStateAction<FarklılarListesiData[]>>
}
const OnaysizSGKHizmet = ({ fetchFile, fetchFileAnalize, SGKHizmet, MuhtasarVePrim, handlePdfResponse, handleDownload, sgkHizmetData, setSgkHizmetData }: StepProps) => {
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
    }, [SGKHizmet]);

    useEffect(() => {
        const processExistingFile = async () => {
            if (SGKHizmet && typeof SGKHizmet === 'string' && !MuhtasarVePrim) {
                try {
                    setLoading(true);
                    const response = await fetchFileAnalize('SGKHizmet');
                    if (!response.data) {
                        return
                    }
                    if (response.error) {
                        toast.error('PDF işlenirken bir hata oluştu');
                    } else if (response.data.sgkHizmet && response.data.sgkHizmet.geciciListe && response.data.sgkHizmet.geciciListe.length > 0) {
                        setSgkHizmetData(response.data.sgkHizmet.geciciListe ?? [])
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
    }, [SGKHizmet,MuhtasarVePrim]);




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
                        <button onClick={() => handlePdfResponse(pdfDataSave, 'OnaysızSGKHizmetListesi.pdf')} className='btn btn-md btn-light'>Dosyayı Görüntüle <KeenIcon icon='graph' /></button>
                        <button onClick={() => handleDownload(pdfDataSave, 'OnaysızSGKHizmetListesi')} className='btn btn-md btn-light'><KeenIcon icon='file-down' /></button>

                    </div>


                    {sgkHizmetData.length > 0 && (

                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Typography variant="h6" className='p-3'>
                                SGK Hizmet Listesi
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>S.Guvenlik No</TableCell>
                                        <TableCell>Adı</TableCell>
                                        <TableCell>Soyadı</TableCell>
                                        <TableCell>Gün</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sgkHizmetData.map((row, index) => (
                                        <TableRow key={index} className='hover:bg-gray-100'>
                                            <TableCell>{index + 1}</TableCell>
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
                </div>)
            }
        </>
    )
}

export default OnaysizSGKHizmet
