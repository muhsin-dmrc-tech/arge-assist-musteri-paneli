import clsx from 'clsx';
import { KullaniciType, SohbetData } from '@/auth/types';

interface IAvatarsItem {
  fallback?: string;
  variant?: string;
}
interface IAvatarsItems extends Array<IAvatarsItem> {}

interface IAvatarsProps {
  size?: string;
  group: KullaniciType[];
  each:IAvatarsItem;
  more?: { variant?: string; number?: number | string; label?: string };
  className?: string;
}

const CommonAvatars = ({ size, group, more, className,each }: IAvatarsProps) => {
  const avatarSize = size ? size : 'size-6';
  const API_URL = import.meta.env.VITE_APP_API_URL;

  const renderItem = (index: number ,each:IAvatarsItem,Kullanici?: { ProfilResmi?: string, AdSoyad: string }) => {
    return (
      <div key={index} className="flex">
        { Kullanici ?
        (
          Kullanici?.ProfilResmi ? <img
          src={`${API_URL + Kullanici?.ProfilResmi}`}
          className={clsx(
              `hover:z-5 relative shrink-0 rounded-full ring-1 ring-light-light ${avatarSize}`
            )}
          alt={`${Kullanici?.AdSoyad}`}
        /> : <span className={clsx(
              `hover:z-5 relative inline-flex items-center justify-center shrink-0 rounded-full ring-1 font-semibold leading-none text-3xs ${avatarSize}`
            )}>
          {Kullanici?.AdSoyad?.slice(0, 1).toLocaleUpperCase('tr-TR')}
        </span>
          
        ) : 
        each.fallback ? (
          <span
            className={clsx(
              `hover:z-5 relative inline-flex items-center justify-center shrink-0 rounded-full ring-1 font-semibold leading-none text-3xs ${avatarSize}`,
              each.variant
            )}
          >
            {each.fallback}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <div className={clsx('flex -space-x-2', className && className)}>
      {group.map((kullanici, index) => {
        return renderItem(index, each,kullanici);
      })}

      {more && (
        <div className="flex">
          <span
            className={clsx(
              `relative inline-flex items-center justify-center shrink-0 rounded-full ring-1 font-semibold leading-none text-3xs ${size} size-6`,
              more.variant
            )}
          >
            +{more.number || more.label}
          </span>
        </div>
      )}
    </div>
  );
};

export { CommonAvatars, type IAvatarsItem, type IAvatarsItems, type IAvatarsProps };
