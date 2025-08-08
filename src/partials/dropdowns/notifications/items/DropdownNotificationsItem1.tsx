//import { socket } from '@/App';
import { getSocket } from '@/auth/socket';
import { useEffect, useState } from 'react';

interface IDropdownNotificationsItemProps {
  BildirimID: number;
  KullaniciID: number;
  Baslik: string;
  Link: string;
  OkunduMu: boolean;
  Icerik: string;
}

const DropdownNotificationsItem1 = ({
  BildirimID,
  KullaniciID,
  Baslik,
  Link,
  OkunduMu,
  Icerik
}: IDropdownNotificationsItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const socket = getSocket();

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault(); // Link'e tıklamayı engelle, sadece içeriği aç
    setExpanded(!expanded);

    socket.emit("BildirimOkundu", { BildirimID, KullaniciID });
  };

  useEffect(() => {
    if (Icerik.length <= 100 && !OkunduMu) {
     setTimeout(()=>{
       socket.emit("BildirimOkundu", { BildirimID, KullaniciID });
     },1500)
    }
  },[Icerik,OkunduMu])




  return (
    <a href={Link} className={`card shadow-none flex flex-col gap-2.5 p-3.5 rounded-lg w-full ${OkunduMu ? 'bg-light-active' : 'bg-lime-100'}`}>
      <div className="flex flex-col gap-3.5 w-full">
        <div className="flex flex-col gap-1 w-full">
          <div className="text-2sm font-medium w-full flex flex-row">
            <div className="text-gray-900 font-semibold w-full">
              {Baslik}
            </div>
            <span className={OkunduMu ? "badge badge-circle bg-gray-500 size-1 mx-1.5" : "badge badge-circle bg-green-500 size-1 mx-1.5"}></span>
          </div>
        </div>

        <div className="text-2sm font-semibold text-gray-600 mb-px w-full">
          <span className="text-gray-700 font-medium w-full">
            {expanded ? Icerik : `${Icerik.slice(0, 100)}${Icerik.length > 100 ? '...' : ''}`}
          </span>
          {Icerik.length > 100 && !expanded && (
            <button
              onClick={toggleExpand}
              className="text-blue-500 text-sm ml-1 hover:underline"
            >
              devamını oku
            </button>
          )}
        </div>
      </div>
    </a>
  );
};

export { DropdownNotificationsItem1 };
