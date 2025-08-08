import clsx from 'clsx';
import { UsersData } from './GorevListesiData';
import { DefaultTooltip } from '@/components';
import { forwardRef } from 'react';
import getRandomColor from '@/hooks/getRandomColor';



type TeamUsersProps = {
  users: UsersData[];
  button: any;
};


const ButtonWrapper = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { children, ...other } = props;
  return (
    <div ref={ref} {...other}>
      {children}
    </div>
  );
});

ButtonWrapper.displayName = 'ButtonWrapper';

export const TeamUsers = ({ users, button }: TeamUsersProps) => {
  // Rastgele renk seçme fonksiyonu
  
  return (
    <div className={clsx('flex -space-x-2')}>
      {users.map((each, index) => {
        const randomColor = getRandomColor(each.Kullanici.AdSoyad.charAt(0));
        return (
          index <= 2 && (
            <div key={index} className="flex group relative">
              <span
                className={clsx(
                  'relative inline-flex items-center justify-center shrink-0 rounded-full ring-1 font-semibold leading-none text-3xs size-[30px]',
                  `text-${randomColor}-inverse`,
                  `ring-${randomColor}-light`,
                  `bg-${randomColor}`
                )}
              >
                {each.Kullanici.AdSoyad.charAt(0).toUpperCase()}
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                {each.Kullanici.AdSoyad}
              </div>
            </div>
          )
        );
      })}
      {users.length > 3 && (
        <div className="flex">
          <span
            className={clsx(
              `relative inline-flex items-center justify-center shrink-0 rounded-full ring-1 font-semibold leading-none text-3xs size-[30px] text-primary-inverse ring-primary-light bg-primary`
            )}
          >
            +{users.length - 3}
          </span>
        </div>
      )}
      <div className="max-w-25">
        <DefaultTooltip
          title="Kullanıcı Ekle"
          placement="top"
          className="max-w-48"
        >
          <ButtonWrapper className="inline-block">
            {button}
          </ButtonWrapper>
        </DefaultTooltip>
      </div>
    </div>
  );
};
