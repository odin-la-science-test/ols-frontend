export { useLogin, useGuestLogin, useRegister, useLogout } from './use-auth';
export { useApiError, type ApiErrorInfo } from './use-api-error';
export { useModules, useModulesByType, useModule, moduleKeys } from './use-modules';
export type { AppModuleDTO, ModuleType } from './use-modules';
export { 
  createModuleKeys,
  useModuleList,
  useModuleItem,
  useModuleSearch,
  useModuleIdentifyByProfile,
  useModuleIdentifyByApiCode,
  type ModuleApi
} from './use-module-crud';
export { useSelection, type UseSelectionOptions, type UseSelectionReturn } from './use-selection';
export { useToast, toast } from './use-toast';
export { useKeyboardShortcuts } from './use-keyboard-shortcuts';
export { useModuleContext } from './use-module-context';
export { useDensity } from './use-density';
export { useGlobalSearch, parseSearchInput, type SearchResult, type GlobalSearchResults, type SearchMode, type ParsedSearch } from './use-global-search';
export { useStatusBarItems } from './use-status-bar-items';
export { useModulePersistence, type ModulePageState, type CrudListState } from './use-module-persistence';
export { useDraftForm, type UseDraftFormOptions, type UseDraftFormReturn } from './use-draft-form';
export { useModuleShell, type UseModuleShellOptions, type ModuleShellReturn } from './use-module-shell';
export { useResizeObserver } from './use-resize-observer';
export { useWidgetSettings } from './use-widget-settings';
export { useActivityLog } from './use-activity-log';
export { useSearchUsers, usersKeys } from './use-search-users';
export { useHubModules, type HubModule } from './use-hub-modules';
export { useTextCorrection } from './use-text-correction';
export { useOptimisticMutation, type UseOptimisticMutationOptions } from './use-optimistic-mutation';
export { useModuleEvent } from './use-module-event';
export { useRetryFeedback } from './use-retry-feedback';
export { useSmartTips } from './use-smart-tips';
export { usePresence } from './use-presence';
export { usePagination } from './use-pagination';
export { useOfflineStatus, type OfflineStatus } from './use-offline-status';
export { useGuestGuard } from './use-guest-guard';
