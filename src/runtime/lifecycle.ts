export type LifecycleState =
  | { status: 'initializing' | 'loading' | 'ready' | 'completed' }
  | { status: 'failed'; reason: string };

export type LifecycleEvent =
  | { type: 'LOAD' }
  | { type: 'READY' }
  | { type: 'COMPLETE' }
  | { type: 'FAIL'; reason: string }
  /** A render crash: unlike FAIL, it can also end a completed experience, so a broken UI never hides behind "Completed". */
  | { type: 'CRASH'; reason: string }
  | { type: 'RETRY' };

export const initialLifecycle: LifecycleState = { status: 'initializing' };

type Status = LifecycleState['status'];

/** Allowed transitions: status -> event -> next status. Anything else is ignored. */
const transitions: Record<Status, Partial<Record<LifecycleEvent['type'], Status>>> = {
  initializing: { LOAD: 'loading', FAIL: 'failed' },
  loading: { READY: 'ready', FAIL: 'failed' },
  ready: { COMPLETE: 'completed', FAIL: 'failed', CRASH: 'failed' },
  completed: { CRASH: 'failed' },
  failed: { RETRY: 'initializing' },
};

export function lifecycleReducer(state: LifecycleState, event: LifecycleEvent): LifecycleState {
  const next = transitions[state.status][event.type];
  if (!next) {
    return state;
  }
  return event.type === 'FAIL' || event.type === 'CRASH'
    ? { status: 'failed', reason: event.reason }
    : ({ status: next } as LifecycleState);
}
