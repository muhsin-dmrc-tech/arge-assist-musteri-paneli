import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router';

const FirmaAbonelikYenileModal = ({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void; }) => {

  const navigate = useNavigate();


  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="max-w-[1000px]">
        <DialogHeader className="flex flex-col gap-2.5">
          <DialogTitle className="text-2xl font-bold">Firmanızın Aboneliği Bulunamadı Yada Süresi Dolmuş</DialogTitle>
          <DialogDescription>Lütfen firma nız la ilgili işlemleri yapmaya devam edebilmek için Firma Aboneliği satın alın.</DialogDescription>
          <div className="flex flex-row gap-3 justify-between">
            <button onClick={() => {setOpen(false);navigate(`/abonelik-planlari`)}} className='btn btn-success'>Şimdi Satın Al</button>
            <button onClick={() => setOpen(false)} className='btn btn-warning'>Vazgeç</button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default FirmaAbonelikYenileModal