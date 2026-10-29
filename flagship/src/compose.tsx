import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { newId, useMail, type Draft } from './store';

type ComposeState = { open: boolean; draft: Draft; origin: HTMLElement | null };

type ComposeApi = ComposeState & {
  /** Open the composer, growing from the element that asked for it. */
  openCompose: (draft?: Partial<Draft>, origin?: HTMLElement | null) => void;
  closeCompose: () => void;
};

const EMPTY: Draft = { to: '', subject: '', body: '' };
const ComposeContext = createContext<ComposeApi | null>(null);

export function ComposeProvider({ children }: { children: ReactNode }) {
  const { state: mail } = useMail();
  const [state, setState] = useState<ComposeState>({ open: false, draft: EMPTY, origin: null });
  const openCompose = useCallback(
    (draft: Partial<Draft> = {}, origin: HTMLElement | null = null) => {
      const body = draft.body ?? '';
      const signature = !draft.id && mail.settings.signature ? `${body}${body ? '\n\n' : ''}${mail.settings.signature}` : body;
      setState({ open: true, draft: { ...EMPTY, ...draft, id: draft.id ?? newId('d'), body: signature }, origin });
    },
    [mail.settings.signature],
  );
  const closeCompose = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const value = useMemo(() => ({ ...state, openCompose, closeCompose }), [state, openCompose, closeCompose]);
  return <ComposeContext.Provider value={value}>{children}</ComposeContext.Provider>;
}

export function useCompose(): ComposeApi {
  const api = useContext(ComposeContext);
  if (!api) throw new Error('useCompose must be used inside ComposeProvider');
  return api;
}
