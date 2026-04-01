import { Label } from '@/components/ui';
import type {
  KeybindingEntry,
  KeybindingActionId,
  KeyCombo,
  KeybindingConflict,
} from '@/stores/keybindings-store';
import { KeybindingRow } from './keybinding-row';

// ─── Keybinding Category ───

export interface KeybindingCategoryProps {
  label: string;
  bindings: KeybindingEntry[];
  getEffectiveCombo: (id: KeybindingActionId) => KeyCombo;
  isCustomized: (id: KeybindingActionId) => boolean;
  recordingActionId: KeybindingActionId | null;
  onStartRecording: (id: KeybindingActionId) => void;
  onStopRecording: () => void;
  onSetKeybinding: (id: KeybindingActionId, combo: KeyCombo) => void;
  onResetKeybinding: (id: KeybindingActionId) => void;
  conflicts: KeybindingConflict[];
}

export function KeybindingCategory({
  label,
  bindings,
  getEffectiveCombo,
  isCustomized,
  recordingActionId,
  onStartRecording,
  onStopRecording,
  onSetKeybinding,
  onResetKeybinding,
  conflicts,
}: KeybindingCategoryProps) {
  if (bindings.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {bindings.map((binding) => (
        <KeybindingRow
          key={binding.id}
          binding={binding}
          effectiveCombo={getEffectiveCombo(binding.id)}
          customized={isCustomized(binding.id)}
          isRecording={recordingActionId === binding.id}
          onStartRecording={() => onStartRecording(binding.id)}
          onStopRecording={onStopRecording}
          onSetKeybinding={(combo) => onSetKeybinding(binding.id, combo)}
          onReset={() => onResetKeybinding(binding.id)}
          hasConflict={conflicts.some(
            (c) => c.actionId === binding.id || c.conflictsWith === binding.id
          )}
        />
      ))}
    </div>
  );
}
