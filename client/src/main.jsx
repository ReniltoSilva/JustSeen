import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import RequireAuth from "./auth/RequireAuth.jsx";
import PageLoading from "./components/PageLoading.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { LibraryProvider } from "./library/LibraryContext.jsx";
import { ThemeProvider } from "./theme/ThemeContext.jsx";

/* Each page is its own file that downloads the first time it's opened,
so the first visit only loads what it needs */
const Feed = lazy(() => import("./pages/Feed.jsx"));
const Watched = lazy(() => import("./pages/Watched.jsx"));
const Watchlist = lazy(() => import("./pages/Watchlist.jsx"));
const People = lazy(() => import("./pages/People.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const YearInFilm = lazy(() => import("./pages/YearInFilm.jsx"));
const MovieDetails = lazy(() => import("./pages/MovieDetails.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

/* Shows the spinner while a page's file is downloading */
const page = (element) => <Suspense fallback={<PageLoading />}>{element}</Suspense>;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <LibraryProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<App />}>
                <Route path="login" element={page(<Login />)} />
                <Route path="reset-password" element={page(<ResetPassword />)} />
                <Route path="privacy" element={page(<Privacy />)} />

                {/* Everything else needs an account */}
                <Route element={<RequireAuth />}>
                  <Route index element={page(<Feed />)} />
                  <Route path="watched" element={page(<Watched />)} />
                  <Route path="watchlist" element={page(<Watchlist />)} />
                  <Route path="people" element={page(<People />)} />
                  <Route path="search" element={page(<Search />)} />
                  <Route path="movie/:movieId" element={page(<MovieDetails />)} />
                  <Route path="u/:username" element={page(<Profile />)} />
                  <Route path="u/:username/year/:year" element={page(<YearInFilm />)} />
                </Route>

                <Route path="*" element={page(<NotFound />)} />
              </Route>
            </Routes>
          </BrowserRouter>
        </LibraryProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
