import { useEffect, useCallback, useRef, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkspaceStore, useTabsStore, type ModuleContext } from '@/stores';

// ═══════════════════════════════════════════════════════════════════════════
// USE MODULE CONTEXT - Sauvegarde/restauration du contexte de module
// Permet de reprendre là où on en était (scroll, filtres, sélection)
// ═══════════════════════════════════════════════════════════════════════════

interface UseModuleContextOptions {
  /** Nom du module pour les récents */
  moduleName: string;
  /** Icône du module */
  moduleIcon: string;
  /** Référence vers l'élément scrollable (optionnel) */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Activer le tracking automatique du module dans les récents */
  trackRecent?: boolean;
  /** Activer la sauvegarde automatique du contexte */
  autoSave?: boolean;
  /** Délai de debounce pour la sauvegarde (ms) */
  saveDelay?: number;
}

interface UseModuleContextReturn {
  /** Contexte sauvegardé pour ce module */
  savedContext: ModuleContext | undefined;
  /** Sauvegarder le contexte manuellement */
  saveContext: (context: Partial<ModuleContext>) => void;
  /** Restaurer la position de scroll */
  restoreScrollPosition: () => void;
  /** Effacer le contexte sauvegardé */
  clearContext: () => void;
}

/**
 * Hook pour gérer le contexte d'un module (scroll, filtres, sélection).
 * Permet la reprise du travail là où l'utilisateur l'avait laissé.
 * 
 * @example
 * ```tsx
 * const scrollRef = useRef<HTMLDivElement>(null);
 * const { savedContext, saveContext, restoreScrollPosition } = useModuleContext({
 *   moduleName: 'Bacteriology',
 *   moduleIcon: 'bug',
 *   scrollRef,
 *   trackRecent: true,
 * });
 * 
 * // Restaurer le scroll au montage
 * useEffect(() => {
 *   restoreScrollPosition();
 * }, []);
 * 
 * // Sauvegarder les filtres quand ils changent
 * useEffect(() => {
 *   saveContext({ filters: activeFilters });
 * }, [activeFilters]);
 * ```
 */
export function useModuleContext({
  moduleName,
  moduleIcon,
  scrollRef,
  trackRecent = true,
  autoSave = true,
  saveDelay = 500,
}: UseModuleContextOptions): UseModuleContextReturn {
  const location = useLocation();
  const path = location.pathname;

  const {
    addRecent,
    saveModuleContext,
    getModuleContext,
    clearModuleContext,
  } = useWorkspaceStore();

  const { addTab, updateTab, getTabByPath } = useTabsStore();

  // Ref pour le timeout de debounce
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Contexte sauvegardé
  const savedContext = getModuleContext(path);

  // ─── Ajouter aux récents au montage ───
  useEffect(() => {
    if (trackRecent) {
      addRecent({
        path,
        title: moduleName,
        icon: moduleIcon,
      });
    }
  }, [path, moduleName, moduleIcon, trackRecent, addRecent]);

  // ─── Ajouter/mettre à jour l'onglet ───
  useEffect(() => {
    const existingTab = getTabByPath(path);
    if (!existingTab) {
      // Ajouter un nouvel onglet
      addTab({
        path,
        title: moduleName,
        icon: moduleIcon,
      });
    }
  }, [path, moduleName, moduleIcon, addTab, getTabByPath]);

  // ─── Sauvegarder le contexte ───
  const saveContext = useCallback((context: Partial<ModuleContext>) => {
    // Debounce pour éviter trop de sauvegardes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveModuleContext(path, context);

      // Mettre à jour l'onglet aussi
      const existingTab = getTabByPath(path);
      if (existingTab) {
        updateTab(existingTab.id, {
          scrollPosition: context.scrollPosition,
          selectedItemId: context.selectedItemId,
        });
      }
    }, saveDelay);
  }, [path, saveDelay, saveModuleContext, getTabByPath, updateTab]);

  // ─── Auto-save scroll position ───
  useEffect(() => {
    if (!autoSave || !scrollRef?.current) return;

    const element = scrollRef.current;

    const handleScroll = () => {
      saveContext({ scrollPosition: element.scrollTop });
    };

    // Debounce scroll events
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 200);
    };

    element.addEventListener('scroll', debouncedScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', debouncedScroll);
      clearTimeout(scrollTimeout);
    };
  }, [autoSave, scrollRef, saveContext]);

  // ─── Restaurer la position de scroll ───
  const restoreScrollPosition = useCallback(() => {
    if (!scrollRef?.current || !savedContext?.scrollPosition) return;

    const scrollPosition = savedContext.scrollPosition;
    const element = scrollRef.current;

    // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
    requestAnimationFrame(() => {
      if (element) {
        element.scrollTop = scrollPosition;
      }
    });
  }, [scrollRef, savedContext]);

  // ─── Effacer le contexte ───
  const clearContext = useCallback(() => {
    clearModuleContext(path);
  }, [path, clearModuleContext]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    savedContext,
    saveContext,
    restoreScrollPosition,
    clearContext,
  };
}

export default useModuleContext;
