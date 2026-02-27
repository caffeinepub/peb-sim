import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  UserProfile,
  Project,
  ProjectStatus,
  SubscriptionTier,
  ShoppingItem,
  StripeConfiguration,
  EngineeringInputs,
  BrandingSettings,
  Comment,
} from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

// ─── User / Subscription ─────────────────────────────────────────────────────

export function useGetCurrentUser() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['currentUser', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Not available');
      return actor.getUser(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, email }: { displayName: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(displayName, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Projects ────────────────────────────────────────────────────────────────

export function useListProjects() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Project[]>({
    queryKey: ['projects', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.listProjectsByOwner(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetProject(projectId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Project>({
    queryKey: ['project', projectId?.toString()],
    queryFn: async () => {
      if (!actor || projectId === null) throw new Error('Not available');
      return actor.getProject(projectId);
    },
    enabled: !!actor && !actorFetching && projectId !== null,
  });
}

const DEFAULT_ENGINEERING_INPUTS: EngineeringInputs = {
  windSpeed: BigInt(0),
  seismicZone: 'II',
  liveLoad: BigInt(0),
};

const DEFAULT_BRANDING_SETTINGS: BrandingSettings = {
  signageText: '',
  primaryColorRal: 'RAL 7016',
  secondaryColorRal: 'RAL 9006',
};

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      uploadedFileName,
      engineeringInputs,
      brandingSettings,
    }: {
      name: string;
      uploadedFileName: string;
      engineeringInputs?: EngineeringInputs;
      brandingSettings?: BrandingSettings;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProject(
        name,
        uploadedFileName,
        engineeringInputs ?? DEFAULT_ENGINEERING_INPUTS,
        brandingSettings ?? DEFAULT_BRANDING_SETTINGS
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProjectStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, status }: { projectId: bigint; status: ProjectStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProjectStatus(projectId, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId.toString()] });
    },
  });
}

export function useSaveErectionData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, dataJSON }: { projectId: bigint; dataJSON: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveErectionData(projectId, dataJSON);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProject(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ─── Stripe ──────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['stripeSession', sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) throw new Error('Not available');
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !actorFetching && !!sessionId,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Shared Links ────────────────────────────────────────────────────────────

export function useCreateSharedLink() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (projectId: bigint): Promise<string> => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSharedLink(projectId);
    },
  });
}

export function useGetProjectByShareToken(token: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Project | null>({
    queryKey: ['shareToken', token],
    queryFn: async () => {
      if (!actor || !token) return null;
      return actor.getProjectByShareToken(token);
    },
    enabled: !!actor && !actorFetching && !!token,
    retry: false,
  });
}

// ─── Comments / Annotations ──────────────────────────────────────────────────

export function useGetComments(projectId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', projectId?.toString()],
    queryFn: async () => {
      if (!actor || projectId === null) return [];
      return actor.getComments(projectId);
    },
    enabled: !!actor && !actorFetching && projectId !== null,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      projectId: bigint;
      elementId: string;
      position: { x: number; y: number; z: number };
      text: string;
    }): Promise<Comment> => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(params.projectId, params.elementId, params.position, params.text);
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId.toString()] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId }: { commentId: bigint; projectId: bigint }): Promise<void> => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteComment(commentId);
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId.toString()] });
    },
  });
}
