import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyList from "./pages/Friends.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";

createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="saved" element={<Saved />} />
        <Route path="friends" element={<Friends />} />
      </Route>
    </Routes>
  </Router>,
);
