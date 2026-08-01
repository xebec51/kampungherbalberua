import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns `false` during SSR and the very first client render, then `true`
 * once React has hydrated. Used to gate any animation state that must not
 * be baked into the server-rendered HTML (e.g. an "out of view, hidden"
 * style) so content never gets stuck invisible if JS fails to load or run.
 *
 * Implemented with `useSyncExternalStore` (the React-recommended pattern
 * for client/server snapshot mismatches) rather than
 * `useEffect(() => setState(true), [])`, which triggers an extra
 * cascading render and trips the `react-hooks/set-state-in-effect` lint
 * rule.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
