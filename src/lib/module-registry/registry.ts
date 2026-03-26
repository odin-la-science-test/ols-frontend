import type { ModuleDefinition, ModuleSearchProvider, ModuleActivityPanel, TourStep } from './types';
import { logger } from '../logger';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE REGISTRY — Central singleton that all shell components read from
//
// The registry replaces all hardcoded module lists in the codebase:
// - Router reads routes from registry
// - Command palette reads navigation + commands from registry
// - Global search iterates search providers from registry
// - Breadcrumbs, status bar, menu bar resolve labels from registry
// - Split editor pane resolves components from registry
// - Dashboard reads widgets from registry
// ═══════════════════════════════════════════════════════════════════════════

class ModuleRegistry {
  private modules = new Map<string, ModuleDefinition>();
  private routeIndex = new Map<string, ModuleDefinition>();
  private moduleKeyIndex = new Map<string, ModuleDefinition>();

  /** Register a module definition */
  register(definition: ModuleDefinition): void {
    if (this.modules.has(definition.id)) {
      if (import.meta.env.DEV) {
        logger.warn(`Module "${definition.id}" is already registered — skipping`);
      }
      return;
    }

    this.modules.set(definition.id, definition);
    this.routeIndex.set(`/${definition.route.path}`, definition);
    this.moduleKeyIndex.set(definition.moduleKey, definition);
  }

  /** Get all registered modules */
  getAll(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /** Get a module by its id */
  getById(id: string): ModuleDefinition | undefined {
    return this.modules.get(id);
  }

  /** Get all modules for a given platform */
  getByPlatform(platform: ModuleDefinition['platform']): ModuleDefinition[] {
    return this.getAll().filter((m) => m.platform === platform);
  }

  /**
   * Resolve a route path to its module definition.
   * Matches the longest prefix: '/atlas/bacteriology/sub' matches '/atlas/bacteriology'.
   */
  getByRoute(path: string): ModuleDefinition | undefined {
    // Exact match first
    const exact = this.routeIndex.get(path);
    if (exact) return exact;

    // Prefix match (longest wins)
    let bestMatch: ModuleDefinition | undefined;
    let bestLength = 0;

    for (const [routePath, def] of this.routeIndex) {
      if (path.startsWith(routePath) && routePath.length > bestLength) {
        bestMatch = def;
        bestLength = routePath.length;
      }
    }

    return bestMatch;
  }

  /**
   * Resolve a route path segment to its module definition.
   * Useful for breadcrumbs: resolves 'bacteriology' to the module.
   */
  getBySegment(segment: string): ModuleDefinition | undefined {
    return this.getAll().find((m) => {
      const lastSegment = m.route.path.split('/').pop();
      return lastSegment === segment;
    });
  }

  /** Get all modules that provide a search function */
  getSearchProviders(): Array<{ module: ModuleDefinition; provider: ModuleSearchProvider }> {
    return this.getAll()
      .filter((m): m is ModuleDefinition & { search: ModuleSearchProvider } => !!m.search)
      .map((m) => ({ module: m, provider: m.search }));
  }

  /** Get all commands from all modules */
  getCommands(): Array<{ module: ModuleDefinition; commands: NonNullable<ModuleDefinition['commands']> }> {
    return this.getAll()
      .filter((m): m is ModuleDefinition & { commands: NonNullable<ModuleDefinition['commands']> } =>
        !!m.commands && m.commands.length > 0
      )
      .map((m) => ({ module: m, commands: m.commands }));
  }

  /** Get all widgets from all modules */
  getWidgets(): Array<{ module: ModuleDefinition; widgets: NonNullable<ModuleDefinition['widgets']> }> {
    return this.getAll()
      .filter((m): m is ModuleDefinition & { widgets: NonNullable<ModuleDefinition['widgets']> } =>
        !!m.widgets && m.widgets.length > 0
      )
      .map((m) => ({ module: m, widgets: m.widgets }));
  }

  /** Get all modules that provide an activity bar panel */
  getActivityPanels(): Array<{ module: ModuleDefinition; panel: ModuleActivityPanel }> {
    return this.getAll()
      .filter((m): m is ModuleDefinition & { activityPanel: ModuleActivityPanel } => !!m.activityPanel)
      .map((m) => ({ module: m, panel: m.activityPanel }));
  }

  /** Get all modules that provide a guided tour */
  getTours(): Array<{ module: ModuleDefinition; steps: TourStep[] }> {
    return this.getAll()
      .filter((m): m is ModuleDefinition & { tour: TourStep[] } => !!m.tour && m.tour.length > 0)
      .map((m) => ({ module: m, steps: m.tour }));
  }

  /** Get the full route path for a module by id, e.g. '/lab/notes' */
  getRoutePath(moduleId: string): string | undefined {
    const mod = this.getById(moduleId);
    return mod ? `/${mod.route.path}` : undefined;
  }

  /** Get a module by its backend catalogue key */
  getByModuleKey(moduleKey: string): ModuleDefinition | undefined {
    return this.moduleKeyIndex.get(moduleKey);
  }

  /** Check if a module is registered */
  has(id: string): boolean {
    return this.modules.has(id);
  }

  /** Get total number of registered modules */
  get size(): number {
    return this.modules.size;
  }
}

/** Singleton registry instance — import this in all shell components */
export const registry = new ModuleRegistry();
