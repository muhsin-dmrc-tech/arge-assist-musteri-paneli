import React, { useEffect, useRef } from 'react';
import { KeenIcon } from '@/components';

interface PasswordStrengthProps {
  password: string;
  onValid: () => void;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, onValid }) => {
  const has8Chars = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isAllValid = has8Chars && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  const onValidCalled = useRef(false);

  useEffect(() => {
    if (isAllValid && !onValidCalled.current) {
      onValid();
      onValidCalled.current = true;
    }
    if (!isAllValid) {
      onValidCalled.current = false;
    }
  }, [isAllValid, onValid]);

  const getRequirementClass = (isValid: boolean) => {
    return isValid ? 'text-success' : 'text-gray-500';
  };

  const getIcon = (isValid: boolean) => {
    return isValid ? 'check-circle' : 'close-circle';
  };

  if (isAllValid) {
    return (
      <div className="p-4 border rounded-lg bg-success-light mt-2">
        <div className="flex items-center gap-2 text-success font-semibold">
          <KeenIcon icon="check-circle" className="h-5 w-5" />
          <span>Şifre güvenli</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50 mt-2">
      <div className="text-sm font-semibold mb-2 text-gray-700">Şifreniz şunları içermelidir:</div>
      <div className="flex flex-col gap-1.5 text-xs">
        <div className={`flex items-center gap-2 ${getRequirementClass(has8Chars)}`}>
          <KeenIcon icon={getIcon(has8Chars)} className="h-4 w-4" />
          <span>En az 8 karakter</span>
        </div>
        <div className={`flex items-center gap-2 ${getRequirementClass(hasUpperCase)}`}>
          <KeenIcon icon={getIcon(hasUpperCase)} className="h-4 w-4" />
          <span>En az bir büyük harf (A-Z)</span>
        </div>
        <div className={`flex items-center gap-2 ${getRequirementClass(hasLowerCase)}`}>
          <KeenIcon icon={getIcon(hasLowerCase)} className="h-4 w-4" />
          <span>En az bir küçük harf (a-z)</span>
        </div>
        <div className={`flex items-center gap-2 ${getRequirementClass(hasNumber)}`}>
          <KeenIcon icon={getIcon(hasNumber)} className="h-4 w-4" />
          <span>En az bir rakam (0-9)</span>
        </div>
        <div className={`flex items-center gap-2 ${getRequirementClass(hasSpecialChar)}`}>
          <KeenIcon icon={getIcon(hasSpecialChar)} className="h-4 w-4" />
          <span>En az bir özel karakter (!@#$...)</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrength;
