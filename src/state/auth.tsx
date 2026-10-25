import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { backendConfigured, getClient, toIndianE164 } from '../lib/backend';

export interface AuthUser { id: string; phoneLast4: string }

interface AuthCtx {
  configured: boolean;
  loading: boolean;
  user: AuthUser | null;
  sendCode: (phone: string) => Promise<void>;
  verifyCode: (phone: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}
const Ctx = createContext<AuthCtx | null>(null);

const toUser = (u: { id: string; phone?: string | null } | null | undefined): AuthUser | null =>
  u ? { id: u.id, phoneLast4: (u.phone ?? '').slice(-4) } : null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = backendConfigured();
  const [loading, setLoading] = useState(configured);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!configured) return;
    let off: (() => void) | undefined;
    let dead = false;
    getClient().then(async (c) => {
      const { data } = await c.auth.getSession();
      if (!dead) { setUser(toUser(data.session?.user)); setLoading(false); }
      off = c.auth.onAuthStateChange((_e, s) => setUser(toUser(s?.user))).data.subscription.unsubscribe;
    }).catch(() => { if (!dead) setLoading(false); });
    return () => { dead = true; off?.(); };
  }, [configured]);

  const sendCode = useCallback(async (phone: string) => {
    const e164 = toIndianE164(phone);
    if (!e164) throw Object.assign(new Error('invalid phone'), { code: 'bad-phone' });
    const { error } = await (await getClient()).auth.signInWithOtp({ phone: e164 });
    if (error) throw error;
  }, []);

  const verifyCode = useCallback(async (phone: string, code: string) => {
    const e164 = toIndianE164(phone);
    if (!e164) throw new Error('invalid phone');
    const { error } = await (await getClient()).auth.verifyOtp({ phone: e164, token: code.trim(), type: 'sms' });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => { await (await getClient()).auth.signOut(); setUser(null); }, []);

  const deleteAccount = useCallback(async () => {
    const c = await getClient();
    const { error } = await c.rpc('delete_my_account');
    if (error) throw error;
    await c.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ configured, loading, user, sendCode, verifyCode, signOut, deleteAccount }), [configured, loading, user, sendCode, verifyCode, signOut, deleteAccount]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside AuthProvider');
  return c;
}
