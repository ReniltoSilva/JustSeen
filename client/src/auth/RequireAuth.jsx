import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import PageLoading from "../components/PageLoading";
import WelcomeSetup from "../pages/WelcomeSetup";

/* Pages inside this need an account: logged-out visitors go to the login page,
and come back here afterwards */
const RequireAuth = () => {
  const { user, session, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoading />;

  /* Logged in, but the profile row is missing: should never happen, but don't spin forever */
  if (session && !user) {
    return (
      <div className="mx-auto max-w-sm px-4 py-32 text-center">
        <p className="text-soft">We couldn't load your profile. Please log in again.</p>
        <button
          type="button"
          onClick={logout}
          className="mt-4 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
        >
          Log out
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  /* First Google sign-in: choose a username and avatar before anything else */
  if (user.needs_setup) return <WelcomeSetup />;

  return <Outlet />;
};

export default RequireAuth;
