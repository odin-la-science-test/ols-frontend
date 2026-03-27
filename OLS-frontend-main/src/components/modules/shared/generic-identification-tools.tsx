'use client';

import { useState, type FormEvent } from 'react';

import { 
  FlaskConical, 
  Hash, 
  Loader2,
  Sparkles,
  Search,
  X
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { SidebarSection } from '@/components/modules/layout/module-sidebar';
import { ToggleButton, BooleanToggle } from '@/components/modules/shared';
import { useTranslation } from 'react-i18next';

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC IDENTIFICATION TOOLS - Configurable identification component
// ═══════════════════════════════════════════════════════════════════════════

export interface ProfileField {
  key: string;
  type: 'toggle' | 'boolean' | 'select';
  label: string;
  options?: Array<{ value: string | boolean; label: string; variant?: string }>;
}

export interface ProfileSection {
  label: string;
  fields: ProfileField[];
}

export interface IdentificationConfig {
  profileSections: ProfileSection[];
  profileSectionTitle?: string;
  apiCodeLabel?: string;
  apiCodePlaceholder?: string;
  apiCodeValidator?: (code: string) => boolean;
  apiCodeTransform?: (code: string) => string;
}

interface GenericIdentificationToolsProps {
  config: IdentificationConfig;
  onResults?: (results: unknown[]) => void;
  onAction?: () => void;
  useIdentifyByProfile: () => {
    mutate: (profile: Record<string, unknown>, options?: { onSuccess?: (data: unknown) => void }) => void;
    isPending: boolean;
  };
  useIdentifyByApiCode: () => {
    mutate: (code: string, options?: { onSuccess?: (data: unknown) => void; onError?: () => void }) => void;
    isPending: boolean;
  };
}

export function GenericIdentificationTools({
  config,
  onResults,
  onAction,
  useIdentifyByProfile,
  useIdentifyByApiCode,
}: GenericIdentificationToolsProps) {
  return (
    <>
      <SidebarSection 
        title={config.profileSectionTitle || "Profil d'identification"} 
        icon={FlaskConical} 
        defaultOpen={false}
      >
        <ProfileIdentifier 
          config={config}
          onResults={onResults}
          onAction={onAction}
          useIdentifyByProfile={useIdentifyByProfile}
        />
      </SidebarSection>

      <SidebarSection title="Code API" icon={Hash} defaultOpen={false}>
        <ApiCodeIdentifier 
          config={config}
          onResults={onResults}
          onAction={onAction}
          useIdentifyByApiCode={useIdentifyByApiCode}
        />
      </SidebarSection>
    </>
  );
}

// ─── Profile Identifier ───
interface ProfileIdentifierProps {
  config: IdentificationConfig;
  onResults?: (results: unknown[]) => void;
  onAction?: () => void;
  useIdentifyByProfile: () => {
    mutate: (profile: Record<string, unknown>, options?: { onSuccess?: (data: unknown) => void }) => void;
    isPending: boolean;
  };
}

function ProfileIdentifier({ config, onResults, onAction, useIdentifyByProfile }: ProfileIdentifierProps) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const { mutate: identify, isPending } = useIdentifyByProfile();

  const handleToggle = (key: string, value: unknown) => {
    setProfile((prev) => {
      const currentValue = prev[key];
      // Three-state toggle: undefined -> value -> undefined
      if (currentValue === undefined) return { ...prev, [key]: value };
      if (currentValue === value) return { ...prev, [key]: undefined };
      return { ...prev, [key]: value };
    });
  };

  const handleBooleanToggle = (key: string, value: boolean | undefined) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    identify(profile, {
      onSuccess: (data) => {
        onResults?.(data as unknown[]);
        onAction?.();
      },
    });
    // Close immediately for UX responsiveness
    onAction?.();
  };

  const handleReset = () => {
    setProfile({});
    onAction?.();
  };

  const activeCount = Object.values(profile).filter((v) => v !== undefined).length;

  return (
    <div className="space-y-4">
      {config.profileSections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">{section.label}</label>
          
          {/* Toggle fields */}
          {section.fields.filter(f => f.type === 'toggle').length > 0 && (
            <div className="flex flex-wrap gap-2">
              {section.fields.filter(f => f.type === 'toggle').map((field) => (
                field.options?.map((option) => (
                  <ToggleButton
                    key={`${field.key}-${option.value}`}
                    active={profile[field.key] === option.value}
                    onClick={() => handleToggle(field.key, option.value)}
                    variant={option.variant as 'default' | 'positive' | 'negative' | undefined}
                    size="sm"
                  >
                    {option.label}
                  </ToggleButton>
                ))
              ))}
            </div>
          )}

          {/* Boolean fields */}
          {section.fields.filter(f => f.type === 'boolean').length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {section.fields.filter(f => f.type === 'boolean').map((field) => (
                <BooleanToggle
                  key={field.key}
                  label={field.label}
                  value={profile[field.key] as boolean | undefined}
                  onChange={(val) => handleBooleanToggle(field.key, val)}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={isPending || activeCount === 0}
          className="w-full"
          size="sm"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t('common.identify')} ({activeCount})
        </Button>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-2" />
            {t('common.clearProfile')}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── API Code Identifier ───
interface ApiCodeIdentifierProps {
  config: IdentificationConfig;
  onResults?: (results: unknown[]) => void;
  onAction?: () => void;
  useIdentifyByApiCode: () => {
    mutate: (code: string, options?: { onSuccess?: (data: unknown) => void; onError?: () => void }) => void;
    isPending: boolean;
  };
}

function ApiCodeIdentifier({ config, onResults, onAction, useIdentifyByApiCode }: ApiCodeIdentifierProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const { mutate: identify, isPending } = useIdentifyByApiCode();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValidCode) {
      identify(code, {
        onSuccess: (data) => {
          onResults?.([data]);
          onAction?.();
        },
        onError: () => {
          // Propagate an empty result so the UI can show "aucun résultat"
          onResults?.([]);
          onAction?.();
        },
      });
    } else {
      onAction?.();
    }
  };

  const handleCodeChange = (value: string) => {
    const transformed = config.apiCodeTransform ? config.apiCodeTransform(value) : value;
    setCode(transformed);
  };

  const isValidCode = config.apiCodeValidator ? config.apiCodeValidator(code) : code.length >= 3;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          {config.apiCodeLabel || t('scientific.apiCode')}
        </label>
        <Input
          type="text"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder={config.apiCodePlaceholder || t('common.enterCode')}
          className="font-mono"
        />
        {code && !isValidCode && (
          <p className="text-xs text-muted-foreground">
            {t('common.invalidCode')}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || !isValidCode}
        className="w-full"
        size="sm"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Search className="h-4 w-4 mr-2" />
        )}
        {t('common.identify')}
      </Button>
    </form>
  );
}
