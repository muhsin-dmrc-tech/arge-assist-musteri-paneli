import { Fragment, useRef, useState } from 'react';
import {
  Menu,
  MenuIcon,
  MenuItem,
  MenuLabel,
  MenuSub,
  MenuTitle,
  MenuToggle
} from '@/components/menu';
import { KeenIcon } from '@/components/keenicons';
import { useLanguage } from '@/i18n';
import { ModalShareProfile } from '../modals/share-profile';
import { ModalGiveAward } from '../modals/give-award';
import { ModalReportUser } from '../modals/report-user';

const NavbarDropdown = () => {
  const itemRef = useRef<any>(null);
  const { isRTL } = useLanguage();

  const [shareProfileModalOpen, setShareProfileModalOpen] = useState(false);
  const handleSettingsModalOpen = () => {
    setShareProfileModalOpen(true);
    itemRef.current?.hide();
  };
  const handleShareProfileModalClose = () => {
    setShareProfileModalOpen(false);
  };

  const [giveAwardModalOpen, setGiveAwardModalOpen] = useState(false);
  const handleGiveAwardModalOpen = () => {
    setGiveAwardModalOpen(true);
    itemRef.current?.hide();
  };
  const handleGiveAwardModalClose = () => {
    setGiveAwardModalOpen(false);
  };

  const [reportUserModalOpen, setReportUserModalOpen] = useState(false);
  const handleReportUserModalOpen = () => {
    setReportUserModalOpen(true);
    itemRef.current?.hide();
  };
  const handleReportUserModalClose = () => {
    setReportUserModalOpen(false);
  };

  return (
    <Fragment>
      <Menu className="flex items-stretch">
        <MenuItem
          ref={itemRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [0, -10] : [0, 10]
                }
              }
            ]
          }}
        >
          <MenuToggle className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <KeenIcon icon="dots-vertical" />
          </MenuToggle>
          <MenuSub className="bg-white divide-y divide-gray-100 rounded-lg shadow-lg" rootClassName="w-56">
            <MenuItem onClick={handleSettingsModalOpen}>
              <MenuLabel className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <MenuIcon className="mr-3 h-5 w-5 text-gray-400">
                  <KeenIcon icon="coffee" />
                </MenuIcon>
                <MenuTitle>Share Profile</MenuTitle>
              </MenuLabel>
            </MenuItem>
            <MenuItem onClick={handleGiveAwardModalOpen}>
              <MenuLabel className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <MenuIcon className="mr-3 h-5 w-5 text-gray-400">
                  <KeenIcon icon="award" />
                </MenuIcon>
                <MenuTitle>Give Award</MenuTitle>
              </MenuLabel>
            </MenuItem>
            <MenuItem>
              <MenuLabel className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <div className="flex items-center">
                  <MenuIcon className="mr-3 h-5 w-5 text-gray-400">
                    <KeenIcon icon="chart-line" />
                  </MenuIcon>
                  <MenuTitle>Stay Updated</MenuTitle>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </MenuLabel>
            </MenuItem>
            <MenuItem onClick={handleReportUserModalOpen}>
              <MenuLabel className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <MenuIcon className="mr-3 h-5 w-5 text-gray-400">
                  <KeenIcon icon="information-2" />
                </MenuIcon>
                <MenuTitle>Report User</MenuTitle>
              </MenuLabel>
            </MenuItem>
          </MenuSub>
        </MenuItem>
      </Menu>

      <ModalShareProfile open={shareProfileModalOpen} onOpenChange={handleShareProfileModalClose} />
      <ModalGiveAward open={giveAwardModalOpen} onOpenChange={handleGiveAwardModalClose} />
      <ModalReportUser open={reportUserModalOpen} onOpenChange={handleReportUserModalClose} />
    </Fragment>
  );
};

export { NavbarDropdown };
