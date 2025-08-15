export interface ItemValutype {
    TeknokentID: number;
    OnerilenProjeIsmi: string;
    ProjeKonusuVeAmaci: string;
    ProjeyiOrtayaCikaranProblem: string;
    ProjeKapsamindakiCozum: string;
    ProjeninIcerdigiYenilikler: string;
    RakipAnalizi: any;
    TicariBasariPotansiyeli: string;
    DosyaEki: any;
    EkDosyaSil: boolean
}

export interface Step1Props {
    itemValue: ItemValutype;
    setitemValue: React.Dispatch<React.SetStateAction<ItemValutype>>;
    //teknokentler: any;
}

export interface Step2Props {
    itemValue: ItemValutype;
    setitemValue: React.Dispatch<React.SetStateAction<ItemValutype>>;
}

export interface Step3Props {
    itemValue: ItemValutype;
    setitemValue: React.Dispatch<React.SetStateAction<ItemValutype>>;
}

export interface Step6Props {
    itemValue: ItemValutype;
    setitemValue: React.Dispatch<React.SetStateAction<ItemValutype>>;
    handlePdfUploadClick: () => void;
    fileInputRef: any;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileError: string | null;
    basvuruEki: any | null;
    item: any;
    fetchFile: () => void
}

// ... diğer step props'ları için benzer şekilde devam edecek
