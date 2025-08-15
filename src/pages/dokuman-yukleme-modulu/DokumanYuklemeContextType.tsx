import { createContext, useContext, useState } from 'react';
import { DonemType, FarklılarListesiData, FirmaDonemsalFaaliyetBilgileri, ItemValutype, MuhtasarBeyannameMeta, MuhtasarTableData, PersonelBilgi, PersonellerType, ProjeRaporuType, SgkHizmetListesiData, SGKTahakkuktype } from './types';
import { WIZARD_STEPS } from './blocks/menu/wizard.config';

interface RaporContextType {
    itemValue: ItemValutype;
    setitemValue: (value: ItemValutype) => void;
    geciciListe: FarklılarListesiData[];
    setGeciciListe: (value: FarklılarListesiData[]) => void;
    tableData: MuhtasarTableData[];
    setTableData: (value: MuhtasarTableData[]) => void;
    steps: typeof WIZARD_STEPS;
    setSteps: (value: typeof WIZARD_STEPS) => void;
    item: any;
    setItem: (value: any) => void;
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
    muafiyetTableData: MuhtasarTableData[];
    setMuafiyetTableData: (value: MuhtasarTableData[]) => void;
    muhtasarMeta: MuhtasarBeyannameMeta | null;
    setMuhtasarMeta: (value: MuhtasarBeyannameMeta | null) => void;
    onayliMuhtasarMeta: MuhtasarBeyannameMeta | null;
    setOnayliMuhtasarMeta: (value: MuhtasarBeyannameMeta | null) => void;
    personeller: PersonellerType[];
    setPersoneller: (value: PersonellerType[]) => void;
    file: File | null;
    setFile: (value: File | null) => void;
    tamamlananAdimlar: any;
    setTamamlananAdimlar: React.Dispatch<any>;
    checkedList: any;
    setCheckedList: React.Dispatch<any>;
    checkedList1: any;
    setCheckedList1: React.Dispatch<any>;
    vergiTutar: string;
    setVergiTutar: (value: string) => void;
    terkinTutar: string;
    setTerkinTutar: (value: string) => void;
    projeKoduTespiti: string;
    setProjeKoduTespiti: (value: string) => void;
    onayliVergiTutar: string;
    setOnayliVergiTutar: (value: string) => void;
    onayliTerkinTutar: string;
    setOnayliTerkinTutar: (value: string) => void;
    onayliProjeKoduTespiti: string;
    setOnayliProjeKoduTespiti: (value: string) => void;
    seciliDonem: DonemType;
    setSeciliDonem: (value: DonemType) => void;
    projeRaporu: ProjeRaporuType;
    setProjeRaporu: (value: ProjeRaporuType) => void;
    projeKodu: string;
    setProjeKodu: (value: string) => void;
    donemCalisma: string;
    setDonemCalisma: (value: string) => void;
    personelListesi: PersonelBilgi[];
    setPersonelListesi: (value: PersonelBilgi[]) => void;
    faaliyetBilgileri: FirmaDonemsalFaaliyetBilgileri;
    setFaaliyetBilgileri: (value: FirmaDonemsalFaaliyetBilgileri) => void;
    SGKTahakkuk: SGKTahakkuktype;
    setSGKTahakkuk: (value: SGKTahakkuktype) => void;
}

const RaporContext = createContext<RaporContextType | undefined>(undefined);

