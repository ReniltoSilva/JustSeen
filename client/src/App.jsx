import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./auth/AuthContext";

/* Every page shares the header; the page itself renders in <Outlet />.
If a page crashes, the header still works and the error clears on the next page */
function App() {
  const location = useLocation();
  const { user } = useAuth();
  /* The welcome page (at /login, and at / when logged out) and the first-visit
  setup and restore-account steps have their own logo and layout */
  const isWelcome = location.pathname === "/login" || (!user && location.pathname === "/") || user?.needs_setup || user?.deletion_requested_at;

  return (
    <div className="min-h-screen bg-ink text-fg">
      {!isWelcome && <Header />}
      <main>
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
