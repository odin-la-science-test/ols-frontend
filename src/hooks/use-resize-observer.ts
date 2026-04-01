import { useEffect, useState, type RefObject } from 'react';

/** Track the dimensions of an element via ResizeObserver */
export function useResizeObserver(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
