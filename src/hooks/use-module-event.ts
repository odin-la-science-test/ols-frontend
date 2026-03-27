import { useEffect, useRef } from 'react';

import { eventBus, type ModuleEvents } from '@/lib/event-bus';

/**
 * Subscribe to a typed event bus event with auto-cleanup on unmount.
 * Handler ref is kept stable to avoid re-subscribing on every render.
 */
export function useModuleEvent<K extends keyof ModuleEvents>(
  event: K,
  handler: (payload: ModuleEvents[K]) => void,
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    return eventBus.on(event, ((payload: ModuleEvents[K]) => {
      handlerRef.current(payload);
    }) as (payload: ModuleEvents[K]) => void);
  }, [event]);
}
