import api from '@/api/axios';
import type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationMembership,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  SupervisionRelationship,
  CreateSupervisionRequest,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION API - Endpoints for organization module
// ═══════════════════════════════════════════════════════════════════════════

const BASE = '/organizations';

export const organizationApi = {
  // ─── Organizations ───

  getMyOrganizations: () =>
    api.get<Organization[]>(BASE),

  getById: (id: number) =>
    api.get<Organization>(`${BASE}/${id}`),

  update: (id: number, data: UpdateOrganizationRequest) =>
    api.put<Organization>(`${BASE}/${id}`, data),

  delete: (id: number) =>
    api.delete(`${BASE}/${id}`),

  search: (query: string) =>
    api.get<Organization[]>(`${BASE}/search`, { params: { query } }),

  // ─── Admin ───

  getAllOrganizations: () =>
    api.get<Organization[]>(`${BASE}/admin`),

  create: (data: CreateOrganizationRequest) =>
    api.post<Organization>(BASE, data),

  deleteOrg: (id: number) =>
    api.delete(`${BASE}/${id}`),

  // ─── Members ───

  getMembers: (orgId: number) =>
    api.get<OrganizationMembership[]>(`${BASE}/${orgId}/members`),

  addMember: (orgId: number, data: AddMemberRequest) =>
    api.post<OrganizationMembership>(`${BASE}/${orgId}/members`, data),

  updateMemberRole: (orgId: number, membershipId: number, data: UpdateMemberRoleRequest) =>
    api.put<OrganizationMembership>(`${BASE}/${orgId}/members/${membershipId}/role`, data),

  removeMember: (orgId: number, membershipId: number) =>
    api.delete(`${BASE}/${orgId}/members/${membershipId}`),

  acceptInvitation: (orgId: number) =>
    api.post<OrganizationMembership>(`${BASE}/${orgId}/members/accept`),

  leaveOrganization: (orgId: number) =>
    api.delete(`${BASE}/${orgId}/members/leave`),

  // ─── Supervisions ───

  getSupervisions: (orgId: number) =>
    api.get<SupervisionRelationship[]>(`${BASE}/${orgId}/supervisions`),

  createSupervision: (orgId: number, data: CreateSupervisionRequest) =>
    api.post<SupervisionRelationship>(`${BASE}/${orgId}/supervisions`, data),

  deleteSupervision: (orgId: number, supervisionId: number) =>
    api.delete(`${BASE}/${orgId}/supervisions/${supervisionId}`),

  getMySupervisees: (orgId: number) =>
    api.get<SupervisionRelationship[]>(`${BASE}/${orgId}/supervisions/my-supervisees`),

  getMySupervisors: (orgId: number) =>
    api.get<SupervisionRelationship[]>(`${BASE}/${orgId}/supervisions/my-supervisors`),
};
