'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import type { UseFormRegisterReturn, Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Check, Loader2, ChevronDown } from 'lucide-react';
import type { SaveStatus } from '@/hooks/use-inline-auto-save';
import { Badge } from './badge';

// ═══════════════════════════════════════════════════════════════════════════
// INLINE FIELDS — Editable fields that look like text until focused
//
// Used in detail panels for Notion-like inline editing + auto-save.
// All components follow the same visual pattern:
// - Unfocused: looks like static text (same font/size as DetailRow)
// - Focused: subtle ring, editable input
// ═══════════════════════════════════════════════════════════════════════════

// ─── Save Indicator ───

export function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />;
  }
  if (status === 'saved') {
    return <Check className="w-3 h-3 text-emerald-500 animate-in fade-in duration-200" />;
  }
  return null;
}

// ─── Inline Text ───

interface InlineTextProps {
  registration: UseFormRegisterReturn;
  placeholder?: string;
  readOnly?: boolean;
  onFieldBlur?: () => void;
  type?: 'text' | 'email' | 'tel';
  className?: string;
  label?: string;
  saveStatus?: SaveStatus;
}

export function InlineText({
  registration,
  placeholder,
  readOnly = false,
  onFieldBlur,
  type = 'text',
  className,
  label,
  saveStatus,
}: InlineTextProps) {
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    registration.onBlur(e);
    onFieldBlur?.();
  }, [registration, onFieldBlur]);

  if (readOnly) {
    return (
      <div className={cn('py-2', className)}>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
        <p className="text-sm font-medium">{(registration as unknown as { value?: string }).value || '—'}</p>
      </div>
    );
  }

  return (
    <div className={cn('py-1.5', className)}>
      {label && (
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          {saveStatus && <SaveIndicator status={saveStatus} />}
        </div>
      )}
      <input
        {...registration}
        type={type}
        placeholder={placeholder}
        onBlur={handleBlur}
        className={cn(
          'w-full text-sm font-medium bg-transparent rounded-md px-2 py-1 -mx-2',
          'border border-transparent transition-all duration-150',
          'hover:bg-muted/30',
          'focus:outline-none focus:border-border/50 focus:bg-muted/20 focus:ring-1 focus:ring-ring/20',
          'placeholder:text-muted-foreground/50',
        )}
      />
    </div>
  );
}

// ─── Inline Textarea ───

interface InlineTextareaProps {
  registration: UseFormRegisterReturn;
  placeholder?: string;
  readOnly?: boolean;
  onFieldBlur?: () => void;
  className?: string;
  label?: string;
  saveStatus?: SaveStatus;
  rows?: number;
}

export function InlineTextarea({
  registration,
  placeholder,
  readOnly = false,
  onFieldBlur,
  className,
  label,
  saveStatus,
  rows = 4,
}: InlineTextareaProps) {
  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    registration.onBlur(e);
    onFieldBlur?.();
  }, [registration, onFieldBlur]);

  if (readOnly) {
    return (
      <div className={cn('py-2', className)}>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
        <p className="text-sm font-medium whitespace-pre-wrap">
          {(registration as unknown as { value?: string }).value || '—'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('py-1.5', className)}>
      {label && (
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          {saveStatus && <SaveIndicator status={saveStatus} />}
        </div>
      )}
      <textarea
        {...registration}
        placeholder={placeholder}
        rows={rows}
        onBlur={handleBlur}
        className={cn(
          'w-full text-sm font-medium bg-transparent rounded-md px-2 py-1.5 -mx-2 resize-none',
          'border border-transparent transition-all duration-150',
          'hover:bg-muted/30',
          'focus:outline-none focus:border-border/50 focus:bg-muted/20 focus:ring-1 focus:ring-ring/20',
          'placeholder:text-muted-foreground/50',
        )}
      />
    </div>
  );
}

// ─── Inline Select ───

interface InlineSelectOption {
  value: string;
  label: string;
}

interface InlineSelectProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  options: InlineSelectOption[];
  readOnly?: boolean;
  onSave?: () => void;
  className?: string;
  label?: string;
  saveStatus?: SaveStatus;
  placeholder?: string;
}

export function InlineSelect<TFieldValues extends FieldValues>({
  name,
  control,
  options,
  readOnly = false,
  onSave,
  className,
  label,
  saveStatus,
  placeholder,
}: InlineSelectProps<TFieldValues>) {
  return (
    <div className={cn('py-1.5', className)}>
      {label && (
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          {saveStatus && <SaveIndicator status={saveStatus} />}
        </div>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          if (readOnly) {
            const selectedLabel = options.find((o) => o.value === field.value)?.label ?? '—';
            return <p className="text-sm font-medium">{selectedLabel}</p>;
          }

          return (
            <div className="relative">
              <select
                value={field.value ?? ''}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  onSave?.();
                }}
                className={cn(
                  'w-full text-sm font-medium bg-transparent rounded-md px-2 py-1 -mx-2 pr-8 appearance-none',
                  'border border-transparent transition-all duration-150 cursor-pointer',
                  'hover:bg-muted/30',
                  'focus:outline-none focus:border-border/50 focus:bg-muted/20 focus:ring-1 focus:ring-ring/20',
                )}
              >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          );
        }}
      />
    </div>
  );
}

// ─── Inline Color Picker ───

interface InlineColorPickerProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  colors: { value: string; label: string; className: string }[];
  readOnly?: boolean;
  onSave?: () => void;
  className?: string;
  label?: string;
  saveStatus?: SaveStatus;
}

export function InlineColorPicker<TFieldValues extends FieldValues>({
  name,
  control,
  colors,
  readOnly = false,
  onSave,
  className,
  label,
  saveStatus,
}: InlineColorPickerProps<TFieldValues>) {
  return (
    <div className={cn('py-1.5', className)}>
      {label && (
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          {saveStatus && <SaveIndicator status={saveStatus} />}
        </div>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selected = colors.find((c) => c.value === field.value);

          if (readOnly) {
            return (
              <div className="flex items-center gap-2">
                {selected && <div className={cn('w-3 h-3 rounded-full', selected.className)} />}
                <span className="text-sm font-medium">{selected?.label ?? '—'}</span>
              </div>
            );
          }

          return (
            <div className="flex flex-wrap gap-1.5">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    field.onChange(color.value);
                    onSave?.();
                  }}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all duration-150',
                    color.className,
                    field.value === color.value
                      ? 'ring-2 ring-offset-2 ring-offset-background ring-ring'
                      : 'hover:scale-110',
                  )}
                  title={color.label}
                />
              ))}
            </div>
          );
        }}
      />
    </div>
  );
}

// ─── Inline Tag Input ───

interface InlineTagInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  readOnly?: boolean;
  onFieldBlur?: () => void;
  className?: string;
  label?: string;
  saveStatus?: SaveStatus;
  placeholder?: string;
}

export function InlineTagInput<TFieldValues extends FieldValues>({
  name,
  control,
  readOnly = false,
  onFieldBlur,
  className,
  label,
  saveStatus,
  placeholder,
}: InlineTagInputProps<TFieldValues>) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('py-1.5', className)}>
      {label && (
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          {saveStatus && <SaveIndicator status={saveStatus} />}
        </div>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const tags: string[] = field.value ?? [];

          const addTag = (tag: string) => {
            const trimmed = tag.trim();
            if (trimmed && !tags.includes(trimmed)) {
              field.onChange([...tags, trimmed]);
              onFieldBlur?.();
            }
            setInputValue('');
          };

          const removeTag = (tag: string) => {
            field.onChange(tags.filter((t: string) => t !== tag));
            onFieldBlur?.();
          };

          const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(inputValue);
            }
            if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          };

          return (
            <div className="flex flex-wrap gap-1.5 items-center">
              {tags.map((tag: string) => (
                <Badge key={tag} variant="default" className={cn(!readOnly && 'cursor-pointer')}
                  onClick={readOnly ? undefined : () => removeTag(tag)}>
                  {tag}
                  {!readOnly && <span className="ml-1 text-muted-foreground">x</span>}
                </Badge>
              ))}
              {!readOnly && (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (inputValue.trim()) addTag(inputValue);
                  }}
                  placeholder={tags.length === 0 ? placeholder : '+'}
                  className={cn(
                    'text-sm bg-transparent outline-none min-w-[60px] flex-1 py-0.5',
                    'placeholder:text-muted-foreground/50',
                  )}
                />
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
