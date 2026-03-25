'use client';

import { useState, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// USE SELECTION - Generic hook for managing multi-selection state
// ═══════════════════════════════════════════════════════════════════════════

export interface UseSelectionOptions {
  /** Maximum number of items that can be selected (default: 10) */
  maxSelection?: number;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  /** Callback when max selection is reached and user tries to select more */
  onMaxReached?: () => void;
}

export interface UseSelectionReturn<T extends { id: string | number }> {
  /** Currently selected item IDs */
  selectedIds: Set<string | number>;
  /** Currently selected items (full objects) */
  selectedItems: T[];
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Number of selected items */
  selectionCount: number;
  /** Whether an item is selected */
  isSelected: (id: string | number) => boolean;
  /** Whether max selection is reached */
  isMaxReached: boolean;
  /** Toggle selection mode on/off */
  toggleSelectionMode: () => void;
  /** Enter selection mode */
  enterSelectionMode: () => void;
  /** Exit selection mode and clear selection */
  exitSelectionMode: () => void;
  /** Toggle an item's selection state */
  toggleSelection: (item: T) => void;
  /** Select an item */
  select: (item: T) => void;
  /** Deselect an item */
  deselect: (id: string | number) => void;
  /** Clear all selections (without exiting selection mode) */
  clearSelection: () => void;
  /** Select all items from a list */
  selectAll: (items: T[]) => void;
}

export function useSelection<T extends { id: string | number }>(
  items: T[] = [],
  options: UseSelectionOptions = {}
): UseSelectionReturn<T> {
  const { maxSelection = 10, onSelectionChange, onMaxReached } = options;

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Derive selected items from IDs
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(item.id));
  }, [items, selectedIds]);

  const selectionCount = selectedIds.size;
  const isMaxReached = selectionCount >= maxSelection;

  // Helper to update selection and notify
  const updateSelection = useCallback((newSelection: Set<string | number>) => {
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  }, [onSelectionChange]);

  // Check if item is selected
  const isSelected = useCallback((id: string | number) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    if (isSelectionMode) {
      // Exiting - clear selection
      updateSelection(new Set());
    }
    setIsSelectionMode(prev => !prev);
  }, [isSelectionMode, updateSelection]);

  // Enter selection mode
  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  // Exit selection mode and clear
  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    updateSelection(new Set());
  }, [updateSelection]);

  // Toggle item selection
  const toggleSelection = useCallback((item: T) => {
    const newSelection = new Set(selectedIds);
    
    if (newSelection.has(item.id)) {
      newSelection.delete(item.id);
    } else if (newSelection.size < maxSelection) {
      newSelection.add(item.id);
    } else {
      // Max reached, notify
      onMaxReached?.();
      return;
    }
    
    updateSelection(newSelection);
  }, [selectedIds, maxSelection, updateSelection, onMaxReached]);

  // Select an item
  const select = useCallback((item: T) => {
    if (selectedIds.has(item.id) || selectedIds.size >= maxSelection) return;
    
    const newSelection = new Set(selectedIds);
    newSelection.add(item.id);
    updateSelection(newSelection);
  }, [selectedIds, maxSelection, updateSelection]);

  // Deselect an item
  const deselect = useCallback((id: string | number) => {
    if (!selectedIds.has(id)) return;
    
    const newSelection = new Set(selectedIds);
    newSelection.delete(id);
    updateSelection(newSelection);
  }, [selectedIds, updateSelection]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    updateSelection(new Set());
  }, [updateSelection]);

  // Select all items (up to max)
  const selectAll = useCallback((itemsToSelect: T[]) => {
    const newSelection = new Set<string | number>();
    for (const item of itemsToSelect) {
      if (newSelection.size >= maxSelection) break;
      newSelection.add(item.id);
    }
    updateSelection(newSelection);
  }, [maxSelection, updateSelection]);

  return {
    selectedIds,
    selectedItems,
    isSelectionMode,
    selectionCount,
    isSelected,
    isMaxReached,
    toggleSelectionMode,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelection,
    select,
    deselect,
    clearSelection,
    selectAll,
  };
}
