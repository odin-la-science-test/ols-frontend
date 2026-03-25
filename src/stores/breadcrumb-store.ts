import { create } from 'zustand';

/**
 * Store for dynamic breadcrumb labels.
 * Pages with dynamic segments (e.g., /lab/organization/:id) register
 * a label for their path so breadcrumbs show a meaningful name instead of an ID.
 */
interface BreadcrumbState {
  labels: Record<string, string>;
  setLabel: (path: string, label: string) => void;
  removeLabel: (path: string) => void;
  getLabel: (path: string) => string | undefined;
}

export const useBreadcrumbStore = create<BreadcrumbState>()((set, get) => ({
  labels: {},
  setLabel: (path, label) => set((s) => ({ labels: { ...s.labels, [path]: label } })),
  removeLabel: (path) => set((s) => {
    const { [path]: _, ...rest } = s.labels;
    return { labels: rest };
  }),
  getLabel: (path) => get().labels[path],
}));
