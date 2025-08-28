import { createContext, useContext, useState } from 'react';
import { DonemType, ItemValutype, MuhtasarBeyannameMeta, MuhtasarTableData, PersonelTableData, ProjeRaporuType, SgkHizmetListesiData, SGKTahakkuktype } from './types';


interface RaporContextType {
    itemValue: ItemValutype;
    setitemValue: (value: ItemValutype) => void;
    submitVisible: boolean;
    setSubmitVisible: (value: boolean) => void;
    error: string | null;
    setError: (value: string | null) => void;
    pageError: string | null;
    setPageError: (value: string | null) => void;
    successMessage: string | null;
    setSuccessMessage: (value: string | null) => void;
    stepErrors: any;
    setStepErrors: React.Dispatch<any>;
    raporHatalar: {siraNo:number,error:string}[] | [];
    setRaporHatalar: React.Dispatch<{siraNo:number,error:string}[] | []>;
    currentStep: number;
    setCurrentStep: (value: number) => void;
    sgkHizmetListesi: SgkHizmetListesiData[];
    setSgkHizmetListesi: (value: SgkHizmetListesiData[]) => void;
    onayliSgkHizmetListesi: SgkHizmetListesiData[];
    setOnayliSgkHizmetListesi: (value: SgkHizmetListesiData[]) => void;
    muhtasarTableData: MuhtasarTableData[];
    setMuhtasarTableData: (value: MuhtasarTableData[]) => void;
    onayliMuhtasarTableData: MuhtasarTableData[];
    setOnayliMuhtasarTableData: (value: MuhtasarTableData[]) => void;
    muhtasarMeta: MuhtasarBeyannameMeta | null;
    setMuhtasarMeta: (value: MuhtasarBeyannameMeta | null) => void;
    onayliMuhtasarMeta: MuhtasarBeyannameMeta | null;
    setOnayliMuhtasarMeta: (value: MuhtasarBeyannameMeta | null) => void;
    file: File | null;
    setFile: (value: File | null) => void;
    tamamlananAdimlar: any;
    setTamamlananAdimlar: React.Dispatch<any>;
    seciliDonem: DonemType;
    setSeciliDonem: (value: DonemType) => void;
    projeRaporu: ProjeRaporuType;
    setProjeRaporu: (value: ProjeRaporuType) => void;
    SGKTahakkuk: SGKTahakkuktype;
    setSGKTahakkuk: (value: SGKTahakkuktype) => void;
    calismaSureleriData: PersonelTableData[];
    setCalismaSureleriData: (value: PersonelTableData[]) => void;
}

const RaporContext = createContext<RaporContextType | undefined>(undefined);

export const RaporProvider = ({ children }: { children: React.ReactNode }) => {
    const [tamamlananAdimlar, setTamamlananAdimlar] = useState({
        Adim1:false,
        Adim2:false,
        Adim3:false,
        Adim4:false,
        Adim5:false,
        Adim6:false,
        Adim7:false,
        Adim8:false,
    });
    const [submitVisible, setSubmitVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageError, setPageError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
    const [raporHatalar, setRaporHatalar] = useState<{siraNo:number,error:string}[] | []>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [calismaSureleriData, setCalismaSureleriData] = useState<PersonelTableData[]>([]);
    const [sgkHizmetListesi, setSgkHizmetListesi] = useState<SgkHizmetListesiData[]>([]);
    const [onayliSgkHizmetListesi, setOnayliSgkHizmetListesi] = useState<SgkHizmetListesiData[]>([]);
    const [muhtasarTableData, setMuhtasarTableData] = useState<MuhtasarTableData[]>([]);
    const [onayliMuhtasarTableData, setOnayliMuhtasarTableData] = useState<MuhtasarTableData[]>([]);
    const [muhtasarMeta, setMuhtasarMeta] = useState<MuhtasarBeyannameMeta | null>(null);
    const [onayliMuhtasarMeta, setOnayliMuhtasarMeta] = useState<MuhtasarBeyannameMeta | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [SGKTahakkuk, setSGKTahakkuk] = useState<SGKTahakkuktype>({} as SGKTahakkuktype);


    const [seciliDonem, setSeciliDonem] = useState<DonemType>({} as DonemType);
    const [itemValue, setitemValue] = useState<ItemValutype>({} as ItemValutype);

    const [projeRaporu, setProjeRaporu] = useState<ProjeRaporuType>({} as ProjeRaporuType);
    
    const value = {        
        itemValue,
        setitemValue,
        seciliDonem,
        setSeciliDonem,
        error,
        setError,
        stepErrors,
        setStepErrors,
        pageError,
        setPageError,
        projeRaporu,
        setProjeRaporu,
        currentStep,
        setCurrentStep,
        successMessage,
        setSuccessMessage,
        submitVisible,
        setSubmitVisible,
        file,
        setFile,
        tamamlananAdimlar,
        setTamamlananAdimlar,
        raporHatalar,
        setRaporHatalar,
        calismaSureleriData,
        setCalismaSureleriData,
        sgkHizmetListesi,
        setSgkHizmetListesi,
        muhtasarTableData,
        setMuhtasarTableData,
        muhtasarMeta,
        setMuhtasarMeta,
        onayliSgkHizmetListesi,
        setOnayliSgkHizmetListesi,
        onayliMuhtasarTableData,
        setOnayliMuhtasarTableData,
        onayliMuhtasarMeta,
        setOnayliMuhtasarMeta,
        SGKTahakkuk,
        setSGKTahakkuk,
    };

    return (
        <RaporContext.Provider value={value}>
            {children}
        </RaporContext.Provider>
    );
};

export const useRapor = () => {
    const context = useContext(RaporContext);
    if (context === undefined) {
        throw new Error('useRapor must be used within a RaporProvider');
    }
    return context;
};