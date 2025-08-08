import React, {  useEffect, useRef, useState } from 'react';
import { KeenIcon } from '@/components';
import { KullaniciType, SohbetData, SohbetMessage } from '@/auth/types';
import { DropdownChatMessageOut } from './DropdownChatMessageOut';
import { DropdownChatMessageIn } from './DropdownChatMessageIn';
import { useAuthContext } from '@/auth';
import axios from 'axios';
import SohbetKisileriListesi from './SohbetKisilerListesi';
import { useSocketData } from '@/auth/SocketDataContext';
import { Skeleton } from '@mui/material';
import { format, isToday, isYesterday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getSocket } from '@/auth/socket';
import { produce } from 'immer';
import { BuildTopbar } from './buildTopbar';
import { toast } from 'sonner';


export interface FileUploadStatus {
  file: File;
  status: 'waiting' | 'uploading' | 'done' | 'error';
  url?: string;
  DosyaID?: number
}

const SohbetMesajlari = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const aktifSohbetRef = useRef<SohbetData>({} as SohbetData);
  const mesajScrollRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const socket = getSocket();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const lastMesajIDRef = useRef<number | null>(null);
  const [yeniMesajUyarisi, setYeniMesajUyarisi] = useState(false);
  const [yuklenenDosyalar, setYuklenenDosyalar] = useState<any[]>([]);
  const [fileUploadStatuses, setFileUploadStatuses] = useState<FileUploadStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [yeniSohbet, setYeniSohbet] = useState(false);
  const [error, setError] = useState('');
  const [mesajlar, setMesajlar] = useState<SohbetMessage[]>([]);
  const mesajlarRef = useRef<SohbetMessage[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [mesajInput, setMesajInput] = useState('');
  const [grupAdi, setgrupAdi] = useState('');
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [formHeight, setFormHeight] = useState(30);
  const [sohbetFirmalarID, setSohbetFirmalarID] = useState<number[] | []>([]);
  const [sohbetTeknokentlerID, setSohbetTeknokentlerID] = useState<number[] | []>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { currentUser, sohbetKullaniciId, setSohbetKullaniciId } = useAuthContext();
  const { sohbetler, seciliSohbetId, setSeciliSohbetId, setSohbetler, fetchSohbetKisileri, sohbetKisileri, seciliEkran, setSeciliEkran } = useSocketData();
  const [maxHeight, setMaxHeight] = useState('100vh');


  useEffect(() => {
    const updateMaxHeight = () => {
      const windowHeight = window.innerHeight;
      setMaxHeight(`${windowHeight - 220}px`);
    };

    // İlk yüklemede ve pencere boyutu değiştiğinde çalıştır
    updateMaxHeight();
    window.addEventListener('resize', updateMaxHeight);

    return () => {
      window.removeEventListener('resize', updateMaxHeight);
    };
  }, []);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      setFormHeight(textarea.scrollHeight);
    }
  };

  // Event handler'ları düzelt
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Mouse position kontrolü
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Eğer mouse container dışına çıktıysa
    if (
      x < rect.left ||
      x >= rect.right ||
      y < rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    let validFiles: File[] = [];
    let hasError = false;

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name}: ${validation.error}`);
        hasError = true;
      }
    });

    if (validFiles.length > 0) {
      const totalFiles = [...selectedFiles, ...validFiles];
      if (totalFiles.length > 10) {
        toast.warning('En fazla 10 dosya yükleyebilirsiniz.');
        validFiles = validFiles.slice(0, 10 - selectedFiles.length);
      }
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };


  // Dosya kontrol fonksiyonu
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const allowedMimeTypes = [
      // Resimler
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      // Dökümanlar
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Sıkıştırılmış dosyalar
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/vnd.rar'
    ];

    // MIME type kontrolü
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Geçersiz dosya tipi. Desteklenen formatlar: jpg, gif, jpeg, png, txt, pdf, doc, docx, xls, xlsx, zip, rar, 7z'
      };
    }

    // Sıkıştırılmış dosyalar için boyut kontrolü (10MB)
    const compressedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/vnd.rar'
    ];

    if (compressedTypes.includes(file.type)) {
      const maxCompressedSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxCompressedSize) {
        return {
          isValid: false,
          error: 'Sıkıştırılmış dosyalar 10MB\'dan büyük olamaz.'
        };
      }
    } else {
      // Diğer dosyalar için boyut kontrolü (25MB)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: 'Dosya boyutu 25MB\'dan büyük olamaz.'
        };
      }
    }

    return { isValid: true };
  };






  useEffect(() => {
    autoResize();
  }, [mesajInput]);

  const scrollToBottom = () => {
    setTimeout(() => {
      const container = mesajScrollRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (page < totalPage && e.currentTarget.scrollTop <= 100 && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };


  //params ile yeni sohbet tetikleme
  useEffect(() => {
    if (sohbetKullaniciId && sohbetKullaniciId > 0 && selectedUserIds.length === 0) {
      setTimeout(() => {
        setSelectedUserIds([sohbetKullaniciId]);
      }, 300)
      if (!currentUser || currentUser?.id === sohbetKullaniciId) {
        setError('Kendinize mesaj gönderemezsiniz.');
        return;
      }
      sohbeteBasla()
    } else {
      setSohbetKullaniciId(undefined)
    }
  }, [sohbetKullaniciId, currentUser, selectedUserIds])



  const sohbeteBasla = async (secilenler?: number[]) => {
    if (!secilenler && (selectedUserIds.length === 0 && !sohbetKullaniciId)) {
      setError('Sohbet başlatmak için en az bir kişi seçmelisiniz.');
      return;
    } else if (secilenler && secilenler.length === 0) {
      setError('Sohbet başlatmak için en az bir kişi seçmelisiniz.');
      return;
    }
    

    setSeciliEkran('sohbet');
    await fetchSohbetVarmiItem(secilenler);
  };

  const fetchSohbetVarmiItem = async (secilenler?: number[]) => {
    if (isLoading) return;
    if (selectedUserIds.length < 1 && (!secilenler || secilenler?.length < 1)) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/sohbetler/sohbet-item`,secilenler ? secilenler : (selectedUserIds.length > 0 ? selectedUserIds : [sohbetKullaniciId]));
      if (response.status === 201 && response.data.sohbet) {
        setYeniSohbet(false);
        const yeniSohbet: any = response.data.sohbet ?? {};
        const yeniMesajlar: any[] = response.data.mesajlar ? response.data.mesajlar.data : [];

        if (yeniSohbet.SohbetID) {
          setSohbetler(prev => {
            const index = prev.findIndex(s => Number(s.SohbetID) === Number(yeniSohbet.SohbetID));

            if (index !== -1) {
              // Var olan sohbeti güncelle
              const guncelMesajlar = prev[index].Mesajlar || [];
              const birlesikMesajlar = [
                ...guncelMesajlar,
                ...yeniMesajlar.filter(
                  yeni => !guncelMesajlar.some(eski => Number(eski.MesajID) === Number(yeni.MesajID))
                )
              ];

              const guncelSohbet = {
                ...prev[index],
                ...yeniSohbet,
                Mesajlar: birlesikMesajlar,
                SonMesaj: yeniMesajlar.length > 0 ? yeniMesajlar[yeniMesajlar.length - 1] : null
              };

              const yeniListe = [...prev];
              yeniListe[index] = guncelSohbet;
              return yeniListe;
            } else {

              setYeniSohbet(true);
              // Yeni sohbet olarak ekle
              return [
                {
                  ...yeniSohbet,
                  Mesajlar: yeniMesajlar,
                  SonMesaj: yeniMesajlar.length > 0 ? yeniMesajlar[yeniMesajlar.length - 1] : null
                },
                ...prev
              ];
            }
          });
        }

        setSeciliSohbetId(yeniSohbet.SohbetID ?? 0);
        setTotalPage(response.data.mesajlar ? response.data.mesajlar?.lastPage : 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSohbetItem = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.get(`${API_URL}/sohbetler/sohbet-item/${seciliSohbetId}?page=${page}`);
      if (response.data.sohbet) {
        const yeniSohbet: any = response.data.sohbet;
        const yeniMesajlar: any[] = response.data.mesajlar.data;

        setSohbetler(prev => {
          const index = prev.findIndex(s => s.SohbetID === yeniSohbet.SohbetID);

          if (index !== -1) {
            // Var olan sohbeti güncelle
            const guncelMesajlar = prev[index].Mesajlar || [];
            const birlesikMesajlar = [
              ...guncelMesajlar,
              ...yeniMesajlar.filter(
                yeni => !guncelMesajlar.some(eski => eski.MesajID === yeni.MesajID)
              )
            ];

            const guncelSohbet = {
              ...prev[index],
              ...yeniSohbet,
              Mesajlar: birlesikMesajlar,
              SonMesaj: yeniMesajlar.length > 0 ? yeniMesajlar[yeniMesajlar.length - 1] : null,
              pageSogbet: response.data.mesajlar.page,
              totalPageSohbet: response.data.mesajlar.lastPage
            };

            const yeniListe = [...prev];
            yeniListe[index] = guncelSohbet;
            return yeniListe;
          } else {
            // Yeni sohbet olarak ekle
            return [
              {
                ...yeniSohbet,
                Mesajlar: yeniMesajlar,
                SonMesaj: yeniMesajlar.length > 0 ? yeniMesajlar[yeniMesajlar.length - 1] : null,
                pageSogbet: response.data.mesajlar.page,
                totalPageSohbet: response.data.mesajlar.lastPage
              },
              ...prev
            ];
          }
        });

        setTotalPage(response.data.mesajlar.lastPage);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setError('Sohbet bulunamadı.');
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    (async () => {
      if (yeniSohbet && seciliSohbetId < 1) return;
      if (seciliSohbetId > 0 && seciliEkran === 'sohbet') {
        scrollToBottom()
        await fetchSohbetItem();
        scrollToBottom()
      } else {
        setYeniSohbet(true);
      }
    })()
  }, [seciliSohbetId, seciliEkran]);

  useEffect(() => {
    // Koşulu düzenleyelim
    if (
      seciliSohbetId &&
      seciliEkran === 'sohbet' &&
      (
        (aktifSohbetRef.current?.pageSohbet === undefined && page > 1) ||
        (aktifSohbetRef.current?.pageSohbet && aktifSohbetRef.current?.pageSohbet > page)
      )
    ) {
      fetchSohbetItem();
    }
  }, [page]);

  useEffect(() => {
    if (yeniSohbet) {
      fetchSohbetKisileri();
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [yeniSohbet]);




  // useEffect'i şu şekilde güncelleyelim
  useEffect(() => {
    aktifSohbetRef.current = sohbetler.find(i => i.SohbetID == seciliSohbetId) ?? {} as SohbetData;
    const mesajs = aktifSohbetRef.current?.Mesajlar;

    if (!aktifSohbetRef.current?.SohbetID) {
      setMesajlar([])
    }

    if (!mesajs) return;

    // Her mesaj değişikliğinde state'i güncelle
    setMesajlar(mesajs);
    mesajlarRef.current = mesajs;

    const container = mesajScrollRef.current;
    if (!container) return;

    const threshold = 100;
    const scrollBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const isNearBottom = scrollBottom < threshold;

    // Son mesaj kontrolü
    const currentLastMesaj = mesajs[mesajs.length - 1];
    const previousLastMesajID = lastMesajIDRef.current;

    if (currentLastMesaj?.MesajID !== previousLastMesajID) {
      lastMesajIDRef.current = currentLastMesaj?.MesajID;

      if (isNearBottom) {
        scrollToBottom();
        setYeniMesajUyarisi(false);
      } else {
        setYeniMesajUyarisi(true);
      }
    }

  }, [sohbetler, seciliSohbetId]);





  const handleFormInput = async () => {
    const mesajHtml = mesajInput.trim().replace(/\n/g, '<br>');
    if (yuklenenDosyalar.length < 1 && mesajHtml.length < 1) return;
    if (!sohbetler.find(i => i.SohbetID === seciliSohbetId) && selectedUserIds.length < 1) return;

    const tempId = Date.now();
    const formData = new FormData();

    if (mesajHtml.length > 0) {
      formData.append('mesaj', mesajHtml);
    }

    const isYeniSohbet = !seciliSohbetId;

    if (!isYeniSohbet) {
      formData.append('SohbetID', seciliSohbetId.toString());
    } else {
      formData.append('kullanicilar', JSON.stringify(selectedUserIds));
      if (selectedUserIds.length > 1) {
        formData.append('GrupAdi', grupAdi);
      }
    }
    if (sohbetTeknokentlerID.length > 0) {
      formData.append('TeknokentIDler', JSON.stringify(sohbetTeknokentlerID));
    }
    if (sohbetFirmalarID.length > 0) {
      formData.append('FirmaIDler', JSON.stringify(sohbetFirmalarID));
    }

    if (yuklenenDosyalar.length > 0) {
      formData.append('dosyalar', JSON.stringify(yuklenenDosyalar));
    }

    let newMesaj: SohbetMessage & { hata?: boolean; tempId?: number; Gönderiliyor?: boolean } = {
      MesajIcerigi: mesajHtml,
      MesajID: tempId,
      tempId,
      SohbetID: seciliSohbetId ?? 0,
      GonderenKullaniciID: currentUser?.id ?? 0,
      GonderenKullanici: currentUser ?? ({} as KullaniciType),
      GonderimTarihi: new Date().toISOString(),
      OkunmaBilgileri: [],
      Gonderiliyor: true,
      hata: false,
      Dosyalar: yuklenenDosyalar.length > 0 ? yuklenenDosyalar.map(dosya => ({
        DosyaID: dosya.DosyaID,
        DosyaTipi: dosya.DosyaTipi,
        DosyaURL: dosya.DosyaURL,
        YuklenmeTarihi: dosya.YuklenmeTarihi
      })) : undefined
    };

    if (!isYeniSohbet) {
      // Var olan sohbete geçici olarak mesajı ekle
      setSohbetler(prev =>
        produce(prev, draft => {
          const index = draft.findIndex(s => Number(s.SohbetID) === Number(seciliSohbetId));
          if (index === -1) return;
          const sohbet = draft[index];
          const mesajVarMi = sohbet.Mesajlar?.some(m => m.MesajID === newMesaj.MesajID);
          if (!mesajVarMi) {
            sohbet.Mesajlar = [...(sohbet.Mesajlar || []), newMesaj];
            sohbet.SonMesaj = newMesaj;
          }
        })
      );
    } else {
      if (!seciliSohbetId) {
        mesajlarRef.current = [...mesajlarRef.current, newMesaj];
      }
    }


    setMesajInput('');
    setFileUploadStatuses([])
    setSelectedFiles([])
    setYuklenenDosyalar([])
    scrollToBottom();

    try {
      const response = await axios.post(`${API_URL}/sohbetler/yeni-mesaj`, formData);
      if (response.status === 201 && response.data) {
        const gonderilenMesaj = response.data;
        const newSohbet = gonderilenMesaj.Sohbet;


        if (!isYeniSohbet) {
          setSohbetler(prev =>
            produce(prev, draft => {
              const index = draft.findIndex(s => Number(s.SohbetID) === Number(seciliSohbetId));
              if (index === -1) return;
              const sohbet = draft[index];
              sohbet.Mesajlar = sohbet.Mesajlar?.map(msg =>
                msg.tempId === tempId ? gonderilenMesaj : msg
              );
              if (sohbet.SonMesaj?.tempId === tempId) {
                sohbet.SonMesaj = gonderilenMesaj;
              }
            })
          );
        } else {
          // Seçili sohbeti güncelle
          setSeciliSohbetId(newSohbet.SohbetID);
          setYeniSohbet(false); // Yeni sohbet modundan çık
        }




      }

    } catch (error) {
      console.error(error);

      const errorMesaj = {
        ...newMesaj,
        Gonderiliyor: false,
        hata: true
      };
      if (!isYeniSohbet) {
        setSohbetler(prev =>
          produce(prev, draft => {
            const index = draft.findIndex(s => Number(s.SohbetID) === Number(seciliSohbetId ?? 0));
            if (index === -1) return;
            const sohbet = draft[index];
            const mesajVarMi = sohbet.Mesajlar?.some(m => m.MesajID === newMesaj.MesajID);
            if (!mesajVarMi) {
              sohbet.Mesajlar = [...(sohbet.Mesajlar || []), errorMesaj];
              sohbet.SonMesaj = errorMesaj;
            }
          })
        );
        setMesajlar(prevMesajlar =>
          prevMesajlar.map(mesaj =>
            mesaj.MesajID === newMesaj.MesajID ? errorMesaj : mesaj
          )
        );
      } else {
        // Yeni sohbet için mesajı geçici olarak ekle

        mesajlarRef.current = [...mesajlarRef.current, errorMesaj];
        setMesajlar(prevMesajlar =>
          prevMesajlar.map(mesaj =>
            mesaj.MesajID === newMesaj.MesajID ? errorMesaj : mesaj
          )
        );
      }
    }
  };


  const yenidenGonderFunc = async (mesaj: SohbetMessage & { hata?: boolean; tempId?: number; Gönderiliyor?: boolean }) => {
    // Mesajı gönderiliyor durumuna al
    const gonderiliyorMesaj = {
      ...mesaj,
      Gönderiliyor: true,
      hata: false
    };
    const isYeniSohbet = !seciliSohbetId;

    // UI'ı güncelle
    if (!isYeniSohbet) {
      setSohbetler(prev =>
        produce(prev, draft => {
          const index = draft.findIndex(s => Number(s.SohbetID) === Number(seciliSohbetId));
          if (index === -1) return;
          const sohbet = draft[index];
          sohbet.Mesajlar = sohbet.Mesajlar?.map(m =>
            m.MesajID === mesaj.MesajID ? gonderiliyorMesaj : m
          );
          if (sohbet.SonMesaj?.MesajID === mesaj.MesajID) {
            sohbet.SonMesaj = gonderiliyorMesaj;
          }
        })
      );
    } else {
      mesajlarRef.current = mesajlarRef.current.map(m =>
        m.MesajID === mesaj.MesajID ? gonderiliyorMesaj : m
      );
      setMesajlar(prev => prev.map(m =>
        m.MesajID === mesaj.MesajID ? gonderiliyorMesaj : m
      ));
    }


    try {
      const formData = new FormData();

      if (mesaj.MesajIcerigi) {
        formData.append('mesaj', mesaj.MesajIcerigi);
      }

      if (!isYeniSohbet) {
        formData.append('SohbetID', seciliSohbetId.toString());
      } else {
        formData.append('kullanicilar', JSON.stringify(selectedUserIds));
        if (selectedUserIds.length > 1) {
          formData.append('GrupAdi', grupAdi);
        }
      }

      // Teknokent ve Firma ID'lerini ekle
      if (sohbetTeknokentlerID.length > 0) {
        formData.append('TeknokentIDler', JSON.stringify(sohbetTeknokentlerID));
      }
      if (sohbetFirmalarID.length > 0) {
        formData.append('FirmaIDler', JSON.stringify(sohbetFirmalarID));
      }

      // Dosyaları ekle
      if (mesaj.Dosyalar && mesaj.Dosyalar?.length > 0) {
        formData.append('dosyalar', JSON.stringify(mesaj.Dosyalar));
      }

      const response = await axios.post(`${API_URL}/sohbetler/yeni-mesaj`, formData);

      if (response.status === 201 && response.data) {
        const gonderilenMesaj = response.data;
        const newSohbet = gonderilenMesaj.Sohbet;

        if (!isYeniSohbet) {
          setSohbetler(prev =>
            produce(prev, draft => {
              const index = draft.findIndex(s => Number(s.SohbetID) === Number(seciliSohbetId));
              if (index === -1) return;
              const sohbet = draft[index];
              sohbet.Mesajlar = sohbet.Mesajlar?.map(msg =>
                msg.MesajID === mesaj.MesajID ? gonderilenMesaj : msg
              );
              if (sohbet.SonMesaj?.MesajID === mesaj.MesajID) {
                sohbet.SonMesaj = gonderilenMesaj;
              }
            })
          );
        } else {
          setSeciliSohbetId(newSohbet.SohbetID);
          setYeniSohbet(false);
        }

        toast.success('Mesaj başarıyla gönderildi');
      }
    } catch (error) {
      console.error('Mesaj yeniden gönderme hatası:', error);

      const errorMesaj = {
        ...mesaj,
        Gönderiliyor: false,
        hata: true
      };

      // Hata durumunda UI'ı güncelle
      if (!isYeniSohbet) {
        setSohbetler(prev =>
          produce(prev, draft => {
            const index = draft.findIndex(s => Number(s.SohbetID) === Number(seciliSohbetId));
            if (index === -1) return;
            const sohbet = draft[index];
            sohbet.Mesajlar = sohbet.Mesajlar?.map(m =>
              m.MesajID === mesaj.MesajID ? errorMesaj : m
            );
            if (sohbet.SonMesaj?.MesajID === mesaj.MesajID) {
              sohbet.SonMesaj = errorMesaj;
            }
          })
        );
      } else {
        mesajlarRef.current = mesajlarRef.current.map(m =>
          m.MesajID === mesaj.MesajID ? errorMesaj : m
        );
        setMesajlar(prev => prev.map(m =>
          m.MesajID === mesaj.MesajID ? errorMesaj : m
        ));
      }

      toast.error('Mesaj gönderilemedi');
    }
  };



  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Bugün';
    if (isYesterday(date)) return 'Dün';
    return format(date, 'dd MMMM EEEE yyyy', { locale: tr });
  };

  const mesajSilFunc = async (mesajId: number) => {
    if (!mesajId || !seciliSohbetId) return;

    try {
      const response = await axios.post(`${API_URL}/sohbetler/sil-mesaj`, {
        MesajID: mesajId,
        SohbetID: seciliSohbetId
      });

      if (response.status === 201) {
        // Sohbetler state'ini güncelle
        setSohbetler(prev =>
          produce(prev, draft => {
            const index = draft.findIndex(s =>
              Number(s.SohbetID) === Number(seciliSohbetId)
            );

            if (index === -1) return;

            const sohbet = draft[index];
            // Mesajı bul ve güncelle
            sohbet.Mesajlar = sohbet.Mesajlar?.map(mesaj =>
              mesaj.MesajID === mesajId
                ? { ...mesaj, SilindiMi: true }
                : mesaj
            );

            // Son mesaj silinmişse onu da güncelle
            if (sohbet.SonMesaj?.MesajID === mesajId) {
              sohbet.SonMesaj = { ...sohbet.SonMesaj, SilindiMi: true };
            }
          })
        );

        // Mesajlar state'ini güncelle
        setMesajlar(prevMesajlar =>
          prevMesajlar.map(mesaj =>
            mesaj.MesajID === mesajId
              ? { ...mesaj, SilindiMi: true }
              : mesaj
          )
        );

        // Başarı mesajı göster
        toast.success('Mesaj başarıyla silindi', { duration: 400 });
      }
    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      toast.error('Mesaj silinirken bir hata oluştu', { duration: 400 });
    }
  };


  type AyrilmaBildirimi = {
    type: 'ayrilma';
    tarih: string | undefined;
    kullanici: string;
    id: string;
    MesajID?: never;
  };

  const buildMessages = () => {

    let lastDateLabel = '';

    const getAllItems = () => {
      const messages = (mesajlar ? mesajlar : mesajlarRef.current) || [];
      const ayrilanKullanicilar: AyrilmaBildirimi[] =
        sohbetler
          .find(s => s.SohbetID === seciliSohbetId)?.Kullanicilar?.filter(k => k.AyrildiMi)
          .map(k => ({
            type: 'ayrilma',
            tarih: k.AyrilmaTarihi,
            kullanici: k.Kullanici?.AdSoyad || 'Bilinmeyen Kullanıcı',
            id: `ayrilma_${k.KullaniciID}`
          })) || [];

      return [...messages, ...ayrilanKullanicilar].sort((a, b) => {
        const dateA = new Date(('type' in a ? a.tarih : a.GonderimTarihi) || '');
        const dateB = new Date(('type' in b ? b.tarih : b.GonderimTarihi) || '');
        return dateA.getTime() - dateB.getTime();
      });
    };
    return (
      <div
        ref={mesajScrollRef}
        className="flex flex-col overflow-x-hidden scrollable-y-auto h-full gap-5 py-5 relative max-[600px]:max-w-[100%]"
        onScroll={handleScroll}
      >
        {yeniMesajUyarisi && (
          <div
            className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow cursor-pointer z-50"
            onClick={() => {
              scrollToBottom();
              setYeniMesajUyarisi(false);
            }}
          >
            Yeni mesajlar var. Görmek için tıkla.
          </div>
        )}

        {isLoading &&
          <div className="flex flex-col gap-6 w-full px-3">
            {new Array(4).fill(0).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 1 ? 'flex-row justify-end' : 'flex-row-reverse justify-end'} gap-2`}>
                <Skeleton variant="circular" width={60} height={60}
                  animation="wave" />
                <Skeleton variant="rectangular" width={210} height={60}
                  animation="wave"
                  style={{ borderRadius: 8 }} />
              </div>
            ))}
          </div>}


        {

          getAllItems().map((item, index) => {
            const date = new Date(('type' in item ? item.tarih || new Date() : item.GonderimTarihi) || new Date());
            const dateLabel = getDateLabel(date.toISOString());
            const showDateDivider = dateLabel !== lastDateLabel;
            lastDateLabel = dateLabel;

            return (
              <React.Fragment key={'type' in item ? item.id : `${item.MesajID}_${item.SilindiMi}`}>
                {showDateDivider && (
                  <div className="border-b border-gray-200 text-gray-400 text-sm py-2 flex justify-center">
                    {dateLabel}
                  </div>
                )}

                {'type' in item ? (
                  <div className="text-center text-gray-500 text-sm py-1">
                    {item.kullanici} gruptan ayrıldı {format(date, 'HH:mm')}
                  </div>
                ) : (
                  item.GonderenKullaniciID === currentUser?.id ? (
                    <DropdownChatMessageOut
                      mesaj={item}
                      yenidenGonderFunc={yenidenGonderFunc}
                      mesajSilFunc={mesajSilFunc}
                    />
                  ) : (
                    <DropdownChatMessageIn
                      mesaj={item}
                    />
                  )
                )}
              </React.Fragment>
            );
          })
        }

      </div>
    );
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormInput();
    }
  };



  // useEffect ile selectedFiles'ı takip edelim
  useEffect(() => {
    const newFiles = selectedFiles.filter(file =>
      !fileUploadStatuses.some(status =>
        status.file.name === file.name &&
        status.file.size === file.size
      )
    );

    if (newFiles.length > 0) {
      setFileUploadStatuses(prev => [
        ...prev,
        ...newFiles.map(file => ({
          file,
          status: 'waiting' as const, // literal type olarak belirt
        }))
      ]);
    }
    uploadFiles();
  }, [selectedFiles, fileUploadStatuses]);

  // Upload fonksiyonunu güncelleyelim
  const uploadFiles = async () => {
    const waitingFiles = fileUploadStatuses.filter(status => status.status === 'waiting');

    for (const fileStatus of waitingFiles) {
      // Her dosya için yeni bir FormData oluştur
      const formData = new FormData();
      formData.append('file', fileStatus.file);

      setFileUploadStatuses(prev => prev.map(status =>
        status.file.name === fileStatus.file.name
          ? { ...status, status: 'uploading' as const }
          : status
      ));

      try {
        const response = await axios.post(
          `${API_URL}/sohbetler/yukle-dosya`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
        if (response.status === 201 && response.data) {
          setFileUploadStatuses(prev => prev.map(status =>
            status.file.name === fileStatus.file.name
              ? { ...status, status: 'done' as const, url: response.data.DosyaURL, DosyaID: response.data.DosyaID }
              : status
          ));
          setYuklenenDosyalar(prev => [...prev, response.data]);
        }
      } catch (error) {
        console.error('Dosya yükleme hatası:', error);
        setFileUploadStatuses(prev => prev.map(status =>
          status.file.name === fileStatus.file.name
            ? { ...status, status: 'error' as const }
            : status
        ));
      }
    }
  };

  // Önizleme komponenetini güncelleyelim
  const renderFilePreview = (file: File, index: number) => {
    const uploadStatus = fileUploadStatuses.find(
      status => status.file.name === file.name
    );

    const yuklenenDosyaID = uploadStatus?.DosyaID ?? null;

    const dosyaSilFunc = async () => {
      if (!yuklenenDosyaID) return;
      // Silme işlemi için API çağrısı yap
      await axios.post(`${API_URL}/sohbetler/sil-dosya`, { DosyaID: yuklenenDosyaID, SohbetID: seciliSohbetId ?? null })
        .then(response => {
          if (response.status === 201) {
            setSelectedFiles(prev => prev.filter((_, i) => i !== index));
            setFileUploadStatuses(prev =>
              prev.filter(status => status.file.name !== file.name)
            );
          }
        }
        )
        .catch(error => {
          console.error('Dosya silme hatası:', error);
          toast.error('Dosya silinirken bir hata oluştu.');
        }
        );
    };

    return (
      <div key={index} className="w-10 h-10 relative group">
        {/* Yükleme durumu overlay'i */}
        {uploadStatus?.status === 'uploading' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
            <KeenIcon
              icon="loader-2"
              className="text-white animate-spin"
            />
          </div>
        )}

        {/* Hata durumu */}
        {uploadStatus?.status === 'error' && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-50 rounded flex items-center justify-center">
            <KeenIcon
              icon="cross"
              className="text-white"
            />
          </div>
        )}

        {/* Başarılı yükleme */}
        {uploadStatus?.status === 'done' && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-50 rounded flex items-center justify-center">
            <KeenIcon
              icon="check"
              className="text-white"
            />
          </div>
        )}

        {/* Silme butonu */}
        <button
          onClick={() => dosyaSilFunc()}
          className="absolute -top-2 -right-2 z-10 w-5 h-5 bg-red-500 rounded-full text-white 
                   flex items-center justify-center opacity-0 group-hover:opacity-100 
                   transition-opacity duration-200 hover:bg-red-600"
          type="button"
        >
          <KeenIcon icon="cross" />
        </button>

        {/* Dosya önizlemesi */}
        {file.type.startsWith("image") ? (
          <img
            src={URL.createObjectURL(file)}
            className="w-full h-full object-cover rounded"
            alt="preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 
                       text-xs text-center p-1 rounded">
            {file.name.split('.').pop()?.toUpperCase()}
          </div>
        )}
      </div>
    );
  };






  const buildForm = () => {

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        let validFiles: File[] = [];
        let hasError = false;

        files.forEach(file => {
          const validation = validateFile(file);
          const newFiles = selectedFiles.filter(sfile => sfile.name === file.name && sfile.size === file.size);

          if (newFiles && newFiles.length > 0) {
            toast.error(`${file.name}: Bu dosya daha önce yüklenmiş`);
            hasError = true;
          }
          if (validation.isValid) {
            validFiles.push(file);
          } else {
            toast.error(`${file.name}: ${validation.error}`);
            hasError = true;
          }
        });

        if (!hasError && validFiles.length > 0) {
          const totalFiles = [...selectedFiles, ...validFiles];
          if (totalFiles.length > 10) {
            toast.warning('En fazla 10 dosya yükleyebilirsiniz.');
            validFiles = validFiles.slice(0, 10 - selectedFiles.length);
          }
          setSelectedFiles(prev => [...prev, ...validFiles]);
        }
      }
    };



    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMesajInput(e.target.value);
      if (seciliSohbetId) {
        socket.emit("Yaziyor", { userId: currentUser?.id, SohbetID: seciliSohbetId, KullaniciAdi: currentUser?.AdSoyad, Durum: 1 });
      }
    };

    const handleBlur = () => {
      if (seciliSohbetId) {
        socket.emit("Yaziyor", { userId: currentUser?.id, SohbetID: seciliSohbetId, KullaniciAdi: currentUser?.AdSoyad, Durum: 0 });
      }
    };

    const handleSubmit = () => {
      handleFormInput(); // bu senin mevcut form gönderme fonksiyonun
      if (seciliSohbetId) {
        socket.emit("Yaziyor", { userId: currentUser?.id, SohbetID: seciliSohbetId, KullaniciAdi: currentUser?.AdSoyad, Durum: 0 });
      }
    };

    return (
      <div
        className="relative grow mx-5 border rounded-md p-3 ps-0 bg-white shadow-sm"
      >
        {/* Dosya önizlemeleri */}
        {selectedFiles.length > 0 && (
          <div className="m-2 flex flex-wrap gap-2">
            {selectedFiles.map((file, i) => renderFilePreview(file, i))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          className="input max-w-[90%] resize-none pt-2 overflow-hidden h-auto min-h-[2.5rem] max-h-[300px] bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
          onChange={handleTextareaChange}
          onInput={autoResize}
          onBlur={handleBlur}
          placeholder="Mesaj yazın..."
          value={mesajInput}
          rows={1}
          onKeyDown={handleKeyDown}
          style={{ outline: 'none' }}
        />



        {/* Gizli dosya inputu */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <div className="flex flex-col items-center gap-0.5 absolute end-3 top-1 bottom-1">
          <button
            className="btn btn-sm btn-icon btn-light btn-clear"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <KeenIcon icon="exit-up" />
          </button>
          <button
            className="btn btn-dark btn-sm"
            type="submit"
            onClick={handleSubmit}
          >
            <KeenIcon icon="paper-plane" />
          </button>
        </div>
      </div>
    );
  };



  return (
    <>
      <div className='h-full'>
        {(seciliSohbetId > 0 && seciliEkran === 'sohbet') || (selectedUserIds.length > 0 && seciliEkran === 'sohbet')
          ?
          <div
            ref={dropZoneRef}
            className="w-full flex flex-col h-full max-h-[100%] flex-1 relative pb-2"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            {/* Drag & Drop Overlay */}
            {isDragging && (
              <div
                className="absolute inset-0 bg-black bg-opacity-70 z-[9999] flex items-center justify-center pointer-events-none"
                style={{ position: 'fixed' }}
              >
                <div className="text-white text-center">
                  <KeenIcon
                    icon="file-up"
                    className="w-16 h-16 mb-4 animate-bounce"
                  />
                  <p className="text-xl font-semibold">Dosyaları buraya sürükleyin</p>
                  <p className="text-sm opacity-75 mt-2">
                    (Maksimum 10 dosya yükleyebilirsiniz)
                  </p>
                </div>
              </div>
            )}
            {/* Header */}
            <div ref={headerRef} className="flex-shrink-0">
              <BuildTopbar
                isLoading={isLoading}
                selectedUserIds={selectedUserIds}
                grupAdi={grupAdi}
                sohbetId={seciliSohbetId ?? null}
              />
              {error && <span className='text-red-700'>{error}</span>}
            </div>

            {/* Messages - Scrollable Area */}
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto  overflow-x-hidden scrollbar-thin pb-2 scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-[355px]:max-w-[100%] max-h-[calc(100vh-100px)]"
              style={{
                height: `calc(100% - ${formHeight + 16}px)`,
                maxHeight: maxHeight
              }}
            >
              {buildMessages && buildMessages()}
            </div>

            {/* Footer */}
            {(seciliSohbetId < 1 ||
              ((sohbetler.find(s => s.SohbetID === seciliSohbetId)
                ?.Kullanicilar
                ?.filter(k => !k.AyrildiMi)
                ?.length ?? 0) > 1)) && (
                <div ref={footerRef} className="flex-shrink-0 mt-auto">
                  {buildForm && buildForm()}
                </div>
              )}
          </div> :

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">

            {sohbetKisileri.length > 0 ?
              <SohbetKisileriListesi
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                sohbeteBasla={sohbeteBasla}
                grupAdi={grupAdi}
                setGrupAdi={setgrupAdi}
                setSohbetFirmalarID={setSohbetFirmalarID}
                setSohbetTeknokentlerID={setSohbetTeknokentlerID}
              />
              : !isLoading &&
              <div className="text-bold w-full flex justify-center">Hiç Sohbet Kişisi Bulunamadı...</div>
            }

            {isLoading &&
              <div className="flex flex-col gap-6 w-full px-3">
                {new Array(4).fill(0).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 1 ? 'flex-row justify-end' : 'flex-row-reverse justify-end'} gap-2`}>
                    <Skeleton variant="circular" width={60} height={60}
                      animation="wave" />
                    <Skeleton variant="rectangular" width={210} height={60}
                      animation="wave"
                      style={{ borderRadius: 8 }} />
                  </div>
                ))}
              </div>}
          </div>

        }
      </div>
    </>
  );
};

export default SohbetMesajlari;
