import { ChangeEvent, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { useLanguage } from '@/i18n';
import { toAbsoluteUrl } from '@/utils';
import { useSettings } from '@/providers/SettingsProvider';
import { DefaultTooltip, KeenIcon } from '@/components';
import {
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuSeparator,
  MenuArrow,
  MenuIcon
} from '@/components/menu';

interface IDropdownUserProps {
  menuItemRef: any;
}

const DropdownUser = ({ menuItemRef }: IDropdownUserProps) => {
  const { settings, storeSettings } = useSettings();
  const API_URL = import.meta.env.VITE_APP_API_URL;
  const { logout, currentUser } = useAuthContext();
  const { isRTL } = useLanguage();
  const handleThemeMode = (event: ChangeEvent<HTMLInputElement>) => {
    const newThemeMode = event.target.checked ? 'dark' : 'light';

    storeSettings({
      themeMode: newThemeMode
    });
  };
  const buildHeader = () => {
    return (
      <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
        <div className="flex items-center gap-2">
          {currentUser?.ProfilResmi ? <img
            src={`${API_URL + currentUser?.ProfilResmi}`}
            className="rounded-full size-9 shrink-0"
            alt={`${currentUser?.AdSoyad}`}
          /> : <span className="flex items-center justify-center size-9 rounded-full border-2 border-success  text-sm font-semibold text-white bg-red-400">
            {currentUser?.AdSoyad?.slice(0, 1).toUpperCase()}
          </span>}
          <div className="flex flex-col gap-1.5">
            <span
              className="text-sm text-gray-800 hover:text-primary font-semibold leading-none"
            >
              {currentUser?.AdSoyad}
            </span>
            <span
              className="text-xs text-gray-600 hover:text-primary font-medium leading-none"
            >
              {currentUser?.Email}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const buildMenu = () => {
    return (
      <Fragment>
        <MenuSeparator />
        <div className="flex flex-col">
          <MenuItem>
            <MenuLink path="/account/profil/settings">
              <MenuIcon>
                <KeenIcon icon="profile-circle" />
              </MenuIcon>
              <MenuTitle>
                Profilim
              </MenuTitle>
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink path="/destek-talebleri">
              <MenuIcon>
                <KeenIcon icon="support" />
              </MenuIcon>
              <MenuTitle>
                Destek Talebleri
              </MenuTitle>
            </MenuLink>
          </MenuItem>
          <MenuSeparator />
        </div>
      </Fragment>
    );
  };

  const buildFooter = () => {
    return (
      <div className="flex flex-col">
        <div className="menu-item mb-0.5">
          <div className="menu-link">
            <span className="menu-icon">
              <KeenIcon icon="moon" />
            </span>
            <span className="menu-title">
              Koyu Mod
            </span>
            <label className="switch switch-sm">
              <input
                name="theme"
                type="checkbox"
                checked={settings.themeMode === 'dark'}
                onChange={handleThemeMode}
                value="1"
              />
            </label>
          </div>
        </div>

        <div className="menu-item px-4 py-1.5">
          <a onClick={logout} className="btn btn-sm btn-light justify-center">
            Çıkış
          </a>
        </div>
      </div>
    );
  };

  return (
    <MenuSub
      className="menu-default light:border-gray-300"
      rootClassName="p-0"
    >
      {buildHeader()}
      {buildMenu()}
      {buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };
