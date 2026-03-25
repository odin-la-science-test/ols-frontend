// ═══════════════════════════════════════════════════════════════════════════
// MODULE REGISTRY — Entry point
//
// This file imports all module definitions and registers them.
// When adding a new module, add its import + registration here.
// ═══════════════════════════════════════════════════════════════════════════

export { registry } from './registry';
export type {
  ModuleDefinition,
  ModuleRoute,
  ModuleSearchResult,
  ModuleSearchProvider,
  ModuleCommand,
  ModuleAction,
  ModuleWidget,
} from './types';

// ─── Module registrations ─────────────────────────────────────────────────
// Import and register each module's definition.
// This is the ONLY place in the core that references modules by name.

import { registry } from './registry';

import { bacteriologyModule } from '@/features/bacteriology/definition';
import { mycologyModule } from '@/features/mycology/definition';
import { contactsModule } from '@/features/contacts/definition';
import { notesModule } from '@/features/notes/definition';
import { quickshareModule } from '@/features/quickshare/definition';
import { notificationsModule } from '@/features/notifications/definition';
import { supportModule } from '@/features/support/definition';
import { organizationModule } from '@/features/organization/definition';

registry.register(bacteriologyModule);
registry.register(mycologyModule);
registry.register(contactsModule);
registry.register(notesModule);
registry.register(quickshareModule);
registry.register(notificationsModule);
registry.register(supportModule);
registry.register(organizationModule);
