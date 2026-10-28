'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Copia un texto al portapapeles; `copied` vuelve a false a los 1,8 s. Si falla, `failed`. */
export function useCopy() {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1800);
  }, []);

  return { copy, copied: state === 'copied', failed: state === 'failed' };
}
