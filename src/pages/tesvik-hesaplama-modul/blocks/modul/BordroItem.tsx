import React, { useState } from 'react'
import { TeknoKentHesaplama } from './TesvikHesaplamaModulApi';
import { KeenIcon } from '@/components';

interface PropsType {
    item: { id: number; PersonelAdi: string; ayliklar: TeknoKentHesaplama[]; },
    personelSil: () => void;
    open:boolean;
    setOpen: () => void;
}

const BordroItem = ({ item, personelSil,open,setOpen }: PropsType) => {
    return (
        <div className='border border-gray-200 rounded-xl shadow-md bg-white'>
            <div className="p-3 flex w-full items-center justify-between relative pb-6">
                <button onClick={() => setOpen()} className="flex w-full items-center justify-between">
                    <h3 className='font-semibold'>{item.PersonelAdi}</h3>
                    <h3>{item.ayliklar && item.ayliklar[0] ? (item.ayliklar[0]?.KanunNo === '4691' ? '(4691) Teknokent Projeleri İçin Çalışan' :
                        item.ayliklar[0]?.KanunNo === '5746' ? '(5746) Tubitak projeleri, Arge ve Tasarım Merkezleri İçin Çalışan' : 'Standart Çalışan') : 'Hesaplama Yapılamadı'}</h3>


                </button>

                <button onClick={() => setOpen()} className="absolute right-0 -bottom-2 flex flex-col items-end pe-10 w-full">

                    <KeenIcon icon={open ? 'up' : 'down'} className="text-4xl text-gray-200 bg-white z-10" />

                    <div className="w-full border-b border-gray-200 absolute left-0 top-1/2 z-0"></div>
                </button>
                <div className="flex gap-4 items-center justify-end w-20">
                    <button onClick={() => personelSil()} className='text-red-500'><KeenIcon icon='trash' /></button>
                </div>
            </div>

            <div
                style={{
                    maxHeight: open ? 2000 : 0,
                    opacity: open ? 1 : 0,
                    overflow: 'hidden',
                    transition: open
                        ? 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        : 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-hidden={!open}
            >
                <div className="p-3 kt-card-content">
                    <div className="grid datatable-initialized">
                        <div className="relative w-full scrollable-x-auto border rounded-md">
                            <table className="w-full align-middle text-left rtl:text-right caption-bottom text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2">
                                        <th className="p-2 text-center text-xs font-bold border-r">Ay</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Aylık Brüt Ücret</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Bodroya Esas Brüt</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Gün Sayısı</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Sgk Matrahı</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">BES Oranı</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">BES Kesintisi</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Sgk İşçi Primi</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Sgk İşveren Primi</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Sgk 5510/15510 Teşviği</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Sgk 5746-4691 Teşviği</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Sgk Teşvik Toplamı</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Kalan Sgk İşveren Primi</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">İşsizlik İşçi Primi</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">İşsizlik İşveren Primi</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Ödenecek Sgk Primi</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Gelir Vergisi Matrahı</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Kümülatif Gel.Ver.Matrahı</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Gelir Vergisi</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Asg.Ücr. İstisna Matrahı</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Asg.Ücr. Kümüle İst.Matr.</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Asg.Ücr. Vergi İstisnası</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Gelir Ver. Teşviği</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Kalan Gel.Ver.</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Asg.Ücr. Dam. Ver. İstisnası</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Dam. Ver. Teşviği</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Ödenecek Dam. Ver.</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Net Maaş</th>
                                        <th className="p-2 text-center text-xs font-bold border-r">Toplam Maliyet</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {item.ayliklar.map((data, index) => (
                                        <tr key={data.Ay} className="border-b hover:bg-gray-50 even:bg-gray-25">
                                            <td className="p-2 text-xs text-gray-700 text-center font-bold border-r">{data.Ay}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.AylikBrutUcret?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.BrutUcret?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.BordroGunSayisi}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.SGKMatrahi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.BESOrani}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.BESKEsintisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.SGKIsciPayi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.SGKIsverenPayi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.SGK5510Tesvigi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.SGK4691Tesvigi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.SGKTesvigi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.KalanSGKIsverenPrimi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.IssizlikIsciPrimi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.IssizlikIsverenPrimi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.OdenecekSGKPrimi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.GelirVergisiMatrahi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.KumGelirVergisiMatrahi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.GelirVergisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.AsgUcretIstisnaMatrahi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.AsgUcretKumuleIstisnaMatrahi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.AsgUcretVergiIstisnasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.GelirVergisiTesvigi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.KalanGelirVergisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.AsgUcretDamgaVergiIstisnasi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.DamgaVergisiTesvigi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.OdenecekDamgaVergisi?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.NetOdenen?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2 text-xs text-center font-medium border-r">{data.ToplamMaliyet?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                    {/* Yıl toplamı satırı */}
                                    <tr className="border-b hover:bg-gray-50 even:bg-gray-25 font-bold bg-gray-200">
                                        <td className="p-2 text-xs text-gray-900 text-center font-bold border-r">Yıl Toplamı</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.AylikBrutUcret || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.BrutUcret || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r"></td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.SGKMatrahi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r"></td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.BESKEsintisi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.SGKIsciPayi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.SGKIsverenPayi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.SGK5510Tesvigi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.SGK4691Tesvigi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.SGKTesvigi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.KalanSGKIsverenPrimi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.IssizlikIsciPrimi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.IssizlikIsverenPrimi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.OdenecekSGKPrimi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.GelirVergisiMatrahi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r"></td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.GelirVergisi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.AsgUcretIstisnaMatrahi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.AsgUcretKumuleIstisnaMatrahi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.AsgUcretVergiIstisnasi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.GelirVergisiTesvigi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.KalanGelirVergisi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.AsgUcretDamgaVergiIstisnasi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.DamgaVergisiTesvigi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.OdenecekDamgaVergisi || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.NetOdenen || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 text-xs text-center text-gray-900 font-medium border-r">{item.ayliklar.reduce((sum, d) => sum + (d.ToplamMaliyet || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className='p-3'>
                <div className='grid grid-cols-12 gap-4'>
                    <div className="col-span-12 md:col-span-3">
                        <div className="text-sm text-gray-600">Teknokent Teşvik Toplamı</div>
                        <div className="text-lg font-bold text-green-600">
                            {item.ayliklar.reduce((sum, item) => sum + item.ToplamTesvik, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-3">
                        <div className="text-sm text-gray-600">Toplam Maliyet</div>
                        <div className="text-lg font-bold text-red-600">
                            {item.ayliklar.reduce((sum, item) => sum + item.ToplamMaliyet, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BordroItem