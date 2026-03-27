'use client';

import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Input, Label } from '@/components/ui';

interface AuthInputFieldProps {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  labelClassName?: string;
  error?: string;
  errorClassName?: string;
}

export function AuthInputField({
  id,
  label,
  register,
  type = 'text',
  placeholder,
  autoComplete,
  className,
  labelClassName,
  error,
  errorClassName,
}: AuthInputFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className={cn('text-sm', labelClassName)}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...register}
      />
      {error && (
        <p className={cn('text-xs text-destructive', errorClassName)}>
          {error}
        </p>
      )}
    </div>
  );
}
