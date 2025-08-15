import React from 'react'
import { WIZARD_STEPS } from '@/pages/dokuman-yukleme-modulu/blocks/menu/wizard.config';
import clsx from 'clsx';
import { KeenIcon } from '@/components';
import { useRapor } from '../../DokumanYuklemeContextType';

interface MenuProps {
  steps: typeof WIZARD_STEPS;
  currentStep: number;
  onStepClick: (stepId: number) => void;
  stepErrors: Record<number, string>;
}

const Menu = ({ steps, currentStep, onStepClick, stepErrors }: MenuProps) => {
  const { tamamlananAdimlar } = useRapor();
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow md:rounded-r-none min-h-[100%]">
      {steps.map((step) => (
        <div
          key={step.id}
          onClick={() => onStepClick(step.id)}
          className={clsx(
            'flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all relative',
            'hover:bg-gray-50',
            {
              'bg-primary/10': step.state === 'current',
              'bg-success/10': step.state === 'completed',
              'bg-red-50': stepErrors[step.id],
              'opacity-60': step.state === 'pending'
            }
          )}
        >
          {stepErrors[step.id] && (
            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              !
            </div>
          )}
          <div className={clsx(
            'min-w-8 min-h-8 rounded-full flex items-center justify-center text-white font-medium',
            {
              'bg-primary': step.state === 'current',
              'bg-success': step.state === 'completed' || tamamlananAdimlar[`Adim${step.id}`],
              'bg-gray-400': step.state === 'pending',
              'bg-red-400': stepErrors[step.id]
            }
          )}>
            {step.state === 'completed' || tamamlananAdimlar[`Adim${step.id}`] ? (
              <KeenIcon icon="check" className="w-auto h-auto" />
            ) : (
              step.id
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium text-sm">
              {step.title}
            </span>
            <span className="text-gray-500 text-xs">
              {step.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu;