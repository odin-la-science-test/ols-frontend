import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from './api';
import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  CreateSupervisionRequest,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION HOOKS - TanStack Query hooks
// ═══════════════════════════════════════════════════════════════════════════

export const organizationKeys = {
  all: ['organizations'] as const,
  myOrganizations: () => [...organizationKeys.all, 'my'] as const,
  detail: (id: number) => [...organizationKeys.all, 'detail', id] as const,
  search: (query: string) => [...organizationKeys.all, 'search', query] as const,
  members: (orgId: number) => [...organizationKeys.all, 'members', orgId] as const,
  supervisions: (orgId: number) => [...organizationKeys.all, 'supervisions', orgId] as const,
  mySupervisees: (orgId: number) => [...organizationKeys.all, 'my-supervisees', orgId] as const,
  mySupervisors: (orgId: number) => [...organizationKeys.all, 'my-supervisors', orgId] as const,
};

// ─── Organizations (user) ───

export const useMyOrganizations = () => {
  return useQuery({
    queryKey: organizationKeys.myOrganizations(),
    queryFn: () => organizationApi.getMyOrganizations().then((res) => res.data),
  });
};

export const useOrganizationDetail = (id: number) => {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => organizationApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useSearchOrganizations = (query: string) => {
  return useQuery({
    queryKey: organizationKeys.search(query),
    queryFn: () => organizationApi.search(query).then((res) => res.data),
    enabled: query.length >= 2,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) =>
      organizationApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.myOrganizations() });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrganizationRequest }) =>
      organizationApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
};

// ─── Organizations (admin) ───

export const useAllOrganizations = () => {
  return useQuery({
    queryKey: [...organizationKeys.all, 'admin-all'] as const,
    queryFn: () => organizationApi.getAllOrganizations().then((res) => res.data),
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => organizationApi.deleteOrg(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
};

// ─── Members ───

export const useOrganizationMembers = (orgId: number) => {
  return useQuery({
    queryKey: organizationKeys.members(orgId),
    queryFn: () => organizationApi.getMembers(orgId).then((res) => res.data),
    enabled: !!orgId,
  });
};

export const useAddMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: AddMemberRequest }) =>
      organizationApi.addMember(orgId, data).then((res) => res.data),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(orgId) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(orgId) });
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, membershipId, data }: { orgId: number; membershipId: number; data: UpdateMemberRoleRequest }) =>
      organizationApi.updateMemberRole(orgId, membershipId, data).then((res) => res.data),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(orgId) });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, membershipId }: { orgId: number; membershipId: number }) =>
      organizationApi.removeMember(orgId, membershipId),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(orgId) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(orgId) });
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: number) =>
      organizationApi.acceptInvitation(orgId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
};

export const useLeaveOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: number) => organizationApi.leaveOrganization(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.myOrganizations() });
    },
  });
};

// ─── Supervisions ───

export const useSupervisions = (orgId: number) => {
  return useQuery({
    queryKey: organizationKeys.supervisions(orgId),
    queryFn: () => organizationApi.getSupervisions(orgId).then((res) => res.data),
    enabled: !!orgId,
  });
};

export const useCreateSupervision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: number; data: CreateSupervisionRequest }) =>
      organizationApi.createSupervision(orgId, data).then((res) => res.data),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.supervisions(orgId) });
    },
  });
};

export const useDeleteSupervision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, supervisionId }: { orgId: number; supervisionId: number }) =>
      organizationApi.deleteSupervision(orgId, supervisionId),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.supervisions(orgId) });
    },
  });
};

export const useMySupervisees = (orgId: number) => {
  return useQuery({
    queryKey: organizationKeys.mySupervisees(orgId),
    queryFn: () => organizationApi.getMySupervisees(orgId).then((res) => res.data),
    enabled: !!orgId,
  });
};

export const useMySupervisors = (orgId: number) => {
  return useQuery({
    queryKey: organizationKeys.mySupervisors(orgId),
    queryFn: () => organizationApi.getMySupervisors(orgId).then((res) => res.data),
    enabled: !!orgId,
  });
};
