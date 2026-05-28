import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authQueryKey } from "@/lib/auth";

export function useIdleTimeout(user: any, isLoading: boolean) {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoading || !user) return;

    // 10 minutes of inactivity
    const INACTIVE_TIMEOUT = 10 * 60 * 1000;
    let timeoutId: any;

    const handleLogout = () => {
      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_user");
      queryClient.setQueryData(authQueryKey, null);
      queryClient.clear();
      router.replace("/login");
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, INACTIVE_TIMEOUT);
    };

    const events = ["mousemove", "keypress", "mousedown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [user, isLoading, router, queryClient]);
}
