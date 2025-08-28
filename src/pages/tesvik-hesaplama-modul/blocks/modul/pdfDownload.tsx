import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TeknoKentHesaplama } from "./TesvikHesaplamaModulApi";

pdfMake.vfs = pdfFonts.vfs;

import logo from "/media/app/arge_logo.png";

const toBase64 = (url: string) =>
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = reject;
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
    });

export const handlePdfDownload = async (
    personelAylikListesi: {
        id: number;
        PersonelAdi: string;
        ayliklar: TeknoKentHesaplama[];
    }[]
) => {
    if (!personelAylikListesi || personelAylikListesi.length === 0) return;

    const logoBase64 = await toBase64(logo);
    const today = new Date().toLocaleDateString("tr-TR");

    let genelToplamTesvik = 0;
    let genelToplamMaliyet = 0;

    // Genel toplamları hesapla
    personelAylikListesi.forEach((p) => {
        p.ayliklar?.forEach((a) => {
            genelToplamTesvik += a.ToplamTesvik || 0;
            genelToplamMaliyet += a.ToplamMaliyet || 0;
        });
    });

    const content: any[] = [
        // --- 1. Sayfa (Rapor) ---
        { image: "logo", width: 120, alignment: "left", margin: [50, 50, 0, 0] },
        { text: "Teknokent Teşvik Hesaplama Raporu", style: "header", margin: [0, 20, 0, 10] },
        { text: `Tarih: ${today}`, alignment: "right", margin: [0, 0, 50, 20] },

        { text: `Toplam Personel Sayısı: ${personelAylikListesi.length}`, style: "reportItem" },
        { text: `Genel Teşvik Tutarı: ${genelToplamTesvik.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`, style: "reportItem" },
        { text: `Genel Maliyet Tutarı: ${genelToplamMaliyet.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`, style: "reportItem" },

        {
            text: "\nNot: Bu belge resmi bir belge değildir. ArgeAssist, bilgilerin doğruluğunu garanti etmez.",
            style: "note",
            margin: [50, 50, 0, 0],pageBreak: "after"
        },
    ];

    // --- Personel Sayfaları ---
    personelAylikListesi.forEach((personel, idx) => {
        let yillikToplamTesvik = 0;
        let yillikToplamMaliyet = 0;

        const calismaTuru =
            personel.ayliklar && personel.ayliklar[0]
                ? personel.ayliklar[0].KanunNo === "4691"
                    ? "(4691) Teknokent Projeleri İçin Çalışan"
                    : personel.ayliklar[0].KanunNo === "5746"
                        ? "(5746) Tubitak, Arge ve Tasarım Merkezleri İçin Çalışan"
                        : "Standart Çalışan"
                : "Hesaplama Yapılamadı";

        content.push({
            text: `Personel: ${personel.PersonelAdi}      -      Çalışma Türü: ${calismaTuru}`,
            fontSize: 16,
            bold: true,
            margin: [0, 10, 0, 5]
        });
        if (!personel.ayliklar || personel.ayliklar.length === 0) {
            content.push({ text: "Hesaplama yapılamamış", margin: [0, 0, 0, 20] });
        } else {
            // Tablo başlığı
           const combinedTableBody = [
                [
                    { text: "Ay", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "Brüt Ücret", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "SGK Matrahı", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "Asg.Ücr. İstisna Matrahı", fontSize: 8, bold: true, margin: [0, 0, 0, 2]},
                    { text: "Asg.Ücr. Kümüle İst.Matr.", fontSize: 8, bold: true, margin: [0, 0, 0, 2]},
                    { text: "Asg.Ücr. Vergi İstisnası", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "Gelir Vergisi Matrahı", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "Kümülatif Gel.Ver.Matrahı", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "Gelir Vergisi", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "Gelir Ver. Teşviği", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "Kalan Gel.Ver.", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "BES Kesintisi", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "Net Maaş", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                ],
            ];
                                     
            personel.ayliklar.forEach((d) => {
                combinedTableBody.push([
                    { text: d.Ay, fontSize: 8 },
                    { text: d.AylikBrutUcret?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.SGKMatrahi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.AsgUcretIstisnaMatrahi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.AsgUcretKumuleIstisnaMatrahi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.AsgUcretVergiIstisnasi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.GelirVergisiMatrahi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.KumGelirVergisiMatrahi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.GelirVergisi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.GelirVergisiTesvigi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.KalanGelirVergisi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.BESKEsintisi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.NetOdenen?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                ] as any);

                yillikToplamTesvik += d.ToplamTesvik || 0;
                yillikToplamMaliyet += d.ToplamMaliyet || 0;
            });

            content.push({
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto','auto', 'auto','auto'],
                    body: combinedTableBody,
                },
                layout: "lightHorizontalLines",
                margin: [0, 0, 0, 5]
            });
            content.push({ text: "",margin:[10,10,10,10] });

             const combinedTableBody2 = [
                [
                    { text: "Ay", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "Gün Sayısı", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "SGK İşçi Primi", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "SGK İşveren Primi", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "SGK 5510/15510 Teşviği", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "SGK 5746-4691 Teşviği", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "SGK Teşvik Toplamı", fontSize: 8, bold: true, margin: [0, 0, 0, 2]},
                    { text: "Kalan SGK İşveren Primi", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "İşsizlik İşçi Primi", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "İşsizlik İşveren Primi", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                    { text: "Ödenecek SGK Primi", fontSize: 8, bold: true, margin: [0, 0, 0, 2]},
                    { text: "Toplam Maliyet", fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                ],
            ];

            personel.ayliklar.forEach((d) => {
                combinedTableBody2.push([
                    { text: d.Ay, fontSize: 8 },
                    { text: d.BordroGunSayisi, fontSize: 8 },
                    { text: d.SGKIsciPayi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.SGKIsverenPayi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.SGK5510Tesvigi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.SGK4691Tesvigi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.SGKTesvigi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.KalanSGKIsverenPrimi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.IssizlikIsciPrimi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.IssizlikIsverenPrimi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.OdenecekSGKPrimi?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                    { text: d.ToplamMaliyet?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), fontSize: 8 },
                ] as any);
            });

            content.push({
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto','auto','auto'],
                    body: combinedTableBody2,
                },
                layout: "lightHorizontalLines",
                margin: [0, 0, 0, 5]
            });


            content.push({
                text: `Yıl Toplamı = Teşvik: ${yillikToplamTesvik.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺ | Maliyet: ${yillikToplamMaliyet.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`,
                bold: true,
                margin: [0, 10, 0, 20],
            });
        }

        if (idx !== personelAylikListesi.length - 1)
            content.push({ text: "", pageBreak: "after" });
    });

    const docDefinition: any = {
        content,
        styles: {
            header: { fontSize: 16, bold: true, alignment: "center" },
            reportItem: { fontSize: 12, margin: [50, 5, 0, 0] },
            personelHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
            tableHeader: { bold: true, fillColor: "#eeeeee", alignment: "center" },
            note: { italics: true, fontSize: 10, color: "gray" },
        },
        images: { logo: logoBase64 },
        defaultStyle: { font: "Roboto" },
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [30, 30, 30, 30],
    };

    pdfMake.createPdf(docDefinition).download(`Teknokent_Tesvik_Raporu_${today}.pdf`);
};
