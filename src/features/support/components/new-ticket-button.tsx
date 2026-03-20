'use client';

import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { useTicketFormStore } from '../ticket-form-store';

// ═══════════════════════════════════════════════════════════════════════════
// NEW TICKET BUTTON - Header action button that opens the form panel
// Uses shared store to communicate with TicketFormPanel
// ═══════════════════════════════════════════════════════════════════════════

export function NewTicketButton() {
  const { t } = useTranslation();
  const openForm = useTicketFormStore((s) => s.open);

  return (
    <Button
      onClick={openForm}
      variant="outline"
      size="sm"
      className="hidden sm:flex"
    >
      <Plus className="w-4 h-4 mr-2" />
      {t('support.newTicket')}
    </Button>
  );
}
