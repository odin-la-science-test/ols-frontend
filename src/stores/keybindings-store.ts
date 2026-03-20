import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// KEYBINDINGS STORE - Raccourcis clavier personnalisables
// Persisté en localStorage - Inspiré de VS Code
// ═══════════════════════════════════════════════════════════════════════════

// ─── Action IDs ───
export type KeybindingActionId =
  | 'commandPalette'
  | 'toggleTabBar'
  | 'toggleSidebar'
  | 'toggleActivityBar'
  | 'toggleFocusMode'
  | 'nextTab'
  | 'previousTab'
  | 'lastTab'
  | 'goToTab1'
  | 'goToTab2'
  | 'goToTab3'
  | 'goToTab4'
  | 'goToTab5'
  | 'goToTab6'
  | 'goToTab7'
  | 'goToTab8'
  | 'toggleBottomPanel'
  | 'toggleSplit';

// ─── Key combo representation ───
export interface KeyCombo {
  key: string;       // lowercase letter or digit (e.g. 'k', '1')
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

export interface KeybindingEntry {
  id: KeybindingActionId;
  defaultCombo: KeyCombo;
  userCombo: KeyCombo | null; // null = use default
  /** i18n key for the label */
  labelKey: string;
  /** i18n key for the description */
  descriptionKey: string;
  /** Category for grouping in UI */
  category: 'navigation' | 'layout' | 'tabs';
}

// ─── Default keybindings ───
const DEFAULT_KEYBINDINGS: KeybindingEntry[] = [
  {
    id: 'commandPalette',
    defaultCombo: { key: 'k', ctrlKey: true, shiftKey: false, altKey: false },
    userCombo: null,
    labelKey: 'keybindings.actions.commandPalette',
    descriptionKey: 'keybindings.descriptions.commandPalette',
    category: 'navigation',
  },
  {
    id: 'toggleSidebar',
    defaultCombo: { key: 'b', ctrlKey: true, shiftKey: false, altKey: false },
    userCombo: null,
    labelKey: 'keybindings.actions.toggleSidebar',
    descriptionKey: 'keybindings.descriptions.toggleSidebar',
    category: 'layout',
  },
  {
    id: 'toggleTabBar',
    defaultCombo: { key: 'h', ctrlKey: true, shiftKey: false, altKey: false },
    userCombo: null,
    labelKey: 'keybindings.actions.toggleTabBar',
    descriptionKey: 'keybindings.descriptions.toggleTabBar',
    category: 'layout',
  },
  {
    id: 'toggleActivityBar',
    defaultCombo: { key: 'j', ctrlKey: true, shiftKey: false, altKey: false },
    userCombo: null,
    labelKey: 'keybindings.actions.toggleActivityBar',
    descriptionKey: 'keybindings.descriptions.toggleActivityBar',
    category: 'layout',
  },
  {
    id: 'toggleFocusMode',
    defaultCombo: { key: 'f', ctrlKey: true, shiftKey: true, altKey: false },
    userCombo: null,
    labelKey: 'keybindings.actions.toggleFocusMode',
    descriptionKey: 'keybindings.descriptions.toggleFocusMode',
    category: 'layout',
  },
  // Tab cycling (Alt+PageDown/PageUp to avoid browser Ctrl+Tab conflict)
  {
    id: 'nextTab',
    defaultCombo: { key: 'arrowright', ctrlKey: false, shiftKey: false, altKey: true },
    userCombo: null,
    labelKey: 'keybindings.actions.nextTab',
    descriptionKey: 'keybindings.descriptions.nextTab',
    category: 'tabs',
  },
  {
    id: 'previousTab',
    defaultCombo: { key: 'arrowleft', ctrlKey: false, shiftKey: false, altKey: true },
    userCombo: null,
    labelKey: 'keybindings.actions.previousTab',
    descriptionKey: 'keybindings.descriptions.previousTab',
    category: 'tabs',
  },
  // Quick switch — toggles between the two most recent tabs (like Alt+Tab on Windows)
  {
    id: 'lastTab',
    defaultCombo: { key: 'a', ctrlKey: false, shiftKey: false, altKey: true },
    userCombo: null,
    labelKey: 'keybindings.actions.lastTab',
    descriptionKey: 'keybindings.descriptions.lastTab',
    category: 'tabs',
  },
  {
    id: 'toggleBottomPanel',
    defaultCombo: { key: '`', ctrlKey: true, shiftKey: false, altKey: false },
    userCombo: null,
    labelKey: 'keybindings.actions.toggleBottomPanel',
    descriptionKey: 'keybindings.descriptions.toggleBottomPanel',
    category: 'layout',
  },
  {
    id: 'toggleSplit',
    defaultCombo: { key: '\\', ctrlKey: true, shiftKey: false, altKey: false },
    userCombo: null,
    labelKey: 'keybindings.actions.toggleSplit',
    descriptionKey: 'keybindings.descriptions.toggleSplit',
    category: 'layout',
  },
  // Tabs 1-8
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) => ({
    id: `goToTab${n}` as KeybindingActionId,
    defaultCombo: { key: String(n), ctrlKey: true, shiftKey: false, altKey: false },
    userCombo: null,
    labelKey: `keybindings.actions.goToTab`,
    descriptionKey: `keybindings.descriptions.goToTab`,
    category: 'tabs' as const,
  })),
];

