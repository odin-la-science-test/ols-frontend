'use client';

import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Shield,
  Camera,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  Calendar,
  Smartphone,
} from 'lucide-react';
import { Button, Input, Label, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { FormSection, Badge } from '@/components/modules/shared';
import { SettingsLayout, type SettingsSection } from '@/components/modules/layout';
import { cn } from '@/lib/utils';
import { useAuthStore, getAvatarUrl } from '@/stores/auth-store';
import { toast } from '@/hooks';
import { usersApi } from '@/api/endpoints/users';
import { SessionsSection } from './components/sessions-section';
import { AvatarPicker } from './components/avatar-picker';

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE PAGE - User profile management
// Uses FormPageLayout for consistent UI with other modules
// ═══════════════════════════════════════════════════════════════════════════

// System pages use the theme's native --color-primary (no custom accent)

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getRoleLabel = () => {
    if (!user) return '';
    const roleLabelMap: Record<string, string> = {
      GUEST: t('settings.roles.guest'),
      STUDENT: t('settings.roles.student'),
      PROFESSIONAL: t('settings.roles.professional'),
      PROFESSOR: t('settings.roles.professional'),
      ADMIN: t('settings.roles.admin'),
    };
    return roleLabelMap[user.role] || user.role;
  };

  const handleAvatarSelect = async (avatarId: string | null) => {
    setIsSavingAvatar(true);
    try {
      await usersApi.updateAvatar(avatarId);
      updateUser({ avatarId });
      setShowAvatarPicker(false);
      toast({ title: t('profile.avatarChanged') });
    } catch {
      toast({ title: t('profile.saveError'), variant: 'destructive' });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const hasProfileChanges = firstName !== (user?.firstName || '') || lastName !== (user?.lastName || '');

  const handleSaveProfile = async () => {
    if (!hasProfileChanges) return;
    setIsSaving(true);
    try {
      updateUser({ firstName, lastName });
      toast({ title: t('profile.saved') });
    } catch {
      toast({ title: t('profile.saveError'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: t('profile.passwordRequired'), variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t('profile.passwordMismatch'), variant: 'destructive' });
      return;
    }
    if (newPassword.length < 4) {
      toast({ title: t('profile.passwordTooShort'), variant: 'destructive' });
      return;
    }
    toast({ title: t('profile.passwordChanged') });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSection(false);
  };

  return (
    <SettingsLayout
      title={t('profile.title')}
      icon={User}
      sections={[
        { id: 'identity', icon: User, labelKey: 'profile.identity', keywords: ['avatar', 'photo', 'nom', 'name'] },
        { id: 'personal-info', icon: Mail, labelKey: 'profile.personalInfo', keywords: ['email', 'prenom', 'nom', 'role'] },
        { id: 'security', icon: KeyRound, labelKey: 'profile.security', keywords: ['password', 'mot de passe', 'securite'] },
        { id: 'sessions', icon: Smartphone, labelKey: 'profile.sessions', keywords: ['session', 'device', 'appareil', 'connexion'] },
      ] satisfies SettingsSection[]}
    >
      {(filteredSectionIds) => (<>
      {/* ─── Avatar & Identity ─── */}
      {filteredSectionIds.includes('identity') && <FormSection id="identity" delay={0}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="h-24 w-24 text-2xl ring-2 ring-border ring-offset-2 ring-offset-background">
                <AvatarImage src={getAvatarUrl(user?.avatarId)} />
                <AvatarFallback className="bg-muted text-foreground text-xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <button
                className={cn(
                  'absolute inset-0 rounded-full flex items-center justify-center',
                  'bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                )}
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              >
                <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
              </button>
            </div>

            {/* Identity */}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge variant="outline" size="default">
                  <Shield className="w-3 h-3 mr-1.5" strokeWidth={1.5} />
                  {getRoleLabel()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Avatar Picker */}
          {showAvatarPicker && (
            <AvatarPicker
              currentAvatarId={user?.avatarId}
              onSelect={handleAvatarSelect}
              onClose={() => setShowAvatarPicker(false)}
              isLoading={isSavingAvatar}
            />
          )}
        </div>
      </FormSection>}

      {/* ─── Personal Info ─── */}
      {filteredSectionIds.includes('personal-info') && <FormSection
        id="personal-info"
        title={t('profile.personalInfo')}
        description={t('profile.personalInfoDesc')}
        delay={1}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('profile.firstName')}</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-card border-border/40 h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('profile.lastName')}</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-card border-border/40 h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              {t('profile.email')}
            </Label>
            <Input
              value={email}
              disabled
              className="bg-muted/30 border-border/30 h-9 text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[10px] text-muted-foreground/60">{t('profile.emailHint')}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {t('profile.role')}
            </Label>
            <Input
              value={getRoleLabel()}
              disabled
              className="bg-muted/30 border-border/30 h-9 text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              disabled={!hasProfileChanges || isSaving}
              onClick={handleSaveProfile}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {t('profile.save')}
            </Button>
          </div>
        </div>
      </FormSection>}

      {/* ─── Security ─── */}
      {filteredSectionIds.includes('security') && <FormSection
        id="security"
        title={t('profile.security')}
        description={t('profile.securityDesc')}
        icon={KeyRound}
        delay={2}
        headerAction={
          !showPasswordSection ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordSection(true)}
              className="text-xs"
            >
              {t('profile.changePassword')}
            </Button>
          ) : undefined
        }
      >
        {showPasswordSection ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('profile.currentPassword')}</Label>
              <div className="relative">
                <Input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-card border-border/40 h-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t('profile.newPassword')}</Label>
                <div className="relative">
                  <Input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-card border-border/40 h-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t('profile.confirmPassword')}</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-card border-border/40 h-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPasswordSection(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                className="gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {t('profile.changePassword')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('profile.passwordHint', 'Cliquez sur le bouton ci-dessus pour modifier votre mot de passe.')}</p>
        )}
      </FormSection>}

      {/* ─── Sessions ─── */}
      {filteredSectionIds.includes('sessions') && <SessionsSection />}
      </>)}
    </SettingsLayout>
  );
}
