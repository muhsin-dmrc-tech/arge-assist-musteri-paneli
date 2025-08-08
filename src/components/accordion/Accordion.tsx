import clsx from 'clsx';
import { Children, cloneElement, isValidElement, memo, ReactNode, useState } from 'react';
import { IAccordionItemProps } from './';

interface IAccordionProps {
  className?: string;
  children: ReactNode;
  isOpen?: boolean;
  onClick?: () => void;
  allowMultiple?: boolean;
  activeIndex?: number | null; // 💡 dışarıdan kontrol için
  onChange?: (index: number | null) => void; // 💡 dışarıdan state güncelleme için
}

const AccordionComponent = ({ className, children, allowMultiple, activeIndex, onChange }: IAccordionProps) => {
  const [internalIndex, setInternalIndex] = useState<number | null>(null);

  const isControlled = activeIndex !== undefined;
  const openIndex = isControlled ? activeIndex : internalIndex;

  const handleItemClick = (index: number) => {
    const newIndex = openIndex === index ? null : index;
    if (isControlled && onChange) {
      onChange(newIndex); // dışarıdaki state'e bildir
    } else {
      setInternalIndex(newIndex); // iç state ile kontrol
    }
  };


  const modifiedChildren = Children.map(children, (child, index) => {
    if (isValidElement<IAccordionItemProps>(child)) {
      return cloneElement<IAccordionItemProps>(child, {
        isOpen: allowMultiple ? child.props.isOpen : openIndex === index,
        onClick: () => handleItemClick(index)
      });
    }
    return child;
  });

  return <div className={clsx('accordion', className)}>{modifiedChildren}</div>;
};


const Accordion = memo(AccordionComponent);
export { Accordion, type IAccordionProps };
