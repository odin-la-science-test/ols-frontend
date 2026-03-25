import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { Button, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getAvatarUrl } from '@/stores/auth-store';

const PREDEFINED_AVATARS = [
  { id: 'bottts-microscope', category: 'bottts' },
  { id: 'bottts-bacteria', category: 'bottts' },
  { id: 'bottts-molecule', category: 'bottts' },
  { id: 'bottts-mushroom', category: 'bottts' },
  { id: 'bottts-dna', category: 'bottts' },
  { id: 'bottts-erlenmeyer', category: 'bottts' },
  { id: 'bottts-cell', category: 'bottts' },
  { id: 'bottts-neuron', category: 'bottts' },
  { id: 'emoji-scientist', category: 'emoji' },
  { id: 'emoji-atom', category: 'emoji' },
  { id: 'emoji-virus', category: 'emoji' },
  { id: 'emoji-chemistry', category: 'emoji' },
  { id: 'emoji-petri', category: 'emoji' },
  { id: 'emoji-pipette', category: 'emoji' },
] as const;

interface AvatarPickerProps {
  currentAvatarId?: string | null;
  onSelect: (avatarId: string | null) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function AvatarPicker({ currentAvatarId, onSelect, onClose, isLoading }: AvatarPickerProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(currentAvatarId ?? null);

  const handleConfirm = () => {
    onSelect(selected);
  };

  return (
    <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_95%,transparent)] backdrop-blur-xl p-4 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('profile.pickAvatar')}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Robots */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">{t('profile.avatarCategoryRobots')}</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {PREDEFINED_AVATARS.filter((a) => a.category === 'bottts').map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelected(avatar.id)}
              className={cn(
                'relative rounded-lg p-1 transition-all duration-150',
                'hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)] hover:scale-105',
                selected === avatar.id
                  ? 'ring-2 ring-primary bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]'
                  : 'ring-1 ring-border/30'
              )}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={getAvatarUrl(avatar.id)} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              {selected === avatar.id && (
                <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Emojis */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">{t('profile.avatarCategoryEmojis')}</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {PREDEFINED_AVATARS.filter((a) => a.category === 'emoji').map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelected(avatar.id)}
              className={cn(
                'relative rounded-lg p-1 transition-all duration-150',
                'hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)] hover:scale-105',
                selected === avatar.id
                  ? 'ring-2 ring-primary bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]'
                  : 'ring-1 ring-border/30'
              )}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={getAvatarUrl(avatar.id)} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              {selected === avatar.id && (
                <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => setSelected(null)}
          disabled={!selected}
        >
          {t('profile.removeAvatar')}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading || selected === (currentAvatarId ?? null)}
          >
            {t('profile.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