// ─── Helpers ───

/** Map of key names to human-friendly display strings */
const KEY_DISPLAY_MAP: Record<string, string> = {
  pagedown: 'PgDn',
  pageup: 'PgUp',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  backspace: '⌫',
  delete: 'Del',
  escape: 'Esc',
  enter: '↵',
  ' ': 'Space',
};

/** Format a KeyCombo to a human-readable string like "Ctrl+Shift+K" */
export function formatKeyCombo(combo: KeyCombo): string {
  const parts: string[] = [];
  if (combo.ctrlKey) parts.push('Ctrl');
  if (combo.altKey) parts.push('Alt');
  if (combo.shiftKey) parts.push('Shift');
  // Use display map for known named keys, otherwise capitalize
  const mapped = KEY_DISPLAY_MAP[combo.key.toLowerCase()];
  let displayKey: string;
  if (mapped) {
    displayKey = mapped;
  } else if (combo.key.length === 1) {
    displayKey = combo.key.toUpperCase();
  } else {
    displayKey = combo.key.charAt(0).toUpperCase() + combo.key.slice(1);
  }
  parts.push(displayKey);
  return parts.join('+');
}

/** Check if two combos are equal */
export function combosEqual(a: KeyCombo, b: KeyCombo): boolean {
  return a.key === b.key && a.ctrlKey === b.ctrlKey && a.shiftKey === b.shiftKey && a.altKey === b.altKey;
}

/** Check if a keyboard event matches a KeyCombo */
export function eventMatchesCombo(event: KeyboardEvent, combo: KeyCombo): boolean {
  const modKey = event.ctrlKey || event.metaKey;

  // Determine the effective key to compare.
  // Alt modifier can produce special characters on some layouts (e.g. Alt+A → 'æ').
  // In that case event.key is not the expected letter, so we need a fallback.
  let eventKey = event.key.toLowerCase();

  // If Alt is pressed and event.key is a single non-ASCII char (special char produced
  // by Alt on some layouts), try to recover the base key from event.code.
  if (event.altKey && combo.altKey && eventKey.length === 1 && !/^[a-z0-9]$/.test(eventKey) && event.code) {
    const code = event.code;
    if (code.startsWith('Key')) {
      eventKey = code.slice(3).toLowerCase();
    } else if (code.startsWith('Digit')) {
      eventKey = code.slice(5);
    }
  }

  return (
    eventKey === combo.key.toLowerCase() &&
    modKey === combo.ctrlKey &&
    event.shiftKey === combo.shiftKey &&
    event.altKey === combo.altKey
  );
}

// ─── Conflict type ───
export interface KeybindingConflict {
  actionId: KeybindingActionId;
  conflictsWith: KeybindingActionId;
  combo: KeyCombo;
}

