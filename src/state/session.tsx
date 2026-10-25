import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { applicableQuestions } from '../engine/loadData';
import type { Answer, Mode, Question, StageId } from '../engine/types';
import { SESSION_KEY, wipeStorage } from '../lib/exit';
import type { Lang } from '../lib/i18n';

export interface SessionState {
  mode: Mode | null; lang: Lang; stage: StageId | null;
  answers: Record<string, Answer>; index: number; startedAt: number | null;
}

export type Action =
  | { type: 'setMode'; mode: Mode }
  | { type: 'setLang'; lang: Lang }
  | { type: 'setStage'; stage: StageId }
  | { type: 'answer'; id: string; value: Answer }
  | { type: 'skip'; id: string }
  | { type: 'next' } | { type: 'back' } | { type: 'goto'; index: number }
  | { type: 'reset' } | { type: 'clearAll' };

export const initialState: SessionState = { mode: null, lang: 'hi', stage: null, answers: {}, index: 0, startedAt: null };

export function reducer(s: SessionState, a: Action): SessionState {
  switch (a.type) {
    case 'setMode': return { ...s, mode: a.mode };
    case 'setLang': return { ...s, lang: a.lang };
    case 'setStage':
      return a.stage === s.stage ? { ...s, index: 0 } : { ...s, stage: a.stage, answers: {}, index: 0, startedAt: Date.now() };
    case 'answer': return { ...s, answers: { ...s.answers, [a.id]: a.value } };
    case 'skip': return { ...s, answers: { ...s.answers, [a.id]: 'not_sure' } };
    case 'next': return { ...s, index: s.index + 1 };
    case 'back': return { ...s, index: Math.max(0, s.index - 1) };
    case 'goto': return { ...s, index: Math.max(0, a.index) };
    case 'reset': return { ...s, stage: null, answers: {}, index: 0, startedAt: null };
    case 'clearAll': return { ...initialState };
  }
}

function restore(): SessionState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return { ...initialState, ...(JSON.parse(raw) as Partial<SessionState>) };
  } catch { /* ignore */ }
  return initialState;
}

interface Ctx {
  state: SessionState;
  dispatch: (a: Action) => void;
  questions: Question[];
  clearAll: () => void;
}
const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children, initial }: { children: ReactNode; initial?: SessionState }) {
  const [state, rawDispatch] = useReducer(reducer, initial ?? restore());
  useEffect(() => {
    try {
      if (state.stage) sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch { /* ignore */ }
  }, [state]);
  const value = useMemo<Ctx>(() => ({
    state,
    dispatch: rawDispatch,
    questions: state.stage ? applicableQuestions(state.stage) : [],
    clearAll: () => { rawDispatch({ type: 'clearAll' }); wipeStorage(); },
  }), [state]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Ctx {
  const c = useContext(SessionContext);
  if (!c) throw new Error('useSession outside SessionProvider');
  return c;
}
