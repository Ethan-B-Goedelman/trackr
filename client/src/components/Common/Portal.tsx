import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children directly on document.body via a React portal.
 * This bypasses any CSS stacking context (transform, filter, will-change)
 * on ancestor elements, ensuring position:fixed overlays always anchor
 * to the true viewport — not to a transformed parent.
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  const el = useRef<HTMLDivElement | null>(null);
  if (!el.current) el.current = document.createElement('div');

  useEffect(() => {
    const node = el.current!;
    document.body.appendChild(node);
    return () => { document.body.removeChild(node); };
  }, []);

  return createPortal(children, el.current);
}
