import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { useAuthContext } from '@/auth';
import useAxiosInterceptors from '@/auth/providers/useAxiosInterceptors';

const IstekKotaAlertModal = ({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) => {

    const { auth,saveAuth, setCurrentUser } = useAuthContext();
    const { blockTime } = useAxiosInterceptors(auth, saveAuth, setCurrentUser);
  


    return (
        <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="max-w-[1000px]">
          <DialogHeader className="flex flex-col gap-2.5">
            <DialogTitle className="text-2xl font-bold">İstek sınırına ulaştınız</DialogTitle>
            {blockTime && <DialogDescription>Lütfen bekleyin: {Math.ceil((blockTime - Date.now()) / 1000)} saniye kaldı.</DialogDescription>}

          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
}

export default IstekKotaAlertModal