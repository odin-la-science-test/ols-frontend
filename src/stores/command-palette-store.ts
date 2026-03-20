import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND PALETTE STORE - État de la command palette
// ═══════════════════════════════════════════════════════════════════════════

export type PaletteMode = 'default' | 'commands' | 'entities' | 'tags';

interface CommandPaletteState {
  isOpen: boolean;
  mode: PaletteMode;
  open: (mode?: PaletteMode) => void;
  close: () => void;
  toggle: () => void;
  setMode: (mode: PaletteMode) => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>()((set) => ({
  isOpen: false,
  mode: 'default',

  open: (mode?: PaletteMode) => set({ isOpen: true, mode: mode ?? 'default' }),
  close: () => set({ isOpen: false, mode: 'default' }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen, mode: state.isOpen ? 'default' : state.mode })),
  setMode: (mode: PaletteMode) => set({ mode }),
}));
