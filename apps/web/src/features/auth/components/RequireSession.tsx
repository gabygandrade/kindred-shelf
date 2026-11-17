/** Route guard for every signed-in page: with no session, sends you to sign-in and back afterwards. */
import { Navigate, Outlet, useLocation } from "react-router";
import { ErrorState, LoadingState } from "../../../components/QueryStates";
import { useSession } from "../hooks/useSession";

/** Guards every signed-in route. The API enforces this too; this only avoids a broken screen. */
export function RequireSession() {
  const { user, isPending, error, refetch } = useSession();
  const location = useLocation();

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/sign-in?next=${encodeURIComponent(next)}`} replace />;
  }
  return <Outlet />;
}
