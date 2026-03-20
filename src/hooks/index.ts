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
export { useGlobalSearch, parseSearchInput, type SearchResult, type SearchResultType, type GlobalSearchResults, type SearchMode, type ParsedSearch } from './use-global-search';
export { useStatusBarItems } from './use-status-bar-items';
