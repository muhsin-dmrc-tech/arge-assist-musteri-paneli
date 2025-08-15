import * as pdfjsLib from 'pdfjs-dist';
import { KeenIcon } from '@/components';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/auth';
import { Skeleton } from '@mui/material';
import { useRapor } from '../../DokumanYuklemeContextType';
import { handleSubmitPropsType, SurecKayitlariType } from '../../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
interface Step3Props {
    handleSubmit: ({stepId, belgeAdi}:handleSubmitPropsType) => Promise<any>;
}



const Step3 = ({ handleSubmit }: Step3Props) => {
	const { projeRaporu, itemValue, setitemValue, currentStep } = useRapor();
	const [surecKayitlari, setSurecKayitlari] = useState<SurecKayitlariType[]>([]);
	const { currentUser } = useAuthContext();
	const API_URL = import.meta.env.VITE_APP_API_URL;
	const [loading, setLoading] = useState(false);


	const fetchSurecKayitlari = async () => {
		const queryParams = new URLSearchParams();
		queryParams.set('surec', 'Onay');
		queryParams.set('zaman', 'ay');
		if (projeRaporu.ID) {
			queryParams.set('raporId', String(projeRaporu.ID));
		}

		try {
			setLoading(true)
			const response = await axios.get(`${API_URL}/dokumanlar/surec-kayitlari?${queryParams.toString()}`);
			if (response.status !== 200) {
				return;
			}
			if (response.data) {
				const surecKayitlari = response.data;
				setSurecKayitlari(surecKayitlari);

			} else {
				setSurecKayitlari([]);
			}
		} catch (error: any) {
			toast.error(error?.response?.data?.message ?? 'Veriler çekilirken bir hata oluştu', { duration: 5000 });
		} finally {
			setLoading(false)
		}
	};

	useEffect(() => {
		if (currentStep === 3 && projeRaporu) {
			fetchSurecKayitlari()
		}
	}, [currentStep, projeRaporu.SonDuzenlenmeTarihi])

	const handleSubmitFunc = async () => {
		if (loading) return
		setLoading(true)
		const response = await handleSubmit({ stepId: 3, belgeAdi: 'OnOnay' });

		setLoading(false)
	}


	return (
		<div className="flex flex-col gap-3 justify-center items-center py-4">

			{projeRaporu.SurecSirasi === 2 && (projeRaporu.Durum).toLocaleUpperCase('tr-TR') === ('Hazırlanıyor').toLocaleUpperCase('tr-TR') ?
				(<>
					<h4 className='text-xlg font-bold'>Döküman Yükleme Onay Süreci</h4>
					<span className='text-gary-700'>Onay süreci için gerekli tüm belgeler başarıyla kaydedildi. Belgeleri onaylayarak işlemi tamamlayabilirsiniz. Yüklediğiniz belgeler, Uzmanlarımız tarafından incelenecek olup, değerlendirme sonucu tarafınıza e-posta yoluyla iletilecektir.</span>
					<button onClick={handleSubmitFunc} className='btn btn-success'>Onay için gönder</button>
				</>)
				:
				(projeRaporu.SurecSirasi >= 3 &&
					(loading ?
						<div className="flex flex-col gap-4">
							{[...Array(5)].map((_, index) => (
								<Skeleton
									key={index}
									variant="rectangular"
									height={30}
									animation="wave"
									style={{ borderRadius: 5 }}
								/>
							))}
						</div>
						:
						<div className="flex flex-col gap-2">
							{surecKayitlari && surecKayitlari.length > 0 ?
								<div className="flex flex-col min-h-[60px] w-full border-t">
									{surecKayitlari.map((s, index) =>
										<div key={index} className='flex flex-col'>
											<div className="flex gap-1">
												<div className="flex flex-row items-center justify-end pr-3 gap-2 min-w-[120px] max-w-[120px] py-2">
													<div className="flex flex-col text-3xs">
														<div className="flex flex-col items-end">
															<span className='font-semibold truncate block max-w-[120px]'>{s.Kullanici.AdSoyad}</span>
															<span>{format(s.BaslamaZamani, 'dd/MM/yyy')}</span>
															<span>{format(s.BaslamaZamani, 'HH:mm')}</span>
														</div>
													</div>
												</div>

												<div className="h-auto min-h-[60px] border-l-[1px] border-gray-700 flex justify-center items-center">
													<span
														className={cn(
															'bg-white border-[2px] left-[-8px] rounded-full h-[16px] w-[16px] relative',
															{
																'border-green-500': s.BitirmeZamani && s.Durum === 'Tamamlandı',
																'border-yellow-500': !s.BitirmeZamani && s.Durum === 'İncelemede',
																'border-red-500': s.BitirmeZamani && s.Durum === 'Reddedildi',
															}
														)}
													></span>
												</div>

												<div className="flex flex-col justify-center py-2">
													<div className="text-sm font-semibold">
														{s.Adim.AdimAdi}
													</div>
													<div className={cn(
														'text-xs font-semibold',
														{
															'text-green-500': s.Durum === 'Tamamlandı',
															'text-yellow-500': s.Durum === 'İncelemede',
															'text-red-500': s.Durum === 'Reddedildi'
														}
													)}>
														{s.Durum}
													</div>

													{s.Aciklama && surecKayitlari.length !== index + 1 &&
														<div className="text-xs italic text-gray-500 block max-w-[300px] pr-1">
															"{s.Aciklama}"
														</div>
													}
												</div>

											</div>

											{s.Durum === 'Reddedildi' && surecKayitlari.length === index + 1 &&
												<div className="border rounded-lg border-red-500 flex flex-col p-3 gap-3">
													<div className="text-xs italic text-gray-700">
														"{s.Aciklama}"
													</div>
													<button onClick={handleSubmitFunc} className='btn btn-success flex justify-center'>Tekrar Gönder</button>
												</div>}
											{s.Durum === 'Tamamlandı' && surecKayitlari.length === (index + 1) && s.KullaniciID !== currentUser?.id &&
												<div className="border rounded-lg border-green-500 flex flex-col w-fit p-3 gap-3">
													{s.Aciklama && <div className="text-xs italic text-gray-700">
														"{s.Aciklama}"
													</div>}
													<div className="text-md text-green-500 flex gap-1 items-center">
														<KeenIcon icon='check-circle' />
														Onay süreci tamamlandı.</div>
												</div>}
										</div>
									)
									}

								</div> :
								<div className="flex flex-col gap-4">
									{[...Array(5)].map((_, index) => (
										<Skeleton
											key={index}
											variant="rectangular"
											height={30}
											animation="wave"
											style={{ borderRadius: 5 }}
										/>
									))}
								</div>
							}


						</div>
					)
				)
			}

		</div>
	);
};
export default Step3;