export const RaporProvider = ({ children }: { children: React.ReactNode }) => {
    const [geciciListe, setGeciciListe] = useState<FarklılarListesiData[]>([]);
    const [tableData, setTableData] = useState<MuhtasarTableData[]>([]);
    const [steps, setSteps] = useState(WIZARD_STEPS);
    const [item, setItem] = useState<any>({});
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
    const [sgkHizmetListesi, setSgkHizmetListesi] = useState<SgkHizmetListesiData[]>([]);
    const [onayliSgkHizmetListesi, setOnayliSgkHizmetListesi] = useState<SgkHizmetListesiData[]>([]);
    const [muhtasarTableData, setMuhtasarTableData] = useState<MuhtasarTableData[]>([]);
    const [onayliMuhtasarTableData, setOnayliMuhtasarTableData] = useState<MuhtasarTableData[]>([]);
    const [muafiyetTableData, setMuafiyetTableData] = useState<MuhtasarTableData[]>([]);
    const [muhtasarMeta, setMuhtasarMeta] = useState<MuhtasarBeyannameMeta | null>(null);
    const [onayliMuhtasarMeta, setOnayliMuhtasarMeta] = useState<MuhtasarBeyannameMeta | null>(null);
    const [personeller, setPersoneller] = useState<PersonellerType[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [checkedList, setCheckedList] = useState<any>({});
    const [checkedList1, setCheckedList1] = useState<any>({});
    const [vergiTutar, setVergiTutar] = useState('');
    const [terkinTutar, setTerkinTutar] = useState('');
    const [projeKoduTespiti, setProjeKoduTespiti] = useState('');

    const [onayliVergiTutar, setOnayliVergiTutar] = useState('');
    const [onayliTerkinTutar, setOnayliTerkinTutar] = useState('');
    const [onayliProjeKoduTespiti, setOnayliProjeKoduTespiti] = useState('');
    const [SGKTahakkuk, setSGKTahakkuk] = useState<SGKTahakkuktype>({} as SGKTahakkuktype);


    const [seciliDonem, setSeciliDonem] = useState<DonemType>({} as DonemType);
    const [itemValue, setitemValue] = useState<ItemValutype>({} as ItemValutype);

    const [projeRaporu, setProjeRaporu] = useState<ProjeRaporuType>({} as ProjeRaporuType);
    const [projeKodu, setProjeKodu] = useState('');
    const [donemCalisma, setDonemCalisma] = useState('');
    const [personelListesi, setPersonelListesi] = useState<PersonelBilgi[]>([]);
    const [faaliyetBilgileri, setFaaliyetBilgileri] = useState<FirmaDonemsalFaaliyetBilgileri>({
        argePersonelGelirVergisiIstisnaTutari: { matrah: '', hesaplananVergiPrim: '', muafiyetTutari: '', hata: '' },
        kdvIstisnaTutari: { matrah: '', hesaplananVergiPrim: '', muafiyetTutari: '', hata: '' },
        sgkPrimiIsverenHissesiDestegi: { matrah: '', hesaplananVergiPrim: '', muafiyetTutari: '', hata: '' }
    });
    
    const value = {
        geciciListe,
        setGeciciListe,
        tableData,
        setTableData,
        steps,
        setSteps,
        item,
        setItem,
        submitVisible,
        setSubmitVisible,
        error,
        setError,
        pageError,
        setPageError,
        successMessage,
        setSuccessMessage,
        stepErrors,
        setStepErrors,
        currentStep,
        setCurrentStep,
        onayliSgkHizmetListesi,
        setOnayliSgkHizmetListesi,
        muafiyetTableData,
        setMuafiyetTableData,
        personeller,
        setPersoneller,
        file,
        setFile,
        checkedList,
        setCheckedList,
        checkedList1,
        setCheckedList1,
        vergiTutar,
        setVergiTutar,
        terkinTutar,
        setTerkinTutar,
        projeKoduTespiti,
        setProjeKoduTespiti,
        seciliDonem,
        setSeciliDonem,
        projeRaporu,
        setProjeRaporu,
        projeKodu,
        setProjeKodu,
        donemCalisma,
        setDonemCalisma,
        personelListesi,
        setPersonelListesi,
        faaliyetBilgileri,
        setFaaliyetBilgileri,
        onayliMuhtasarTableData,
        setOnayliMuhtasarTableData,
        onayliMuhtasarMeta,
        setOnayliMuhtasarMeta,
        onayliVergiTutar,
        setOnayliVergiTutar,
        onayliTerkinTutar,
        setOnayliTerkinTutar,
        onayliProjeKoduTespiti,
        setOnayliProjeKoduTespiti,
        SGKTahakkuk,
        setSGKTahakkuk,

        
        itemValue,
        setitemValue,
        tamamlananAdimlar,
        setTamamlananAdimlar,
        raporHatalar,
        setRaporHatalar,
        sgkHizmetListesi,
        setSgkHizmetListesi,
        muhtasarTableData,
        setMuhtasarTableData,
        muhtasarMeta,
        setMuhtasarMeta,
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