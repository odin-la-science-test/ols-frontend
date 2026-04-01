// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION TYPES - Domain types for organization module
// ═══════════════════════════════════════════════════════════════════════════

export type { OrganizationType, OrganizationRole, MembershipStatus } from '@/api/generated/enums';
import type { OrganizationType, OrganizationRole, MembershipStatus } from '@/api/generated/enums';

export interface Organization {
  id: number;
  name: string;
  description: string | null;
  type: OrganizationType;
  website: string | null;
  createdAt: string;
  memberCount: number;
  createdByName: string;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  type: OrganizationType;
  website?: string;
  ownerEmail: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  type?: OrganizationType;
  website?: string;
}

export interface OrganizationMembership {
  id: number;
  organizationId: number;
  organizationName: string;
  userId: number;
  userEmail: string;
  userFullName: string;
  userAvatarId: string | null;
  role: OrganizationRole;
  status: MembershipStatus;
  joinedAt: string;
}

export interface AddMemberRequest {
  email: string;
  role: OrganizationRole;
}

export interface UpdateMemberRoleRequest {
  role: OrganizationRole;
}

export interface SupervisionRelationship {
  id: number;
  organizationId: number;
  supervisorId: number;
  supervisorName: string;
  supervisorAvatarId: string | null;
  superviseeId: number;
  superviseeName: string;
  superviseeAvatarId: string | null;
  createdAt: string;
}

export interface CreateSupervisionRequest {
  supervisorId: number;
  superviseeId: number;
}
