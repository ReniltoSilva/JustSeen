import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";

/* Every page shares the header; the page itself renders in <Outlet />.
If a page crashes, the header still works and the error clears on the next page */
function App() {
  const location = useLocation();
  /* The welcome page has its own logo and layout */
  const isWelcome = location.pathname === "/login";

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
