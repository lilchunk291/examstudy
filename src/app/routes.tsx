import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Study from "./pages/Study";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import Crisis from "./pages/Crisis";
import Profile from "./pages/Profile";
import Vault from "./pages/Vault";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import DeepSession from "./pages/DeepSession";
import SilentRooms from "./pages/SilentRooms";

import ThemeEditor from "./pages/ThemeEditor";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/auth/callback",
    Component: AuthCallback,
  },
  {
    path: "/deep-session",
    Component: DeepSession,
  },
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "schedule", Component: Schedule },
      { path: "study", Component: Study },
      { path: "rooms", Component: SilentRooms },
      { path: "chat", Component: Chat },
      { path: "analytics", Component: Analytics },
      { path: "crisis", Component: Crisis },
      { path: "profile", Component: Profile },
      { path: "vault", Component: Vault },
      { path: "settings", Component: Settings },
      { path: "theme", Component: ThemeEditor },
      { path: "focus", Component: DeepSession },
      { path: "*", Component: NotFound },
    ],
  },
]);
