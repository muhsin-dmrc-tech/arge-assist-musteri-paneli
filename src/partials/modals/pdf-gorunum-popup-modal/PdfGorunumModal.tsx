import { forwardRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components';
import { DialogDescription } from '@radix-ui/react-dialog';

interface PdfGorunumModalProps {
  open: boolean;
  onOpenChange: (data: any) => void;
  pdfData: string;
  description?: string;
  title?: string;
}

const PdfGorunumModal = forwardRef<HTMLDivElement, PdfGorunumModalProps>(
  ({ open, onOpenChange, pdfData,description,title }, ref) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    useEffect(() => {
      if (!pdfData) return;
    
      try {
        // Base64'ten binary'ye çevir
        const binaryString = atob(pdfData);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
    
        // Blob oluştur
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
    
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("PDF oluşturma hatası:", error);
      }
    }, [pdfData]);
    
    // Download fonksiyonunu da güncelle
    const handleDownload = () => {
      if (!pdfData) return;
    
      try {
        // Base64'ten binary'ye çevir
        const binaryString = atob(pdfData);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
    
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'disarida-gecirilen-sure.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('PDF indirme hatası:', error);
      }
    };
    return (
      <Dialog open={open} modal={true}>
        <DialogContent
          className={`${isFullScreen ? 'max-w-[90vw] h-[90vh]' : 'max-w-[600px]'
            } [&>button]:hidden`}
          ref={ref}
          onPointerDownOutside={(e) => e.preventDefault()} // Dışarı tıklamayı engelle
          onEscapeKeyDown={(e) => e.preventDefault()} // ESC tuşunu engelle
        >
          <DialogHeader className="flex md:flex-row gap-1 flex-col items-between md:justify-between md:items-center w-full">
           <div className="flex flex-col justify-start w-full">
           <DialogTitle className="text-s md:text-l">{title ?? 'PDF Önizleme'}</DialogTitle>
           <DialogDescription className="text-xs">{description}</DialogDescription>
           </div>
            <div className="flex gap-2 justify-end w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                <KeenIcon icon={isFullScreen ? "arrow-two-diagonals" : "maximize"} className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <KeenIcon icon="folder-down" className="w-4 h-4 mr-2" />
                İndir
              </Button>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange('close')}
                >
                  <KeenIcon icon="cross" className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div
            className="relative w-full cursor-pointer transition-all duration-300"
            style={{ height: isFullScreen ? 'calc(90vh - 100px)' : '400px' }}
          >
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span>PDF yükleniyor...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

PdfGorunumModal.displayName = 'PdfGorunumModal';

export { PdfGorunumModal };
