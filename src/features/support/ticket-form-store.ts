import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET FORM STORE - Shared state for opening/closing the ticket form
// Allows header button and form panel to communicate
// ═══════════════════════════════════════════════════════════════════════════

interface TicketFormStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useTicketFormStore = create<TicketFormStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
