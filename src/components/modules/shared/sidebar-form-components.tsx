'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { useDensity } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR FORM COMPONENTS — Building blocks pour formulaires dans la sidebar
//
// Garantissent la cohérence visuelle entre tous les forms rendus dans la
// SecondarySidebar (via CrudListLayout.renderEditor ou DetailPanel).
//
// Usage :
//   <div className="flex flex-col flex-1 min-h-0">
//     <SidebarFormBody>
//       <SidebarFormField label="Titre">
//         <Input value={...} onChange={...} />
//       </SidebarFormField>
//     </SidebarFormBody>
//     <SidebarFormActions>
//       <Button variant="outline" size="sm" onClick={onCancel}>Annuler</Button>
//       <Button size="sm" onClick={onSubmit}>Créer</Button>
//     </SidebarFormActions>
//   </div>
// ═══════════════════════════════════════════════════════════════════════════

// ── SidebarFormBody — zone scrollable density-aware ──

interface SidebarFormBodyProps {
  children: ReactNode;
  className?: string;
}

export function SidebarFormBody({ children, className }: SidebarFormBodyProps) {
  const d = useDensity();
  return (
    <div className={cn('flex-1 overflow-y-auto', d.detailPadding, className)}>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// ── SidebarFormField — label + children ──

interface SidebarFormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  error?: string;
}

export function SidebarFormField({ label, children, className, error }: SidebarFormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

// ── SidebarFormActions — footer sticky ──

interface SidebarFormActionsProps {
  children: ReactNode;
  className?: string;
}

export function SidebarFormActions({ children, className }: SidebarFormActionsProps) {
  const d = useDensity();
  return (
    <div className={cn('border-t border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_20%,transparent)] shrink-0', d.detailPadding, className)}>
      <div className="flex items-center justify-end gap-2">
        {children}
      </div>
    </div>
  );
}
