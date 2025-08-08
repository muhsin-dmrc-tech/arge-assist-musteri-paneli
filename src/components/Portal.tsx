import { useIsMounted } from '@/hooks/useIsMounted';
import { createPortal } from 'react-dom';

const Portal = ({ children }: { children: React.ReactNode }) => {
    const isMounted = useIsMounted();

    if (!isMounted()) {
        return null;
    }

    return createPortal(children, document.body);
};

export default Portal;