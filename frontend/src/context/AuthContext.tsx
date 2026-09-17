import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../supabaseClient";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  accountsEnabled: boolean;

  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;

  verifyPassword: (
    password: string
  ) => Promise<{ error: string | null }>;

  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ error: string | null }>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const accountsEnabled = Boolean(supabase);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signUp(
    email: string,
    password: string
  ) {
    if (!supabase) {
      return {
        error: "Accounts aren't set up yet.",
      };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      error: error?.message ?? null,
    };
  }

  async function signIn(
    email: string,
    password: string
  ) {
    if (!supabase) {
      return {
        error: "Accounts aren't set up yet.",
      };
    }

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    return {
      error: error?.message ?? null,
    };
  }

  /*
   * Verify the user's current password without
   * changing the password.
   */
  async function verifyPassword(
    password: string
  ) {
    if (!supabase) {
      return {
        error: "Accounts aren't set up yet.",
      };
    }

    if (!session?.user?.email) {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    const { error } =
      await supabase.auth.signInWithPassword({
        email: session.user.email,
        password,
      });

    if (error) {
      return {
        error: "Your current password is incorrect.",
      };
    }

    return {
      error: null,
    };
  }

  /*
   * Re-authenticate first, then change the password.
   */
  async function changePassword(
    currentPassword: string,
    newPassword: string
  ) {
    if (!supabase) {
      return {
        error: "Accounts aren't set up yet.",
      };
    }

    if (!session?.user?.email) {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    /*
     * Verify the current password before allowing
     * the password to be changed.
     */
    const { error: verifyError } =
      await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });

    if (verifyError) {
      return {
        error: "Your current password is incorrect.",
      };
    }

    const { error: updateError } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    return {
      error: updateError?.message ?? null,
    };
  }

  async function signOut() {
    if (!supabase) return;

    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        accountsEnabled,
        signUp,
        signIn,
        verifyPassword,
        changePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return ctx;
}