import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { feedbackLink } from "../lib/feedback";
import { useTheme } from "../theme/ThemeContext";
import UserAvatar from "./UserAvatar";
import NotificationBell from "./NotificationBell";
import Logo from "./Logo";
import { MonitorIcon, MoonIcon, SearchIcon, SunIcon } from "./icons";

const navLinks = [
  { to: "/", label: "Feed" },
  { to: "/watched", label: "Watched" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/people", label: "People" },
];

const themes = [
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
  { value: "system", label: "Auto", icon: <MonitorIcon /> },
];

/* Purple line under the page I'm on */
const navLinkClass = ({ isActive }) =>
  `relative flex items-center h-full px-1 text-[15px] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full ${
    isActive ? "text-fg after:bg-brand" : "text-soft hover:text-fg after:bg-transparent"
  }`;

const Header = () => {
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  /* DaisyUI dropdowns stay open while focused, so blur to close */
  const closeMenu = () => document.activeElement?.blur();

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/login");
  };

  /* Keep the box in sync with the search page, e.g. after going back */
  const currentQuery =
    location.pathname === "/search" ? (new URLSearchParams(location.search).get("q") ?? "") : "";
  const [lastQuery, setLastQuery] = useState(currentQuery);
  if (currentQuery !== lastQuery) {
    setLastQuery(currentQuery);
    setSearch(currentQuery);
  }

  const searchMovie = (e) => {
    e.preventDefault();
    const query = search.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-ink/80 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-3 md:gap-8">
        <Link to="/" className="shrink-0" aria-label="JustSeen home">
          <Logo />
        </Link>

        {/* Search bar */}
        {user && (
          <form onSubmit={searchMovie} className="relative flex-1 min-w-0 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Search movies..."
              aria-label="Search movies"
              className="w-full h-10 rounded-full bg-panel border border-line pl-10 pr-4 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        )}

        {user && (
          <nav className="hidden md:flex items-stretch gap-6 h-full ml-auto">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === "/"} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Bell and account menu sit together */}
        <div className={`flex items-center gap-1.5 shrink-0 ml-auto ${user ? "md:ml-0" : ""}`}>
          {user && <NotificationBell />}

          {user ? (
            <div className="dropdown dropdown-end shrink-0">
              <div
                tabIndex={0}
                role="button"
                aria-label="Account menu"
                className="rounded-full ring-2 ring-transparent hover:ring-line-strong focus-visible:ring-brand transition cursor-pointer"
              >
                <UserAvatar user={user} className="w-9" />
              </div>

              <div
                tabIndex={0}
                className="dropdown-content z-50 mt-3 w-64 rounded-2xl border border-line bg-panel p-2 shadow-2xl text-fg"
              >
                <div className="flex items-center gap-3 px-2 pt-1.5 pb-3 border-b border-line">
                  <UserAvatar user={user} className="w-9" />
                  <div className="min-w-0">
                    <p className="font-semibold text-fg truncate">{user.name}</p>
                    <p className="text-xs text-muted truncate">@{user.username}</p>
                  </div>
                </div>

                <Link
                  to={`/u/${user.username}`}
                  onClick={closeMenu}
                  className="mt-1 flex rounded-lg px-2.5 py-2 text-sm hover:bg-fg/5"
                >
                  My profile
                </Link>

                {/* Appearance: light, dark, or follow the device */}
                <div className="px-2.5 pt-2 pb-1">
                  <p className="text-xs text-muted mb-1.5">Appearance</p>
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-fg/[0.05] p-1" role="radiogroup" aria-label="Appearance">
                    {themes.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={theme === option.value}
                        onClick={() => setTheme(option.value)}
                        className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
                          theme === option.value ? "bg-panel text-fg shadow-sm" : "text-muted hover:text-fg"
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  to="/privacy"
                  onClick={closeMenu}
                  className="mt-1 flex rounded-lg px-2.5 py-2 text-sm text-soft hover:bg-fg/5 hover:text-fg"
                >
                  Privacy policy
                </Link>
                <a
                  href={feedbackLink({ user })}
                  onClick={closeMenu}
                  className="flex rounded-lg px-2.5 py-2 text-sm text-soft hover:bg-fg/5 hover:text-fg"
                >
                  Send feedback or report a bug
                </a>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full rounded-lg px-2.5 py-2 text-left text-sm text-disagree hover:bg-disagree/10"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            location.pathname !== "/login" && (
              <Link
                to="/login"
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
              >
                Log in
              </Link>
            )
          )}
        </div>
      </div>

      {/* Page links move under the header on small screens */}
      {user && (
        <nav className="md:hidden flex justify-around h-11 border-t border-line">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === "/"} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
