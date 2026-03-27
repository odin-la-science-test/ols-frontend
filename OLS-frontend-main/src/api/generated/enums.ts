// ═══════════════════════════════════════════════════════════════════════════
// ENUMS GENERES - Re-exports depuis le schema OpenAPI
// Source de verite : enums Java backend
// ═══════════════════════════════════════════════════════════════════════════

import type { components } from './schema';

// --- User ---
type UserDTO = components['schemas']['UserDTO'];
export type RoleType = NonNullable<UserDTO['role']>;

// --- Bacteriology ---
type BacteriumDTO = components['schemas']['BacteriumDTO'];
export type GramStatus = NonNullable<BacteriumDTO['gram']>;
export type BacterialMorphology = NonNullable<BacteriumDTO['morpho']>;
export type HemolysisType = NonNullable<BacteriumDTO['hemolyse']>;

// --- Mycology ---
type FungusDTO = components['schemas']['FungusDTO'];
export type FungusType = NonNullable<FungusDTO['type']>;
export type FungusCategory = NonNullable<FungusDTO['category']>;

// --- Support ---
type SupportTicketDTO = components['schemas']['SupportTicketDTO'];
export type TicketCategory = NonNullable<SupportTicketDTO['category']>;
export type TicketPriority = NonNullable<SupportTicketDTO['priority']>;
export type TicketStatus = NonNullable<SupportTicketDTO['status']>;

// --- Notifications ---
type NotificationDTO = components['schemas']['NotificationDTO'];
export type NotificationType = NonNullable<NotificationDTO['type']>;

// --- QuickShare ---
type SharedItemDTO = components['schemas']['SharedItemDTO'];
export type ShareType = NonNullable<SharedItemDTO['type']>;

// --- Notes ---
type NoteDTO = components['schemas']['NoteDTO'];
export type NoteColor = NonNullable<NoteDTO['color']>;

// --- Organization ---
type OrganizationDTO = components['schemas']['OrganizationDTO'];
export type OrganizationType = NonNullable<OrganizationDTO['type']>;
type MembershipDTO = components['schemas']['MembershipDTO'];
export type OrganizationRole = NonNullable<MembershipDTO['role']>;
export type MembershipStatus = NonNullable<MembershipDTO['status']>;

// --- Catalog ---
import type { operations } from './schema';
export type ModuleType = operations['getModulesByType']['parameters']['path']['type'];