// ─── Store ───
interface KeybindingsState {
  bindings: KeybindingEntry[];
  /** Whether the keybinding recorder is active */
  recordingActionId: KeybindingActionId | null;

  // Actions
  /** Get the effective combo for an action (user override or default) */
  getEffectiveCombo: (actionId: KeybindingActionId) => KeyCombo;
  /** Set a custom keybinding for an action */
  setKeybinding: (actionId: KeybindingActionId, combo: KeyCombo) => void;
  /** Reset a single keybinding to default */
  resetKeybinding: (actionId: KeybindingActionId) => void;
  /** Reset all keybindings to defaults */
  resetAll: () => void;
  /** Get all conflicts */
  getConflicts: () => KeybindingConflict[];
  /** Check if a specific action has a custom binding */
  isCustomized: (actionId: KeybindingActionId) => boolean;
  /** Start recording a new keybinding */
  startRecording: (actionId: KeybindingActionId) => void;
  /** Stop recording */
  stopRecording: () => void;
}

export const useKeybindingsStore = create<KeybindingsState>()(
  persist(
    (set, get) => ({
      bindings: DEFAULT_KEYBINDINGS.map((b) => ({ ...b })),
      recordingActionId: null,

      getEffectiveCombo: (actionId) => {
        const binding = get().bindings.find((b) => b.id === actionId);
        if (!binding) {
          const def = DEFAULT_KEYBINDINGS.find((b) => b.id === actionId);
          return def?.defaultCombo ?? { key: '', ctrlKey: false, shiftKey: false, altKey: false };
        }
        return binding.userCombo ?? binding.defaultCombo;
      },

      setKeybinding: (actionId, combo) => {
        set((state) => ({
          bindings: state.bindings.map((b) =>
            b.id === actionId ? { ...b, userCombo: combo } : b
          ),
          recordingActionId: null,
        }));
      },

      resetKeybinding: (actionId) => {
        set((state) => ({
          bindings: state.bindings.map((b) =>
            b.id === actionId ? { ...b, userCombo: null } : b
          ),
        }));
      },

      resetAll: () => {
        set({
          bindings: DEFAULT_KEYBINDINGS.map((b) => ({ ...b, userCombo: null })),
          recordingActionId: null,
        });
      },

      getConflicts: () => {
        const { bindings } = get();
        const conflicts: KeybindingConflict[] = [];
        const effective = bindings.map((b) => ({
          id: b.id,
          combo: b.userCombo ?? b.defaultCombo,
        }));

        for (let i = 0; i < effective.length; i++) {
          for (let j = i + 1; j < effective.length; j++) {
            if (combosEqual(effective[i].combo, effective[j].combo)) {
              conflicts.push({
                actionId: effective[i].id,
                conflictsWith: effective[j].id,
                combo: effective[i].combo,
              });
            }
          }
        }

        return conflicts;
      },

      isCustomized: (actionId) => {
        const binding = get().bindings.find((b) => b.id === actionId);
        return binding?.userCombo !== null && binding?.userCombo !== undefined;
      },

      startRecording: (actionId) => {
        set({ recordingActionId: actionId });
      },

      stopRecording: () => {
        set({ recordingActionId: null });
      },
    }),
    {
      name: 'ols-keybindings',
      version: 3,
      // Only persist bindings, not the recording state
      partialize: (state) => ({ bindings: state.bindings }),
      // Merge new default actions into existing persisted bindings without wiping user customizations
      migrate: (persistedState, _version) => {
        const ps = persistedState as { bindings?: KeybindingEntry[] };
        const saved: KeybindingEntry[] = ps?.bindings ?? [];
        const merged = DEFAULT_KEYBINDINGS.map((def) => {
          const existing = saved.find((b) => b.id === def.id);
          // Keep user's combo override if they had one, otherwise use fresh default
          return existing ? { ...def, userCombo: existing.userCombo } : { ...def };
        });
        return { bindings: merged };
      },
    }
  )
);
