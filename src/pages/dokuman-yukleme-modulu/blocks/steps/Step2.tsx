import React, { lazy, Suspense, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useRapor } from '../../DokumanYuklemeContextType';
import { Accordion, AccordionItem } from '@/components/accordion';
import { KeenIcon } from '@/components';
import { handleSubmitPropsType } from '../../types';


const Step2a = lazy(() => import('./Step2a'));
const Step2b = lazy(() => import('./Step2b'));
const Step2c = lazy(() => import('./Step2c'));

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';


interface Step2Props {
    fetchFile: (filepath: string) => Promise<any>;
        handleSubmit: ({ stepId, file, belgeAdi, checkedList, adim }: handleSubmitPropsType) => Promise<any>;
}

const Step2 = ({ fetchFile, handleSubmit }: Step2Props) => {
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
            title: 'Onaylı SGK Hizmet Listesi (5746)',
            component: <Step2a
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
            title: 'Onaylı Muhtasar Beyannamesi (5746)',
            component: <Step2b
                fetchFile={fetchFile}
                setErrors={setErrors}
                errors={errors}
                tamamlananlar={tamamlananlar}
                setTamamlananlar={setTamamlananlar}
                handleSubmit={handleSubmit}
                adimSelect={adimSelect}
                goToNext={() => setActiveIndex(2)}
            />
        },
        {
            title: 'SGK Tahakkuk Fişi (5746)',
            component: <Step2c
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
            Boolean(!projeRaporu.OnayliSGKHizmet?.length),
            Boolean(!projeRaporu.OnayliMuhtasarVePrim?.length),
            Boolean(!projeRaporu.SGKTahakkuk?.length)
        ];
        return conditions.slice(1, index + 1).some(condition => condition);
    };

    useEffect(() => {
        if (projeRaporu) {
            let index = 0;
            if (projeRaporu.OnayliSGKHizmet) {
                index = 1;
            }
            if (projeRaporu.OnayliMuhtasarVePrim) {
                index = 2;
            }
            if (projeRaporu.SGKTahakkuk) {
                index = 3;
            }
            setActiveIndex(index)
        }

    },[projeRaporu])

    return (
        <div className="flex flex-col gap-4">
            <label>Onaylı Dökümanlar</label>

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

export default Step2;
