import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCircle, Plus, Upload, RotateCcw, X } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { clipboard } from '@/lib/clipboard';
import { useProfilesStore, PROFILE_ICONS, captureSnapshot, applySnapshot, type ProfileIconId } from '@/stores';
import { toast } from '@/hooks';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { ProfileCard } from './profile-card';

// ─── Profiles Section ───

export function ProfilesSection() {
  const { t } = useTranslation();
  const {
    profiles,
    activeProfileId,
    createProfile,
    deleteProfile,
    setActiveProfileId,
    exportProfile,
    importProfile,
    resetToDefaults: resetProfiles,
  } = useProfilesStore();

  // ─── Profile UI state ───
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showImportProfile, setShowImportProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const [newProfileIcon, setNewProfileIcon] = useState<ProfileIconId>('microscope');
  const [importJson, setImportJson] = useState('');

  /** Handle creating a new profile */
  const handleCreateProfile = useCallback(() => {
    if (!newProfileName.trim()) return;
    const snapshot = captureSnapshot();
    createProfile(newProfileName.trim(), newProfileIcon, newProfileDesc.trim(), snapshot);
    toast({ title: t('profiles.created') });
    setShowCreateProfile(false);
    setNewProfileName('');
    setNewProfileDesc('');
    setNewProfileIcon('microscope');
  }, [newProfileName, newProfileIcon, newProfileDesc, createProfile, t]);

  /** Handle switching to a profile */
  const handleActivateProfile = useCallback((profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    applySnapshot(profile.snapshot);
    setActiveProfileId(profileId);
    const displayName = profile.isDefault ? t(profile.name) : profile.name;
    toast({ title: t('profiles.activated', { name: displayName }) });
  }, [profiles, setActiveProfileId, t]);

  /** Handle export */
  const handleExportProfile = useCallback(async (id: string) => {
    const json = exportProfile(id);
    if (json) {
      const ok = await clipboard.copy(json);
      toast({ title: ok ? t('profiles.exported') : t('profiles.exportError') });
    }
  }, [exportProfile, t]);

  /** Handle import */
  const handleImportProfile = useCallback(() => {
    if (!importJson.trim()) return;
    const id = importProfile(importJson.trim());
    if (id) {
      toast({ title: t('profiles.imported') });
      setShowImportProfile(false);
      setImportJson('');
    } else {
      toast({ title: t('profiles.importError') });
    }
  }, [importJson, importProfile, t]);

  return (
    <FormSection
      id="profiles"
      title={t('settingsPage.profiles')}
      description={t('settingsPage.profilesDesc')}
      icon={UserCircle}
      delay={8}
    >
      <div className="space-y-4">
        {/* Active profile indicator + action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {profiles.filter((p) => !p.isDefault).length} {t('settingsPage.profiles').toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowImportProfile(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Upload className="w-3 h-3" />
              {t('profiles.import')}
            </button>
            <button
              onClick={() => setShowCreateProfile(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-foreground/10 hover:bg-foreground/15 text-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
              {t('profiles.create')}
            </button>
          </div>
        </div>

        {/* Create profile form */}
        {showCreateProfile && (
          <div className="p-4 rounded-lg border border-border/40 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{t('profiles.createTitle')}</p>
              <button
                onClick={() => setShowCreateProfile(false)}
                className="p-1 rounded hover:bg-muted/50 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{t('profiles.createDesc')}</p>

            {/* Name input */}
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder={t('profiles.namePlaceholder')}
              className="w-full px-3 py-2 text-sm rounded-md border border-border/40 bg-background/50 placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
              autoFocus
            />

            {/* Description input */}
            <input
              type="text"
              value={newProfileDesc}
              onChange={(e) => setNewProfileDesc(e.target.value)}
              placeholder={t('profiles.descriptionPlaceholder')}
              className="w-full px-3 py-2 text-sm rounded-md border border-border/40 bg-background/50 placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
            />

            {/* Icon picker */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{t('profiles.chooseIcon')}</label>
              <div className="flex flex-wrap gap-1.5">
                {PROFILE_ICONS.map((iconId) => (
                  <button
                    key={iconId}
                    onClick={() => setNewProfileIcon(iconId)}
                    className={cn(
                      'p-2 rounded-lg border transition-all',
                      newProfileIcon === iconId
                        ? 'border-[var(--module-accent)]/50 bg-[var(--module-accent-subtle)] ring-1 ring-[var(--module-accent)]/20'
                        : 'border-border/30 hover:border-border/50 hover:bg-muted/30'
                    )}
                  >
                    <DynamicIcon name={iconId} className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowCreateProfile(false)}
                className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {t('profiles.cancel')}
              </button>
              <button
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim()}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  newProfileName.trim()
                    ? 'bg-foreground/10 hover:bg-foreground/15 text-foreground'
                    : 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                )}
              >
                {t('profiles.save')}
              </button>
            </div>
          </div>
        )}

        {/* Import profile form */}
        {showImportProfile && (
          <div className="p-4 rounded-lg border border-border/40 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{t('profiles.importTitle')}</p>
              <button
                onClick={() => { setShowImportProfile(false); setImportJson(''); }}
                className="p-1 rounded hover:bg-muted/50 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{t('profiles.importDesc')}</p>
            <Textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder={t('profiles.importPlaceholder')}
              rows={5}
              spellCheck={false}
              className="text-xs font-mono border-border/40 bg-background/50 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setShowImportProfile(false); setImportJson(''); }}
                className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {t('profiles.cancel')}
              </button>
              <button
                onClick={handleImportProfile}
                disabled={!importJson.trim()}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  importJson.trim()
                    ? 'bg-foreground/10 hover:bg-foreground/15 text-foreground'
                    : 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                )}
              >
                {t('profiles.import')}
              </button>
            </div>
          </div>
        )}

        {/* Profiles list */}
        <div className="space-y-2">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isActive={activeProfileId === profile.id}
              onActivate={() => handleActivateProfile(profile.id)}
              onExport={() => handleExportProfile(profile.id)}
              onDelete={() => {
                deleteProfile(profile.id);
                toast({ title: t('profiles.deleted') });
              }}
            />
          ))}
        </div>

        {/* Reset all profiles */}
        {profiles.filter((p) => !p.isDefault).length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                resetProfiles();
                toast({ title: t('profiles.resetDone') });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border/40"
            >
              <RotateCcw className="w-3 h-3" />
              {t('profiles.resetAll')}
            </button>
          </div>
        )}
      </div>
    </FormSection>
  );
}
