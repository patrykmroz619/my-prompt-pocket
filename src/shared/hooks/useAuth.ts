import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabaseClient } from "@shared/db/supabase.client";
import type { IUser } from "@shared/types/types";

export const useAuth = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user?.email } : null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await supabaseClient.auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
      throw error;
    }
  };

  return { user, isLoading, logout };
};
