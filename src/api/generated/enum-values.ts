// ═══════════════════════════════════════════════════════════════════════════
// ENUM VALUES - Arrays runtime pour Zod schemas et iterations
// Source de verite : enums Java backend (via OpenAPI)
// ═══════════════════════════════════════════════════════════════════════════

import type {
  RoleType,
  GramStatus,
  BacterialMorphology,
  HemolysisType,
  FungusType,
  FungusCategory,
  ModuleType,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  NotificationType,
  ShareType,
  NoteColor,
  OrganizationType,
  OrganizationRole,
  MembershipStatus,
} from './enums';

// --- User ---
export const ROLE_TYPES = ['GUEST', 'STUDENT', 'PROFESSIONAL', 'ADMIN'] as const;

// --- Bacteriology ---
export const GRAM_STATUSES = ['POSITIVE', 'NEGATIVE', 'VARIABLE'] as const;
export const BACTERIAL_MORPHOLOGIES = ['COCCI', 'BACILLI', 'SPIRAL', 'COCCOBACILLI'] as const;
export const HEMOLYSIS_TYPES = ['ALPHA', 'BETA', 'GAMMA'] as const;

// --- Mycology ---
export const FUNGUS_TYPES = ['LEVURES', 'MOISISSURES', 'CHAMPIGNONS_FILAMENTEUX'] as const;
export const FUNGUS_CATEGORIES = ['PATHOGENES', 'COMESTIBLES', 'TOXIQUES', 'MEDICINAUX', 'FERMENTATION', 'CULTURE', 'DIAGNOSTIC'] as const;

// --- Catalog ---
export const MODULE_TYPES = ['MUNIN_ATLAS', 'HUGIN_LAB'] as const;

// --- Support ---
export const TICKET_CATEGORIES = ['BUG', 'FEATURE_REQUEST', 'QUESTION', 'ACCOUNT', 'OTHER'] as const;
export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

// --- Notifications ---
export const NOTIFICATION_TYPES = ['QUICKSHARE_RECEIVED', 'CONTACT_ADDED', 'SYSTEM', 'SUPPORT_REPLY', 'SUPPORT_STATUS_CHANGED', 'MODULE_ACCESS_GRANTED', 'NEW_LOGIN', 'ORGANIZATION_INVITED', 'ORGANIZATION_ROLE_CHANGED', 'ORGANIZATION_REMOVED'] as const;

// --- QuickShare ---
export const SHARE_TYPES = ['TEXT', 'FILE'] as const;

// --- Organization ---
export const ORGANIZATION_TYPES = ['LABORATORY', 'UNIVERSITY', 'COMPANY', 'HOSPITAL', 'RESEARCH_CENTER', 'OTHER'] as const;
export const ORGANIZATION_ROLES = ['OWNER', 'MANAGER', 'MEMBER', 'INTERN'] as const;
export const MEMBERSHIP_STATUSES = ['ACTIVE', 'INVITED', 'SUSPENDED'] as const;

// --- Notes ---
export const NOTE_COLORS = ['BLUE', 'RED', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'] as const;

// ═══════════════════════════════════════════════════════════════════════════
// TYPE-CHECKS COMPILE-TIME
// Erreur de compilation si un array derive du type genere
// ═══════════════════════════════════════════════════════════════════════════

const _c01: readonly RoleType[] = ROLE_TYPES;
const _c02: readonly GramStatus[] = GRAM_STATUSES;
const _c03: readonly BacterialMorphology[] = BACTERIAL_MORPHOLOGIES;
const _c04: readonly HemolysisType[] = HEMOLYSIS_TYPES;
const _c05: readonly FungusType[] = FUNGUS_TYPES;
const _c06: readonly FungusCategory[] = FUNGUS_CATEGORIES;
const _c07: readonly ModuleType[] = MODULE_TYPES;
const _c08: readonly TicketCategory[] = TICKET_CATEGORIES;
const _c09: readonly TicketPriority[] = TICKET_PRIORITIES;
const _c10: readonly TicketStatus[] = TICKET_STATUSES;
const _c11: readonly NotificationType[] = NOTIFICATION_TYPES;
const _c12: readonly ShareType[] = SHARE_TYPES;
const _c13: readonly NoteColor[] = NOTE_COLORS;
const _c14: readonly OrganizationType[] = ORGANIZATION_TYPES;
const _c15: readonly OrganizationRole[] = ORGANIZATION_ROLES;
const _c16: readonly MembershipStatus[] = MEMBERSHIP_STATUSES;

// Supprime les warnings unused
void _c01; void _c02; void _c03; void _c04; void _c05; void _c06; void _c07;
void _c08; void _c09; void _c10; void _c11; void _c12; void _c13;
void _c14; void _c15; void _c16;
