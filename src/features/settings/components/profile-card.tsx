import { useTranslation } from 'react-i18next';
import { Check, Copy, Palette, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import type { WorkspaceProfile } from '@/stores/profiles-store';

// ─── Profile Card ───

export interface ProfileCardProps {
  profile: WorkspaceProfile;
  isActive: boolean;
  onActivate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function ProfileCard({ profile, isActive, onActivate, onExport, onDelete }: ProfileCardProps) {
  const { t } = useTranslation();

  const displayName = profile.isDefault ? t(profile.name) : profile.name;
  const displayDesc = profile.isDefault ? t(profile.description) : profile.description;

  // Summary of what the profile includes
  const presetLabel = profile.snapshot.themePreset;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-all',
        isActive
          ? 'border-[var(--module-accent)]/40 bg-[var(--module-accent-subtle)]'
          : 'border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-card hover:border-[color-mix(in_srgb,var(--color-border)_60%,transparent)]'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'shrink-0 p-2 rounded-lg',
        isActive ? 'bg-[color-mix(in_srgb,var(--color-foreground)_10%,transparent)]' : 'bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)]'
      )}>
        {getIconComponent(profile.icon, 'h-4 w-4')}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{displayName}</span>
          {isActive && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-[var(--module-accent)]/15 text-[var(--module-accent)]">
              {t('profiles.active')}
            </span>
          )}
        </div>
        {displayDesc && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{displayDesc}</p>
        )}

        {/* Snapshot info */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
            <Palette className="w-2.5 h-2.5" />
            {presetLabel}
          </span>
          <span className="text-[10px] text-muted-foreground/40">•</span>
          <span className="text-[10px] text-muted-foreground/60">
            {profile.snapshot.density}
          </span>
          <span className="text-[10px] text-muted-foreground/40">•</span>
          <span className="text-[10px] text-muted-foreground/60">
            {profile.snapshot.fontSize}px
          </span>
          {(profile.snapshot.openTabs?.length ?? 0) > 0 && (
            <>
              <span className="text-[10px] text-muted-foreground/40">•</span>
              <span className="text-[10px] text-muted-foreground/60">
                {profile.snapshot.openTabs.length} {t('tabs.title', 'tabs')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!isActive && (
          <button
            onClick={onActivate}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)] transition-colors"
            title={t('profiles.activate')}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onExport}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)] transition-colors"
          title={t('profiles.export')}
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        {!profile.isDefault && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-[color-mix(in_srgb,var(--color-destructive)_10%,transparent)] transition-colors"
            title={t('profiles.delete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
