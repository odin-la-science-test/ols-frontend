import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHistoryStore } from './history-store';

beforeEach(() => {
  useHistoryStore.setState({ scopes: {}, maxEntries: 50 });
});

function makeCommand(value: { current: number }, target: number) {
  const prev = value.current;
  return {
    labelKey: `set-${target}`,
    execute: vi.fn(() => { value.current = target; }),
    undo: vi.fn(() => { value.current = prev; }),
  };
}

describe('history-store', () => {
  it('pushCommand executes and advances pointer', async () => {
    const val = { current: 0 };
    const cmd = makeCommand(val, 1);

    await useHistoryStore.getState().pushCommand('test', cmd);

    expect(cmd.execute).toHaveBeenCalledOnce();
    expect(val.current).toBe(1);

    const scope = useHistoryStore.getState().getScope('test');
    expect(scope.entries).toHaveLength(1);
    expect(scope.pointer).toBe(0);
  });

  it('pushCommand truncates redo stack', async () => {
    const val = { current: 0 };
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 1));
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 2));

    // Undo to go back
    await useHistoryStore.getState().undo('test');

    // Push new command — should truncate entry at index 1
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 3));

    const scope = useHistoryStore.getState().getScope('test');
    expect(scope.entries).toHaveLength(2);
    expect(scope.pointer).toBe(1);
    expect(scope.entries[1].labelKey).toBe('set-3');
  });

  it('undo calls undo() and decrements pointer', async () => {
    const val = { current: 0 };
    const cmd = makeCommand(val, 1);
    await useHistoryStore.getState().pushCommand('test', cmd);

    await useHistoryStore.getState().undo('test');

    expect(cmd.undo).toHaveBeenCalledOnce();
    expect(useHistoryStore.getState().getScope('test').pointer).toBe(-1);
  });

  it('redo calls execute() and increments pointer', async () => {
    const val = { current: 0 };
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 1));
    await useHistoryStore.getState().undo('test');

    await useHistoryStore.getState().redo('test');

    expect(val.current).toBe(1);
    expect(useHistoryStore.getState().getScope('test').pointer).toBe(0);
  });

  it('canUndo / canRedo return correct booleans at limits', async () => {
    const store = useHistoryStore.getState();
    expect(store.canUndo('test')).toBe(false);
    expect(store.canRedo('test')).toBe(false);

    const val = { current: 0 };
    await store.pushCommand('test', makeCommand(val, 1));

    expect(useHistoryStore.getState().canUndo('test')).toBe(true);
    expect(useHistoryStore.getState().canRedo('test')).toBe(false);

    await useHistoryStore.getState().undo('test');

    expect(useHistoryStore.getState().canUndo('test')).toBe(false);
    expect(useHistoryStore.getState().canRedo('test')).toBe(true);
  });

  it('jumpTo forward (redo N)', async () => {
    const val = { current: 0 };
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 1));
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 2));
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 3));

    // Undo all
    await useHistoryStore.getState().undo('test');
    await useHistoryStore.getState().undo('test');
    await useHistoryStore.getState().undo('test');
    expect(useHistoryStore.getState().getScope('test').pointer).toBe(-1);

    // Jump to last entry
    const entries = useHistoryStore.getState().getScope('test').entries;
    await useHistoryStore.getState().jumpTo('test', entries[2].id);

    expect(useHistoryStore.getState().getScope('test').pointer).toBe(2);
    expect(val.current).toBe(3);
  });

  it('jumpTo backward (undo N)', async () => {
    const val = { current: 0 };
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 1));
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 2));
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 3));

    const entries = useHistoryStore.getState().getScope('test').entries;
    await useHistoryStore.getState().jumpTo('test', entries[0].id);

    expect(useHistoryStore.getState().getScope('test').pointer).toBe(0);
    expect(val.current).toBe(1);
  });

  it('scope isolation: actions in scope A do not affect scope B', async () => {
    const valA = { current: 0 };
    const valB = { current: 0 };

    await useHistoryStore.getState().pushCommand('a', makeCommand(valA, 1));
    await useHistoryStore.getState().pushCommand('b', makeCommand(valB, 10));

    expect(useHistoryStore.getState().getScope('a').entries).toHaveLength(1);
    expect(useHistoryStore.getState().getScope('b').entries).toHaveLength(1);

    await useHistoryStore.getState().undo('a');
    expect(valA.current).toBe(0);
    expect(valB.current).toBe(10);
  });

  it('max entries: drops oldest when limit exceeded', async () => {
    useHistoryStore.setState({ maxEntries: 3 });
    const val = { current: 0 };

    for (let i = 1; i <= 5; i++) {
      await useHistoryStore.getState().pushCommand('test', makeCommand(val, i));
    }

    const scope = useHistoryStore.getState().getScope('test');
    expect(scope.entries).toHaveLength(3);
    expect(scope.entries[0].labelKey).toBe('set-3');
    expect(scope.pointer).toBe(2);
  });

  it('clearScope resets one scope without touching others', async () => {
    const val = { current: 0 };
    await useHistoryStore.getState().pushCommand('a', makeCommand(val, 1));
    await useHistoryStore.getState().pushCommand('b', makeCommand(val, 2));

    useHistoryStore.getState().clearScope('a');

    expect(useHistoryStore.getState().getScope('a').entries).toHaveLength(0);
    expect(useHistoryStore.getState().getScope('b').entries).toHaveLength(1);
  });

  it('undo when canUndo === false is a no-op', async () => {
    await useHistoryStore.getState().undo('nonexistent');
    // Should not throw
    expect(useHistoryStore.getState().getScope('nonexistent').pointer).toBe(-1);
  });

  it('redo when canRedo === false is a no-op', async () => {
    const val = { current: 0 };
    await useHistoryStore.getState().pushCommand('test', makeCommand(val, 1));
    await useHistoryStore.getState().redo('test');
    // pointer should stay at 0 (already at end)
    expect(useHistoryStore.getState().getScope('test').pointer).toBe(0);
  });
});
