import React, { lazy, Suspense, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRapor } from '../../DokumanYuklemeContextType';
import { Accordion, AccordionItem } from '@/components/accordion';
import { KeenIcon } from '@/components';
import { DonemType, handleSubmitPropsType } from '../../types';
import { useParams } from 'react-router';


const Step1a = lazy(() => import('./Step1a'));
const Step1b = lazy(() => import('./Step1b'));

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';


interface Step1Props {
    fetchFile: (filepath: string) => Promise<any>;
    handleSubmit: ({ stepId, file, belgeAdi, checkedList, adim }: handleSubmitPropsType) => Promise<any>;
    donemler: DonemType[]
}

const Step1 = ({ fetchFile, handleSubmit, donemler }: Step1Props) => {
    const { itemId } = useParams();
    const [errors, setErrors] = useState<Array<{ index: number, error: string }>>([]);
    const [tamamlananlar, setTamamlananlar] = useState<Array<{ index: number }>>([]);
    const { projeRaporu, setitemValue, itemValue } = useRapor()
    const [activeIndex, setActiveIndex] = useState<number | null>(0);


    const adimSelect = (index: number) => {
        const adimlar: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
        setitemValue({
            ...itemValue,
            adim: adimlar[index]
        });
    }

    const items = [
        {
            title: 'Onaysız SGK Hizmet Listesi (5746)',
            component: <Step1a
                fetchFile={fetchFile}
                setErrors={setErrors}
                errors={errors}
                tamamlananlar={tamamlananlar}
                setTamamlananlar={setTamamlananlar}
                handleSubmit={handleSubmit}
                adimSelect={adimSelect}
                goToNext={() => setActiveIndex(1)}
            />
        },
        {
            title: 'Onaysız Muhtasar Beyannamesi (5746)',
            component: <Step1b
                fetchFile={fetchFile}
                setErrors={setErrors}
                errors={errors}
                tamamlananlar={tamamlananlar}
                setTamamlananlar={setTamamlananlar}
                handleSubmit={handleSubmit}
                adimSelect={adimSelect}
                goToNext={() => setActiveIndex(2)}
            />
        }
    ];

    const disabledFunc = (index: number): boolean => {
        const conditions = [
            false,
            Boolean(!projeRaporu.SGKHizmet?.length),
            Boolean(!projeRaporu.MuhtasarVePrim?.length)
        ];
        return conditions.slice(1, index).some(condition => condition);
    };

    useEffect(() => {
        if (projeRaporu) {
            let index = 0;
            if (projeRaporu.SGKHizmet) {
                index = 1;
            }
            if (projeRaporu.MuhtasarVePrim) {
                index = 2;
            }
            setActiveIndex(index)
        }

    }, [projeRaporu])

    return (
        <div className="flex flex-col gap-4">
            <label>Onaysız Dökümanlar</label>

            <div className="flex flex-col gap-1">
                <label>Dönem Seç</label>
                {donemler.length < 1 ? <span className='text-red-700'>Hiç dönem bulunamadı.</span> : ''}
                <Select disabled={itemId ? true : false} value={itemValue.DonemID > 0 ? itemValue.DonemID.toString() : ''} onValueChange={(value) => setitemValue({ ...itemValue, DonemID: Number(value) })} required>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Dönem Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        {donemler?.map((item: any) => (<SelectItem key={item.DonemID} value={item.DonemID?.toString()}>{item?.DonemAdi}</SelectItem>))}

                    </SelectContent>
                </Select>
            </div>

            <Accordion
                allowMultiple={false}
                activeIndex={activeIndex}
                onChange={(index) => setActiveIndex(index)}
            >
                {items.map((item, index) => {
                    const currentError = errors.find(e => e.index === index);
                    return (
                        <AccordionItem
                            key={index}
                            disabled={disabledFunc(index)}
                            title={
                                <div className="flex items-center gap-2">
                                    <span>{index + 1}-{item.title}</span>
                                </div>
                            }
                            indicator={
                                tamamlananlar?.find(t=>t.index === index) ? (
                                    <KeenIcon icon="check" className="text-green-500 text-lg" />
                                ) : currentError?.error ? (
                                    <KeenIcon icon="cross" className="text-red-500 text-lg" />
                                ) : null
                            }
                        >
                            <Suspense fallback={<div>Yükleniyor...</div>}>
                                {item.component}
                            </Suspense>
                        </AccordionItem>
                    );
                })}
            </Accordion>

        </div>
    );
};

export default Step1;
