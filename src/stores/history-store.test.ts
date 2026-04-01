import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHistoryStore, setHistoryQueryClient } from './history-store';
import { QueryClient } from '@tanstack/react-query';

// Mock the history API and command resolver
vi.mock('@/lib/history/history-api', () => ({
  fetchHistory: vi.fn(),
  clearHistory: vi.fn(),
  truncateAfter: vi.fn(),
}));

vi.mock('@/lib/history/command-resolver', () => ({
  resolveCommand: vi.fn(),
}));

import { fetchHistory, clearHistory } from '@/lib/history/history-api';
import { resolveCommand } from '@/lib/history/command-resolver';
import type { HistoryEntryDTO } from '@/lib/history/types';

const mockFetchHistory = fetchHistory as ReturnType<typeof vi.fn>;
const mockClearHistory = clearHistory as ReturnType<typeof vi.fn>;
const mockResolveCommand = resolveCommand as ReturnType<typeof vi.fn>;

function makeMockEntry(id: number, actionType: string = 'UPDATE'): HistoryEntryDTO {
  return {
    id,
    moduleSlug: 'notes',
    actionType: actionType as HistoryEntryDTO['actionType'],
    entityId: id * 10,
    labelKey: `history.notes.${actionType.toLowerCase()}`,
    icon: 'pencil',
    previousData: JSON.stringify({ title: `before-${id}` }),
    newData: JSON.stringify({ title: `after-${id}` }),
    createdAt: new Date(Date.now() + id * 1000).toISOString(),
  };
}

beforeEach(() => {
  useHistoryStore.setState({ scopes: {} });
  vi.clearAllMocks();
  setHistoryQueryClient(new QueryClient());
});

describe('history-store (persistent)', () => {
  it('loadScope fetches entries and sets pointer to latest', async () => {
    mockFetchHistory.mockResolvedValue([makeMockEntry(1), makeMockEntry(2), makeMockEntry(3)]);

    await useHistoryStore.getState().loadScope('notes');

    const scope = useHistoryStore.getState().getScope('notes');
    expect(scope.entries).toHaveLength(3);
    expect(scope.pointer).toBe(2);
    expect(scope.isLoading).toBe(false);
    expect(mockFetchHistory).toHaveBeenCalledWith('notes');
  });

  it('loadScope handles empty response', async () => {
    mockFetchHistory.mockResolvedValue([]);

    await useHistoryStore.getState().loadScope('notes');

    const scope = useHistoryStore.getState().getScope('notes');
    expect(scope.entries).toHaveLength(0);
    expect(scope.pointer).toBe(-1);
  });

  it('undo calls resolveCommand().undo() and decrements pointer', async () => {
    const undoFn = vi.fn();
    mockFetchHistory.mockResolvedValue([makeMockEntry(1), makeMockEntry(2)]);
    mockResolveCommand.mockReturnValue({ execute: vi.fn(), undo: undoFn });

    await useHistoryStore.getState().loadScope('notes');
    await useHistoryStore.getState().undo('notes');

    expect(undoFn).toHaveBeenCalledOnce();
    expect(useHistoryStore.getState().getScope('notes').pointer).toBe(0);
  });

  it('redo calls resolveCommand().execute() and increments pointer', async () => {
    const executeFn = vi.fn();
    const undoFn = vi.fn();
    mockFetchHistory.mockResolvedValue([makeMockEntry(1), makeMockEntry(2)]);
    mockResolveCommand.mockReturnValue({ execute: executeFn, undo: undoFn });

    await useHistoryStore.getState().loadScope('notes');
    await useHistoryStore.getState().undo('notes');
    await useHistoryStore.getState().redo('notes');

    expect(executeFn).toHaveBeenCalledOnce();
    expect(useHistoryStore.getState().getScope('notes').pointer).toBe(1);
  });

  it('canUndo / canRedo return correct booleans', async () => {
    mockFetchHistory.mockResolvedValue([makeMockEntry(1)]);
    mockResolveCommand.mockReturnValue({ execute: vi.fn(), undo: vi.fn() });

    const store = useHistoryStore.getState();
    expect(store.canUndo('notes')).toBe(false);
    expect(store.canRedo('notes')).toBe(false);

    await store.loadScope('notes');

    expect(useHistoryStore.getState().canUndo('notes')).toBe(true);
    expect(useHistoryStore.getState().canRedo('notes')).toBe(false);

    await useHistoryStore.getState().undo('notes');

    expect(useHistoryStore.getState().canUndo('notes')).toBe(false);
    expect(useHistoryStore.getState().canRedo('notes')).toBe(true);
  });

  it('scope isolation: scopes are independent', async () => {
    mockFetchHistory
      .mockResolvedValueOnce([makeMockEntry(1)])
      .mockResolvedValueOnce([makeMockEntry(10), makeMockEntry(11)]);

    await useHistoryStore.getState().loadScope('notes');
    await useHistoryStore.getState().loadScope('contacts');

    expect(useHistoryStore.getState().getScope('notes').entries).toHaveLength(1);
    expect(useHistoryStore.getState().getScope('contacts').entries).toHaveLength(2);
  });

  it('clearScope clears local state and calls backend', async () => {
    mockFetchHistory.mockResolvedValue([makeMockEntry(1)]);
    mockClearHistory.mockResolvedValue(undefined);

    await useHistoryStore.getState().loadScope('notes');
    await useHistoryStore.getState().clearScope('notes');

    expect(mockClearHistory).toHaveBeenCalledWith('notes');
    expect(useHistoryStore.getState().getScope('notes').entries).toHaveLength(0);
  });

  it('undo when canUndo === false is a no-op', async () => {
    mockResolveCommand.mockReturnValue({ execute: vi.fn(), undo: vi.fn() });
    await useHistoryStore.getState().undo('nonexistent');
    expect(mockResolveCommand).not.toHaveBeenCalled();
  });

  it('refreshScope re-fetches and resets pointer to latest', async () => {
    mockFetchHistory
      .mockResolvedValueOnce([makeMockEntry(1)])
      .mockResolvedValueOnce([makeMockEntry(1), makeMockEntry(2), makeMockEntry(3)]);

    await useHistoryStore.getState().loadScope('notes');
    expect(useHistoryStore.getState().getScope('notes').entries).toHaveLength(1);

    await useHistoryStore.getState().refreshScope('notes');
    expect(useHistoryStore.getState().getScope('notes').entries).toHaveLength(3);
    expect(useHistoryStore.getState().getScope('notes').pointer).toBe(2);
  });
});
