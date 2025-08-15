import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton } from '@mui/material';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import { KeenIcon } from '@/components';
import { SGKTahakkuktype } from '@/pages/dokuman-yukleme-modulu/types';

interface StepProps {
    fetchFile: (filepath: string) => Promise<any>;
    fetchFileAnalize: (filepath: string) => Promise<any>;
    SGKTahakkuk: string;
    handlePdfResponse: (blob: Blob | null, file: any) => void;
    handleDownload: (pdfDataSave: Blob | null, filename: any) => void;
    sgkTahakkukData: SGKTahakkuktype;
    setSGKTahakkukData: React.Dispatch<React.SetStateAction<SGKTahakkuktype>>
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
const SGKTahakkukFisi = ({ fetchFile, SGKTahakkuk, handlePdfResponse, handleDownload, sgkTahakkukData, fetchFileAnalize, setSGKTahakkukData }: StepProps) => {
    const [loading, setLoading] = useState(false);
    const [pdfDataSave, setPdfDataSave] = useState<Blob | null>(null);
    const [primler, setPrimler] = useState<primlerType[]>([]);
    const [dataValue, setDataValue] = useState<dataValueType>({} as dataValueType);

    useEffect(() => {
        const processExistingFile = async () => {
            if (SGKTahakkuk && typeof SGKTahakkuk === 'string') {
                try {
                    setLoading(true);
                    const response = await fetchFile(SGKTahakkuk);

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
    }, [SGKTahakkuk]);


    useEffect(() => {
        const processExistingFile = async () => {
            if (SGKTahakkuk && typeof SGKTahakkuk === 'string') {
                try {
                    setLoading(true);
                    const response = await fetchFileAnalize('SGKTahakkuk');
                    if (!response.data) {
                        return
                    }
                    if (response.error) {
                        toast.error('PDF işlenirken bir hata oluştu');
                    } else if (response.data?.sgkTahakkuk && response.data?.sgkTahakkuk?.sgkTahakkuk) {
                        setSGKTahakkukData(response.data?.sgkTahakkuk?.sgkTahakkuk ?? {})
                        setDataValue(response.data?.sgkTahakkuk?.dataValue ?? {})
                        setPrimler(response.data?.sgkTahakkuk?.primler ?? [])
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
    }, [SGKTahakkuk]);


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
                        <button onClick={() => handlePdfResponse(pdfDataSave, 'SGKTahakkuk.pdf')} className='btn btn-md btn-light'>Dosyayı Görüntüle <KeenIcon icon='graph' /></button>
                        <button onClick={() => handleDownload(pdfDataSave, 'SGKTahakkuk')} className='btn btn-md btn-light'><KeenIcon icon='file-down' /></button>

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
                </div>)
            }
        </>
    )
}

export default SGKTahakkukFisi
