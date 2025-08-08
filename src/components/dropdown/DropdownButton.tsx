import { Fragment, useRef } from 'react';
import {
  Menu,
  MenuItem,
  MenuLabel,
  MenuIcon,
  MenuTitle,
  MenuSub,
  MenuToggle
} from '@/components/menu';
import { useLanguage } from '@/i18n';

interface DropdownItem {
  label: string;
  action: () => void;
  iconClass?: string;
  badge?: string;
  badgeClass?: string;
}

interface DropdownButtonProps {
  text: string;
  items: DropdownItem[];
  className?: string;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({ text, items, className }) => {
  const itemRef = useRef<any>(null);
  const { isRTL } = useLanguage();

  return (
    <Fragment>
      <Menu className={`items-stretch ${className || ''}`}>
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
          <MenuToggle className="btn btn-light">
            {text}
          </MenuToggle>
          <MenuSub className="menu-default" rootClassName="w-full max-w-56">
            {items.map((item, index) => (
              <MenuItem key={index} onClick={() => {
                item.action();
                itemRef.current?.hide();
              }}>
                <MenuLabel>
                  {item.iconClass && (
                    <MenuIcon>
                      <i className={item.iconClass}></i>
                    </MenuIcon>
                  )}
                  <MenuTitle>{item.label}</MenuTitle>
                  {item.badge && (
                    <span className={`badge badge-sm badge-outline badge-pill ${item.badgeClass || ''}`}>
                      {item.badge}
                    </span>
                  )}
                </MenuLabel>
              </MenuItem>
            ))}
          </MenuSub>
        </MenuItem>
      </Menu>
    </Fragment>
  );
};
